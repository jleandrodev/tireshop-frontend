import { criarHttpNavegacaoRepository, SIMBOLO_NAVEGACAO_REPOSITORY } from '~~/layers/conteudo'
import { useClienteHttp } from '~~/layers/shared'

// T-0204 · REQ-02-01 (ADR 0002): único lugar que chama `criarHttpNavegacaoRepository`. Roda uma
// vez por app Vue — no servidor, uma vez por requisição (SSR do Nuxt), igual ao `01.http.ts`: o
// `ClienteHttp` injetado já é o do visitante da requisição atual (T-0118), então o repositório
// criado aqui nunca é compartilhado entre requisições.
export default defineNuxtPlugin((nuxtApp) => {
  const repositorio = criarHttpNavegacaoRepository(useClienteHttp())
  nuxtApp.vueApp.provide(SIMBOLO_NAVEGACAO_REPOSITORY, repositorio)
})
