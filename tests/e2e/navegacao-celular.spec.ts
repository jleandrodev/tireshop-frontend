import { expect, test } from '@playwright/test'
import { conferirInvariantes } from './_invariantes'

// T-0219 · REQ-02-02, 05, 06, 09..12, 14, 15, 18: a moldura do site, no celular (390px), contra
// o mock. O computador fica em `navegacao.spec.ts` — mega menu vs. gaveta são telas diferentes
// demais para caber num arquivo só.

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name !== 'celular', 'só roda no projeto celular (390px)')
})

test.describe('moldura do site: celular', () => {
  test('CA-02-04: a gaveta abre, mostra os aros em grade e fecha ao escolher um aro', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    const gaveta = page.getByRole('dialog', { name: 'Menu' })
    await expect(gaveta).toBeVisible()

    await gaveta.locator('summary', { hasText: 'Departamentos' }).click()
    await gaveta.locator('summary', { hasText: 'Carros' }).click()

    await expect(gaveta.getByRole('link', { name: 'Todos os pneus de carros' })).toBeVisible()
    const aro10 = gaveta.getByRole('link', { name: 'Aro 10' })
    await expect(aro10).toBeVisible()

    await aro10.click()
    await expect(gaveta).toBeHidden()
  })

  test('a gaveta fecha no X, com Esc e ao passar de 900px', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    const gaveta = page.getByRole('dialog', { name: 'Menu' })
    await expect(gaveta).toBeVisible()
    await page.getByRole('button', { name: 'Fechar o menu' }).click()
    await expect(gaveta).toBeHidden()

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect(gaveta).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(gaveta).toBeHidden()

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect(gaveta).toBeVisible()
    await page.setViewportSize({ width: 1000, height: 900 })
    await expect(gaveta).toBeHidden()
  })

  test('CA-02-05: as quatro colunas do rodapé estão fechadas; "Ajuda para escolher" abre com "Comparar pneus"', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const colunas = page.locator('.ts-rodape__coluna')
    await expect(colunas).toHaveCount(4)
    for (const coluna of await colunas.all()) {
      expect(await coluna.evaluate((el) => (el as HTMLDetailsElement).open)).toBe(false)
    }

    const colunaDeAjuda = colunas.filter({ hasText: 'Ajuda para escolher' })
    await colunaDeAjuda.locator('summary').click()
    await expect(colunaDeAjuda.getByRole('link', { name: 'Comparar pneus' })).toBeVisible()
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
    await expect(page.locator('#newsletter-email')).toHaveAttribute('aria-invalid', 'true')
  })

  test('a barra de topo não mostra os atalhos "Meus Pedidos" e "Ajuda"', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.locator('.ts-topbar__links')).toBeHidden()
  })

  test('REQ-02-15: o botão do WhatsApp não cobre o aviso de cookies nem uma barra fixa de prova', async ({
    page,
  }) => {
    await page.goto('/_prova/barra-fixa')
    await page.waitForLoadState('networkidle')

    const fab = page.locator('.ts-fab')
    const barra = page.locator('.ts-barra-compra')
    const aviso = page.locator('[aria-label="Aviso de cookies"]')
    await expect(fab).toBeVisible()
    await expect(barra).toBeVisible()
    await expect(aviso).toBeVisible()

    const caixaDoFab = await fab.boundingBox()
    const caixaDaBarra = await barra.boundingBox()
    const caixaDoAviso = await aviso.boundingBox()
    expect(caixaDoFab).not.toBeNull()
    expect(caixaDaBarra).not.toBeNull()
    expect(caixaDoAviso).not.toBeNull()

    function seSobrepoem(
      a: { x: number; y: number; width: number; height: number },
      b: { x: number; y: number; width: number; height: number },
    ): boolean {
      return (
        a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
      )
    }

    expect(seSobrepoem(caixaDoFab!, caixaDaBarra!)).toBe(false)
    expect(seSobrepoem(caixaDoFab!, caixaDoAviso!)).toBe(false)
  })

  test('conferirInvariantes(page) passa com a gaveta fechada e com ela aberta', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(conferirInvariantes(page)).resolves.toBeUndefined()

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect(conferirInvariantes(page)).resolves.toBeUndefined()
  })
})
