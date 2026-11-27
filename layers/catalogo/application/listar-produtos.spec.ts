import { erroDeRede } from '#layers/shared'
import { describe, expect, test } from 'vitest'
import { criarProdutoRepositoryFalso } from './__falsos__/produto-repository-falso'
import { listarProdutos } from './listar-produtos'
import { CriterioDeListagem, POR_PAGINA } from '../domain/criterio-de-listagem'
import { umProdutoResumo } from '../domain/__fabricas__/produto'

// T-0306 · REQ-03-02, REQ-03-06 (docs/domain/catalogo.md): só repassa a porta, mas garante que a
// listagem nunca pede mais de 12 por página — mesmo padrão de `obterNavegacao` (T-0201), com uma
// regra de negócio a mais.

function umaLista() {
  return {
    itens: [umProdutoResumo()],
    paginacao: { pagina: 1, porPagina: 12, total: 1, totalPaginas: 1 },
    facetas: [],
    ordenacoes: [{ valor: 'mais_vendidos' as const, rotulo: 'Mais vendidos' }],
  }
}

describe('listarProdutos', () => {
  test('repassa o critério à porta e devolve itens, paginação, facetas e ordenações', async () => {
    const repositorio = criarProdutoRepositoryFalso()
    const lista = umaLista()
    repositorio.programarSucesso(lista)
    const criterio = CriterioDeListagem.inicial('pneus-para-carros')

    const resultado = await listarProdutos(repositorio, criterio)

    expect(repositorio.chamadas).toHaveLength(1)
    expect(repositorio.chamadas[0]?.categoria).toBe('pneus-para-carros')
    if (!resultado.ok) throw new Error('esperava sucesso')
    expect(resultado.valor).toEqual(lista)
  })

  test('nunca pede mais de 12 por página, mesmo que a entrada peça', async () => {
    const repositorio = criarProdutoRepositoryFalso()
    repositorio.programarSucesso(umaLista())
    const criterio = CriterioDeListagem.inicial('pneus-para-carros', 999)

    await listarProdutos(repositorio, criterio)

    expect(repositorio.chamadas[0]?.porPagina).toBe(POR_PAGINA)
  })

  test('erro da porta sai como Result de falha, sem lançar', async () => {
    const repositorio = criarProdutoRepositoryFalso()
    repositorio.programarFalha(erroDeRede('tempo esgotado'))
    const criterio = CriterioDeListagem.inicial('pneus-para-carros')

    const resultado = await listarProdutos(repositorio, criterio)

    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('ErroDeRede')
  })

  test('lista vazia é sucesso, com total 0', async () => {
    const repositorio = criarProdutoRepositoryFalso()
    repositorio.programarSucesso({
      itens: [],
      paginacao: { pagina: 1, porPagina: 12, total: 0, totalPaginas: 0 },
      facetas: [],
      ordenacoes: [{ valor: 'mais_vendidos' as const, rotulo: 'Mais vendidos' }],
    })
    const criterio = CriterioDeListagem.inicial('pneus-para-carros')

    const resultado = await listarProdutos(repositorio, criterio)

    if (!resultado.ok) throw new Error('esperava sucesso')
    expect(resultado.valor.itens).toHaveLength(0)
    expect(resultado.valor.paginacao.total).toBe(0)
  })
})
