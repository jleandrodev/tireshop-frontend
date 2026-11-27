// T-0105 · REQ-01-06 (ADR 0008): toda URL interna sai daqui, e só daqui (docs/design/mapa-prototipo.md
// "Páginas"); `resolverRota` faz o caminho de volta, inclusive reconhecendo o padrão legado do
// site atual (`/<n>/<n>/Texto_Com_Underscore`).

function comAncora(caminho: string, opcoes?: { ancora?: string }): string {
  return opcoes?.ancora ? `${caminho}#${opcoes.ancora}` : caminho
}

export const rotas = {
  home: (opcoes?: { ancora?: string }): string => comAncora('/', opcoes),

  categoria: (slug: string, opcoes?: { pagina?: number }): string => {
    const base = `/c/${slug}`
    const pagina = opcoes?.pagina ?? 1
    return pagina > 1 ? `${base}?pagina=${pagina}` : base
  },

  produto: ({ id, slug }: { id: string; slug: string }): string => `/p/${id}/${slug}`,

  politica: (slug: string): string => `/ajuda/${slug}`,

  sobreNos: (): string => '/sobre-nos',

  lojas: (): string => '/lojas',

  loja: (slug: string): string => `/lojas/${slug}`,

  comparar: (ids: readonly string[] = []): string =>
    ids.length > 0 ? `/comparar?p=${ids.join(',')}` : '/comparar',
}

export type RotaResolvida =
  | { tipo: 'home' }
  | { tipo: 'categoria'; slug: string; pagina: number }
  | { tipo: 'produto'; id: string; slug: string }
  | { tipo: 'politica'; slug: string }
  | { tipo: 'sobreNos' }
  | { tipo: 'lojas' }
  | { tipo: 'loja'; slug: string }
  | { tipo: 'comparar'; ids: string[] }
  | { tipo: 'legado'; caminho: string }
  | { tipo: 'desconhecida' }

const REGEX_LEGADO = /^\/\d+\/\d+\/[A-Za-z0-9_-]+$/

/** `caminho` pode trazer `?consulta` e `#ancora`; só o `pathname` entra no reconhecimento de rota. */
export function resolverRota(caminho: string): RotaResolvida {
  const url = new URL(caminho, 'http://localhost')
  const { pathname } = url

  if (pathname === '/') return { tipo: 'home' }
  if (pathname === '/sobre-nos') return { tipo: 'sobreNos' }
  if (pathname === '/lojas') return { tipo: 'lojas' }
  if (pathname === '/comparar') {
    const ids = url.searchParams.get('p')
    return { tipo: 'comparar', ids: ids ? ids.split(',') : [] }
  }

  const categoria = pathname.match(/^\/c\/([^/]+)$/)
  if (categoria) {
    const pagina = Number(url.searchParams.get('pagina') ?? '1')
    return { tipo: 'categoria', slug: categoria[1]!, pagina: Number.isFinite(pagina) ? pagina : 1 }
  }

  const produto = pathname.match(/^\/p\/([^/]+)\/([^/]+)$/)
  if (produto) return { tipo: 'produto', id: produto[1]!, slug: produto[2]! }

  const loja = pathname.match(/^\/lojas\/([^/]+)$/)
  if (loja) return { tipo: 'loja', slug: loja[1]! }

  const politica = pathname.match(/^\/ajuda\/([^/]+)$/)
  if (politica) return { tipo: 'politica', slug: politica[1]! }

  if (REGEX_LEGADO.test(pathname)) return { tipo: 'legado', caminho: pathname }

  return { tipo: 'desconhecida' }
}

/** `interno`: caminho relativo (gerado por rotas.*). `externo`: URL absoluta (outro domínio ou
 *  não — uma URL absoluta não é mantida por este app). `ausente`: sem link. */
export function classificarHref(href: string | null): 'interno' | 'externo' | 'ausente' {
  if (href === null) return 'ausente'
  return /^[a-z][a-z0-9+.-]*:/i.test(href) ? 'externo' : 'interno'
}
