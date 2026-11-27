import { expect, test } from '@playwright/test'
import { conferirInvariantes } from './_invariantes'

// T-0219 · REQ-02-02, 05, 06, 09..12, 14, 15, 18: a moldura do site, no computador (1440px),
// contra o mock. A celular fica em `navegacao-celular.spec.ts` — telas bastante diferentes
// (mega menu vs. gaveta) para caber num arquivo só, por tamanho.

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'computador', 'só roda no projeto computador (1440px)')
})

test.describe('moldura do site: computador', () => {
  test('CA-02-01: o HTML do servidor já traz a moldura, com uma única chamada a /navegacao', async ({
    request,
  }) => {
    const resposta = await request.get('/')
    const html = await resposta.text()

    expect(resposta.status()).toBe(200)
    expect(resposta.headers()['x-dev-chamadas-navegacao']).toBe('1')
    expect(html).toContain('(41) 3317-2251')
    expect(html).toContain('Departamentos')
    expect(html.match(/Aro \d+/g)?.length ?? 0).toBeGreaterThanOrEqual(50)
    expect(html).toContain('Os preços, as promoções')
    expect(html).toContain('80.171.671/0001-54')
  })

  test('CA-02-02: "Departamentos" lista os 8 departamentos; Carros com 14 aros, Vans com 3', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // `<summary>` do mega menu: role "group" no `<details>`, não "button" (achado rodando
    // contra o Chromium de verdade — `getByRole('button', …)` nunca resolvia).
    await page.locator('.ts-mega summary', { hasText: 'Departamentos' }).click()
    const painel = page.locator('.ts-mega__deps')

    const titulos = await painel.locator('.ts-mega__titulo').allTextContents()
    expect(titulos).toHaveLength(8)

    const carros = painel.locator('li').filter({ hasText: 'Carros' })
    await expect(carros.getByRole('link', { name: /^Aro /i })).toHaveCount(14)
    await expect(carros.getByRole('link', { name: 'Aro 10' })).toBeVisible()
    await expect(carros.getByRole('link', { name: 'Aro 24' })).toBeVisible()

    const vans = painel.locator('li').filter({ hasText: 'Vans' })
    await expect(vans.getByRole('link', { name: /^Aro /i })).toHaveCount(3)

    const rodapeDoMenu = page.locator('.ts-mega__rodape')
    await expect(rodapeDoMenu.getByText('Ajuda para escolher')).toBeVisible()
    await expect(rodapeDoMenu.getByText('Também vendemos')).toBeVisible()
  })

  test('CA-02-03: um mega menu por vez; Esc fecha e devolve o foco ao título', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const departamentos = page.locator('.ts-mega summary', { hasText: 'Departamentos' })
    const marcas = page.locator('.ts-mega summary', { hasText: 'Marcas' })

    await departamentos.click()
    await expect(page.locator('.ts-mega__deps')).toBeVisible()

    await marcas.click()
    await expect(page.locator('.ts-mega__marcas')).toBeVisible()
    await expect(page.locator('.ts-mega__deps')).toBeHidden()

    await page.keyboard.press('Escape')
    await expect(page.locator('.ts-mega__marcas')).toBeHidden()
    await expect(marcas).toBeFocused()
  })

  test('os links do mega menu têm pelo menos 24px', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('.ts-mega summary', { hasText: 'Departamentos' }).click()

    for (const link of await page.locator('.ts-mega__deps a, .ts-mega__rodape a').all()) {
      const caixa = await link.boundingBox()
      expect(caixa).not.toBeNull()
      expect(Math.min(caixa!.width, caixa!.height)).toBeGreaterThanOrEqual(24)
    }
  })

  test('CA-02-05: as quatro colunas do rodapé estão abertas em 1440px', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const colunas = page.locator('.ts-rodape__coluna')
    await expect(colunas).toHaveCount(4)
    for (const coluna of await colunas.all()) {
      expect(await coluna.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(true)
    }
    await expect(page.getByRole('link', { name: 'Comparar pneus' })).toBeVisible()
  })

  test('CA-02-06: assinar a newsletter com e-mail e WhatsApp válidos', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const pedido = page.waitForRequest(
      (requisicao) =>
        requisicao.url().includes('/api/mock/newsletter') && requisicao.method() === 'POST',
    )
    await page.locator('#newsletter-email').fill('cliente@exemplo.com.br')
    await page.locator('#newsletter-whatsapp').fill('41999990000')
    await page.getByRole('button', { name: 'Assinar' }).click()

    const requisicao = await pedido
    expect(requisicao.postDataJSON()).toEqual({
      email: 'cliente@exemplo.com.br',
      whatsapp: '41999990000',
    })
    await expect(page.locator('[role="status"]')).not.toBeEmpty()

    const guardado = await page.evaluate(() => ({ ...localStorage, ...sessionStorage }))
    expect(JSON.stringify(guardado)).not.toContain('cliente@exemplo.com.br')
  })

  test('CA-02-07: newsletter com e-mail inválido não chama a API e marca o campo', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    let chamouApi = false
    page.on('request', (requisicao) => {
      if (requisicao.url().includes('/api/mock/newsletter')) chamouApi = true
    })

    await page.locator('#newsletter-email').fill('cliente@')
    await page.getByRole('button', { name: 'Assinar' }).click()
    await page.waitForTimeout(300)

    expect(chamouApi).toBe(false)
    const email = page.locator('#newsletter-email')
    await expect(email).toHaveAttribute('aria-invalid', 'true')
    await expect(email).toBeFocused()
  })

  test('CA-02-08: "Entendi" esconde o aviso de cookies, e ele não volta ao recarregar', async ({
    page,
  }) => {
    await page.goto('/')
    const aviso = page.locator('[aria-label="Aviso de cookies"]')
    await expect(aviso).toBeVisible()

    await page.getByRole('button', { name: 'Entendi' }).click()
    await expect(aviso).toBeHidden()

    await page.reload()
    await page.waitForLoadState('networkidle')
    await expect(aviso).toBeHidden()
  })

  test('o texto visível da moldura não contém "numa"', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.locator('.ts-mega summary', { hasText: 'Departamentos' }).click()

    expect(await page.locator('body').innerText()).not.toContain('numa')
  })

  test('conferirInvariantes(page) passa com o mega menu fechado e com ele aberto', async ({
    page,
  }) => {
    // Mais de 100 links (navegação inteira + mega menu aberto), com `conferirInvariantes`
    // conferindo visibilidade um a um e rodando o axe: sozinho sempre passou rápido, mas sob
    // contenção (suíte inteira em paralelo) passava dos 30s — mesma categoria de achado do
    // `kernel.spec.ts` (T-0120).
    test.slow()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(conferirInvariantes(page)).resolves.toBeUndefined()

    await page.locator('.ts-mega summary', { hasText: 'Departamentos' }).click()
    await expect(conferirInvariantes(page)).resolves.toBeUndefined()
  })
})
