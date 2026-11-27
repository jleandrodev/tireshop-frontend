import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { criarClienteHttpFalso, erroDeRede } from '#layers/shared'
import { describe, expect, test } from 'vitest'
import { CriterioDeListagem } from '../../domain/criterio-de-listagem'
import { criarHttpProdutoRepository } from './http-produto-repository'
import { ListaDeProdutosSchema } from './lista-de-produtos.schema'

// T-0309 · REQ-03-06, REQ-03-07 (docs/api/openapi.yaml, ListaDeProdutos): o adaptador HTTP do
// contexto — o DTO nunca sai de adapters/, só a `ListaDeProdutos` do domínio.

const raiz = join(import.meta.dirname, '..', '..', '..', '..')

function fixture(nome: string): unknown {
  return JSON.parse(readFileSync(join(raiz, 'mocks', 'fixtures', `${nome}.json`), 'utf8'))
}

describe('ListaDeProdutosSchema', () => {
  test.each([
    'produtos-lista',
    'produtos-lista-pagina-3',
    'produtos-lista-medida-225-45-r17',
    'produtos-vitrine-ofertas',
    'produtos-lista-vazia',
  ])('%s.json valida no schema', (nome) => {
    expect(ListaDeProdutosSchema.safeParse(fixture(nome)).success).toBe(true)
  })

  test('recusa resposta sem total, com o caminho do campo', () => {
    const resposta = fixture('produtos-lista') as Record<string, unknown>
    delete resposta.total

    const resultado = ListaDeProdutosSchema.safeParse(resposta)

    expect(resultado.success).toBe(false)
    if (resultado.success) throw new Error('esperava falha')
    expect(resultado.error.issues[0]?.path).toEqual(['total'])
  })
})

describe('criarHttpProdutoRepository', () => {
  test('monta GET /produtos com categoria, facetas repetidas, ordem, página e porPagina', async () => {
    const clienteHttp = criarClienteHttpFalso()
    clienteHttp.programarSucesso('/produtos', fixture('produtos-lista'))
    const repositorio = criarHttpProdutoRepository(clienteHttp)
    const criterio = CriterioDeListagem.inicial('pneus-para-carros')
      .alternar('aro', '17')
      .alternar('aro', '18')
      .alternar('marca', 'hankook')
      .comOrdem('menor_preco')
      .irParaPagina(2)

    await repositorio.listar(criterio)

    expect(clienteHttp.chamadas).toEqual([
      {
        metodo: 'GET',
        caminho: '/produtos',
        corpo: undefined,
        consulta: {
          categoria: 'pneus-para-carros',
          aro: ['17', '18'],
          marca: ['hankook'],
          ordem: 'menor_preco',
          pagina: 2,
          porPagina: 12,
        },
      },
    ])
  })

  test('resposta válida vira ListaDeProdutos com facetas e paginação', async () => {
    const clienteHttp = criarClienteHttpFalso()
    clienteHttp.programarSucesso('/produtos', fixture('produtos-lista'))
    const repositorio = criarHttpProdutoRepository(clienteHttp)

    const resultado = await repositorio.listar(CriterioDeListagem.inicial('pneus-para-carros'))

    if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))
    expect(resultado.valor.itens.length).toBeGreaterThan(0)
    expect(resultado.valor.paginacao).toEqual({
      pagina: 1,
      porPagina: 12,
      total: 26,
      totalPaginas: 3,
    })
    expect(resultado.valor.facetas.length).toBeGreaterThan(0)
  })

  test('a fixture produtos-lista-vazia.json vira lista vazia, sem erro', async () => {
    const clienteHttp = criarClienteHttpFalso()
    clienteHttp.programarSucesso('/produtos', fixture('produtos-lista-vazia'))
    const repositorio = criarHttpProdutoRepository(clienteHttp)

    const resultado = await repositorio.listar(CriterioDeListagem.inicial('pneus-para-carros'))

    if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))
    expect(resultado.valor.itens).toHaveLength(0)
    expect(resultado.valor.paginacao.total).toBe(0)
  })

  test('falha de rede vira ErroDeRede', async () => {
    const clienteHttp = criarClienteHttpFalso()
    clienteHttp.programarFalha('/produtos', erroDeRede('tempo esgotado'))
    const repositorio = criarHttpProdutoRepository(clienteHttp)

    const resultado = await repositorio.listar(CriterioDeListagem.inicial('pneus-para-carros'))

    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('ErroDeRede')
  })
})
