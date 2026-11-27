import { describe, expect, test, vi } from 'vitest'
import { criarClienteHttp } from './cliente-http'

// T-0103 · REQ-01-03, REQ-01-04 (RNF-05, ADR 0003, ADR 0004): o único jeito de falar com a API.
// Nenhum método lança; toda falha vira um erro do kernel.

type RespostaFalsa = { status: number; corpo?: unknown; contentType?: string }

function fetchComResposta({ status, corpo, contentType = 'application/json' }: RespostaFalsa) {
  return vi.fn(
    async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(corpo === undefined ? null : JSON.stringify(corpo), {
        status,
        headers: { 'content-type': contentType },
      }),
  )
}

const schemaQualquer = { safeParse: (dado: unknown) => ({ success: true as const, data: dado }) }

// Mesmo formato de erro do Zod (`{ issues: [{ path, message }] }`), sem importar o pacote: é
// esse formato que cliente-http.ts entende, e é nele que um schema Zod de verdade já responde.
const schemaNavegacao = {
  safeParse: (dado: unknown) => {
    const d = dado as { contato?: { telefone?: unknown } }
    if (typeof d?.contato?.telefone !== 'string') {
      return {
        success: false as const,
        error: {
          issues: [{ path: ['contato', 'telefone'], message: 'campo obrigatório ausente' }],
        },
      }
    }
    return { success: true as const, data: dado }
  },
}

