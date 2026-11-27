import { getRequestHeader, type H3Event } from 'h3'
import { inject, type InjectionKey } from 'vue'
import type { ClienteHttp, ConfiguracaoClienteHttp } from './cliente-http'

// T-0118 · REQ-01-19 (RNF-05, ADR 0002): a única forma de obter o `ClienteHttp` dentro de
// componente/composable. Quem cria a instância é `app/plugins/01.http.ts` — um ClienteHttp
// por app Vue, que no servidor é um por requisição (Nuxt cria uma instância por SSR).
export const SIMBOLO_CLIENTE_HTTP: InjectionKey<ClienteHttp> = Symbol('clienteHttp')

export function useClienteHttp(): ClienteHttp {
  const cliente = inject(SIMBOLO_CLIENTE_HTTP)
  if (!cliente) {
    throw new Error('useClienteHttp: nenhum ClienteHttp foi fornecido (ver app/plugins/01.http.ts)')
  }
  return cliente
}

/** Extraído do plugin pra testar sem precisar simular SSR de verdade (o ambiente de teste do
 *  Nuxt usado aqui é client-only: `useRequestEvent()` nunca devolve um evento de verdade nele). */
export function montarConfiguracaoDoClienteHttp(opcoes: {
  apiBase: string
  tempoLimiteMs?: number
  evento?: H3Event
  fetch: typeof fetch
}): ConfiguracaoClienteHttp {
  const cookie = opcoes.evento ? getRequestHeader(opcoes.evento, 'cookie') : undefined
  return {
    apiBase: opcoes.apiBase,
    tempoLimiteMs: opcoes.tempoLimiteMs,
    cabecalhos: cookie ? { cookie } : undefined,
    fetch: opcoes.fetch,
  }
}
