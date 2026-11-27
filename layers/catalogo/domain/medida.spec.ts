import { describe, expect, test } from 'vitest'
import { Medida } from './medida'

// T-0301 · REQ-03-03 (docs/domain/catalogo.md): a medida do pneu — largura e altura inteiros
// positivos, aro como texto (nem todo aro é um número inteiro: "17,5", "16C").

describe('Medida.de', () => {
  test('cria 225/45 R17 e devolve o rótulo', () => {
    const resultado = Medida.de({ largura: 225, altura: 45, aro: '17' })

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) throw new Error('esperava sucesso')
    expect(resultado.valor.rotulo).toBe('225/45 R17')
  })

  test.each([['17,5'], ['16C']])('aceita aro como texto (%s)', (aro) => {
    const resultado = Medida.de({ largura: 225, altura: 45, aro })

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) throw new Error('esperava sucesso')
    expect(resultado.valor.rotulo).toBe(`225/45 R${aro}`)
  })

  test.each([
    ['largura zero', { largura: 0, altura: 45, aro: '17' }],
    ['largura negativa', { largura: -225, altura: 45, aro: '17' }],
    ['largura não inteira', { largura: 225.5, altura: 45, aro: '17' }],
    ['altura zero', { largura: 225, altura: 0, aro: '17' }],
    ['altura negativa', { largura: 225, altura: -45, aro: '17' }],
    ['altura não inteira', { largura: 225, altura: 45.5, aro: '17' }],
  ])('recusa %s', (_motivo, dados) => {
    const resultado = Medida.de(dados)

    expect(resultado.ok).toBe(false)
    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('MedidaInvalida')
  })

  test('recusa aro vazio', () => {
    const resultado = Medida.de({ largura: 225, altura: 45, aro: '' })

    expect(resultado.ok).toBe(false)
    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('MedidaInvalida')
  })
})

describe('Medida.igual', () => {
  test('duas medidas com os mesmos três valores são iguais', () => {
    const a = Medida.de({ largura: 225, altura: 45, aro: '17' })
    const b = Medida.de({ largura: 225, altura: 45, aro: '17' })
    if (!a.ok || !b.ok) throw new Error('esperava sucesso')

    expect(a.valor.igual(b.valor)).toBe(true)
  })

  test('medidas com um valor diferente não são iguais', () => {
    const a = Medida.de({ largura: 225, altura: 45, aro: '17' })
    const b = Medida.de({ largura: 205, altura: 45, aro: '17' })
    if (!a.ok || !b.ok) throw new Error('esperava sucesso')

    expect(a.valor.igual(b.valor)).toBe(false)
  })
})
