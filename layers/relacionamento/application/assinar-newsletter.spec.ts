import { erroDeRede, erroDeValidacao } from '#layers/shared'
import { beforeEach, describe, expect, test } from 'vitest'
import { criarLeadsGatewayFalso, type LeadsGatewayFalso } from './__falsos__/leads-gateway-falso'
import { assinarNewsletter } from './assinar-newsletter'

// T-0215 · REQ-02-12, REQ-02-13 (docs/domain/relacionamento.md): valida localmente antes de
// chamar a porta (regra do contexto) e repassa o que a porta devolver, sem lançar.

describe('assinarNewsletter', () => {
  let gateway: LeadsGatewayFalso

  beforeEach(() => {
    gateway = criarLeadsGatewayFalso()
  })

  test('com e-mail e WhatsApp válidos, chama a porta uma vez e devolve a confirmação recebida', async () => {
    gateway.programarSucesso({ mensagem: 'Inscrição confirmada!' })

    const resultado = await assinarNewsletter(gateway, {
      email: 'cliente@exemplo.com.br',
      whatsapp: '41999990000',
    })

    expect(gateway.chamadas).toHaveLength(1)
    expect(resultado).toEqual({ ok: true, valor: { mensagem: 'Inscrição confirmada!' } })
  })

  test('com e-mail inválido, devolve ErroDeValidacao com o campo email e não chama a porta', async () => {
    const resultado = await assinarNewsletter(gateway, { email: 'cliente@' })

    expect(gateway.chamadas).toHaveLength(0)
    expect(resultado).toEqual({
      ok: false,
      erro: erroDeValidacao([
        { campo: 'email', mensagem: 'Digite um e-mail válido, como nome@exemplo.com.br.' },
      ]),
    })
  })

  test('com WhatsApp inválido, devolve ErroDeValidacao com o campo whatsapp e não chama a porta', async () => {
    const resultado = await assinarNewsletter(gateway, {
      email: 'cliente@exemplo.com.br',
      whatsapp: '123',
    })

    expect(gateway.chamadas).toHaveLength(0)
    expect(resultado).toEqual({
      ok: false,
      erro: erroDeValidacao([
        { campo: 'whatsapp', mensagem: 'Digite o WhatsApp com DDD: 10 ou 11 números.' },
      ]),
    })
  })

  test('sem WhatsApp, a porta recebe a inscrição sem o campo', async () => {
    gateway.programarSucesso({ mensagem: 'Inscrição confirmada!' })

    await assinarNewsletter(gateway, { email: 'cliente@exemplo.com.br' })

    expect(gateway.chamadas[0]?.whatsapp).toBeNull()
  })

  test('ErroDeValidacao vindo da porta (422) é repassado com os campos', async () => {
    const erroDaPorta = erroDeValidacao([{ campo: 'email', mensagem: 'e-mail já cadastrado' }])
    gateway.programarFalha(erroDaPorta)

    const resultado = await assinarNewsletter(gateway, { email: 'cliente@exemplo.com.br' })

    expect(resultado).toEqual({ ok: false, erro: erroDaPorta })
  })

  test('ErroDeRede da porta sai como falha, sem lançar', async () => {
    gateway.programarFalha(erroDeRede('sem conexão'))

    const resultado = await assinarNewsletter(gateway, { email: 'cliente@exemplo.com.br' })

    expect(resultado).toEqual({ ok: false, erro: erroDeRede('sem conexão') })
  })
})