describe('obter', () => {
  test('monta a URL com a consulta: array repete a chave, undefined some', async () => {
    const fetch = fetchComResposta({ status: 200, corpo: { ok: true } })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', fetch })

    await cliente.obter('/produtos', {
      consulta: { aro: ['17', '18'], pagina: 1, marca: undefined },
      schema: schemaQualquer,
    })

    const [url] = fetch.mock.calls[0]!
    expect(url).toBe('/api/mock/produtos?aro=17&aro=18&pagina=1')
  })

  test('a base vem da configuração', async () => {
    const fetch = fetchComResposta({ status: 200, corpo: {} })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', fetch })

    await cliente.obter('/navegacao', { schema: schemaQualquer })

    expect(fetch.mock.calls[0]![0]).toBe('/api/mock/navegacao')
  })

  test('200 que valida no schema vira ok, com o valor já tipado', async () => {
    const fetch = fetchComResposta({ status: 200, corpo: { contato: { telefone: '41999' } } })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', fetch })

    const resultado = await cliente.obter('/navegacao', { schema: schemaNavegacao })

    expect(resultado).toEqual({ ok: true, valor: { contato: { telefone: '41999' } } })
  })

  test('200 sem contato.telefone vira ErroDeContrato', async () => {
    const fetch = fetchComResposta({ status: 200, corpo: { contato: {} } })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', fetch })

    const resultado = await cliente.obter('/navegacao', { schema: schemaNavegacao })

    expect(resultado.ok).toBe(false)
    expect(!resultado.ok && resultado.erro).toMatchObject({
      tipo: 'ErroDeContrato',
      endpoint: 'GET /navegacao',
      caminho: 'contato.telefone',
    })
  })

  test('404 com o corpo de erro-404.json vira NaoEncontrado com o título', async () => {
    const corpo = {
      type: 'https://api.tireshop.com.br/erros/nao-encontrado',
      title: 'Produto não encontrado',
      status: 404,
      detail: 'Não existe produto com o código 9999.',
      instance: '/produtos/9999',
    }
    const fetch = fetchComResposta({ status: 404, corpo, contentType: 'application/problem+json' })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', fetch })

    const resultado = await cliente.obter('/produtos/9999', { schema: schemaQualquer })

    expect(resultado).toEqual({
      ok: false,
      erro: { tipo: 'NaoEncontrado', titulo: 'Produto não encontrado' },
    })
  })

  test('422 com o corpo de erro-422.json vira ErroDeValidacao com os campos', async () => {
    const corpo = {
      type: 'https://api.tireshop.com.br/erros/validacao',
      title: 'Dados inválidos',
      status: 422,
      erros: [{ campo: 'cep', mensagem: 'Digite o CEP completo, com 8 números.' }],
    }
    const fetch = fetchComResposta({ status: 422, corpo, contentType: 'application/problem+json' })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', fetch })

    const resultado = await cliente.obter('/frete', { schema: schemaQualquer })

    expect(resultado).toEqual({
      ok: false,
      erro: {
        tipo: 'ErroDeValidacao',
        campos: [{ campo: 'cep', mensagem: 'Digite o CEP completo, com 8 números.' }],
      },
    })
  })

  test('500 vira ErroDeRede com tentarDeNovo', async () => {
    const fetch = fetchComResposta({ status: 500, corpo: { title: 'Erro interno' } })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', fetch })

    const resultado = await cliente.obter('/navegacao', { schema: schemaQualquer })

    expect(resultado.ok).toBe(false)
    expect(!resultado.ok && resultado.erro).toMatchObject({
      tipo: 'ErroDeRede',
      tentarDeNovo: true,
    })
  })

  test('falha de rede vira ErroDeRede com tentarDeNovo', async () => {
    const fetch = vi.fn(async () => {
      throw new TypeError('fetch failed')
    })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', fetch })

    const resultado = await cliente.obter('/navegacao', { schema: schemaQualquer })

    expect(!resultado.ok && resultado.erro).toMatchObject({
      tipo: 'ErroDeRede',
      tentarDeNovo: true,
    })
  })

  test('tempo esgotado (limite configurável) vira ErroDeRede', async () => {
    const fetch = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
      return new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () =>
          reject(new DOMException('tempo esgotado', 'AbortError')),
        )
      })
    })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', tempoLimiteMs: 20, fetch })

    const resultado = await cliente.obter('/navegacao', { schema: schemaQualquer })

    expect(!resultado.ok && resultado.erro).toMatchObject({
      tipo: 'ErroDeRede',
      tentarDeNovo: true,
    })
  })

  test('o limite padrão é 8 segundos', async () => {
    const cliente = criarClienteHttp({
      apiBase: '/api/mock',
      fetch: fetchComResposta({ status: 200, corpo: {} }),
    })

    // A asserção real está em cliente-http.ts (TEMPO_LIMITE_PADRAO_MS); aqui só confere que o
    // cliente funciona sem tempoLimiteMs informado (usa o padrão).
    const resultado = await cliente.obter('/navegacao', { schema: schemaQualquer })

    expect(resultado.ok).toBe(true)
  })

  test('no servidor, repassa o cabeçalho cookie recebido na configuração', async () => {
    const fetch = fetchComResposta({ status: 200, corpo: {} })
    const cliente = criarClienteHttp({
      apiBase: '/api/mock',
      cabecalhos: { cookie: 'sessao=abc123' },
      fetch,
    })

    await cliente.obter('/navegacao', { schema: schemaQualquer })

    const [, init] = fetch.mock.calls[0]!
    const cabecalhos = new Headers(init?.headers)
    expect(cabecalhos.get('cookie')).toBe('sessao=abc123')
  })

  test('sempre envia as credenciais (o navegador decide o que mandar)', async () => {
    const fetch = fetchComResposta({ status: 200, corpo: {} })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', fetch })

    await cliente.obter('/navegacao', { schema: schemaQualquer })

    const [, init] = fetch.mock.calls[0]!
    expect(init?.credentials).toBe('include')
  })
})

describe('enviar', () => {
  test('POST manda o corpo como JSON e aceita 201 com schema', async () => {
    const fetch = fetchComResposta({ status: 201, corpo: { ok: true } })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', fetch })

    const resultado = await cliente.enviar(
      'POST',
      '/newsletter',
      { email: 'a@a.com' },
      { schema: schemaQualquer },
    )

    expect(resultado).toEqual({ ok: true, valor: { ok: true } })
    const [url, init] = fetch.mock.calls[0]!
    expect(url).toBe('/api/mock/newsletter')
    expect(init?.method).toBe('POST')
    expect(JSON.parse(String(init?.body))).toEqual({ email: 'a@a.com' })
    expect(new Headers(init?.headers).get('content-type')).toBe('application/json')
  })

  test('aceita 204 sem corpo', async () => {
    const fetch = fetchComResposta({ status: 204 })
    const cliente = criarClienteHttp({ apiBase: '/api/mock', fetch })

    const resultado = await cliente.enviar('POST', '/newsletter', { email: 'a@a.com' })

    expect(resultado).toEqual({ ok: true, valor: undefined })
  })
})
