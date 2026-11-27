import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'
import { classificarHref, resolverRota } from '#layers/shared'
import { NavegacaoSchema } from '../../../layers/conteudo/adapters/http/navegacao.schema'
import { lerFixtureJson, responderFixture } from '../../utils/mock'

// T-0008 · REQ-00-07: o servidor de mocks serve fixtures, com atraso e falha simuláveis.
//
// `navegacao.get.ts` é um invólucro fino sobre `responderFixture` (server/utils/mock.ts): lê
// `getQuery`/`useRuntimeConfig`, que só existem dentro do Nitro. Testar aqui, direto, a função
// pura que decide o quê responder — a mesma que a rota chama — evita depender de subir um
// servidor Nuxt inteiro só para um teste de unidade. O comportamento de ponta a ponta (a rota
// HTTP de verdade) foi confirmado à mão contra `bin/pnpm dev` (ver Pendências da task).

const chaveApiBase = 'NUXT_PUBLIC_API_BASE'
const originalApiBase = process.env[chaveApiBase]

afterEach(() => {
  if (originalApiBase === undefined) delete process.env[chaveApiBase]
  else process.env[chaveApiBase] = originalApiBase
})

describe('responderFixture: GET /api/mock/navegacao', () => {
  test('devolve o conteúdo da fixture pedida', async () => {
    delete process.env[chaveApiBase]
    const fixture = { departamentos: ['pneus-para-carros'] }

    const resultado = await responderFixture({
      query: {},
      instancia: '/api/mock/navegacao',
      lerFixture: async () => fixture,
    })

    expect(resultado).toEqual({ tipo: 'ok', corpo: fixture })
  })

  test('?_falha=500 devolve problem+json com status 500', async () => {
    delete process.env[chaveApiBase]

    const resultado = await responderFixture({
      query: { _falha: '500' },
      instancia: '/api/mock/navegacao',
      lerFixture: async () => ({}),
    })

    expect(resultado).toMatchObject({
      tipo: 'falha',
      status: 500,
      corpo: { status: 500, type: expect.any(String), title: expect.any(String) },
    })
  })

  test('?_atraso=300 demora pelo menos 300 ms', async () => {
    delete process.env[chaveApiBase]
    const antes = Date.now()

    await responderFixture({
      query: { _atraso: '300' },
      instancia: '/api/mock/navegacao',
      lerFixture: async () => ({}),
    })

    // Achado no CI (T-0219, job "Testes"): 299ms medidos para um `setTimeout(…, 300)` — não é
    // atraso curto de menos, é a precisão do relógio sob carga (`Date.now()` arredonda; o próprio
    // Node só garante "não antes de" 300ms). Poucos ms de tolerância, não a asserção toda.
    expect(Date.now() - antes).toBeGreaterThanOrEqual(295)
  }, 10_000)

  test('com NUXT_PUBLIC_API_BASE externo, o mock está desligado', async () => {
    process.env[chaveApiBase] = 'https://api.tireshop.com.br'

    const resultado = await responderFixture({
      query: {},
      instancia: '/api/mock/navegacao',
      lerFixture: async () => ({ nao: 'deveria chegar aqui' }),
    })

    expect(resultado).toEqual({ tipo: 'desligado' })
  })

  test('sem a variável definida, usa a base interna (mock ligado)', async () => {
    delete process.env[chaveApiBase]

    const resultado = await responderFixture({
      query: {},
      instancia: '/api/mock/navegacao',
      lerFixture: async () => ({ ok: true }),
    })

    expect(resultado).toEqual({ tipo: 'ok', corpo: { ok: true } })
  })
})

// T-0203 · REQ-02-01, REQ-02-05: a resposta de verdade (mocks/fixtures/navegacao.json, lida por
// `responderFixture`) tem de valer o contrato que o adaptador (T-0202) espera — não só a fixture
// reduzida dos testes acima.

const raiz = join(import.meta.dirname, '..', '..', '..')
const categorias = JSON.parse(
  readFileSync(join(raiz, 'mocks', 'fixtures', '_base', 'categorias.json'), 'utf8'),
) as ReadonlyArray<{ slug: string }>
const slugsDeCategoria = new Set(categorias.map((categoria) => categoria.slug))

function hrefsDaFixture(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.flatMap(hrefsDaFixture)
  if (valor !== null && typeof valor === 'object') {
    return Object.entries(valor as Record<string, unknown>).flatMap(([chave, campo]) =>
      chave === 'href' && typeof campo === 'string' ? [campo] : hrefsDaFixture(campo),
    )
  }
  return []
}

describe('GET /api/mock/navegacao: a resposta de verdade honra o contrato do adaptador', () => {
  async function navegacaoDeVerdade(): Promise<unknown> {
    delete process.env[chaveApiBase]
    const resultado = await responderFixture({
      query: {},
      instancia: '/api/mock/navegacao',
      lerFixture: () => lerFixtureJson('navegacao'),
    })
    if (resultado.tipo !== 'ok') throw new Error('esperava sucesso: ' + JSON.stringify(resultado))
    return resultado.corpo
  }

  test('valida no NavegacaoSchema do adaptador', async () => {
    const resultado = NavegacaoSchema.safeParse(await navegacaoDeVerdade())
    expect(resultado.success).toBe(true)
  })

  test('tem 8 departamentos e pelo menos 50 links de aro no total', async () => {
    const navegacao = (await navegacaoDeVerdade()) as { departamentos: Array<{ aros: unknown[] }> }

    expect(navegacao.departamentos).toHaveLength(8)
    const totalDeAros = navegacao.departamentos.reduce((total, dep) => total + dep.aros.length, 0)
    expect(totalDeAros).toBeGreaterThanOrEqual(50)
  })

  test('todo href interno é reconhecido por resolverRota (nenhum "desconhecida")', async () => {
    const internos = hrefsDaFixture(await navegacaoDeVerdade()).filter(
      (href) => classificarHref(href) === 'interno',
    )

    expect(internos.length).toBeGreaterThan(0)
    for (const href of internos) {
      expect(resolverRota(href).tipo, `href interno não reconhecido: ${href}`).not.toBe(
        'desconhecida',
      )
    }
  })

  test('todo href de categoria (/c/<slug>) aponta para um slug em categorias.json', async () => {
    const hrefsDeCategoria = hrefsDaFixture(await navegacaoDeVerdade()).filter((href) =>
      href.startsWith('/c/'),
    )

    expect(hrefsDeCategoria.length).toBeGreaterThan(0)
    for (const href of hrefsDeCategoria) {
      const slug = href.slice('/c/'.length)
      expect(slugsDeCategoria.has(slug), `slug sem categoria: ${slug}`).toBe(true)
    }
  })

  test('?_falha=500 continua devolvendo problem+json mesmo lendo a fixture de verdade', async () => {
    delete process.env[chaveApiBase]

    const resultado = await responderFixture({
      query: { _falha: '500' },
      instancia: '/api/mock/navegacao',
      lerFixture: () => lerFixtureJson('navegacao'),
    })

    expect(resultado).toMatchObject({
      tipo: 'falha',
      status: 500,
      corpo: { status: 500, type: expect.any(String), title: expect.any(String) },
    })
  })
})
