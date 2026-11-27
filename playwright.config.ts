import { defineConfig, devices } from '@playwright/test'

const estaNoCI = Boolean(process.env.CI)

// Os testes de ponta a ponta rodam contra o servidor de desenvolvimento, dentro do contêiner
// do projeto (ADR 0014): bin/pnpm test:e2e
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: estaNoCI,
  // Teste instável se corrige; não se repete para esconder (ADR 0014).
  retries: 0,
  reporter: estaNoCI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  // T-0010 (REQ-00-09): os dois tamanhos do protótipo. "computador" e "celular" (não
  // "desktop"/"mobile"): o resto do projeto está em português.
  projects: [
    {
      name: 'computador',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'celular',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !estaNoCI,
    timeout: 120_000,
  },
})
