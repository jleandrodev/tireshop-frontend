// API pública do contexto "conteudo" (ADR 0002): o único caminho de import permitido de fora desta
// layer (tests/infra/arquitetura.spec.ts reprova import de caminho interno).
export * from './domain/navegacao'
export * from './domain/portas'
export * from './application/obter-navegacao'
export * from './application/__falsos__/navegacao-repository-falso'
export * from './adapters/http/http-navegacao-repository'
export * from './ui/composables/use-navegacao'
