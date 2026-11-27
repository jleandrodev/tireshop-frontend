import { z } from 'zod'

// T-0216 · REQ-02-12, REQ-02-13 (ADR 0004): o contrato de POST /newsletter. Sem `.strict()` de
// propósito — campo desconhecido é ignorado, não rejeitado (mesmo padrão de navegacao.schema.ts).
export const InscricaoNewsletterSchema = z.object({
  email: z.string(),
  whatsapp: z.string().nullable(),
})

export const ConfirmacaoSchema = z.object({
  mensagem: z.string(),
})
