import { erroDeContrato, type ErroDeContrato } from './erros'
import { ok, falha, type Result } from './result'

// T-0104 · REQ-01-05 (RNF-06, ADR 0004): só o texto de apoio/HTML que passou pela lista branca.
// Regex, não DOM (roda em node, sem dependência nova): o conteúdo é pequeno e estruturado
// (parágrafos, listas, links), não precisa de um parser completo de HTML.
const TAGS_PADRAO = new Set(['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br'])
const TAGS_TABELA = new Set(['table', 'tr', 'td'])
const ATRIBUTO_PERMITIDO = 'href'

const REGEX_TAG = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^<>]*)?)\s*\/?>/g
const REGEX_ATRIBUTO = /([a-zA-Z-]+)\s*=/g
const REGEX_HREF = /href\s*=\s*["']([^"']*)["']/i

function hrefPermitido(href: string): boolean {
  if (href.startsWith('#')) return true
  if (href.startsWith('/') && !href.startsWith('//')) return true
  return /^(https|mailto|tel):/i.test(href)
}

export class HtmlSeguro {
  private constructor(readonly html: string) {}

  static criar(html: string, opcoes?: { tabelas?: boolean }): Result<HtmlSeguro, ErroDeContrato> {
    const tagsPermitidas = opcoes?.tabelas ? new Set([...TAGS_PADRAO, ...TAGS_TABELA]) : TAGS_PADRAO

    for (const match of html.matchAll(REGEX_TAG)) {
      const tag = match[1]!.toLowerCase()
      if (!tagsPermitidas.has(tag)) {
        return falha(erroDeContrato('HtmlSeguro', `tag:${tag}`, `tag não permitida: <${tag}>`))
      }

      const atributos = match[2] ?? ''
      for (const atributo of atributos.matchAll(REGEX_ATRIBUTO)) {
        const nome = atributo[1]!.toLowerCase()
        if (nome !== ATRIBUTO_PERMITIDO) {
          return falha(
            erroDeContrato('HtmlSeguro', `atributo:${nome}`, `atributo não permitido: ${nome}`),
          )
        }
      }

      const href = atributos.match(REGEX_HREF)?.[1]
      if (href !== undefined && !hrefPermitido(href)) {
        return falha(erroDeContrato('HtmlSeguro', 'href', `esquema de link não permitido: ${href}`))
      }
    }

    return ok(new HtmlSeguro(html))
  }
}
