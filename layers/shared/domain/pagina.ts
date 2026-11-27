import { falha, ok, type Result } from './result'

// T-0107 · REQ-01-08 (RNF-07): página de uma listagem, com `totalPaginas` já calculado para quem
// renderiza a paginação não precisar fazer a conta.
export type PaginaInvalida = {
  readonly tipo: 'PaginaInvalida'
  readonly motivo: string
}

export class Pagina<T> {
  private constructor(
    readonly pagina: number,
    readonly porPagina: number,
    readonly total: number,
    readonly totalPaginas: number,
    readonly itens: readonly T[],
  ) {}

  static de<T>(parametros: {
    pagina: number
    porPagina: number
    total: number
    itens: readonly T[]
  }): Result<Pagina<T>, PaginaInvalida> {
    const { pagina, porPagina, total, itens } = parametros
    if (pagina < 1) {
      return falha({ tipo: 'PaginaInvalida', motivo: `pagina precisa ser >= 1: ${pagina}` })
    }
    const totalPaginas = total === 0 ? 0 : Math.ceil(total / porPagina)
    return ok(new Pagina(pagina, porPagina, total, totalPaginas, itens))
  }

  temProxima(): boolean {
    return this.pagina < this.totalPaginas
  }
}
