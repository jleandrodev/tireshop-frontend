import { expect, test } from '@playwright/test'

// T-0001 · REQ-00-01 · CA-00-01: o projeto sobe com SSR.
// O navegador roda com JavaScript desligado: o que aparece aqui veio pronto do servidor.
test.use({ javaScriptEnabled: false })

test.describe('fumaça: o projeto sobe e renderiza no servidor', () => {
  test('GET / responde 200', async ({ request }) => {
    const resposta = await request.get('/')

    expect(resposta.status()).toBe(200)
  })

  test('o HTML bruto de / contém "TireShop"', async ({ page }) => {
    const resposta = await page.goto('/')
    const htmlBruto = (await resposta?.text()) ?? ''

    expect(htmlBruto).toContain('TireShop')
    // Sem JavaScript, o texto também está visível na página: não depende de hidratação.
    await expect(page.locator('body')).toContainText('TireShop')
  })
})
