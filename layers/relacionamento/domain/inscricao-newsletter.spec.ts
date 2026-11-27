import { describe, expect, test } from 'vitest'
import { Email } from './email'
import { InscricaoNewsletter } from './inscricao-newsletter'
import { Telefone } from './telefone'

// T-0214 · REQ-02-12 (docs/domain/relacionamento.md): `Email`, `Telefone` e `InscricaoNewsletter`
// validam o contato da newsletter — WhatsApp é opcional (R2-22), mas se vier precisa ser um
// `Telefone` válido.

describe('Email.de', () => {
  test('aceita "cliente@exemplo.com.br" e guarda em minúsculas', () => {
    const resultado = Email.de('Cliente@Exemplo.com.br')

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) throw new Error('esperava sucesso')
    expect(resultado.valor.valor).toBe('cliente@exemplo.com.br')
  })

  test.each([
    ['sem domínio', 'cliente@'],
    ['sem @', 'cliente.exemplo.com'],
    ['texto vazio', ''],
  ])('recusa %s', (_motivo, valor) => {
    const resultado = Email.de(valor)

    expect(resultado.ok).toBe(false)
    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('EmailInvalido')
  })
})

describe('Telefone.de', () => {
  test.each([
    ['11 dígitos', '41999990000', '41999990000'],
    ['10 dígitos, formatado', '(41) 3317-2251', '4133172251'],
  ])('aceita %s e guarda só os dígitos', (_motivo, entrada, esperado) => {
    const resultado = Telefone.de(entrada)

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) throw new Error('esperava sucesso')
    expect(resultado.valor.valor).toBe(esperado)
  })

  test.each([
    ['menos de 10 dígitos', '123456789'],
    ['mais de 11 dígitos', '123456789012'],
  ])('recusa %s', (_motivo, valor) => {
    const resultado = Telefone.de(valor)

    expect(resultado.ok).toBe(false)
    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('TelefoneInvalido')
  })
})

describe('InscricaoNewsletter.de', () => {
  test('com e-mail e sem WhatsApp é válida', () => {
    const resultado = InscricaoNewsletter.de({ email: 'cliente@exemplo.com.br' })

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) throw new Error('esperava sucesso')
    expect(resultado.valor.whatsapp).toBeNull()
  })

  test('WhatsApp em branco conta como ausente', () => {
    const resultado = InscricaoNewsletter.de({ email: 'cliente@exemplo.com.br', whatsapp: '   ' })

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) throw new Error('esperava sucesso')
    expect(resultado.valor.whatsapp).toBeNull()
  })

  test('WhatsApp preenchido e inválido recusa a inscrição, dizendo o campo e a mensagem', () => {
    const resultado = InscricaoNewsletter.de({ email: 'cliente@exemplo.com.br', whatsapp: '123' })

    expect(resultado.ok).toBe(false)
    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro).toEqual({
      campo: 'whatsapp',
      mensagem: 'Digite o WhatsApp com DDD: 10 ou 11 números.',
    })
  })

  test('e-mail inválido recusa a inscrição, dizendo o campo e a mensagem', () => {
    const resultado = InscricaoNewsletter.de({ email: 'cliente@' })

    expect(resultado.ok).toBe(false)
    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro).toEqual({
      campo: 'email',
      mensagem: 'Digite um e-mail válido, como nome@exemplo.com.br.',
    })
  })
})
