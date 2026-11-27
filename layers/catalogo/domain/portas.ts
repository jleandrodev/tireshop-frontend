import type { ErroDeContrato, ErroDeRede, Result, Slug } from '#layers/shared'
import type { Categoria } from './categoria'
import type { CriterioDeListagem, Ordenacao } from './criterio-de-listagem'
import type { Faceta } from './faceta'
import type { ProdutoResumo } from './produto-resumo'

// T-0306/T-0307 · REQ-03-02, REQ-03-06 (docs/domain/catalogo.md): as portas de saída do
// contexto. `ProdutoRepository.obter`/`relacionados`/`porIds` entram quando a task que precisar
// deles chegar (módulos 04 e 08) — mesmo padrão de `ErroDeConteudo` na T-0201: a porta cresce
// com quem a usa.
export type ErroDeCatalogo = ErroDeRede | ErroDeContrato

export type Paginacao = {
  readonly pagina: number
  readonly porPagina: number
  readonly total: number
  readonly totalPaginas: number
}

// `OpcaoDeOrdenacao` (não `Ordenacao` solta): a API devolve rótulo pronto pro seletor de ordem
// (docs/api/openapi.yaml, ListaDeProdutos.ordenacoes) — achado na T-0309, lendo o contrato de
// verdade; ajustado aqui porque é o mesmo campo que a T-0306 só supôs sem checar.
export type OpcaoDeOrdenacao = {
  readonly valor: Ordenacao
  readonly rotulo: string
}

export type ListaDeProdutos = {
  readonly itens: readonly ProdutoResumo[]
  readonly paginacao: Paginacao
  readonly facetas: readonly Faceta[]
  readonly ordenacoes: readonly OpcaoDeOrdenacao[]
}

export type ProdutoRepository = {
  listar: (criterio: CriterioDeListagem) => Promise<Result<ListaDeProdutos, ErroDeCatalogo>>
}

export type CategoriaNaoEncontrada = {
  readonly tipo: 'CategoriaNaoEncontrada'
  readonly slug: string
}

export type CategoriaRepository = {
  obter: (slug: Slug) => Promise<Result<Categoria, CategoriaNaoEncontrada | ErroDeCatalogo>>
}
