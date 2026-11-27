import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

// Dois projetos (T-0003): "unidade" roda em node, sem carregar o Nuxt — domínio, aplicação e os
// testes de infra; "nuxt" roda com o ambiente do Nuxt, para componentes (ainda sem teste real; a
// primeira task de UI do shared kernel usa este projeto).
//
// A cobertura mede layers/**: 90% de linhas, funções e ramos em domain/ e application/ de cada
// contexto (REQ-00-02; a T-1313 torna o limite por contexto). Fica fora: fábricas, falsos de teste,
// os próprios .spec.ts e a API pública de cada contexto (index.ts só reexporta).
export default defineConfig({
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
          ],
          // Vários arquivos de tests/infra/ escrevem fixture no próprio repositório e rodam
          // `pnpm lint`/`pnpm format:check` contra ele (T-0002, T-0004). Em paralelo, um arquivo
          // pegaria a fixture do outro. Sequencial aqui, mas só neste projeto.
          fileParallelism: false,
        },
      },
      await defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['tests/nuxt/**/*.spec.ts'],
        },
      }),
    ],
  },
})
