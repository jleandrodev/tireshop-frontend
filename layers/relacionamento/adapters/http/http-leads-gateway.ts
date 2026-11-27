import { erroDeContrato, type ClienteHttp, type ErroDoKernel, type Result } from '#layers/shared'
import type { Confirmacao, ErroDeRelacionamento, LeadsGateway } from '../../domain/portas'
import { ConfirmacaoSchema } from './newsletter.schema'

const ENDPOINT = 'POST /newsletter'

// `/newsletter` não tem parâmetro: 404 (NaoEncontrado) do ErroDoKernel não faz sentido aqui, mas
// o ClienteHttp o admite para qualquer endpoint. Vira ErroDeContrato (mesmo padrão de
// http-navegacao-repository.ts).
function paraErroDeRelacionamento(erro: ErroDoKernel): ErroDeRelacionamento {
  if (erro.tipo === 'NaoEncontrado') {
    return erroDeContrato(ENDPOINT, '', 'resposta inesperada do servidor: NaoEncontrado')
  }
  return erro
}

// T-0216 · REQ-02-12, REQ-02-13 (ADR 0003): a única porta de saída que fala HTTP para o contexto
// Relacionamento. 422 e falha de rede já chegam prontos do `ClienteHttp` (ADR 0010).
export function criarHttpLeadsGateway(clienteHttp: ClienteHttp): LeadsGateway {
  return {
    assinar: async (inscricao): Promise<Result<Confirmacao, ErroDeRelacionamento>> => {
      const corpo = {
        email: inscricao.email.valor,
        whatsapp: inscricao.whatsapp?.valor ?? null,
      }
      const resultado = await clienteHttp.enviar('POST', '/newsletter', corpo, {
        schema: ConfirmacaoSchema,
      })
      if (!resultado.ok) return { ok: false, erro: paraErroDeRelacionamento(resultado.erro) }
      return { ok: true, valor: resultado.valor }
    },
  }
}
