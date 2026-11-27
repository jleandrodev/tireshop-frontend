// T-0121 · REQ-01-21 (RNF-07, ADR 0005): mede o que os testes de `domain/` e `application/`
// pegam de verdade. `ui/` e `adapters/` ficam fora (fora do escopo desta task); `*.spec.ts`,
// `__fabricas__/` e `__falsos__/` não são código de produção, não são mutados.
//
// Um lugar só para o limite que reprova: 80 (`thresholds.break`). Nenhum outro arquivo repete
// esse número — tests/infra/mutacao.spec.ts lê este arquivo para conferir.
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  // O glob padrão ("@stryker-mutator/*") não achou o runner dentro do node_modules não-plano
  // do pnpm; nomeado explícito funciona nos dois.
  plugins: ['@stryker-mutator/vitest-runner'],
  // `.nuxt/` está na lista interna de pastas que o Stryker nunca copia pro sandbox (fixo no
  // pacote, não dá pra mudar por config), mas o tsconfig.json da raiz referencia os tsconfig de
  // dentro dela — sem isso o esbuild do Vite quebra ao resolver "references". `nuxt prepare`
  // recria `.nuxt/` a partir do que sobra no sandbox (nuxt.config.ts, layers/), uma vez por
  // sandbox, antes dos testes.
  buildCommand: 'npx nuxt prepare',
  testRunner: 'vitest',
  vitest: {
    configFile: 'vitest.mutacao.config.ts',
  },
  mutate: [
    'layers/*/domain/**/*.ts',
    'layers/*/application/**/*.ts',
    '!layers/*/domain/**/*.spec.ts',
    '!layers/*/application/**/*.spec.ts',
    '!layers/*/domain/__fabricas__/**',
    '!layers/*/application/__fabricas__/**',
    '!layers/*/domain/__falsos__/**',
    '!layers/*/application/__falsos__/**',
  ],
  thresholds: { high: 90, low: 80, break: 80 },
  reporters: ['clear-text', 'progress', 'html'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  tempDirName: '.stryker-tmp',
}

export default config
