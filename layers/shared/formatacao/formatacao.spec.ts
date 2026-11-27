import { afterEach, describe, expect, test } from 'vitest'
import { formatarData } from './datas'
import { formatarNumero, plural } from './numeros'
import { formatarTelefone, linkDeTelefone, linkDoWhatsapp } from './telefones'

// T-0108 · REQ-01-09 (RNF-07): data, número, telefone e plural em pt-BR, por funções puras.

describe('formatarData', () => {
  const fusoOriginal = process.env.TZ

  afterEach(() => {
    process.env.TZ = fusoOriginal
  })

  test.each(['UTC', 'America/Sao_Paulo', 'Pacific/Kiritimati'])(
    '"2026-12-12" vira "12 de dezembro", no fuso %s',
    (fuso) => {
      process.env.TZ = fuso
      expect(formatarData('2026-12-12')).toBe('12 de dezembro')
    },
  )

  test('com { ano: true } inclui o ano: "12 de dezembro de 2026"', () => {
    expect(formatarData('2026-12-12', { ano: true })).toBe('12 de dezembro de 2026')
  })

  test('data que não existe devolve o texto original, sem lançar', () => {
    expect(formatarData('2026-02-30')).toBe('2026-02-30')
  })
})

describe('formatarNumero', () => {
  test('4.9 vira "4,9"', () => {
    expect(formatarNumero(4.9)).toBe('4,9')
  })

  test('1234 vira "1.234"', () => {
    expect(formatarNumero(1234)).toBe('1.234')
  })
})

describe('plural', () => {
  test('quantidade 1 usa a forma singular: "1 pneu"', () => {
    expect(plural(1, 'pneu', 'pneus')).toBe('1 pneu')
  })

  test('quantidade 2 usa a forma plural: "2 pneus"', () => {
    expect(plural(2, 'pneu', 'pneus')).toBe('2 pneus')
  })
})

describe('formatarTelefone', () => {
  test('10 dígitos (fixo): "(41) 3317-2251"', () => {
    expect(formatarTelefone('4133172251')).toBe('(41) 3317-2251')
  })

  test('11 dígitos (celular): "(41) 99999-0000"', () => {
    expect(formatarTelefone('41999990000')).toBe('(41) 99999-0000')
  })

  test('5 dígitos (inválido) devolve o texto original, sem lançar', () => {
    expect(formatarTelefone('12345')).toBe('12345')
  })
})

describe('linkDeTelefone', () => {
  test('"(41) 3317-2251" vira "tel:+554133172251"', () => {
    expect(linkDeTelefone('(41) 3317-2251')).toBe('tel:+554133172251')
  })
})

describe('linkDoWhatsapp', () => {
  test('"554133172251" vira "https://wa.me/554133172251"', () => {
    expect(linkDoWhatsapp('554133172251')).toBe('https://wa.me/554133172251')
  })
})
