import { falha, ok, type CampoInvalido, type Result } from '#layers/shared'
import { Email } from './email'
import { Telefone } from './telefone'

// T-0214 · REQ-02-12 (docs/domain/relacionamento.md, R2-22): e-mail obrigatório, WhatsApp
// opcional — mas se vier preenchido, precisa ser um `Telefone` válido. A falha usa `CampoInvalido`
// (do kernel): a tela sabe em qual campo mostrar a mensagem.
const MENSAGEM_EMAIL_INVALIDO = 'Digite um e-mail válido, como nome@exemplo.com.br.'
const MENSAGEM_WHATSAPP_INVALIDO = 'Digite o WhatsApp com DDD: 10 ou 11 números.'

export class InscricaoNewsletter {
  private constructor(
    readonly email: Email,
    readonly whatsapp: Telefone | null,
  ) {}

  static de(dados: {
    email: string
    whatsapp?: string
  }): Result<InscricaoNewsletter, CampoInvalido> {
    const email = Email.de(dados.email)
    if (!email.ok) return falha({ campo: 'email', mensagem: MENSAGEM_EMAIL_INVALIDO })

    const whatsappBruto = dados.whatsapp?.trim()
    if (!whatsappBruto) return ok(new InscricaoNewsletter(email.valor, null))

    const whatsapp = Telefone.de(whatsappBruto)
    if (!whatsapp.ok) return falha({ campo: 'whatsapp', mensagem: MENSAGEM_WHATSAPP_INVALIDO })

    return ok(new InscricaoNewsletter(email.valor, whatsapp.valor))
  }
}
