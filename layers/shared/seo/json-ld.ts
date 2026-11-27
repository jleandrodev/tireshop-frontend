import type { Migalha } from './metadados'

// T-0106 · REQ-01-07 (ADR 0011): o que é comum a toda página. Product e AutomotiveBusiness são
// de cada contexto (T-04xx, T-12xx).

export type ListItem = {
  readonly '@type': 'ListItem'
  readonly position: number
  readonly name: string
  readonly item?: string
}

export type BreadcrumbList = {
  readonly '@context': 'https://schema.org'
  readonly '@type': 'BreadcrumbList'
  readonly itemListElement: readonly ListItem[]
}

export function breadcrumbList(migalhas: readonly Migalha[], origem: string): BreadcrumbList {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: migalhas.map((migalha, indice) => ({
      '@type': 'ListItem',
      position: indice + 1,
      name: migalha.rotulo,
      ...(migalha.href ? { item: new URL(migalha.href, origem).toString() } : {}),
    })),
  }
}

export type Question = {
  readonly '@type': 'Question'
  readonly name: string
  readonly acceptedAnswer: { readonly '@type': 'Answer'; readonly text: string }
}

export type FaqPage = {
  readonly '@context': 'https://schema.org'
  readonly '@type': 'FAQPage'
  readonly mainEntity: readonly Question[]
}

function textoSemTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Sem pergunta, devolve nada: a página não emite o bloco (um FAQPage vazio não faz sentido). */
export function faqPage(
  perguntas: readonly { pergunta: string; respostaHtml: string }[],
): FaqPage | undefined {
  if (perguntas.length === 0) return undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: perguntas.map((p) => ({
      '@type': 'Question',
      name: p.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: textoSemTags(p.respostaHtml) },
    })),
  }
}
