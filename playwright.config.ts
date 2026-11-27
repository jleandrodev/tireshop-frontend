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
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !estaNoCI,
    timeout: 120_000,
  },
})
