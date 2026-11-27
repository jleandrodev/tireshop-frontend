import { z } from 'zod'

// T-0202 · REQ-02-01, REQ-02-18 (ADR 0003, ADR 0004): o contrato de GET /navegacao. Sem `.strict()`
// de propósito — campo desconhecido é ignorado, não rejeitado (docs/api/openapi.yaml cresce
// de um lado sem quebrar o outro).
const LinkSchema = z.object({
  rotulo: z.string(),
  href: z.string().nullable(),
})

const AroSchema = z.object({
  aro: z.string(),
  href: z.string().nullable(),
})

const DepartamentoSchema = z.object({
  slug: z.string(),
  nome: z.string(),
  icone: z.string(),
  href: z.string().nullable(),
  resumoAros: z.string(),
  aros: z.array(AroSchema),
})

const ImagemSchema = z.object({
  src: z.string(),
  largura: z.number().positive(),
  altura: z.number().positive(),
  alt: z.string(),
})

const MarcaSchema = z.object({
  slug: z.string(),
  nome: z.string(),
  logo: ImagemSchema,
  href: z.string().nullable(),
})

const ColunaDeRodapeSchema = z.object({
  titulo: z.string(),
  links: z.array(LinkSchema),
})

const RodapeSchema = z.object({
  colunas: z.array(ColunaDeRodapeSchema),
  textoFiscal: z.string(),
})

const ContatoSchema = z.object({
  telefone: z.string(),
  whatsapp: z.string(),
  email: z.string(),
  atendimento: z.string(),
  razaoSocial: z.string(),
  cnpj: z.string(),
})

const RedeSocialSchema = z.object({
  id: z.string(),
  nome: z.string(),
  href: z.string(),
})

export const NavegacaoSchema = z.object({
  contato: ContatoSchema,
  redes: z.array(RedeSocialSchema),
  menu: z.array(LinkSchema),
  departamentos: z.array(DepartamentoSchema),
  ajuda: z.array(LinkSchema),
  extras: z.array(LinkSchema),
  marcas: z.array(MarcaSchema),
  rodape: RodapeSchema,
})

export type NavegacaoDTO = z.infer<typeof NavegacaoSchema>
