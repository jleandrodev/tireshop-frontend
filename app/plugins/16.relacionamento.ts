import { criarHttpLeadsGateway, SIMBOLO_LEADS_GATEWAY } from '~~/layers/relacionamento'
import { useClienteHttp } from '~~/layers/shared'

// T-0218 · REQ-02-12 (ADR 0002): único lugar que chama `criarHttpLeadsGateway`. Roda uma vez por
// app Vue — no servidor, uma vez por requisição (SSR do Nuxt), igual a `12.conteudo.ts`.
export default defineNuxtPlugin((nuxtApp) => {
  const gateway = criarHttpLeadsGateway(useClienteHttp())
  nuxtApp.vueApp.provide(SIMBOLO_LEADS_GATEWAY, gateway)
})
