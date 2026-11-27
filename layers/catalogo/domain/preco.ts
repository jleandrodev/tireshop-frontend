import { falha, ok, type Dinheiro, type Result } from '#layers/shared'

// T-0302 · REQ-03-03 (docs/domain/catalogo.md, ADR 0010, RNF-07): só leitura — o preço vem pronto
// da API; o front nunca soma, multiplica nem aplica desconto (arriscaria divergir do backend).
export type PrecoInvalido = {
  readonly tipo: 'PrecoInvalido'
  readonly motivo: string
}

export type Parcelado = {
  readonly total: Dinheiro
  readonly parcelas: number
  readonly valorParcela: Dinheiro
}

export type AVista = {
  readonly valor: Dinheiro
  readonly descontoPercentual: number
}

export class Preco {
  private constructor(
    readonly parcelado: Parcelado,
    readonly aVista: AVista,
    readonly de?: Dinheiro,
  ) {}

  emPromocao(): boolean {
    return this.de !== undefined && this.de.maiorQue(this.parcelado.total)
  }

  static de(dados: {
    parcelado: Parcelado
    aVista: AVista
    de?: Dinheiro
  }): Result<Preco, PrecoInvalido> {
    const { parcelas } = dados.parcelado
    if (!Number.isInteger(parcelas) || parcelas < 1 || parcelas > 12) {
      return falha({ tipo: 'PrecoInvalido', motivo: `parcelas fora de 1 a 12: ${parcelas}` })
    }
    if (dados.aVista.valor.maiorQue(dados.parcelado.total)) {
      return falha({ tipo: 'PrecoInvalido', motivo: 'à vista maior que o parcelado' })
    }
    if (dados.de && !dados.de.maiorQue(dados.parcelado.total)) {
      return falha({ tipo: 'PrecoInvalido', motivo: 'preço anterior não é maior que o parcelado' })
    }
    return ok(new Preco(dados.parcelado, dados.aVista, dados.de))
  }
}
