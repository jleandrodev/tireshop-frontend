import type { CriterioDeListagem } from './criterio-de-listagem'

// T-0305 · REQ-03-05 (docs/domain/catalogo.md): o que o painel de filtros mostra. A contagem
// (`total`) vem pronta da API (fora do escopo) — aqui só a regra de "o que ajuda a filtrar".
export type OpcaoDeFaceta = {
  readonly valor: string
  readonly rotulo: string
  readonly total: number
}

export type Faceta = {
  readonly chave: string
  readonly rotulo: string
  readonly opcoes: readonly OpcaoDeFaceta[]
}

export type OpcaoExibivel = OpcaoDeFaceta & { readonly marcada: boolean }

export type FacetaExibivel = {
  readonly chave: string
  readonly rotulo: string
  readonly opcoes: readonly OpcaoExibivel[]
}

/** Diz se `valor` está marcado em `chave`, segundo o que já foi escolhido no critério. */
export function marcada(criterio: CriterioDeListagem, chave: string, valor: string): boolean {
  return criterio.facetas.get(chave)?.has(valor) ?? false
}

/** Opção com `total` 0 não ajuda a filtrar; faceta com só uma opção exibível também não (ex.:
 *  Aro numa categoria de um aro só). Mantém a ordem recebida das facetas e das opções. */
export function facetasExibiveis(
  facetas: readonly Faceta[],
  criterio: CriterioDeListagem,
): readonly FacetaExibivel[] {
  const resultado: FacetaExibivel[] = []

  for (const faceta of facetas) {
    const opcoesExibiveis = faceta.opcoes.filter((opcao) => opcao.total > 0)
    if (opcoesExibiveis.length <= 1) continue

    resultado.push({
      chave: faceta.chave,
      rotulo: faceta.rotulo,
      opcoes: opcoesExibiveis.map((opcao) => ({
        ...opcao,
        marcada: marcada(criterio, faceta.chave, opcao.valor),
      })),
    })
  }

  return resultado
}
