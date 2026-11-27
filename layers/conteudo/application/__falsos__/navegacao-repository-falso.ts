import { falha, ok, type Result } from '#layers/shared'
import { umaNavegacao } from '../../domain/__fabricas__/navegacao'
import type { Navegacao } from '../../domain/navegacao'
import type { ErroDeConteudo, NavegacaoRepository } from '../../domain/portas'

// T-0201 (docs/testing.md, "Portas falsas"): implementação em memória, para o caso de uso testar
// sem rede nenhuma.
export type NavegacaoRepositoryFalso = NavegacaoRepository & {
  programarSucesso: (navegacao: Navegacao) => void
  programarFalha: (erro: ErroDeConteudo) => void
}

export function criarNavegacaoRepositoryFalso(): NavegacaoRepositoryFalso {
  let resposta: Result<Navegacao, ErroDeConteudo> = ok(umaNavegacao())

  return {
    programarSucesso: (navegacao) => {
      resposta = ok(navegacao)
    },
    programarFalha: (erro) => {
      resposta = falha(erro)
    },
    obter: async () => resposta,
  }
}
