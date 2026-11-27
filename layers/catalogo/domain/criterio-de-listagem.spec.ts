import { describe, expect, test } from 'vitest'
import { CriterioDeListagem, POR_PAGINA } from './criterio-de-listagem'

// T-0304 · REQ-03-06, REQ-03-09 (docs/domain/catalogo.md): value object imutável — cada operação
// devolve um novo critério, nunca muda o que já existia (a URL é a fonte da verdade, não um
// estado escondido).

function umCriterio(): CriterioDeListagem {
  return CriterioDeListagem.inicial('pneus-para-carros')
}

describe('CriterioDeListagem.inicial', () => {
  test('começa na página 1, ordem mais_vendidos, 12 por página', () => {
    const criterio = umCriterio()

    expect(criterio.pagina).toBe(1)
    expect(criterio.ordem).toBe('mais_vendidos')
    expect(POR_PAGINA).toBe(12)
  })
})

describe('alternar', () => {
  test('marca uma opção; alternar de novo desmarca', () => {
    const sem = umCriterio()
    const com = sem.alternar('aro', '17')
    const semDeNovo = com.alternar('aro', '17')

    expect(com).not.toBe(sem)
    expect(com.temFiltro()).toBe(true)
    expect(semDeNovo.temFiltro()).toBe(false)
    expect(sem.temFiltro()).toBe(false)
  })

  test('alternar uma faceta volta para a página 1', () => {
    const naPagina3 = umCriterio().irParaPagina(3)

    const resultado = naPagina3.alternar('aro', '17')

    expect(resultado.pagina).toBe(1)
  })
})

describe('comOrdem', () => {
  test('mudar a ordem volta para a página 1', () => {
    const naPagina3 = umCriterio().irParaPagina(3)

    const resultado = naPagina3.comOrdem('menor_preco')

    expect(resultado.ordem).toBe('menor_preco')
    expect(resultado.pagina).toBe(1)
  })
})

describe('irParaPagina', () => {
  test('irParaPagina(0) é recusado: o critério não muda', () => {
    const criterio = umCriterio().irParaPagina(5)

    const resultado = criterio.irParaPagina(0)

    expect(resultado.pagina).toBe(5)
  })

  test('vai para uma página válida', () => {
    expect(umCriterio().irParaPagina(3).pagina).toBe(3)
  })
})

describe('limpar', () => {
  test('tira as facetas e mantém a categoria e a ordem', () => {
    const comFiltros = umCriterio().alternar('aro', '17').comOrdem('menor_preco')

    const limpo = comFiltros.limpar()

    expect(limpo.temFiltro()).toBe(false)
    expect(limpo.categoria).toBe('pneus-para-carros')
    expect(limpo.ordem).toBe('menor_preco')
  })
})

describe('temFiltro', () => {
  test('é falso quando só há categoria', () => {
    expect(umCriterio().temFiltro()).toBe(false)
  })
})

describe('paraQuery e deQuery', () => {
  test('gera aro=17&aro=18&marca=hankook, omitindo os padrões', () => {
    const criterio = umCriterio()
      .alternar('aro', '17')
      .alternar('aro', '18')
      .alternar('marca', 'hankook')

    expect(criterio.paraQuery().toString()).toBe('aro=17&aro=18&marca=hankook')
  })

  test('deQuery faz o caminho de volta', () => {
    const original = umCriterio()
      .alternar('aro', '17')
      .alternar('aro', '18')
      .alternar('marca', 'hankook')

    const refeito = CriterioDeListagem.deQuery(original.paraQuery(), 'pneus-para-carros')

    expect(refeito.paraQuery().toString()).toBe(original.paraQuery().toString())
    expect(refeito.categoria).toBe('pneus-para-carros')
  })

  test('não omite ordem e página quando fora do padrão', () => {
    const criterio = umCriterio().comOrdem('menor_preco').irParaPagina(2)

    expect(criterio.paraQuery().toString()).toBe('ordem=menor_preco&pagina=2')
  })

  test('valores desconhecidos na query são ignorados', () => {
    const query = new URLSearchParams('pagina=abc&aro=17')

    const criterio = CriterioDeListagem.deQuery(query)

    expect(criterio.pagina).toBe(1)
    expect(criterio.paraQuery().toString()).toBe('aro=17')
  })

  test('ordem inválida vira a padrão', () => {
    const query = new URLSearchParams('ordem=nao-existe')

    const criterio = CriterioDeListagem.deQuery(query)

    expect(criterio.ordem).toBe('mais_vendidos')
  })
})
