// API pública do contexto "relacionamento" (ADR 0002): o único caminho de import permitido de fora desta
// layer (tests/infra/arquitetura.spec.ts reprova import de caminho interno).
export * from './domain/email'
export * from './domain/telefone'
export * from './domain/inscricao-newsletter'
