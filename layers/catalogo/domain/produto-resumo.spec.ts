import { describe, expect, test } from 'vitest'
import { umProdutoResumo } from './__fabricas__/produto'
import { estrelasCheias, mostraPreco, podeComprar, seloFrete } from './produto-resumo'

// T-0303 · REQ-03-03, REQ-03-04 (docs/domain/catalogo.md): o que o card precisa saber — se pode
// comprar, se mostra preço, o selo de frete e as estrelas. Funções livres sobre o tipo (mesmo
// padrão de `Navegacao`: um read-model montado de dados já válidos, sem invariante própria).

describe('podeComprar e mostraPreco', () => {
  test('em estoque: os dois são verdadeiros', () => {
    const produto = umProdutoResumo({ disponibilidade: 'em_estoque' })

    expect(podeComprar(produto)).toBe(true)
    expect(mostraPreco(produto)).toBe(true)
  })

  test('sem estoque: os dois são falsos, mesmo que venha preço', () => {
    const produto = umProdutoResumo({ disponibilidade: 'sem_estoque' })

    expect(podeComprar(produto)).toBe(false)
    expect(mostraPreco(produto)).toBe(false)
    expect(produto.preco).toBeDefined()
  })
})

describe('seloFrete', () => {
  test('devolve o texto "Frete grátis Sul e Sudeste acima de R$ 1.000,00"', () => {
    const produto = umProdutoResumo()

    expect(seloFrete(produto)).toBe('Frete grátis Sul e Sudeste acima de R$ 1.000,00')
  })

  test('sem selo, devolve nada', () => {
    const produto = umProdutoResumo({ frete: undefined })

    expect(seloFrete(produto)).toBeUndefined()
  })
})

describe('estrelasCheias', () => {
  test.each([
    [4.4, 4],
    [4.5, 5],
    [3.2, 3],
  ])('arredonda %s para %s', (nota, esperado) => {
    const produto = umProdutoResumo({ nota })

    expect(estrelasCheias(produto)).toBe(esperado)
  })

  test('sem nota, devolve nada (T-0308: avaliacao: null na API)', () => {
    const produto = umProdutoResumo({ nota: undefined })

    expect(estrelasCheias(produto)).toBeUndefined()
  })
})

describe('umProdutoResumo', () => {
  test('cria um válido e aceita sobrescritas', () => {
    const padrao = umProdutoResumo()
    expect(padrao.disponibilidade).toBe('em_estoque')

    const sobrescrito = umProdutoResumo({ disponibilidade: 'sem_estoque', nota: 2 })
    expect(sobrescrito.disponibilidade).toBe('sem_estoque')
    expect(sobrescrito.nota).toBe(2)
  })
})
