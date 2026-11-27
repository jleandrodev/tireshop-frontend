// T-0106 · REQ-01-07 (ADR 0011): o que toda página precisa definir de SEO. Usado pelas funções
// de metadados de cada contexto; a aplicação de verdade (useSeoMeta/useHead) é só na página.
export type Robots = 'index, follow' | 'noindex, follow' | 'noindex, nofollow'

export type Metadados = {
  readonly titulo: string
  readonly descricao: string
  readonly canonica: string
  readonly robots: Robots
  readonly jsonLd: readonly unknown[]
}

/** `href: null` no item atual e nos que não têm página própria (ADR 0011). */
export type Migalha = {
  readonly rotulo: string
  readonly href: string | null
}
