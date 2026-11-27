import { falha, ok, type Result } from './result'

// T-0102 · REQ-01-02 (RNF-07, premissa P3 do PRD): centavos inteiros em BRL. Imutável, sem
// dividir/multiplicar por fração/aplicar percentual — essas contas vêm prontas da API; fazê-las
// aqui arriscaria arredondar diferente do backend.
export type DinheiroInvalido = {
  readonly tipo: 'DinheiroInvalido'
  readonly motivo: string
}

const MOEDA_SUPORTADA = 'BRL'

export class Dinheiro {
  private constructor(
    readonly centavos: number,
    readonly moeda: typeof MOEDA_SUPORTADA,
  ) {}

  static deCentavos(
    centavos: number,
    moeda: string = MOEDA_SUPORTADA,
  ): Result<Dinheiro, DinheiroInvalido> {
    if (moeda !== MOEDA_SUPORTADA) {
      return falha({ tipo: 'DinheiroInvalido', motivo: `moeda não suportada: ${moeda}` })
    }
    if (!Number.isInteger(centavos)) {
      return falha({
        tipo: 'DinheiroInvalido',
        motivo: `centavos precisa ser inteiro: ${centavos}`,
      })
    }
    if (centavos < 0) {
      return falha({
        tipo: 'DinheiroInvalido',
        motivo: `centavos não pode ser negativo: ${centavos}`,
      })
    }
    return ok(new Dinheiro(centavos, MOEDA_SUPORTADA))
  }

  /** "R$ 529,00", com espaço inseparável antes do valor (não quebra linha entre o cifrão e o número). */
  formatar(): string {
    const reais = (this.centavos / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return `R$ ${reais}`
  }

  somar(outro: Dinheiro): Dinheiro {
    return new Dinheiro(this.centavos + outro.centavos, this.moeda)
  }

  maiorQue(outro: Dinheiro): boolean {
    return this.centavos > outro.centavos
  }

  menorOuIgual(outro: Dinheiro): boolean {
    return this.centavos <= outro.centavos
  }

  igual(outro: Dinheiro): boolean {
    return this.centavos === outro.centavos && this.moeda === outro.moeda
  }
}
