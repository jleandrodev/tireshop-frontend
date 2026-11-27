import { falha, ok, type Result } from '#layers/shared'

// T-0301 · REQ-03-03 (docs/domain/catalogo.md): largura e altura inteiros positivos; aro como
// texto — nem todo aro é um número inteiro ("17,5", "16C").
export type MedidaInvalida = {
  readonly tipo: 'MedidaInvalida'
  readonly motivo: string
}

export class Medida {
  private constructor(
    readonly largura: number,
    readonly altura: number,
    readonly aro: string,
  ) {}

  get rotulo(): string {
    return `${this.largura}/${this.altura} R${this.aro}`
  }

  igual(outra: Medida): boolean {
    return this.largura === outra.largura && this.altura === outra.altura && this.aro === outra.aro
  }

  static de(dados: {
    largura: number
    altura: number
    aro: string
  }): Result<Medida, MedidaInvalida> {
    if (!Number.isInteger(dados.largura) || dados.largura <= 0) {
      return falha({ tipo: 'MedidaInvalida', motivo: `largura inválida: ${dados.largura}` })
    }
    if (!Number.isInteger(dados.altura) || dados.altura <= 0) {
      return falha({ tipo: 'MedidaInvalida', motivo: `altura inválida: ${dados.altura}` })
    }
    if (dados.aro.trim() === '') {
      return falha({ tipo: 'MedidaInvalida', motivo: 'aro vazio' })
    }
    return ok(new Medida(dados.largura, dados.altura, dados.aro))
  }
}
