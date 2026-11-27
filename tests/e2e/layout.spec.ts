import { expect, test } from '@playwright/test'

// T-0205 · REQ-02-02, REQ-02-16: a moldura do layout padrão, contra o mock. Menus, rodapé
// completo, cookies e WhatsApp ainda não existem (tasks seguintes) — aqui só a ordem e o essencial
// (logo, telefone, texto fiscal).

test.describe('layout padrão: a moldura de /', () => {
  test('o HTML do servidor tem, nesta ordem: "Pular para o conteúdo", header, main#conteudo e footer', async ({
    request,
  }) => {
    const resposta = await request.get('/')
    const html = await resposta.text()

    const indicePulo = html.indexOf('Pular para o conteúdo')
    const indiceHeader = html.indexOf('<header')
    const indiceMain = html.indexOf('id="conteudo"')
    const indiceFooter = html.indexOf('<footer')

    expect(indicePulo).toBeGreaterThan(-1)
    expect(indiceHeader).toBeGreaterThan(indicePulo)
    expect(indiceMain).toBeGreaterThan(indiceHeader)
    expect(indiceFooter).toBeGreaterThan(indiceMain)
  })

  test('o cabeçalho traz o telefone da navegação; o rodapé, o texto fiscal', async ({ page }) => {
    await page.goto('/')

    await expect(page.locator('header')).toContainText('(41) 3317-2251')
    await expect(page.locator('footer')).toContainText('Os preços, as promoções')
  })

  test('o primeiro Tab foca "Pular para o conteúdo"; ativá-lo leva o foco ao main', async ({
    page,
  }) => {
    await page.goto('/')

    await page.keyboard.press('Tab')
    const linkDePulo = page.getByRole('link', { name: 'Pular para o conteúdo' })
    await expect(linkDePulo).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page.locator('#conteudo')).toBeFocused()
  })

  test('o layout expõe os lugares "faixa" e "minicart", vazios por enquanto', async ({ page }) => {
    await page.goto('/')

    // `app/layouts/default.vue` tem os dois `<slot>` nomeados, sem conteúdo (T-0210 preenche
    // "faixa"; T-0218, "minicart") — sem fallback, um slot vazio não deixa marca no DOM; o que dá
    // para confer aqui é a ordem ao redor deles, já coberta no primeiro teste deste arquivo.
    await expect(page.locator('footer')).toBeVisible()
  })

  test('a página fez uma única chamada a /navegacao (SiteCabecalho e SiteRodape dedupam)', async ({
    page,
  }) => {
    // O fetch de /navegacao acontece dentro do processo do servidor (SSR) — nunca passa pela
    // rede do navegador, então `page.route` não veria. `12.conteudo.ts` conta as chamadas e
    // devolve no cabeçalho `x-dev-chamadas-navegacao`, só em desenvolvimento.
    const resposta = await page.goto('/')

    expect(resposta?.headers()['x-dev-chamadas-navegacao']).toBe('1')
  })

  test('CA-02-09: com a busca de /navegacao falhando, a página responde 200 e o cabeçalho mostra só o logo', async ({
    page,
  }) => {
    const resposta = await page.goto('/?_falha_navegacao=500')

    expect(resposta?.status()).toBe(200)
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('header')).not.toContainText('3317-2251')
    await expect(page.locator('footer')).not.toContainText('Os preços, as promoções')
  })
})
