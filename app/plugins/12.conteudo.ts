import { getQuery, setResponseHeader } from 'h3'
import { criarHttpNavegacaoRepository, SIMBOLO_NAVEGACAO_REPOSITORY } from '~~/layers/conteudo'
import type { NavegacaoRepository } from '~~/layers/conteudo'
import { erroDeRede, falha, useClienteHttp } from '~~/layers/shared'

// T-0204 · REQ-02-01 (ADR 0002): único lugar que chama `criarHttpNavegacaoRepository`. Roda uma
// vez por app Vue — no servidor, uma vez por requisição (SSR do Nuxt), igual ao `01.http.ts`: o
// `ClienteHttp` injetado já é o do visitante da requisição atual (T-0118), então o repositório
// criado aqui nunca é compartilhado entre requisições.
export default defineNuxtPlugin((nuxtApp) => {
  const repositorio = criarHttpNavegacaoRepository(useClienteHttp())
  nuxtApp.vueApp.provide(SIMBOLO_NAVEGACAO_REPOSITORY, paraTestesEmDev(repositorio))
})

// T-0205: o e2e (tests/e2e/layout.spec.ts) precisa provar duas coisas que o Playwright não vê do
// navegador — a busca a `/navegacao` roda dentro do próprio processo do servidor (nunca passa
// pela rede do browser) — e precisa de um jeito de simular a falha dela sem derrubar o SSR
// (`?_falha=500` do mock não ajuda aqui: não há como apontar para "só a busca de /navegacao
// desta página"). As duas só existem em desenvolvimento (`import.meta.dev` cai por tree-shaking
// em produção) e não mudam o contrato do repositório para quem usa `useNavegacao()`.
function paraTestesEmDev(repositorio: NavegacaoRepository): NavegacaoRepository {
  if (!import.meta.dev) return repositorio

  const evento = useRequestEvent()
  const simularFalha = Boolean(evento && getQuery(evento)._falha_navegacao === '500')
  let chamadas = 0

  return {
    obter: () => {
      chamadas += 1
      if (evento) setResponseHeader(evento, 'x-dev-chamadas-navegacao', String(chamadas))
      if (simularFalha)
        return Promise.resolve(falha(erroDeRede('falha simulada: _falha_navegacao=500')))
      return repositorio.obter()
    },
  }
}
