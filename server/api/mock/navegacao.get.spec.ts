import { afterEach, describe, expect, test } from 'vitest'
import { responderFixture } from '../../utils/mock'

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

    expect(Date.now() - antes).toBeGreaterThanOrEqual(300)
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
