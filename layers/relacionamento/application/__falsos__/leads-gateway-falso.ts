import { falha, ok, type Result } from '#layers/shared'
import type { InscricaoNewsletter } from '../../domain/inscricao-newsletter'
import type { Confirmacao, ErroDeRelacionamento, LeadsGateway } from '../../domain/portas'

// T-0215 (docs/testing.md, "Portas falsas"): implementação em memória, para o caso de uso testar
// sem rede nenhuma; guarda as chamadas recebidas para o teste conferir o que foi enviado.
export type LeadsGatewayFalso = LeadsGateway & {
  programarSucesso: (confirmacao: Confirmacao) => void
  programarFalha: (erro: ErroDeRelacionamento) => void
  readonly chamadas: InscricaoNewsletter[]
}

export function criarLeadsGatewayFalso(): LeadsGatewayFalso {
  let resposta: Result<Confirmacao, ErroDeRelacionamento> = ok({
    mensagem: 'Inscrição confirmada.',
  })
  const chamadas: InscricaoNewsletter[] = []

  return {
    chamadas,
    programarSucesso: (confirmacao) => {
      resposta = ok(confirmacao)
    },
    programarFalha: (erro) => {
      resposta = falha(erro)
    },
    assinar: async (inscricao) => {
      chamadas.push(inscricao)
      return resposta
    },
  }
}
