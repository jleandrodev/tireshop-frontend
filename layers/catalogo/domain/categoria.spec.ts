import { Slug } from '#layers/shared'
import { describe, expect, test } from 'vitest'
import { abaInicialDaBusca, type Categoria } from './categoria'

// T-0307 · REQ-03-01, REQ-03-16 (docs/domain/catalogo.md): a aba inicial da busca por pneu, nas
// categorias que já pré-selecionam a medida ou o aro.

function umaCategoria(tipo: Categoria['tipo']): Categoria {
  const resultado = Slug.de('pneus-para-carros')
  if (!resultado.ok) throw new Error('slug de prova inválido')
  return { slug: resultado.valor, tipo }
}

describe('abaInicialDaBusca', () => {
  test('é medida na categoria de medida', () => {
    expect(abaInicialDaBusca(umaCategoria('medida'))).toBe('medida')
  })

  test('é aro na categoria de aro', () => {
    expect(abaInicialDaBusca(umaCategoria('aro'))).toBe('aro')
  })

  test('é medida na categoria de departamento ou de marca (padrão)', () => {
    expect(abaInicialDaBusca(umaCategoria('departamento'))).toBe('medida')
    expect(abaInicialDaBusca(umaCategoria('marca'))).toBe('medida')
  })
})
