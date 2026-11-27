import { falha, ok, type Result } from '#layers/shared'

// T-0214 · REQ-02-12 (docs/domain/relacionamento.md): endereço de e-mail, guardado em minúsculas
// (dois e-mails que só diferem em caixa são o mesmo contato).
export type EmailInvalido = {
  readonly tipo: 'EmailInvalido'
  readonly motivo: string
}

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class Email {
  private constructor(readonly valor: string) {}

  static de(valor: string): Result<Email, EmailInvalido> {
    const normalizado = valor.toLowerCase()
    if (!FORMATO_EMAIL.test(normalizado)) {
      return falha({ tipo: 'EmailInvalido', motivo: `formato inválido: "${valor}"` })
    }
    return ok(new Email(normalizado))
  }
}
