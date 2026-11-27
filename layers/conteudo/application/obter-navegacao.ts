import type { Result } from '#layers/shared'
import type { Navegacao } from '../domain/navegacao'
import type { ErroDeConteudo, NavegacaoRepository } from '../domain/portas'

// T-0201 · REQ-02-01: só repassa a porta. "Uma busca por requisição" (cache) é decisão da
// composição (T-0204, o mesmo padrão do ClienteHttp em T-0118), não deste caso de uso.
export function obterNavegacao(
  repositorio: NavegacaoRepository,
): Promise<Result<Navegacao, ErroDeConteudo>> {
  return repositorio.obter()
}
