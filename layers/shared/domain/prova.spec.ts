import { expect, test } from 'vitest'
import { somar } from './prova'

// T-0003 · REQ-00-02: um teste trivial roda em ambiente node, sem carregar o Nuxt, em menos de 1 s.
test('somar soma dois números', () => {
  expect(somar(2, 3)).toBe(5)
})
