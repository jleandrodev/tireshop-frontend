import { erroDeValidacao, falha, type Result } from '#layers/shared'
import { InscricaoNewsletter } from '../domain/inscricao-newsletter'
import type { Confirmacao, ErroDeRelacionamento, LeadsGateway } from '../domain/portas'

// T-0215 · REQ-02-12, REQ-02-13 (docs/domain/relacionamento.md): valida localmente antes de
// chamar a porta (regra do contexto) — um e-mail ou WhatsApp inválido nunca gera tráfego de rede.
export async function assinarNewsletter(
  gateway: LeadsGateway,
  dados: { email: string; whatsapp?: string },
): Promise<Result<Confirmacao, ErroDeRelacionamento>> {
  const inscricao = InscricaoNewsletter.de(dados)
  if (!inscricao.ok) return falha(erroDeValidacao([inscricao.erro]))

  return gateway.assinar(inscricao.valor)
}
