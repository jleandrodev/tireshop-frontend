import { expect, test } from '@playwright/test'

// T-0005 · REQ-00-04: o CSS e as fontes do protótipo carregam. As folhas globais entram pelo
// nuxt.config.ts; este teste confere o que o visitante realmente recebe no navegador.

test.describe('estilo: o CSS e as fontes do protótipo carregam', () => {
  test('o body usa a família de fonte do token, e a fonte está carregada', async ({ page }) => {
    await page.goto('/')

    const fontFamily = await page.evaluate(() => getComputedStyle(document.body).fontFamily)
    expect(fontFamily).toContain('TS Sans')

    const carregada = await page.evaluate(async () => {
      await document.fonts.ready
      return Array.from(document.fonts).some(
        (fonte) => fonte.family === 'TS Sans' && fonte.status === 'loaded',
      )
    })
    expect(carregada).toBe(true)
  })

  test('--ts-brand e --ts-acao existem em :root', async ({ page }) => {
    await page.goto('/')

    const tokens = await page.evaluate(() => {
      const raiz = getComputedStyle(document.documentElement)
      return {
        brand: raiz.getPropertyValue('--ts-brand').trim(),
        acao: raiz.getPropertyValue('--ts-acao').trim(),
      }
    })

    expect(tokens.brand).not.toBe('')
    expect(tokens.acao).not.toBe('')
  })

  test('um botão de prova com ts-btn ts-btn--acao tem a cor de fundo do token', async ({
    page,
  }) => {
    await page.goto('/')

    const corDeFundo = await page.evaluate(() => {
      const botao = document.createElement('button')
      botao.className = 'ts-btn ts-btn--acao'
      botao.textContent = 'prova'
      document.body.appendChild(botao)
      const cor = getComputedStyle(botao).backgroundColor
      botao.remove()
      return cor
    })

    // --ts-acao vale #15803D = rgb(21, 128, 61) (tokens-acao.css).
    expect(corDeFundo).toBe('rgb(21, 128, 61)')
  })
})
