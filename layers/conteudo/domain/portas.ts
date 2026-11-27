import type { ErroDeContrato, ErroDeRede, Result } from '#layers/shared'
import type { Navegacao } from './navegacao'

// T-0201 · REQ-02-01: a porta de saída do contexto, implementada pelo adaptador HTTP (T-0202).
// `ErroDeConteudo` cresce (ex.: `PaginaNaoEncontrada`) quando a task que precisar disso chegar
// (docs/domain/conteudo.md; `obterNavegacao` não tem "não encontrado" — é um recurso só).
export type ErroDeConteudo = ErroDeRede | ErroDeContrato

export type NavegacaoRepository = {
  obter: () => Promise<Result<Navegacao, ErroDeConteudo>>
}
