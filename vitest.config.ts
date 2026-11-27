import { defineConfig } from 'vitest/config'

// Configuração mínima para a T-0002 rodar o próprio teste de qualidade. A T-0003 divide isto em
// dois projetos (unidade em node, nuxt para componentes) e liga a cobertura.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/infra/**/*.spec.ts'],
  },
})
