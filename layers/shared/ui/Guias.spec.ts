import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import Guias from './Guias.vue'

// T-0110 · REQ-01-11 (RF-15, RNF-02): padrão de abas da WAI-ARIA — setas, Home e End trocam de
// guia, e só a guia ativa recebe o Tab.

const GUIAS = [
  { id: 'medida', rotulo: 'Por medida' },
  { id: 'aro', rotulo: 'Por aro' },
  { id: 'veiculo', rotulo: 'Por veículo' },
]

function montar(guiaInicial = 'medida') {
  return mountSuspended(Guias, {
    attachTo: document.body,
    props: { guias: GUIAS, ariaLabel: 'Como buscar', guiaInicial },
    slots: {
      medida: '<p>Painel medida</p>',
      aro: '<p>Painel aro</p>',
      veiculo: '<p>Painel veículo</p>',
    },
  })
}

describe('Guias', () => {
  test('renderiza tablist, um tab por guia e um tabpanel por painel, ligados por aria-controls/aria-labelledby', async () => {
    const wrapper = await montar()

    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
    const tabs = wrapper.findAll('[role="tab"]')
    const paineis = wrapper.findAll('[role="tabpanel"]')
    expect(tabs).toHaveLength(3)
    expect(paineis).toHaveLength(3)

    for (const [indice, tab] of tabs.entries()) {
      const idDoTab = tab.attributes('id')!
      const idDoPainel = tab.attributes('aria-controls')!
      const painel = paineis[indice]!
      expect(painel.attributes('id')).toBe(idDoPainel)
      expect(painel.attributes('aria-labelledby')).toBe(idDoTab)
    }
  })

  test('só a guia ativa tem aria-selected="true" e tabindex="0"', async () => {
    const wrapper = await montar()
    const tabs = wrapper.findAll('[role="tab"]')

    expect(tabs[0]!.attributes('aria-selected')).toBe('true')
    expect(tabs[0]!.attributes('tabindex')).toBe('0')
    expect(tabs[1]!.attributes('aria-selected')).toBe('false')
    expect(tabs[1]!.attributes('tabindex')).toBe('-1')
    expect(tabs[2]!.attributes('aria-selected')).toBe('false')
    expect(tabs[2]!.attributes('tabindex')).toBe('-1')
  })

  test('seta para a direita vai para a próxima guia e move o foco; na última, volta para a primeira', async () => {
    const wrapper = await montar()
    const tabs = wrapper.findAll('[role="tab"]')

    await tabs[0]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.findAll('[role="tab"]')[1]!.attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(wrapper.findAll('[role="tab"]')[1]!.element)

    await wrapper.findAll('[role="tab"]')[1]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.findAll('[role="tab"]')[2]!.attributes('aria-selected')).toBe('true')

    await wrapper.findAll('[role="tab"]')[2]!.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.findAll('[role="tab"]')[0]!.attributes('aria-selected')).toBe('true')
  })

  test('seta para a esquerda na primeira vai para a última', async () => {
    const wrapper = await montar()
    const tabs = wrapper.findAll('[role="tab"]')

    await tabs[0]!.trigger('keydown', { key: 'ArrowLeft' })

    expect(wrapper.findAll('[role="tab"]')[2]!.attributes('aria-selected')).toBe('true')
  })

  test('Home vai para a primeira; End, para a última', async () => {
    const wrapper = await montar()
    const tabs = wrapper.findAll('[role="tab"]')

    await tabs[0]!.trigger('keydown', { key: 'End' })
    expect(wrapper.findAll('[role="tab"]')[2]!.attributes('aria-selected')).toBe('true')

    await wrapper.findAll('[role="tab"]')[2]!.trigger('keydown', { key: 'Home' })
    expect(wrapper.findAll('[role="tab"]')[0]!.attributes('aria-selected')).toBe('true')
  })

  test('só o painel da guia ativa fica visível', async () => {
    const wrapper = await montar()
    const paineis = wrapper.findAll('[role="tabpanel"]')

    expect(paineis[0]!.attributes('hidden')).toBeUndefined()
    expect(paineis[1]!.attributes('hidden')).toBe('')
    expect(paineis[2]!.attributes('hidden')).toBe('')
  })

  test('a guia inicial vem por prop', async () => {
    const wrapper = await montar('aro')
    const tabs = wrapper.findAll('[role="tab"]')

    expect(tabs[1]!.attributes('aria-selected')).toBe('true')
  })

  test('mudar de guia emite "mudar" com o id da guia', async () => {
    const wrapper = await montar()

    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')

    expect(wrapper.emitted('mudar')).toEqual([['aro']])
  })

  test('no HTML do servidor todos os painéis estão presentes', async () => {
    const wrapper = await montar()

    expect(wrapper.html()).toContain('Painel medida')
    expect(wrapper.html()).toContain('Painel aro')
    expect(wrapper.html()).toContain('Painel veículo')
  })
})
