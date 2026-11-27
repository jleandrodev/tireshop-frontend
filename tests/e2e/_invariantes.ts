import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'

// T-0010 · REQ-00-09: os invariantes comuns a toda página (docs/testing.md, "Invariantes de
// página"), herdados de tools/hifi/verify.py. Cada módulo acrescenta os invariantes do próprio
// tipo de página por cima deste; aqui só o que vale para qualquer uma.
export async function conferirInvariantes(page: Page): Promise<void> {
  await conferirTitulos(page)
  await conferirImagens(page)
  await conferirSemRolagemHorizontal(page)
  await conferirAlvosDeToque(page)
  await conferirAncoras(page)
  await conferirIframes(page)
  await conferirContraste(page)
}

async function conferirTitulos(page: Page): Promise<void> {
  const h1 = await page.locator('h1').count()
  if (h1 !== 1) {
    throw new Error(`esperava um único h1, achei ${h1}`)
  }

  const niveis = await page
    .locator('h1, h2, h3, h4, h5, h6')
    .evaluateAll((elementos) => elementos.map((el) => Number(el.tagName.slice(1))))
  for (let i = 1; i < niveis.length; i++) {
    if (niveis[i]! - niveis[i - 1]! > 1) {
      throw new Error(`pulo de nível de título: h${niveis[i - 1]} para h${niveis[i]}`)
    }
  }
}

async function conferirImagens(page: Page): Promise<void> {
  const imagens = await page.locator('img').all()
  for (const imagem of imagens) {
    const [alt, largura, altura, carregou] = await Promise.all([
      imagem.getAttribute('alt'),
      imagem.getAttribute('width'),
      imagem.getAttribute('height'),
      imagem.evaluate(
        (el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0,
      ),
    ])
    if (alt === null) throw new Error('imagem sem alt')
    if (largura === null || altura === null) throw new Error('imagem sem width/height (dimensões)')
    if (!carregou) throw new Error('imagem quebrada (não carregou)')
  }
}

async function conferirSemRolagemHorizontal(page: Page): Promise<void> {
  const temRolagem = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
  if (temRolagem) {
    throw new Error('rolagem horizontal na página')
  }
}

const ALVO_MINIMO_PX = 44

// Exceções nomeadas: nenhuma sem seletor e motivo (mesmo padrão de scripts/lint-marca.ts).
// `.ts-carrossel__ponto` é 24px de propósito (T-0111): navegação redundante, as setas (44px)
// já cobrem o alvo mínimo. `.ts-mega__aros a` (30px) e `.ts-mega__grupo a` (36px, "Ajuda para
// escolher"/"Também vendemos") são de propósito (T-0219, CA-02-03: "pelo menos 24 px") —
// computador, mouse, painel com dezenas de aros por departamento; 44px inflaria o painel sem
// ajudar quem usa teclado ou toque (o painel nem abre no celular, que tem a gaveta).
const EXCECOES_ALVO_PEQUENO = ['.ts-carrossel__ponto', '.ts-mega__aros a', '.ts-mega__grupo a']

async function conferirAlvosDeToque(page: Page): Promise<void> {
  const alvos = await page
    .locator('a, button, input, select, textarea, summary, [role="button"]')
    .all()
  for (const alvo of alvos) {
    if (!(await alvo.isVisible())) continue

    // Link de texto corrido (`display: inline`, o padrão do navegador pra <a> sem CSS de
    // tamanho) é o que o WCAG 2.5.8 já isenta do alvo mínimo — ex.: Migalhas, `.ts-link` no meio
    // de um parágrafo. Um controle estilizado como botão nunca é `inline`.
    const ehLinkDeTexto = await alvo.evaluate((el) => getComputedStyle(el).display === 'inline')
    if (ehLinkDeTexto) continue

    const excetuado = await alvo.evaluate(
      (el, seletores) => seletores.some((seletor) => el.matches(seletor)),
      EXCECOES_ALVO_PEQUENO,
    )
    if (excetuado) continue

    const caixa = await alvo.boundingBox()
    if (!caixa) continue
    const menorLado = Math.min(caixa.width, caixa.height)
    if (menorLado < ALVO_MINIMO_PX) {
      throw new Error(`alvo de toque menor que ${ALVO_MINIMO_PX}px (${Math.round(menorLado)}px)`)
    }
  }
}

async function conferirAncoras(page: Page): Promise<void> {
  const ancoras = await page.locator('a[href^="#"]').all()
  for (const ancora of ancoras) {
    const href = (await ancora.getAttribute('href')) ?? ''
    const id = href.slice(1)
    const existe =
      id &&
      (await page.evaluate((idProcurado) => Boolean(document.getElementById(idProcurado)), id))
    if (!existe) {
      throw new Error(`âncora sem destino: ${href}`)
    }
  }
}

async function conferirIframes(page: Page): Promise<void> {
  const iframes = await page.locator('iframe').all()
  for (const iframe of iframes) {
    const title = await iframe.getAttribute('title')
    if (!title) {
      throw new Error('iframe sem title')
    }
  }
}

async function conferirContraste(page: Page): Promise<void> {
  const resultado = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze()
  const contraste = resultado.violations.filter((v) => v.id === 'color-contrast')
  if (contraste.length > 0) {
    throw new Error(`contraste insuficiente: ${contraste.map((v) => v.description).join('; ')}`)
  }
}
