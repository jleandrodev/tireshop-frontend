import { linkDoWhatsapp as linkDoWhatsappCompartilhado, rotas, type Imagem } from '#layers/shared'

// T-0201 · REQ-02-01, REQ-02-05 (docs/domain/conteudo.md): modelo raso de propósito — Conteúdo é
// quase só leitura e exibição, agregado rico aqui seria enfeite.
export type Contato = {
  readonly telefone: string
  readonly whatsapp: string
  readonly email: string
  readonly atendimento: string
  readonly razaoSocial: string
  readonly cnpj: string
}

export type RedeSocial = {
  readonly id: string
  readonly nome: string
  readonly href: string
}

export type Link = {
  readonly rotulo: string
  readonly href: string | null
}

export type LinkComHref = {
  readonly rotulo: string
  readonly href: string
}

export type Aro = {
  readonly aro: string
  readonly href: string | null
}

/** Departamento sem aros (lista vazia) mostra só o título e o `resumoAros` (REQ-02-05). */
export type Departamento = {
  readonly slug: string
  readonly nome: string
  readonly icone: string
  readonly href: string | null
  readonly resumoAros: string
  readonly aros: readonly Aro[]
}

export type Marca = {
  readonly slug: string
  readonly nome: string
  readonly logo: Imagem
  readonly href: string | null
}

export type ColunaDeRodape = {
  readonly titulo: string
  readonly links: readonly Link[]
}

export type Rodape = {
  readonly colunas: readonly ColunaDeRodape[]
  readonly textoFiscal: string
}

export type Navegacao = {
  readonly contato: Contato
  readonly redes: readonly RedeSocial[]
  readonly menu: readonly Link[]
  readonly departamentos: readonly Departamento[]
  readonly ajuda: readonly Link[]
  readonly extras: readonly Link[]
  readonly marcas: readonly Marca[]
  readonly rodape: Rodape
}

export function temAros(departamento: Departamento): boolean {
  return departamento.aros.length > 0
}

export function totalDeLinksDeAro(navegacao: Navegacao): number {
  return navegacao.departamentos.reduce(
    (total, departamento) => total + departamento.aros.length,
    0,
  )
}

/** REQ-02-18: item com `href` nulo não é renderizado. */
export function linksVisiveis(links: readonly Link[]): readonly LinkComHref[] {
  return links.filter((link): link is LinkComHref => link.href !== null)
}

export type TipoDeItemDeMenu = 'lojas' | 'marcas' | 'link'

export function tipoDoItemDeMenu(item: Link): TipoDeItemDeMenu {
  if (item.href === rotas.lojas()) return 'lojas'
  if (item.href === rotas.home({ ancora: 'marcas' })) return 'marcas'
  return 'link'
}

export function linkDoWhatsapp(contato: Contato): string {
  return linkDoWhatsappCompartilhado(contato.whatsapp)
}
