import type { Result } from '#layers/shared'
import { POR_PAGINA, type CriterioDeListagem } from '../domain/criterio-de-listagem'
import type { ErroDeCatalogo, ListaDeProdutos, ProdutoRepository } from '../domain/portas'

// T-0306 · REQ-03-02, REQ-03-06 (docs/domain/catalogo.md): repassa o critério à porta, mas nunca
// deixa pedir mais de 12 por página na listagem — mesmo que o critério recebido peça mais (ex.:
// um critério montado para o comparador, que pede até 48, nunca deveria chegar aqui, mas a
// listagem não confia nisso).
export function listarProdutos(
  repositorio: ProdutoRepository,
  criterio: CriterioDeListagem,
): Promise<Result<ListaDeProdutos, ErroDeCatalogo>> {
  const criterioLimitado =
    criterio.porPagina > POR_PAGINA ? criterio.comPorPagina(POR_PAGINA) : criterio
  return repositorio.listar(criterioLimitado)
}
