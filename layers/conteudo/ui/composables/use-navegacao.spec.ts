import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { erroDeRede } from '#layers/shared'
import { criarNavegacaoRepositoryFalso } from '../../application/__falsos__/navegacao-repository-falso'
import { umaNavegacao } from '../../domain/__fabricas__/navegacao'
import type { NavegacaoRepository } from '../../domain/portas'
import { SIMBOLO_NAVEGACAO_REPOSITORY, useNavegacao } from './use-navegacao'

// T-0204 · REQ-02-01 (ADR 0002, ADR 0007): `NavegacaoRepository` nasce num lugar só
// (app/plugins/12.conteudo.ts) e chega por injeção — nunca por `criarHttpNavegacaoRepository`
// direto num composable de tela; a navegação não é copiada para store.
//
// `useAsyncData('navegacao', ...)` guarda a busca no payload do próprio app Nuxt, não por
// montagem: todos os testes deste arquivo rodam no MESMO app de teste (`@nuxt/test-utils`), então
// compartilham UM falso (reprogramado por teste) e limpam o cache entre eles com `clearNuxtData`
// — senão o segundo teste leria o resultado do primeiro em vez de chamar a porta de novo.

function montar(repositorio: NavegacaoRepository) {
  const ComponenteDeProva = defineComponent({
    setup() {
      return useNavegacao()
    },
    template: '<div />',
  })
  return mountSuspended(ComponenteDeProva, {
    global: { provide: { [SIMBOLO_NAVEGACAO_REPOSITORY as unknown as string]: repositorio } },
  })
}

describe('useNavegacao (composable)', () => {
  const falso = criarNavegacaoRepositoryFalso()
  const obter = vi.fn(falso.obter)
  const repositorio: NavegacaoRepository = { ...falso, obter }

  afterEach(() => {
    clearNuxtData('navegacao')
    obter.mockClear()
  })

  test('devolve navegacao e estado "sucesso" quando a porta responde', async () => {
    const navegacao = umaNavegacao()
    falso.programarSucesso(navegacao)

    const wrapper = await montar(repositorio)
    const vm = wrapper.vm as unknown as ReturnType<typeof useNavegacao>

    expect(vm.estado).toBe('sucesso')
    expect(vm.navegacao).toEqual(navegacao)
  })

  test('falha da porta deixa estado em "erro" e navegacao nula, sem lançar', async () => {
    falso.programarFalha(erroDeRede('tempo esgotado'))

    const wrapper = await montar(repositorio)
    const vm = wrapper.vm as unknown as ReturnType<typeof useNavegacao>

    expect(vm.estado).toBe('erro')
    expect(vm.navegacao).toBeNull()
  })

  test('dois componentes que chamam useNavegacao() na mesma página fazem uma única chamada à porta', async () => {
    falso.programarSucesso(umaNavegacao())

    const ComponenteComDoisConsumidores = defineComponent({
      setup() {
        const a = useNavegacao()
        const b = useNavegacao()
        return { a, b }
      },
      template: '<div />',
    })
    await mountSuspended(ComponenteComDoisConsumidores, {
      global: { provide: { [SIMBOLO_NAVEGACAO_REPOSITORY as unknown as string]: repositorio } },
    })

    expect(obter).toHaveBeenCalledTimes(1)
  })
})
