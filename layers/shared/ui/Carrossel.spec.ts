import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import Carrossel from './Carrossel.vue'

// T-0111 · REQ-01-12 (RF-17, RNF-02): o carrossel só anda por ação do usuário — sem `setInterval`,
// sem prop de rotação automática.

const SLIDES = ['Pneu A', 'Pneu B', 'Pneu C']

function montar(props: Record<string, unknown> = {}) {
  return mountSuspended(Carrossel, {
    props: { slides: SLIDES, ariaLabel: 'Produtos relacionados', ...props },
    slots: {
      slide: '<template #slide="{ slide }">{{ slide }}</template>',
    },
  })
}

describe('Carrossel', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('"Anterior" começa desativado; "Próximo" fica desativado no último slide', async () => {
    const wrapper = await montar()
    const anterior = wrapper.get('button[aria-label="Anterior"]')
    const proximo = wrapper.get('button[aria-label="Próximo"]')

    expect(anterior.attributes('disabled')).toBe('')
    expect(proximo.attributes('disabled')).toBeUndefined()

    await proximo.trigger('click')
    await proximo.trigger('click')

    expect(proximo.attributes('disabled')).toBe('')
    expect(anterior.attributes('disabled')).toBeUndefined()
  })

  test('clicar em "Próximo" rola o trilho um passo (largura do item mais o espaço entre eles)', async () => {
    const wrapper = await montar()

    await wrapper.get('button[aria-label="Próximo"]').trigger('click')

    // `scrollIntoView` é mockado no prototype (compartilhado por todo elemento); por isso a
    // verificação de "foi no item certo" é pelo `this` da chamada (`mock.contexts`), não por
    // comparar funções diferentes.
    const itens = wrapper.findAll('.ts-carrossel__item')
    const chamadas = vi.mocked(itens[1]!.element.scrollIntoView).mock
    expect(chamadas.calls).toHaveLength(1)
    expect(chamadas.contexts[0]).toBe(itens[1]!.element)
  })

  test('com pontos, há um botão por slide, e o atual tem aria-current="true"', async () => {
    const wrapper = await montar({ comPontos: true })
    const pontos = wrapper.findAll('.ts-carrossel__ponto')

    expect(pontos).toHaveLength(3)
    expect(pontos[0]!.attributes('aria-current')).toBe('true')
    expect(pontos[1]!.attributes('aria-current')).toBe('false')
  })

  test('clicar em um ponto leva ao slide dele', async () => {
    const wrapper = await montar({ comPontos: true })
    const pontos = wrapper.findAll('.ts-carrossel__ponto')

    await pontos[2]!.trigger('click')

    expect(pontos[2]!.attributes('aria-current')).toBe('true')
    const itens = wrapper.findAll('.ts-carrossel__item')
    expect(itens[2]!.element.scrollIntoView).toHaveBeenCalledOnce()
  })

  test('com prefers-reduced-motion, a rolagem não é animada', async () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
    } as MediaQueryList)
    const wrapper = await montar()

    await wrapper.get('button[aria-label="Próximo"]').trigger('click')

    const itens = wrapper.findAll('.ts-carrossel__item')
    expect(itens[1]!.element.scrollIntoView).toHaveBeenCalledWith(
      expect.objectContaining({ behavior: 'instant' }),
    )
  })

  test('com temporizadores falsos, 10 segundos se passam e a posição não muda (não há setInterval)', async () => {
    vi.useFakeTimers()
    const wrapper = await montar({ comPontos: true })

    await vi.advanceTimersByTimeAsync(10_000)

    expect(wrapper.findAll('.ts-carrossel__ponto')[0]!.attributes('aria-current')).toBe('true')
    vi.useRealTimers()
  })

  test('as setas e os pontos têm nome acessível ("Anterior", "Próximo", "Ir para o slide 2 de 3")', async () => {
    const wrapper = await montar({ comPontos: true })

    expect(wrapper.find('button[aria-label="Anterior"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="Próximo"]').exists()).toBe(true)
    expect(wrapper.find('button[aria-label="Ir para o slide 2 de 3"]').exists()).toBe(true)
  })

  test('sem slides, o componente não renderiza nada', async () => {
    const wrapper = await montar({ slides: [] })

    expect(wrapper.find('.ts-carrossel').exists()).toBe(false)
    expect(wrapper.text()).toBe('')
  })
})
