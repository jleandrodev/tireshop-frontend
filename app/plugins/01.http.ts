import {
  criarClienteHttp,
  montarConfiguracaoDoClienteHttp,
  SIMBOLO_CLIENTE_HTTP,
} from '~~/layers/shared'

// T-0118 · REQ-01-19 (RNF-05, ADR 0002): único lugar que chama `criarClienteHttp`. Roda uma vez
// por app Vue — no servidor, uma vez por requisição (SSR do Nuxt): cada visitante tem o próprio
// cookie, nunca o de outro. Os plugins dos contextos (10.catalogo.ts…) recebem este cliente
// pronto, em vez de criar o próprio.
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const cliente = criarClienteHttp(
    montarConfiguracaoDoClienteHttp({
      apiBase: config.public.apiBase,
      tempoLimiteMs: config.public.apiTempoLimiteMs,
      evento: useRequestEvent(),
      fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
    }),
  )

  nuxtApp.vueApp.provide(SIMBOLO_CLIENTE_HTTP, cliente)
})
