// @ts-check
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

// Lint de qualidade (tipos, código morto, Vue). Formatação é do Prettier (.prettierrc);
// os dois não se sobrepõem de propósito. Regras de arquitetura entram na T-0004.
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
    },
  },
)
