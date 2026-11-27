// API pública do contexto "relacionamento" (ADR 0002): o único caminho de import permitido de fora desta
// layer (tests/infra/arquitetura.spec.ts reprova import de caminho interno). Fica vazia até a
// primeira task do módulo dono reexportar algo daqui.
export {}
