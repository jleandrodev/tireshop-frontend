import { ok, type ErroDeContrato, type Result } from '#layers/shared'
import { paraProdutoResumo } from './produto-resumo.mapper'
import type { ListaDeProdutosDTO } from './lista-de-produtos.schema'
import type { ListaDeProdutos } from '../../domain/portas'
import type { ProdutoResumo } from '../../domain/produto-resumo'

// T-0309 · REQ-03-06, REQ-03-07 (docs/api/openapi.yaml): traduz o DTO (plano: pagina, porPagina,
// total e totalPaginas na raiz) pro modelo do contexto (`paginacao` aninhada). O DTO não sai de
// adapters/.
export function paraListaDeProdutos(
  dto: ListaDeProdutosDTO,
): Result<ListaDeProdutos, ErroDeContrato> {
  const itens: ProdutoResumo[] = []
  for (const item of dto.itens) {
    const resultado = paraProdutoResumo(item)
    if (!resultado.ok) return resultado
    itens.push(resultado.valor)
  }

  return ok({
    itens,
    paginacao: {
      pagina: dto.pagina,
      porPagina: dto.porPagina,
      total: dto.total,
      totalPaginas: dto.totalPaginas,
    },
    facetas: dto.facetas,
    ordenacoes: dto.ordenacoes,
  })
}
