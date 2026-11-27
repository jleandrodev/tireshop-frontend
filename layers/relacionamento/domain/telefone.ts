import { falha, ok, type Result } from '#layers/shared'

// T-0214 · REQ-02-12 (docs/domain/relacionamento.md): telefone com DDD, 10 (fixo) ou 11 (celular)
// dígitos — guardado só com os dígitos, aceitando entrada já formatada.
export type TelefoneInvalido = {
  readonly tipo: 'TelefoneInvalido'
  readonly motivo: string
}

export class Telefone {
  private constructor(readonly valor: string) {}

  static de(valor: string): Result<Telefone, TelefoneInvalido> {
    const digitos = valor.replace(/\D/g, '')
    if (digitos.length !== 10 && digitos.length !== 11) {
      return falha({
        tipo: 'TelefoneInvalido',
        motivo: `precisa de 10 ou 11 dígitos com DDD: "${valor}"`,
      })
    }
    return ok(new Telefone(digitos))
  }
}
