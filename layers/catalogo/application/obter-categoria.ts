import type { Result, Slug } from '#layers/shared'
import type { Categoria } from '../domain/categoria'
import type { CategoriaNaoEncontrada, CategoriaRepository, ErroDeCatalogo } from '../domain/portas'

// T-0307 · REQ-03-01, REQ-03-16 (docs/domain/catalogo.md): só repassa a porta, mesmo padrão de
// `obterNavegacao` (T-0201).
export function obterCategoria(
  repositorio: CategoriaRepository,
  slug: Slug,
): Promise<Result<Categoria, CategoriaNaoEncontrada | ErroDeCatalogo>> {
  return repositorio.obter(slug)
}
