// API pública do contexto "catalogo" (ADR 0002): o único caminho de import permitido de fora desta
// layer (tests/infra/arquitetura.spec.ts reprova import de caminho interno).
export * from './domain/medida'
export * from './domain/preco'
export * from './domain/produto-resumo'
export * from './domain/__fabricas__/produto'
export * from './domain/criterio-de-listagem'
export * from './domain/faceta'
