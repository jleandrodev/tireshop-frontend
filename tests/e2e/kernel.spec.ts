import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import { conferirInvariantes } from './_invariantes'

// T-0120 · REQ-01-10..REQ-01-20: CA-01-07, CA-01-08, CA-01-09 — os componentes do kernel na
// página de prova (`/_prova/kernel`, só fora de produção).
//
// `mode: 'serial'`: os 8 testes deste arquivo, sozinhos, sempre passaram rápido; juntos, com o
// resto da suíte, competindo por CPU em paralelo (vários `nuxt dev` hidratando a mesma página
// pesada ao mesmo tempo), ficavam instáveis (achado rodando `pnpm test:e2e` repetidas vezes).
// Rodar este arquivo em série reduz o pico de concorrência sem reduzir o paralelismo do resto
// da suíte (ADR 0014 pede sharding só quando o job passar de 10 min — não é o caso aqui).
test.describe.configure({ mode: 'serial' })

async function abrirPaginaDoKernel(page: Page): Promise<void> {
  // 14 componentes hidratando de uma vez, com toda a suíte e2e rodando em paralelo (vários
  // `nuxt dev` concorrendo pela mesma CPU): mais lento que o normal, não é teste quebrado —
  // por isso o tempo limite triplicado (achado rodando `pnpm test:e2e` inteiro, não só este
  // arquivo: sozinho sempre passou rápido, junto com os outros esgotava os 30s por contenção).
  test.slow()
  await page.goto('/_prova/kernel')
  // `page.goto` resolve com o HTML do SSR; sem esperar a hidratação, um clique logo depois
  // às vezes chega antes do listener do Vue existir (achado tentando: o teste "funcionava",
  // mas o estado nunca mudava — não era bug no componente, era corrida com a hidratação).
  await page.waitForLoadState('networkidle')
}

test('conferirInvariantes(page) passa na página de prova do kernel', async ({ page }) => {
  await abrirPaginaDoKernel(page)
  // T-0218: `FormularioNewsletter` (no rodapé real, por baixo de 14 componentes de prova)
  // empurrou o selo "Site Seguro Google" (`loading="lazy"`) além da distância que o Chromium
  // dispara sem rolar — como em qualquer página real, só rola a tela que a imagem carrega; sem
  // isso, `conferirImagens` acusava "quebrada" por nunca ter entrado perto do viewport, não por
  // um defeito do componente (achado comparando com `main`: a mesma imagem, sem este formulário
  // por cima, carregava sem rolar nada).
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await page.waitForLoadState('networkidle')
  await expect(conferirInvariantes(page)).resolves.toBeUndefined()
})

test('CA-01-07: acordeão, guias, carrossel e diálogo operados só com o teclado', async ({
  page,
}) => {
  await abrirPaginaDoKernel(page)

  const botaoGarantia = page.getByRole('button', { name: 'Tem garantia?' })
  await botaoGarantia.focus()
  await expect(botaoGarantia).toHaveAttribute('aria-expanded', 'false')
  await page.keyboard.press('Enter')
  await expect(botaoGarantia).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press(' ')
  await expect(botaoGarantia).toHaveAttribute('aria-expanded', 'false')

  const abaMedida = page.getByRole('tab', { name: 'Por medida' })
  await abaMedida.focus()
  await page.keyboard.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'Por aro' })).toHaveAttribute('aria-selected', 'true')

  const pontos = page.locator('.ts-carrossel__ponto')
  await expect(pontos.first()).toHaveAttribute('aria-current', 'true')
  const botaoProximo = page.getByRole('button', { name: 'Próximo' })
  await botaoProximo.focus()
  await page.keyboard.press('Enter')
  await expect(pontos.nth(1)).toHaveAttribute('aria-current', 'true')

  const botaoAbrirDialogo = page.getByRole('button', { name: 'Abrir diálogo' })
  await botaoAbrirDialogo.focus()
  await page.keyboard.press('Enter')
  const dialogo = page.getByRole('dialog')
  await expect(dialogo).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialogo).toBeHidden()
  await expect(botaoAbrirDialogo).toBeFocused()
})

