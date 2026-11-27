import { z } from 'zod'
import { ProdutoResumoSchema } from './produto-resumo.schema'

// T-0309 · REQ-03-06, REQ-03-07 (docs/api/openapi.yaml, ListaDeProdutos): sem `.strict()` de
// propósito — campo desconhecido é ignorado, não rejeitado.
const OrdenacaoSchema = z.enum(['mais_vendidos', 'menor_preco', 'maior_preco', 'melhor_avaliados'])

const OpcaoDeFacetaSchema = z.object({
  valor: z.string(),
  rotulo: z.string(),
  total: z.number(),
})

const FacetaSchema = z.object({
  chave: z.string(),
  rotulo: z.string(),
  opcoes: z.array(OpcaoDeFacetaSchema),
})

const OpcaoDeOrdenacaoSchema = z.object({
  valor: OrdenacaoSchema,
  rotulo: z.string(),
})

export const ListaDeProdutosSchema = z.object({
  itens: z.array(ProdutoResumoSchema),
  pagina: z.number(),
  porPagina: z.number(),
  total: z.number(),
  totalPaginas: z.number(),
  ordem: OrdenacaoSchema,
  ordenacoes: z.array(OpcaoDeOrdenacaoSchema),
  facetas: z.array(FacetaSchema),
})

export type ListaDeProdutosDTO = z.infer<typeof ListaDeProdutosSchema>
