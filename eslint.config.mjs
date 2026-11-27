// @ts-check
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

// Lint de qualidade (tipos, código morto, Vue). Formatação é do Prettier (.prettierrc);
// os dois não se sobrepõem de propósito.
//
// Regras de arquitetura (T-0004, ADR 0002, docs/architecture.md): a regra de dependência entre
// camadas (domain → application → adapters/ui) e entre contextos (só layers/<ctx>/index.ts é
// público) é verificada aqui, não só documentada. Usa `no-restricted-imports` do próprio ESLint
// (casa com a string do import, igual está escrita no código) em vez de um resolvedor de módulos:
// nesta fase do projeto a maioria dos caminhos ainda não tem arquivo real do outro lado.
const CONTEXTOS = [
  'shared',
  'catalogo',
  'carrinho',
  'entrega',
  'lojas',
  'conteudo',
  'avaliacoes',
  'relacionamento',
]

const GRUPO_ADAPTERS = ['**/adapters/**', '**/adapters']
const GRUPO_UI = ['**/ui/**', '**/ui']

/** O que cada tipo de pasta não pode importar de dentro da própria layer. */
const REGRA_POR_PASTA = {
  domain: { paths: ['vue', '#imports', 'zod'], grupo: GRUPO_ADAPTERS },
  application: { grupo: [...GRUPO_ADAPTERS, ...GRUPO_UI] },
  ui: { grupo: GRUPO_ADAPTERS },
  adapters: { grupo: [] },
}

// Um bloco por (contexto × pasta): evita duas configurações da mesma regra (`no-restricted-imports`)
// disputando o mesmo arquivo — em flat config, a última que casa com o arquivo vence por inteiro,
// não soma com a anterior.
const regrasDeLayers = CONTEXTOS.flatMap((ctx) =>
  Object.entries(REGRA_POR_PASTA).map(([pasta, regra]) => {
    const grupoDeOutrosContextos = CONTEXTOS.filter((outro) => outro !== ctx).flatMap((outro) => [
      `**/${outro}/**`,
      `!**/${outro}/index`,
    ])
    return {
      files: [`layers/${ctx}/${pasta}/**/*.{ts,vue}`],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            ...(regra.paths ? { paths: regra.paths } : {}),
            patterns: [
              {
                group: [...grupoDeOutrosContextos, ...regra.grupo],
                message:
                  'De outro contexto, só o layers/<ctx>/index.ts público; de dentro desta camada, nada de adapters/ nem ui/ onde não cabe (docs/architecture.md).',
              },
            ],
          },
        ],
      },
    }
  }),
)

export default tseslint.config(
  {
    ignores: [
      '.nuxt/**',
      '.output/**',
      '.data/**',
      'dist/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      '.lighthouseci/**',
    ],
  },
  tseslint.configs.recommended,
  {
    // Parâmetro/variável prefixado com "_" é intencionalmente não usado (ex.: um método de uma
    // interface que a implementação em questão ignora, como em cliente-http-falso.ts).
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      // O roteamento por arquivo do Nuxt exige nome de um só termo: index.vue, [id].vue, error.vue.
      'vue/multi-word-component-names': 'off',
      // Formatação é do Prettier (ver topo do arquivo); esta regra brigava com ele por quebra
      // de linha de atributo, sem o Prettier nunca concordar.
      'vue/max-attributes-per-line': 'off',
    },
  },
  ...regrasDeLayers,
  {
    files: ['layers/shared/ui/SpriteDeIcones.vue', 'layers/shared/ui/Acordeao.vue'],
    rules: {
      // Comentário de template do Vue vira nó real no HTML (poluiria toda página); por isso a
      // exceção vem daqui, não de um <!-- eslint-disable --> dentro do <template>. Em
      // SpriteDeIcones, `sprite` é string fixa, montada em build time a partir dos SVGs do
      // projeto. Em Acordeao, a resposta só chega como `HtmlSeguro` (T-0104): já passou pela
      // lista branca de tags/atributos, nunca é HTML arbitrário do usuário.
      'vue/no-v-html': 'off',
    },
  },
  {
    files: ['layers/**/*.{ts,vue}'],
    ignores: ['layers/*/adapters/http/**'],
    rules: {
      // O cliente HTTP é único e vive em adapters/http (ADR 0003, ADR 0004); o resto do projeto
      // não fala com a rede direto. server/** tem a mesma liberdade, fora destas layers.
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='$fetch']",
          message: 'Use o ClienteHttp (shared) em vez de $fetch fora de adapters/http.',
        },
        {
          selector: "CallExpression[callee.name='useFetch']",
          message: 'Use o ClienteHttp (shared) em vez de useFetch fora de adapters/http.',
        },
        {
          selector: "CallExpression[callee.name='fetch']",
          message: 'Use o ClienteHttp (shared) em vez de fetch fora de adapters/http.',
        },
      ],
    },
  },
)
