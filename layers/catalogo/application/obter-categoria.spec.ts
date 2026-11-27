import { falha, ok, Slug } from '#layers/shared'
import { describe, expect, test } from 'vitest'
import type { Categoria } from '../domain/categoria'
import type { CategoriaRepository } from '../domain/portas'
import { obterCategoria } from './obter-categoria'

// T-0307 · REQ-03-01, REQ-03-16 (docs/domain/catalogo.md): só repassa a porta — mesmo padrão de
// `obterNavegacao` (T-0201).

function umSlug(valor: string) {
  const resultado = Slug.de(valor)
  if (!resultado.ok) throw new Error('slug de prova inválido')
  return resultado.valor
}

function umRepositorioFalso(categoria: Categoria | undefined): CategoriaRepository {
  return {
    obter: async (slug) =>
      categoria ? ok(categoria) : falha({ tipo: 'CategoriaNaoEncontrada', slug: slug.valor }),
  }
}

describe('obterCategoria', () => {
  test('devolve a categoria pelo slug', async () => {
    const categoria: Categoria = { slug: umSlug('pneus-para-carros'), tipo: 'departamento' }
    const repositorio = umRepositorioFalso(categoria)

    const resultado = await obterCategoria(repositorio, umSlug('pneus-para-carros'))

    if (!resultado.ok) throw new Error('esperava sucesso')
    expect(resultado.valor).toEqual(categoria)
  })

  test('slug inexistente devolve CategoriaNaoEncontrada', async () => {
    const repositorio = umRepositorioFalso(undefined)

    const resultado = await obterCategoria(repositorio, umSlug('nao-existe'))

    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('CategoriaNaoEncontrada')
  })
})
