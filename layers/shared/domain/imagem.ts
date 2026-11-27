import { falha, ok, type Result } from './result'

// T-0107 · REQ-01-08 (RNF-07): dimensões sempre conhecidas (evita layout shift). `alt` vazio é
// válido: é como se marca imagem decorativa. Sem srcset nem otimização — isso é de outro módulo.
export type ImagemInvalida = {
  readonly tipo: 'ImagemInvalida'
  readonly motivo: string
}

export class Imagem {
  private constructor(
    readonly src: string,
    readonly largura: number,
    readonly altura: number,
    readonly alt: string,
  ) {}

  static de(parametros: {
    src: string
    largura: number
    altura: number
    alt: string
  }): Result<Imagem, ImagemInvalida> {
    const { src, largura, altura, alt } = parametros
    if (largura <= 0) {
      return falha({ tipo: 'ImagemInvalida', motivo: `largura precisa ser positiva: ${largura}` })
    }
    if (altura <= 0) {
      return falha({ tipo: 'ImagemInvalida', motivo: `altura precisa ser positiva: ${altura}` })
    }
    return ok(new Imagem(src, largura, altura, alt))
  }
}
