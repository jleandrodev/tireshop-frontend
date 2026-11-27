import { inject, type InjectionKey } from 'vue'
import type { Result } from '#layers/shared'
import { assinarNewsletter as assinarNewsletterCasoDeUso } from '../../application/assinar-newsletter'
import type { Confirmacao, ErroDeRelacionamento, LeadsGateway } from '../../domain/portas'

// T-0218 · REQ-02-12, REQ-02-13 (ADR 0002, ADR 0007): o `LeadsGateway` nasce num lugar só
// (app/plugins/16.relacionamento.ts) e chega aqui por injeção — nunca por
// `criarHttpLeadsGateway` direto num componente de tela.
export const SIMBOLO_LEADS_GATEWAY: InjectionKey<LeadsGateway> = Symbol('leadsGateway')

export function useRelacionamento(): {
  assinarNewsletter: (dados: {
    email: string
    whatsapp?: string
  }) => Promise<Result<Confirmacao, ErroDeRelacionamento>>
} {
  const gateway = inject(SIMBOLO_LEADS_GATEWAY)
  if (!gateway) {
    throw new Error(
      'useRelacionamento: nenhum LeadsGateway foi fornecido (ver app/plugins/16.relacionamento.ts)',
    )
  }

  return {
    assinarNewsletter: (dados) => assinarNewsletterCasoDeUso(gateway, dados),
  }
}
