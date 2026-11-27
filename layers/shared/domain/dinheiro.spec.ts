import { describe, expect, test } from 'vitest'
import { Dinheiro } from './dinheiro'

// T-0102 · REQ-01-02: Dinheiro guarda centavos inteiros e formata em reais.

function dinheiroValido(centavos: number, moeda?: string): Dinheiro {
  const resultado = Dinheiro.deCentavos(centavos, moeda)
  if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))
  return resultado.valor
}

describe('Dinheiro.deCentavos', () => {
  test('formata 52900 centavos como "R$ 529,00" (espaço inseparável)', () => {
    expect(dinheiroValido(52900).formatar()).toBe('R$ 529,00')
  })

  test('100510 centavos formata "R$ 1.005,10"', () => {
    expect(dinheiroValido(100510).formatar()).toBe('R$ 1.005,10')
  })

  test('0 centavos formata "R$ 0,00"', () => {
    expect(dinheiroValido(0).formatar()).toBe('R$ 0,00')
  })

  test('recusa centavos não inteiros', () => {
    const resultado = Dinheiro.deCentavos(529.9)
    expect(resultado.ok).toBe(false)
  })

  test('recusa NaN', () => {
    const resultado = Dinheiro.deCentavos(Number.NaN)
    expect(resultado.ok).toBe(false)
  })

  test('recusa negativo', () => {
    const resultado = Dinheiro.deCentavos(-100)
    expect(resultado.ok).toBe(false)
  })

  test('recusa moeda diferente de BRL', () => {
    const resultado = Dinheiro.deCentavos(100, 'USD')
    expect(resultado.ok).toBe(false)
  })
})

describe('somar', () => {
  test('devolve um novo Dinheiro, sem mudar o original', () => {
    const a = dinheiroValido(1000)
    const b = dinheiroValido(500)

    const soma = a.somar(b)

    expect(soma.centavos).toBe(1500)
    expect(a.centavos).toBe(1000)
    expect(soma).not.toBe(a)
  })
})

describe('comparações', () => {
  test('maiorQue compara pelos centavos', () => {
    expect(dinheiroValido(1001).maiorQue(dinheiroValido(1000))).toBe(true)
    expect(dinheiroValido(1000).maiorQue(dinheiroValido(1000))).toBe(false)
  })

  test('menorOuIgual compara pelos centavos', () => {
    expect(dinheiroValido(999).menorOuIgual(dinheiroValido(1000))).toBe(true)
    expect(dinheiroValido(1000).menorOuIgual(dinheiroValido(1000))).toBe(true)
    expect(dinheiroValido(1001).menorOuIgual(dinheiroValido(1000))).toBe(false)
  })

  test('igual compara pelos centavos', () => {
    expect(dinheiroValido(1000).igual(dinheiroValido(1000))).toBe(true)
    expect(dinheiroValido(1000).igual(dinheiroValido(1001))).toBe(false)
  })
})

describe('não existe operação que arredonde errado', () => {
  test('não tem método de dividir, multiplicar por fração ou aplicar percentual', () => {
    const dinheiro = dinheiroValido(1000)

    expect('dividir' in dinheiro).toBe(false)
    expect('multiplicarPorFracao' in dinheiro).toBe(false)
    expect('aplicarPercentual' in dinheiro).toBe(false)
  })
})
