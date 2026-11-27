import { describe, expect, expectTypeOf, test } from 'vitest'
import { encadear, falha, mapear, ok, ouPadrao, type Result } from './result'

// T-0101 · REQ-01-01 (ADR 0010): Result<T, E> representa sucesso ou falha sem exceção.

describe('ok e falha', () => {
  test('ok(42) é sucesso e expõe o valor', () => {
    const resultado = ok(42)

    expect(resultado.ok).toBe(true)
    expect(resultado.ok && resultado.valor).toBe(42)
  })

  test('falha(e) é falha e expõe o erro', () => {
    const resultado = falha('deu ruim')

    expect(resultado.ok).toBe(false)
    expect(!resultado.ok && resultado.erro).toBe('deu ruim')
  })

  test('o TypeScript só deixa ler valor depois de conferir ok', () => {
    const resultado: Result<number, string> = ok(42)

    if (resultado.ok) {
      expectTypeOf(resultado.valor).toEqualTypeOf<number>()
    } else {
      expectTypeOf(resultado.erro).toEqualTypeOf<string>()
      // @ts-expect-error -- fora do narrowing, "valor" não existe no lado da falha
      resultado.valor // eslint-disable-line @typescript-eslint/no-unused-expressions
    }
  })
})

describe('mapear', () => {
  test('transforma o valor do sucesso', () => {
    const resultado = mapear(ok(2), (n) => n * 10)

    expect(resultado).toEqual(ok(20))
  })

  test('deixa a falha intacta', () => {
    const resultado = mapear(falha<string>('x'), (n: number) => n * 10)

    expect(resultado).toEqual(falha('x'))
  })
})

describe('encadear', () => {
  test('com uma função que falha devolve aquela falha', () => {
    const resultado = encadear(ok(2), () => falha('não deu'))

    expect(resultado).toEqual(falha('não deu'))
  })

  test('com uma função que dá sucesso, segue encadeado', () => {
    const resultado = encadear(ok(2), (n) => ok(n * 10))

    expect(resultado).toEqual(ok(20))
  })

  test('sobre uma falha, não chama a função', () => {
    let chamou = false
    const resultado = encadear(falha<string>('x'), (n: number) => {
      chamou = true
      return ok(n)
    })

    expect(chamou).toBe(false)
    expect(resultado).toEqual(falha('x'))
  })
})

describe('ouPadrao', () => {
  test('devolve o valor no sucesso', () => {
    expect(ouPadrao(ok(5), 0)).toBe(5)
  })

  test('devolve o padrão na falha', () => {
    expect(ouPadrao(falha('x'), 0)).toBe(0)
  })
})
