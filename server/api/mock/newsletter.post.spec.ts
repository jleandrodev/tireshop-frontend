import { afterEach, describe, expect, test } from 'vitest'
import { lerFixtureJson } from '../../utils/mock'
import { responderNewsletter } from './newsletter.post'

// T-0217 · REQ-02-12, REQ-02-13: `responderNewsletter` é a lógica pura (mesmo padrão da T-0008)
// — a rota HTTP de verdade foi confirmada à mão contra `bin/pnpm dev`.

const chaveApiBase = 'NUXT_PUBLIC_API_BASE'
const originalApiBase = process.env[chaveApiBase]

afterEach(() => {
  if (originalApiBase === undefined) delete process.env[chaveApiBase]
  else process.env[chaveApiBase] = originalApiBase
})

describe('responderNewsletter: POST /api/mock/newsletter', () => {
  test('o corpo de newsletter.requisicao.json devolve 201 com { mensagem }', async () => {
    delete process.env[chaveApiBase]

    const resultado = await responderNewsletter({
      query: {},
      instancia: '/api/mock/newsletter',
      corpo: await lerFixtureJson('newsletter.requisicao'),
    })

    expect(resultado).toMatchObject({ tipo: 'ok', corpo: { mensagem: expect.any(String) } })
  })

  test.each([[undefined], [null]])('sem whatsapp (%p), devolve 201', async (whatsapp) => {
    delete process.env[chaveApiBase]

    const resultado = await responderNewsletter({
      query: {},
      instancia: '/api/mock/newsletter',
      corpo: { email: 'cliente@exemplo.com.br', whatsapp },
    })

    expect(resultado.tipo).toBe('ok')
  })

  test('e-mail inválido devolve problem+json 422 com erros[0].campo = "email"', async () => {
    delete process.env[chaveApiBase]

    const resultado = await responderNewsletter({
      query: {},
      instancia: '/api/mock/newsletter',
      corpo: { email: 'cliente@', whatsapp: null },
    })

    expect(resultado).toMatchObject({
      tipo: 'invalido',
      corpo: { status: 422, erros: [{ campo: 'email' }] },
    })
  })

  test('WhatsApp com 9 dígitos devolve 422 com o campo whatsapp', async () => {
    delete process.env[chaveApiBase]

    const resultado = await responderNewsletter({
      query: {},
      instancia: '/api/mock/newsletter',
      corpo: { email: 'cliente@exemplo.com.br', whatsapp: '419999900' },
    })

    expect(resultado).toMatchObject({
      tipo: 'invalido',
      corpo: { status: 422, erros: [{ campo: 'whatsapp' }] },
    })
  })

  test('o mesmo e-mail enviado duas vezes devolve 201 nas duas (não revela quem já assinou)', async () => {
    delete process.env[chaveApiBase]
    const corpo = { email: 'repetido@exemplo.com.br', whatsapp: null }

    const primeira = await responderNewsletter({
      query: {},
      instancia: '/api/mock/newsletter',
      corpo,
    })
    const segunda = await responderNewsletter({
      query: {},
      instancia: '/api/mock/newsletter',
      corpo,
    })

    expect(primeira.tipo).toBe('ok')
    expect(segunda.tipo).toBe('ok')
  })

  test('?_falha=500 devolve problem+json com status 500', async () => {
    delete process.env[chaveApiBase]

    const resultado = await responderNewsletter({
      query: { _falha: '500' },
      instancia: '/api/mock/newsletter',
      corpo: { email: 'cliente@exemplo.com.br', whatsapp: null },
    })

    expect(resultado).toMatchObject({
      tipo: 'falha',
      status: 500,
      corpo: { status: 500, type: expect.any(String), title: expect.any(String) },
    })
  })
})
