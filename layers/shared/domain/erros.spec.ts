import { describe, expect, test } from 'vitest'
import { erroDeContrato, erroDeRede, erroDeValidacao, naoEncontrado } from './erros'

// T-0103 · REQ-01-03 (ADR 0010): os erros comuns do kernel, união fechada por `tipo`, cada um
// com o que a tela precisa para reagir.

describe('erroDeRede', () => {
  test('sempre pede para tentar de novo', () => {
    const erro = erroDeRede('sem conexão')

    expect(erro).toEqual({ tipo: 'ErroDeRede', tentarDeNovo: true, mensagem: 'sem conexão' })
  })
})

describe('erroDeContrato', () => {
  test('leva o endpoint e o caminho do campo que não bateu', () => {
    const erro = erroDeContrato('GET /navegacao', 'contato.telefone', 'campo obrigatório ausente')

    expect(erro).toEqual({
      tipo: 'ErroDeContrato',
      endpoint: 'GET /navegacao',
      caminho: 'contato.telefone',
      mensagem: 'campo obrigatório ausente',
    })
  })
})

describe('naoEncontrado', () => {
  test('leva o título do problem+json', () => {
    const erro = naoEncontrado('Produto não encontrado')

    expect(erro).toEqual({ tipo: 'NaoEncontrado', titulo: 'Produto não encontrado' })
  })
})

describe('erroDeValidacao', () => {
  test('leva a lista de campos', () => {
    const erro = erroDeValidacao([
      { campo: 'cep', mensagem: 'Digite o CEP completo, com 8 números.' },
    ])

    expect(erro).toEqual({
      tipo: 'ErroDeValidacao',
      campos: [{ campo: 'cep', mensagem: 'Digite o CEP completo, com 8 números.' }],
    })
  })
})
