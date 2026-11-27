import { describe, expect, test } from 'vitest'
import { Imagem } from './imagem'
import { Pagina } from './pagina'
import { Slug } from './slug'

// T-0107 · REQ-01-08 (RNF-07): Slug, Imagem e Pagina validam os próprios invariantes na criação.

describe('Slug.de', () => {
  test('aceita "pneus-para-carros"', () => {
    expect(Slug.de('pneus-para-carros').ok).toBe(true)
  })

  test('aceita "225-45-r17"', () => {
    expect(Slug.de('225-45-r17').ok).toBe(true)
  })

  test.each([
    ['maiúscula', 'Pneus-Para-Carros'],
    ['espaço', 'pneus para carros'],
    ['acento', 'pneus-para-carros-aro-único'],
    ['barra', 'pneus/para-carros'],
    ['texto vazio', ''],
  ])('recusa %s', (_motivo, valor) => {
    expect(Slug.de(valor).ok).toBe(false)
  })

  test('recusa com o motivo, citando o valor recebido', () => {
    const resultado = Slug.de('Pneus-Para-Carros')
    if (resultado.ok) throw new Error('esperava falha')

    expect(resultado.erro).toEqual({
      tipo: 'SlugInvalido',
      motivo: 'formato inválido: "Pneus-Para-Carros"',
    })
  })
})

describe('Imagem.de', () => {
  test('aceita src, largura, altura e alt', () => {
    const resultado = Imagem.de({
      src: '/img/produtos/3084-320.webp',
      largura: 320,
      altura: 284,
      alt: 'Pneu aro 17',
    })
    expect(resultado.ok).toBe(true)
  })

  test('aceita alt vazio (imagem decorativa)', () => {
    const resultado = Imagem.de({ src: '/img/x.webp', largura: 10, altura: 10, alt: '' })
    expect(resultado.ok).toBe(true)
  })

  test.each([
    ['largura zero', { src: '/img/x.webp', largura: 0, altura: 10, alt: '' }],
    ['largura negativa', { src: '/img/x.webp', largura: -1, altura: 10, alt: '' }],
    ['altura zero', { src: '/img/x.webp', largura: 10, altura: 0, alt: '' }],
    ['altura negativa', { src: '/img/x.webp', largura: 10, altura: -1, alt: '' }],
  ])('recusa %s', (_motivo, entrada) => {
    expect(Imagem.de(entrada).ok).toBe(false)
  })

  test('recusa largura com o motivo, citando o valor recebido', () => {
    const resultado = Imagem.de({ src: '/img/x.webp', largura: 0, altura: 10, alt: '' })
    if (resultado.ok) throw new Error('esperava falha')

    expect(resultado.erro).toEqual({
      tipo: 'ImagemInvalida',
      motivo: 'largura precisa ser positiva: 0',
    })
  })

  test('recusa altura com o motivo, citando o valor recebido', () => {
    const resultado = Imagem.de({ src: '/img/x.webp', largura: 10, altura: -1, alt: '' })
    if (resultado.ok) throw new Error('esperava falha')

    expect(resultado.erro).toEqual({
      tipo: 'ImagemInvalida',
      motivo: 'altura precisa ser positiva: -1',
    })
  })
})

describe('Pagina.de', () => {
  test('pagina 1 de 3 (total 26, porPagina 12) tem próxima', () => {
    const resultado = Pagina.de({ pagina: 1, porPagina: 12, total: 26, itens: [] })
    if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))

    expect(resultado.valor.totalPaginas).toBe(3)
    expect(resultado.valor.temProxima()).toBe(true)
  })

  test('pagina 3 de 3 (total 26, porPagina 12) não tem próxima', () => {
    const resultado = Pagina.de({ pagina: 3, porPagina: 12, total: 26, itens: [] })
    if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))

    expect(resultado.valor.temProxima()).toBe(false)
  })

  test('recusa pagina menor que 1', () => {
    const resultado = Pagina.de({ pagina: 0, porPagina: 12, total: 26, itens: [] })
    expect(resultado.ok).toBe(false)
  })

  test('recusa pagina menor que 1, com o motivo', () => {
    const resultado = Pagina.de({ pagina: 0, porPagina: 12, total: 26, itens: [] })
    if (resultado.ok) throw new Error('esperava falha')

    expect(resultado.erro).toEqual({ tipo: 'PaginaInvalida', motivo: 'pagina precisa ser >= 1: 0' })
  })

  test('vazia (total 0) é válida e não tem próxima', () => {
    const resultado = Pagina.de({ pagina: 1, porPagina: 12, total: 0, itens: [] })
    if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))

    expect(resultado.valor.temProxima()).toBe(false)
  })

  test('totalPaginas é 0 quando total é 0, mesmo com porPagina 0 (evita NaN)', () => {
    const resultado = Pagina.de({ pagina: 1, porPagina: 0, total: 0, itens: [] })
    if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))

    expect(resultado.valor.totalPaginas).toBe(0)
  })
})
