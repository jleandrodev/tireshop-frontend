import type { Dinheiro } from '#layers/shared'
import type { Preco } from './preco'

// T-0303 · REQ-03-03, REQ-03-04 (docs/domain/catalogo.md): o que o card da listagem precisa —
// um read-model montado de dados já válidos (preço, nota), sem invariante própria, mesmo padrão
// de `Navegacao` (funções livres, não métodos de classe).
export type Disponibilidade = 'em_estoque' | 'sem_estoque'

export type SeloFrete = {
  readonly regiao: string
  readonly valorMinimo: Dinheiro
}

export type ProdutoResumo = {
  readonly disponibilidade: Disponibilidade
  readonly preco: Preco
  readonly nota: number
  readonly frete?: SeloFrete
}

export function podeComprar(produto: ProdutoResumo): boolean {
  return produto.disponibilidade === 'em_estoque'
}

export function mostraPreco(produto: ProdutoResumo): boolean {
  return produto.disponibilidade === 'em_estoque'
}

export function seloFrete(produto: ProdutoResumo): string | undefined {
  if (!produto.frete) return undefined
  return `Frete grátis ${produto.frete.regiao} acima de ${produto.frete.valorMinimo.formatar()}`
}

export function estrelasCheias(produto: ProdutoResumo): number {
  return Math.round(produto.nota)
}
