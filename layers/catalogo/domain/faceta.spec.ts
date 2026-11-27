import { describe, expect, test } from 'vitest'
import { CriterioDeListagem } from './criterio-de-listagem'
import { facetasExibiveis, marcada, type Faceta } from './faceta'

// T-0305 · REQ-03-05 (docs/domain/catalogo.md): o que o painel de filtros mostra — a contagem é
// da API (fora do escopo), aqui só a regra de "o que ajuda a filtrar".

const FACETAS: readonly Faceta[] = [
  {
    chave: 'aro',
    rotulo: 'Aro',
    opcoes: [
      { valor: '17', rotulo: 'Aro 17', total: 12 },
      { valor: '18', rotulo: 'Aro 18', total: 0 },
    ],
  },
  {
    chave: 'marca',
    rotulo: 'Marca',
    opcoes: [
      { valor: 'hankook', rotulo: 'Hankook', total: 5 },
      { valor: 'fortune', rotulo: 'Fortune', total: 3 },
      { valor: 'sem-estoque', rotulo: 'Sem Estoque', total: 0 },
    ],
  },
  {
    chave: 'cor',
    rotulo: 'Cor',
    opcoes: [{ valor: 'preto', rotulo: 'Preto', total: 20 }],
  },
]

describe('facetasExibiveis', () => {
  test('opção com total 0 não é exibível', () => {
    const [marca] = facetasExibiveis(FACETAS, CriterioDeListagem.inicial())

    expect(marca!.opcoes.map((opcao) => opcao.valor)).toEqual(['hankook', 'fortune'])
  })

  test('faceta com uma opção exibível só não é exibível (Aro, com 1 de 2 opções restando)', () => {
    const exibiveis = facetasExibiveis(FACETAS, CriterioDeListagem.inicial())

    expect(exibiveis.find((faceta) => faceta.chave === 'aro')).toBeUndefined()
  })

  test('faceta com uma única opção de propósito (Cor) também não é exibível', () => {
    const exibiveis = facetasExibiveis(FACETAS, CriterioDeListagem.inicial())

    expect(exibiveis.find((faceta) => faceta.chave === 'cor')).toBeUndefined()
  })

  test('mantém a ordem recebida das facetas e das opções', () => {
    const exibiveis = facetasExibiveis(FACETAS, CriterioDeListagem.inicial())

    expect(exibiveis.map((faceta) => faceta.chave)).toEqual(['marca'])
    expect(exibiveis[0]!.opcoes.map((opcao) => opcao.valor)).toEqual(['hankook', 'fortune'])
  })

  test('marca as opções ativas no critério', () => {
    const criterio = CriterioDeListagem.inicial().alternar('marca', 'hankook')

    const [marca] = facetasExibiveis(FACETAS, criterio)

    expect(marca!.opcoes.find((opcao) => opcao.valor === 'hankook')?.marcada).toBe(true)
    expect(marca!.opcoes.find((opcao) => opcao.valor === 'fortune')?.marcada).toBe(false)
  })
})

describe('marcada', () => {
  test('diz quais opções estão ativas no critério', () => {
    const criterio = CriterioDeListagem.inicial().alternar('marca', 'hankook')

    expect(marcada(criterio, 'marca', 'hankook')).toBe(true)
    expect(marcada(criterio, 'marca', 'fortune')).toBe(false)
    expect(marcada(criterio, 'aro', '17')).toBe(false)
  })
})
