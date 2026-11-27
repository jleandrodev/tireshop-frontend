import type { H3Event } from 'h3'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { criarClienteHttpFalso } from './__falsos__/cliente-http-falso'
import { criarClienteHttp } from './cliente-http'
import {
  montarConfiguracaoDoClienteHttp,
  SIMBOLO_CLIENTE_HTTP,
  useClienteHttp,
} from './use-cliente-http'

// T-0118 · REQ-01-19 (RNF-05, ADR 0002): o ClienteHttp nasce num lugar só (app/plugins/01.http.ts)
// e chega aqui por injeção — nunca por `criarClienteHttp` direto num composable de tela.
//
// `montarConfiguracaoDoClienteHttp` é o que o plugin de verdade chama: testado direto, sem
// `mountSuspended`, porque o ambiente "nuxt" do Vitest aqui é client-only — `useRequestEvent()`
// nunca devolve um evento de verdade nele, então simular SSR por esse caminho não dá.

const ComponenteDeProva = defineComponent({
  setup() {
    const cliente = useClienteHttp()
    return { cliente }
  },
  template: '<div />',
})

function schemaPassaTudo<T>() {
  return { safeParse: (dado: unknown) => ({ success: true as const, data: dado as T }) }
}

function eventoComCookie(cookie: string): H3Event {
  return { node: { req: { headers: { cookie } } } } as unknown as H3Event
}

describe('useClienteHttp (composable)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('devolve um cliente com a base de runtimeConfig.public.apiBase', async () => {
    const wrapper = await mountSuspended(ComponenteDeProva)
    const { cliente } = wrapper.vm as unknown as { cliente: ReturnType<typeof useClienteHttp> }

    await cliente.obter('/produtos', { schema: schemaPassaTudo() })

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/mock/produtos')
  })

  test('com o cliente trocado no teste (provide), useClienteHttp() devolve o falso', async () => {
    const falso = criarClienteHttpFalso()
    const wrapper = await mountSuspended(ComponenteDeProva, {
      global: { provide: { [SIMBOLO_CLIENTE_HTTP as unknown as string]: falso } },
    })

    const { cliente } = wrapper.vm as unknown as { cliente: ReturnType<typeof useClienteHttp> }
    expect(cliente).toBe(falso)
  })
})

describe('montarConfiguracaoDoClienteHttp', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('mudando a base, a chamada vai para a nova base', async () => {
    const cliente = criarClienteHttp(
      montarConfiguracaoDoClienteHttp({ apiBase: '/api/outra-base', fetch }),
    )

    await cliente.obter('/produtos', { schema: schemaPassaTudo() })

    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe('/api/outra-base/produtos')
  })

  test('com evento (requisição do servidor), leva o cabeçalho cookie da requisição atual', async () => {
    const cliente = criarClienteHttp(
      montarConfiguracaoDoClienteHttp({
        apiBase: '/api/mock',
        evento: eventoComCookie('sessao=abc123'),
        fetch,
      }),
    )

    await cliente.obter('/produtos', { schema: schemaPassaTudo() })

    const cabecalhos = vi.mocked(fetch).mock.calls[0]![1]!.headers as Headers
    expect(cabecalhos.get('cookie')).toBe('sessao=abc123')
  })

  test('sem evento (sem requisição do servidor em curso), não manda cookie', () => {
    const configuracao = montarConfiguracaoDoClienteHttp({ apiBase: '/api/mock', fetch })

    expect(configuracao.cabecalhos).toBeUndefined()
  })

  test('duas configurações seguidas (duas requisições) não compartilham cookie uma da outra', () => {
    const configDoVisitanteUm = montarConfiguracaoDoClienteHttp({
      apiBase: '/api/mock',
      evento: eventoComCookie('sessao=visitante-1'),
      fetch,
    })
    const configDoVisitanteDois = montarConfiguracaoDoClienteHttp({ apiBase: '/api/mock', fetch })

    expect(configDoVisitanteUm.cabecalhos?.cookie).toBe('sessao=visitante-1')
    expect(configDoVisitanteDois.cabecalhos).toBeUndefined()
  })
})
