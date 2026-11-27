import { falha, ok, type Result } from './result'

// T-0107 · REQ-01-08 (RNF-07): identificador de URL. Só minúscula, dígito e hífen simples — sem
// gerar a partir de texto livre (isso é tarefa de outro módulo, quando existir).
export type SlugInvalido = {
  readonly tipo: 'SlugInvalido'
  readonly motivo: string
}

const FORMATO_SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

export class Slug {
  private constructor(readonly valor: string) {}

  static de(valor: string): Result<Slug, SlugInvalido> {
    if (!FORMATO_SLUG.test(valor)) {
      return falha({ tipo: 'SlugInvalido', motivo: `formato inválido: "${valor}"` })
    }
    return ok(new Slug(valor))
  }
}
