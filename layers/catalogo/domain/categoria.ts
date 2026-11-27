import type { Slug } from '#layers/shared'

// T-0307 · REQ-03-01, REQ-03-16 (docs/domain/catalogo.md): a categoria (departamento, aro,
// medida ou marca) que abre a listagem. Tipo passivo, mesmo padrão de `ProdutoResumo` — sem
// invariante própria (o `slug` já vem validado).
export type TipoDeCategoria = 'departamento' | 'aro' | 'medida' | 'marca'

export type Categoria = {
  readonly slug: Slug
  readonly tipo: TipoDeCategoria
}

/** A categoria de medida pré-seleciona a medida; a de aro, o aro; as demais partem de medida. */
export function abaInicialDaBusca(categoria: Categoria): 'medida' | 'aro' {
  return categoria.tipo === 'aro' ? 'aro' : 'medida'
}
