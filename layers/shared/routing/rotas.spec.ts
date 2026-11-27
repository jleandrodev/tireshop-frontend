import { describe, expect, test } from 'vitest'
import { classificarHref, resolverRota, rotas } from './rotas'

// T-0105 · REQ-01-06 (ADR 0008): toda URL interna sai de rotas.*; resolverRota faz o caminho de
// volta. Rotas de docs/design/mapa-prototipo.md.

describe('rotas', () => {
  test('home', () => {
    expect(rotas.home()).toBe('/')
    expect(rotas.home({ ancora: 'faq-medida' })).toBe('/#faq-medida')
  })

  test('categoria', () => {
    expect(rotas.categoria('pneus-para-carros')).toBe('/c/pneus-para-carros')
    expect(rotas.categoria('pneus-para-carros', { pagina: 2 })).toBe(
      '/c/pneus-para-carros?pagina=2',
    )
    expect(rotas.categoria('pneus-para-carros', { pagina: 1 })).toBe('/c/pneus-para-carros')
  })

  test('produto', () => {
    expect(
      rotas.produto({ id: '3084', slug: 'pneu-hankook-ventus-prime-2-k115-225-45-r17-91v' }),
    ).toBe('/p/3084/pneu-hankook-ventus-prime-2-k115-225-45-r17-91v')
  })

  test('politica, sobreNos, lojas e loja', () => {
    expect(rotas.politica('trocas-e-devolucoes')).toBe('/ajuda/trocas-e-devolucoes')
    expect(rotas.sobreNos()).toBe('/sobre-nos')
    expect(rotas.lojas()).toBe('/lojas')
    expect(rotas.loja('curitiba')).toBe('/lojas/curitiba')
  })

  test('comparar', () => {
    expect(rotas.comparar(['3084', '3026'])).toBe('/comparar?p=3084,3026')
    expect(rotas.comparar([])).toBe('/comparar')
    expect(rotas.comparar()).toBe('/comparar')
  })
})

describe('resolverRota: o caminho de volta de cada URL gerada acima', () => {
  test.each([
    ['/', { tipo: 'home' }],
    ['/#faq-medida', { tipo: 'home' }],
    ['/c/pneus-para-carros', { tipo: 'categoria', slug: 'pneus-para-carros', pagina: 1 }],
    ['/c/pneus-para-carros?pagina=2', { tipo: 'categoria', slug: 'pneus-para-carros', pagina: 2 }],
    [
      '/p/3084/pneu-hankook-ventus-prime-2-k115-225-45-r17-91v',
      { tipo: 'produto', id: '3084', slug: 'pneu-hankook-ventus-prime-2-k115-225-45-r17-91v' },
    ],
    ['/ajuda/trocas-e-devolucoes', { tipo: 'politica', slug: 'trocas-e-devolucoes' }],
    ['/sobre-nos', { tipo: 'sobreNos' }],
    ['/lojas', { tipo: 'lojas' }],
    ['/lojas/curitiba', { tipo: 'loja', slug: 'curitiba' }],
    ['/comparar?p=3084,3026', { tipo: 'comparar', ids: ['3084', '3026'] }],
    ['/comparar', { tipo: 'comparar', ids: [] }],
  ])('%s', (caminho, esperado) => {
    expect(resolverRota(caminho)).toEqual(esperado)
  })

  test('caminho legado vira { tipo: "legado", caminho }', () => {
    expect(resolverRota('/1/5/Pneus-para-carros_Pneu-Aro-17')).toEqual({
      tipo: 'legado',
      caminho: '/1/5/Pneus-para-carros_Pneu-Aro-17',
    })
  })

  test('caminho desconhecido vira { tipo: "desconhecida" }', () => {
    expect(resolverRota('/isto-nao-existe/em-lugar-nenhum')).toEqual({ tipo: 'desconhecida' })
  })
})

describe('classificarHref', () => {
  test('interno para caminho relativo', () => {
    expect(classificarHref('/c/hankook')).toBe('interno')
  })

  test('externo para URL absoluta', () => {
    expect(classificarHref('https://www.tireshop.com.br/Blog')).toBe('externo')
  })

  test('ausente para null', () => {
    expect(classificarHref(null)).toBe('ausente')
  })
})
