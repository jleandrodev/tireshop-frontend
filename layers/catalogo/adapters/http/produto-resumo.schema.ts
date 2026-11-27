import { z } from 'zod'

// T-0308 · REQ-03-03, REQ-03-04 (docs/api/openapi.yaml, ProdutoResumo): sem `.strict()` de
// propósito — campo desconhecido é ignorado, não rejeitado (mesmo padrão de navegacao.schema.ts).
const DinheiroSchema = z.object({
  centavos: z.number().int(),
  moeda: z.literal('BRL'),
})

const MedidaSchema = z.object({
  largura: z.number(),
  altura: z.number(),
  aro: z.string(),
  rotulo: z.string(),
})

const PrecoSchema = z.object({
  de: DinheiroSchema.nullable(),
  parcelado: z.object({
    total: DinheiroSchema,
    parcelas: z.number(),
    valorParcela: DinheiroSchema,
  }),
  aVista: z.object({
    valor: DinheiroSchema,
    descontoPercentual: z.number(),
  }),
})

const FreteGratisSchema = z.object({
  regiao: z.string(),
  valorMinimo: DinheiroSchema,
})

const AvaliacaoSchema = z.object({
  nota: z.number(),
  total: z.number(),
})

export const ProdutoResumoSchema = z.object({
  id: z.string(),
  slug: z.string(),
  nome: z.string(),
  marca: z.object({ slug: z.string(), nome: z.string() }),
  medida: MedidaSchema,
  departamento: z.object({ slug: z.string(), nome: z.string() }),
  imagem: z.object({
    src: z.string(),
    largura: z.number(),
    altura: z.number(),
    alt: z.string(),
  }),
  preco: PrecoSchema.nullable(),
  promocao: z.boolean(),
  freteGratis: FreteGratisSchema.nullable(),
  tem360: z.boolean(),
  avaliacao: AvaliacaoSchema.nullable(),
  disponibilidade: z.enum(['em_estoque', 'sem_estoque']),
  runFlat: z.boolean(),
  terreno: z.string(),
  desenho: z.string().nullable(),
})

export type ProdutoResumoDTO = z.infer<typeof ProdutoResumoSchema>
