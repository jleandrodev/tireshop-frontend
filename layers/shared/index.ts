// API pública do contexto "shared" (ADR 0002): o único caminho de import permitido de fora desta
// layer (tests/infra/arquitetura.spec.ts reprova import de caminho interno).
export * from './domain/result'
export * from './domain/dinheiro'
export * from './domain/erros'
export * from './domain/html-seguro'
export * from './http/cliente-http'
export * from './http/__falsos__/cliente-http-falso'
