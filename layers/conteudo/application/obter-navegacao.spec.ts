import { describe, expect, test } from 'vitest'
import { erroDeRede } from '#layers/shared'
import { umaNavegacao } from '../domain/__fabricas__/navegacao'
import { criarNavegacaoRepositoryFalso } from './__falsos__/navegacao-repository-falso'
import { obterNavegacao } from './obter-navegacao'

// T-0201 · REQ-02-01: obterNavegacao só repassa a porta — quem decide cache (uma busca por
// requisição) é a composição (T-0204), não o caso de uso.

describe('obterNavegacao', () => {
  test('devolve a Navegacao da porta', async () => {
    const repositorio = criarNavegacaoRepositoryFalso()
    const navegacao = umaNavegacao()
    repositorio.programarSucesso(navegacao)

    const resultado = await obterNavegacao(repositorio)

    expect(resultado).toEqual({ ok: true, valor: navegacao })
  })

  test('erro da porta sai como Result de falha, sem lançar', async () => {
    const repositorio = criarNavegacaoRepositoryFalso()
    repositorio.programarFalha(erroDeRede('tempo esgotado'))

    const resultado = await obterNavegacao(repositorio)

    expect(resultado.ok).toBe(false)
  })
})
