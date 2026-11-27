// T-0304 · REQ-03-06, REQ-03-09 (docs/domain/catalogo.md): combina categoria, facetas marcadas,
// ordem e página — a URL é a fonte da verdade (`paraQuery`/`deQuery`), nunca um estado escondido.
// Imutável: cada operação devolve um novo critério.
export type Ordenacao = 'mais_vendidos' | 'menor_preco' | 'maior_preco' | 'melhor_avaliados'

const ORDENS_VALIDAS: readonly Ordenacao[] = [
  'mais_vendidos',
  'menor_preco',
  'maior_preco',
  'melhor_avaliados',
]
const ORDEM_PADRAO: Ordenacao = 'mais_vendidos'
const PAGINA_PADRAO = 1

export const POR_PAGINA = 12

function ehOrdemValida(valor: string): valor is Ordenacao {
  return (ORDENS_VALIDAS as readonly string[]).includes(valor)
}

export class CriterioDeListagem {
  private constructor(
    readonly categoria: string | undefined,
    readonly facetas: ReadonlyMap<string, ReadonlySet<string>>,
    readonly ordem: Ordenacao,
    readonly pagina: number,
  ) {}

  static inicial(categoria?: string): CriterioDeListagem {
    return new CriterioDeListagem(categoria, new Map(), ORDEM_PADRAO, PAGINA_PADRAO)
  }

  alternar(chave: string, valor: string): CriterioDeListagem {
    const valores = new Set(this.facetas.get(chave) ?? [])
    if (valores.has(valor)) valores.delete(valor)
    else valores.add(valor)

    const facetas = new Map(this.facetas)
    if (valores.size === 0) facetas.delete(chave)
    else facetas.set(chave, valores)

    return new CriterioDeListagem(this.categoria, facetas, this.ordem, PAGINA_PADRAO)
  }

  comOrdem(ordem: Ordenacao): CriterioDeListagem {
    return new CriterioDeListagem(this.categoria, this.facetas, ordem, PAGINA_PADRAO)
  }

  irParaPagina(pagina: number): CriterioDeListagem {
    if (!Number.isInteger(pagina) || pagina < 1) return this
    return new CriterioDeListagem(this.categoria, this.facetas, this.ordem, pagina)
  }

  limpar(): CriterioDeListagem {
    return new CriterioDeListagem(this.categoria, new Map(), this.ordem, PAGINA_PADRAO)
  }

  temFiltro(): boolean {
    return this.facetas.size > 0
  }

  paraQuery(): URLSearchParams {
    const query = new URLSearchParams()
    for (const [chave, valores] of this.facetas) {
      for (const valor of valores) query.append(chave, valor)
    }
    if (this.ordem !== ORDEM_PADRAO) query.set('ordem', this.ordem)
    if (this.pagina !== PAGINA_PADRAO) query.set('pagina', String(this.pagina))
    return query
  }

  static deQuery(query: URLSearchParams, categoria?: string): CriterioDeListagem {
    const facetas = new Map<string, Set<string>>()
    let ordem = ORDEM_PADRAO
    let pagina = PAGINA_PADRAO

    for (const [chave, valor] of query.entries()) {
      if (chave === 'ordem') {
        if (ehOrdemValida(valor)) ordem = valor
        continue
      }
      if (chave === 'pagina') {
        const numero = Number(valor)
        if (Number.isInteger(numero) && numero >= 1) pagina = numero
        continue
      }
      const valores = facetas.get(chave) ?? new Set<string>()
      valores.add(valor)
      facetas.set(chave, valores)
    }

    return new CriterioDeListagem(categoria, facetas, ordem, pagina)
  }
}
