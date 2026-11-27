import type { ErroDeContrato, ErroDeRede, Result } from '#layers/shared'
import type { CriterioDeListagem, Ordenacao } from './criterio-de-listagem'
import type { Faceta } from './faceta'
import type { ProdutoResumo } from './produto-resumo'

// T-0306 · REQ-03-02, REQ-03-06 (docs/domain/catalogo.md): a porta de saída do contexto.
// `obter`, `relacionados` e `porIds` entram quando a task que precisar deles chegar (módulos 04
// e 08) — mesmo padrão de `ErroDeConteudo` na T-0201: a porta cresce com quem a usa.
export type ErroDeCatalogo = ErroDeRede | ErroDeContrato

export type Paginacao = {
  readonly pagina: number
  readonly porPagina: number
  readonly total: number
  readonly totalPaginas: number
}

export type ListaDeProdutos = {
  readonly itens: readonly ProdutoResumo[]
  readonly paginacao: Paginacao
  readonly facetas: readonly Faceta[]
  readonly ordenacoes: readonly Ordenacao[]
}

export type ProdutoRepository = {
  listar: (criterio: CriterioDeListagem) => Promise<Result<ListaDeProdutos, ErroDeCatalogo>>
}
