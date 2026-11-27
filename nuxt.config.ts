// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  // SSR é decisão de arquitetura (ADR 0001); fica explícito para ninguém desligar por engano.
  ssr: true,
  devtools: { enabled: false },
})