test('o foco é sempre visível (outline do token --ts-focus)', async ({ page }) => {
  await abrirPaginaDoKernel(page)

  const botao = page.getByRole('button', { name: 'Abrir diálogo' })
  await botao.focus()
  const contorno = await botao.evaluate((el) => getComputedStyle(el).outlineWidth)
  expect(contorno).not.toBe('0px')
})

test('CA-01-08: zero iframe ao carregar; um iframe com title depois de tocar em cada capa', async ({
  page,
}) => {
  await abrirPaginaDoKernel(page)
  await expect(page.locator('iframe')).toHaveCount(0)

  // timeout maior só nestes dois: sob contenção (suíte inteira em paralelo), o clique até
  // chega, mas o re-render (tirar o <a>, inserir o <iframe>) pode passar dos 5s padrão.
  await page.getByRole('link', { name: 'Assistir: Vídeo de prova' }).click()
  await expect(page.locator('iframe')).toHaveCount(1, { timeout: 15_000 })
  await expect(page.locator('iframe').first()).toHaveAttribute('title', 'Vídeo de prova')

  await page.getByRole('button', { name: 'Ver o mapa' }).click()
  await expect(page.locator('iframe')).toHaveCount(2, { timeout: 15_000 })
  await expect(page.locator('iframe').nth(1)).toHaveAttribute('title', 'Mapa de prova')
})

test('CA-01-09: o carrossel não muda de posição em 6 segundos', async ({ page }) => {
  await abrirPaginaDoKernel(page)

  const primeiroPonto = page.locator('.ts-carrossel__ponto').first()
  await expect(primeiroPonto).toHaveAttribute('aria-current', 'true')

  await page.waitForTimeout(6_000)

  await expect(primeiroPonto).toHaveAttribute('aria-current', 'true')
})

test('tamanhos mínimos: pontos do carrossel 24px; botões, guias e links de paginação 44px', async ({
  page,
}) => {
  await abrirPaginaDoKernel(page)

  for (const ponto of await page.locator('.ts-carrossel__ponto').all()) {
    const caixa = await ponto.boundingBox()
    expect(Math.min(caixa!.width, caixa!.height)).toBeGreaterThanOrEqual(24)
  }

  for (const seletor of [
    '.ts-carrossel__seta',
    '.ts-abas__aba',
    '.ts-paginacao a, .ts-paginacao [aria-current]',
  ]) {
    for (const alvo of await page.locator(seletor).all()) {
      const caixa = await alvo.boundingBox()
      expect(Math.min(caixa!.width, caixa!.height)).toBeGreaterThanOrEqual(44)
    }
  }
})

test('"Ler mais" abre o texto de apoio, e o texto inteiro já estava no HTML do servidor', async ({
  page,
  request,
}) => {
  const resposta = await request.get('/_prova/kernel')
  const htmlDoServidor = await resposta.text()
  expect(htmlDoServidor).toContain('o HTML do servidor já traz o texto completo')

  await abrirPaginaDoKernel(page)
  const corpo = page.locator('.ts-seo__corpo')
  await expect(corpo).toHaveAttribute('data-recolhido', 'true')

  await page.getByRole('button', { name: 'Ler mais' }).click()
  await expect(corpo).toHaveAttribute('data-recolhido', 'false')
})

test('só o botão de variante acao tem o fundo do token --ts-acao', async ({ page }) => {
  await abrirPaginaDoKernel(page)

  const corDoToken = await page.evaluate(() => {
    const div = document.createElement('div')
    div.style.background = 'var(--ts-acao)'
    document.body.appendChild(div)
    const cor = getComputedStyle(div).backgroundColor
    div.remove()
    return cor
  })

  for (const botao of await page.locator('.ts-btn').all()) {
    const [temClasseAcao, corDeFundo] = await botao.evaluate((el) => [
      el.classList.contains('ts-btn--acao'),
      getComputedStyle(el).backgroundColor,
    ])
    if (temClasseAcao) {
      expect(corDeFundo).toBe(corDoToken)
    } else {
      expect(corDeFundo).not.toBe(corDoToken)
    }
  }
})
