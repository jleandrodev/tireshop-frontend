import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

// T-0121 · REQ-01-21 (RNF-07, ADR 0005): config dedicada pro Stryker — só o que o projeto
// "unidade" (vitest.config.ts) já roda para layers/**, sem o projeto "nuxt" (component Vue não é
// mutado; carregar o ambiente do Nuxt a cada mutante só deixaria mais lento).
//
// T-0201: mesmo alias `#layers/shared` do vitest.config.ts — é o Nuxt que gera esse alias
// (docs/architecture.md, A5), e este config roda sem ele.
export default defineConfig({
  resolve: {
    alias: { '#layers/shared': fileURLToPath(new URL('./layers/shared', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['layers/**/*.spec.ts'],
    // Mesmas exclusões do projeto "unidade" (vitest.config.ts): componente Vue precisa do
    // ambiente do Nuxt pra montar (.vue), e os `use-*.spec.ts` precisam de composable do Nuxt
    // (useRuntimeConfig, h3…) — nenhum dos dois é mutado aqui, nem precisam rodar.
    exclude: ['layers/*/ui/**/*.spec.ts', 'layers/**/use-*.spec.ts'],
  },
})
