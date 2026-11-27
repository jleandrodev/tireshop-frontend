import { expect, test } from '@playwright/test'
import { conferirInvariantes } from './_invariantes'

// T-0213 · REQ-02-17 (ADR 0010): CA-02-10 — rota inexistente vira página de não encontrado, com
// status 404 e dentro do layout padrão; erro inesperado vira página de erro, com status 500.

test.describe('página de não encontrado e de erro', () => {
  test('CA-02-10: /nao-existe responde 404 e mostra "Página não encontrada" em um único H1', async ({
    page,
  }) => {
    const resposta = await page.goto('/nao-existe')

    expect(resposta?.status()).toBe(404)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText('Página não encontrada')
  })

  test('a página tem o cabeçalho e o rodapé do layout padrão', async ({ page }) => {
    await page.goto('/nao-existe')

    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('footer')).toBeVisible()
  })

  test('há um link para a Home e um para o WhatsApp', async ({ page }) => {
    await page.goto('/nao-existe')

    await expect(page.getByRole('link', { name: 'Voltar para a Home' })).toHaveAttribute(
      'href',
      '/',
    )
    await expect(page.locator('a[href^="https://wa.me/"]').first()).toBeVisible()
  })

  test('um erro 500 lançado por uma página de prova mostra "Algo deu errado" e responde 500', async ({
    page,
  }) => {
    const resposta = await page.goto('/_prova/erro')

    expect(resposta?.status()).toBe(500)
    // `#__nuxt`: em `nuxt dev`, um erro 500 também abre a sobreposição de depuração do Vite (a
    // lib "my-bad", fora de `#__nuxt`, com o próprio h1) — não existe em produção; o h1 da nossa
    // página é o que importa aqui (achado rodando contra `nuxt dev`, igual à T-0204/T-0211).
    await expect(page.locator('#__nuxt h1')).toHaveCount(1)
    await expect(page.locator('#__nuxt h1')).toHaveText('Algo deu errado')
  })

  test('conferirInvariantes(page) passa na página de não encontrado', async ({ page }) => {
    await page.goto('/nao-existe')
    await expect(conferirInvariantes(page)).resolves.toBeUndefined()
  })
})
