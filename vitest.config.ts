import { fileURLToPath } from 'node:url'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

// T-0201: `#layers/shared` é o alias que o próprio Nuxt gera (um por layer, em `.nuxt/tsconfig.
// *.json`) para o import cruzado de contexto (docs/architecture.md, A5) — só o TypeScript sabe
// dele; o projeto "unidade" roda sem o Nuxt, então precisa do alias de novo, para resolver em
// tempo de execução. Cresce um item por contexto que vier a importar o shared (hoje só ele).
const ALIAS_LAYERS_SHARED = {
  '#layers/shared': fileURLToPath(new URL('./layers/shared', import.meta.url)),
}

// Dois projetos (T-0003): "unidade" roda em node, sem carregar o Nuxt — domínio, aplicação e os
// testes de infra; "nuxt" roda com o ambiente do Nuxt, para componente Vue (`layers/*/ui/*.spec.ts`,
// desde a T-0109) e para composable que precisa do contexto do Nuxt (`use-*.spec.ts`, desde a
// T-0118, ex.: `useRuntimeConfig`, `useRequestEvent`). Mesmo um `.spec.ts` sem DOM dentro de `ui/`
// (ex.: sprite.spec.ts) roda no projeto "nuxt": a pasta (ou o nome `use-*`) decide o projeto, não
// o conteúdo do arquivo.
//
// A cobertura mede layers/**: 90% de linhas, funções e ramos em domain/ e application/ de cada
// contexto (REQ-00-02; a T-1313 torna o limite por contexto). Fica fora: fábricas, falsos de teste,
// os próprios .spec.ts e a API pública de cada contexto (index.ts só reexporta).
export default defineConfig({
  resolve: { alias: ALIAS_LAYERS_SHARED },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['layers/**/*.ts'],
      exclude: [
        'layers/**/*.spec.ts',
        'layers/**/index.ts',
        'layers/**/__fabricas__/**',
        'layers/**/__falsos__/**',
      ],
      thresholds: {
        '**/domain/**': { statements: 90, branches: 90, functions: 90, lines: 90 },
        '**/application/**': { statements: 90, branches: 90, functions: 90, lines: 90 },
      },
    },
    projects: [
      {
        test: {
          name: 'unidade',
          environment: 'node',
          include: [
            'layers/**/*.spec.ts',
            'tests/infra/**/*.spec.ts',
            'tests/contract/**/*.spec.ts',
            'scripts/**/*.spec.ts',
            'server/**/*.spec.ts',
          ],
          exclude: ['layers/*/ui/**/*.spec.ts', 'layers/**/use-*.spec.ts'],
          // Vários arquivos de tests/infra/ escrevem fixture no próprio repositório e rodam
          // `pnpm lint`/`pnpm format:check` contra ele (T-0002, T-0004). Em paralelo, um arquivo
          // pegaria a fixture do outro. Sequencial aqui, mas só neste projeto.
          fileParallelism: false,
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: [
            'tests/nuxt/**/*.spec.ts',
            'layers/*/ui/**/*.spec.ts',
            'layers/**/use-*.spec.ts',
          ],
        },
      }),
    ],
  },
})
