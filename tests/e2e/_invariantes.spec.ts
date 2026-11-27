import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'
import { conferirInvariantes } from './_invariantes'

// T-0010 · REQ-00-09: conferirInvariantes(page) aplica, em qualquer página, as regras comuns
// herdadas do protótipo (docs/testing.md). Cada defeito é plantado isoladamente numa página de
// prova mínima (tests/e2e/_paginas-de-prova/), para o motivo da reprovação ser inequívoco.

const pastaDeProva = join(dirname(fileURLToPath(import.meta.url)), '_paginas-de-prova')

async function abrirPaginaDeProva(
  page: import('@playwright/test').Page,
  nome: string,
): Promise<void> {
  const html = readFileSync(join(pastaDeProva, `${nome}.html`), 'utf8')
  await page.setContent(html)
}

test.describe('conferirInvariantes: cada defeito plantado é acusado', () => {
  test('dois H1', async ({ page }) => {
    await abrirPaginaDeProva(page, 'dois-h1')
    await expect(conferirInvariantes(page)).rejects.toThrow(/h1/i)
  })

  test('pulo de nível de título', async ({ page }) => {
    await abrirPaginaDeProva(page, 'pulo-de-nivel')
    await expect(conferirInvariantes(page)).rejects.toThrow(/pulo de nível/i)
  })

  test('imagem sem alt', async ({ page }) => {
    await abrirPaginaDeProva(page, 'imagem-sem-alt')
    await expect(conferirInvariantes(page)).rejects.toThrow(/alt/i)
  })

  test('imagem sem dimensões', async ({ page }) => {
    await abrirPaginaDeProva(page, 'imagem-sem-dimensoes')
    await expect(conferirInvariantes(page)).rejects.toThrow(/width|height|dimens/i)
  })

  test('rolagem horizontal', async ({ page }) => {
    await abrirPaginaDeProva(page, 'rolagem-horizontal')
    await expect(conferirInvariantes(page)).rejects.toThrow(/rolagem horizontal/i)
  })

  test('alvo de toque menor que 44px', async ({ page }) => {
    await abrirPaginaDeProva(page, 'alvo-pequeno')
    await expect(conferirInvariantes(page)).rejects.toThrow(/44/i)
  })

  test('âncora sem destino', async ({ page }) => {
    await abrirPaginaDeProva(page, 'ancora-sem-destino')
    await expect(conferirInvariantes(page)).rejects.toThrow(/âncora sem destino/i)
  })

  test('iframe sem title', async ({ page }) => {
    await abrirPaginaDeProva(page, 'iframe-sem-title')
    await expect(conferirInvariantes(page)).rejects.toThrow(/iframe/i)
  })
})

test('aprova a página sem defeitos', async ({ page }) => {
  await abrirPaginaDeProva(page, 'limpa')
  await expect(conferirInvariantes(page)).resolves.toBeUndefined()
})
