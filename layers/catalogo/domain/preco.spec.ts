import { Dinheiro } from '#layers/shared'
import { describe, expect, test } from 'vitest'
import { Preco } from './preco'

// T-0302 · REQ-03-03 (docs/domain/catalogo.md): o preço vem pronto da API — o front só mostra,
// nunca soma, multiplica nem aplica desconto (ADR 0010, RNF-07: evita divergir do backend).

function dinheiro(centavos: number): Dinheiro {
  const resultado = Dinheiro.deCentavos(centavos)
  if (!resultado.ok) throw new Error('dinheiro de prova inválido')
  return resultado.valor
}

function dadosValidos(extra?: { de?: Dinheiro }) {
  return {
    parcelado: { total: dinheiro(60000), parcelas: 12, valorParcela: dinheiro(5000) },
    aVista: { valor: dinheiro(54000), descontoPercentual: 10 },
    ...extra,
  }
}

describe('Preco.de', () => {
  test('guarda total parcelado, parcelas, valor da parcela, à vista e desconto como recebidos', () => {
    const resultado = Preco.de(dadosValidos())

    expect(resultado.ok).toBe(true)
    if (!resultado.ok) throw new Error('esperava sucesso')
    expect(resultado.valor.parcelado.total.igual(dinheiro(60000))).toBe(true)
    expect(resultado.valor.parcelado.parcelas).toBe(12)
    expect(resultado.valor.parcelado.valorParcela.igual(dinheiro(5000))).toBe(true)
    expect(resultado.valor.aVista.valor.igual(dinheiro(54000))).toBe(true)
    expect(resultado.valor.aVista.descontoPercentual).toBe(10)
  })

  test('emPromocao() é verdadeiro só quando há preço anterior maior que o parcelado', () => {
    const comPromocao = Preco.de(dadosValidos({ de: dinheiro(70000) }))
    const semPromocao = Preco.de(dadosValidos())

    if (!comPromocao.ok || !semPromocao.ok) throw new Error('esperava sucesso')
    expect(comPromocao.valor.emPromocao()).toBe(true)
    expect(semPromocao.valor.emPromocao()).toBe(false)
  })

  test.each([
    ['0 parcelas', 0],
    ['13 parcelas', 13],
  ])('recusa parcelas fora de 1 a 12 (%s)', (_motivo, parcelas) => {
    const resultado = Preco.de({
      ...dadosValidos(),
      parcelado: { total: dinheiro(60000), parcelas, valorParcela: dinheiro(5000) },
    })

    expect(resultado.ok).toBe(false)
    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('PrecoInvalido')
  })

  test('recusa à vista maior que o parcelado', () => {
    const resultado = Preco.de({
      ...dadosValidos(),
      aVista: { valor: dinheiro(60001), descontoPercentual: 0 },
    })

    expect(resultado.ok).toBe(false)
    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('PrecoInvalido')
  })

  test('recusa preço anterior que não é maior que o parcelado', () => {
    const resultado = Preco.de(dadosValidos({ de: dinheiro(60000) }))

    expect(resultado.ok).toBe(false)
    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('PrecoInvalido')
  })

  test('não tem método que some, multiplique ou aplique desconto', () => {
    const resultado = Preco.de(dadosValidos())
    if (!resultado.ok) throw new Error('esperava sucesso')

    const preco = resultado.valor as unknown as Record<string, unknown>
    expect(preco.somar).toBeUndefined()
    expect(preco.multiplicar).toBeUndefined()
    expect(preco.aplicarDesconto).toBeUndefined()
  })
})
