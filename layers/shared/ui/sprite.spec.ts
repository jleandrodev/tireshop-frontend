import { describe, expect, test } from 'vitest'
import { montarSprite, sprite, type ArquivosDeIcones } from './sprite'

// T-0007 · REQ-00-06: o sprite contém os ícones usados, com o id esperado por categoria.

const SVG_TRACO =
  '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 1" /></svg>'
const SVG_PREENCHIMENTO = '<svg viewBox="0 0 24 24"><path d="M2 2" /></svg>'
const SVG_COM_TITULO =
  '<svg role="img" viewBox="0 0 24 24"><title>WhatsApp</title><path d="M3 3" /></svg>'

function arquivos(parciais: Partial<ArquivosDeIcones>): ArquivosDeIcones {
  return { marcas: {}, mdi: {}, lucide: {}, custom: {}, ...parciais }
}

describe('montarSprite', () => {
  test('marcas entram com prefixo i- e fill, sem <title>', () => {
    const svg = montarSprite(arquivos({ marcas: { 'icons/marcas/whatsapp.svg': SVG_COM_TITULO } }))

    expect(svg).toContain('<symbol id="i-whatsapp" viewBox="0 0 24 24" fill="currentColor">')
    expect(svg).not.toContain('<title>')
  })

  test('mdi entra com prefixo i-mdi-', () => {
    const svg = montarSprite(arquivos({ mdi: { 'icons/mdi/car-side.svg': SVG_PREENCHIMENTO } }))

    expect(svg).toContain('<symbol id="i-mdi-car-side" viewBox="0 0 24 24" fill="currentColor">')
  })

  test('lucide entra com prefixo i- e traço', () => {
    const svg = montarSprite(arquivos({ lucide: { 'icons/lucide/shopping-cart.svg': SVG_TRACO } }))

    expect(svg).toContain(
      '<symbol id="i-shopping-cart" viewBox="0 0 24 24" fill="none" stroke="currentColor"',
    )
  })

  test('custom entra como lucide, com prefixo i- e traço', () => {
    const svg = montarSprite(arquivos({ custom: { 'icons/custom/van.svg': SVG_TRACO } }))

    expect(svg).toContain('<symbol id="i-van"')
  })

  test('chevron-down vira i-chevron-down', () => {
    const svg = montarSprite(arquivos({ lucide: { 'icons/lucide/chevron-down.svg': SVG_TRACO } }))

    expect(svg).toContain('<symbol id="i-chevron-down"')
  })

  test('star gera também i-star-cheia, preenchida', () => {
    const svg = montarSprite(arquivos({ lucide: { 'icons/lucide/star.svg': SVG_TRACO } }))

    expect(svg).toContain('<symbol id="i-star"')
    expect(svg).toMatch(/<symbol id="i-star-cheia"[^>]*fill="currentColor"/)
  })

  test('remove comentário dentro do corpo do ícone (lucide/custom)', () => {
    const svgComComentario = SVG_TRACO.replace('<path', '<!-- nota --><path')
    const svg = montarSprite(arquivos({ lucide: { 'icons/lucide/x.svg': svgComComentario } }))

    expect(svg).not.toContain('<!--')
  })

  test('é um svg escondido, xmlns correto', () => {
    const svg = montarSprite(arquivos({}))

    expect(svg).toBe('<svg xmlns="http://www.w3.org/2000/svg" style="display:none"></svg>')
  })
})

describe('sprite (ícones reais do projeto)', () => {
  test('contém os ícones usados pelo protótipo', () => {
    for (const id of [
      'i-whatsapp',
      'i-shopping-cart',
      'i-chevron-down',
      'i-mdi-car-side',
      'i-star-cheia',
    ]) {
      expect(sprite, `falta o símbolo ${id}`).toContain(`id="${id}"`)
    }
  })

  test('não sobrou nenhum <title> nem comentário', () => {
    expect(sprite).not.toContain('<title>')
    expect(sprite).not.toContain('<!--')
  })
})
