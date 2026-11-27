import { defineConfig } from 'vitest/config'

// T-0121 · REQ-01-21 (RNF-07, ADR 0005): config dedicada pro Stryker — só o que o projeto
// "unidade" (vitest.config.ts) já roda para layers/**, sem o projeto "nuxt" (component Vue não é
// mutado; carregar o ambiente do Nuxt a cada mutante só deixaria mais lento).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['layers/**/*.spec.ts'],
    // Mesmas exclusões do projeto "unidade" (vitest.config.ts): componente Vue precisa do
    // ambiente do Nuxt pra montar (.vue), e os `use-*.spec.ts` precisam de composable do Nuxt
    // (useRuntimeConfig, h3…) — nenhum dos dois é mutado aqui, nem precisam rodar.
    exclude: ['layers/*/ui/**/*.spec.ts', 'layers/**/use-*.spec.ts'],
  },
})
