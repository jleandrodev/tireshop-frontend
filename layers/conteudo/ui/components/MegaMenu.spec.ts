import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent } from 'vue'
import { describe, expect, test } from 'vitest'
import { fornecerCoordenadorMegaMenu } from '../composables/use-coordenador-mega-menu'
import MegaMenu from './MegaMenu.vue'

// T-0207 · REQ-02-05, REQ-02-06: invólucro genérico do `<details>` — Lojas e Marcas (T-0208) usam
// o mesmo componente. O painel fica dentro de um `details` com o `summary` recebido.

describe('MegaMenu', () => {
  test('o painel fica num details com o summary recebido', async () => {
    const wrapper = await mountSuspended(MegaMenu, {
      props: { rotulo: 'Departamentos' },
      slots: { default: '<p>conteúdo do painel</p>' },
    })

    const detalhes = wrapper.get('details.ts-mega')
    expect(detalhes.get('summary').text()).toContain('Departamentos')
    expect(detalhes.find('.ts-mega__painel').text()).toContain('conteúdo do painel')
  })

  test('Esc fecha e devolve o foco ao summary', async () => {
    const wrapper = await mountSuspended(MegaMenu, {
      props: { rotulo: 'Departamentos' },
      attachTo: document.body,
    })

    const detalhes = wrapper.get('details').element as HTMLDetailsElement
    detalhes.open = true
    await detalhes.dispatchEvent(new Event('toggle'))
    expect(detalhes.open).toBe(true)

    await wrapper.get('details').trigger('keydown', { key: 'Escape' })

    expect(detalhes.open).toBe(false)
    expect(document.activeElement).toBe(wrapper.get('summary').element)
    wrapper.unmount()
  })

  test('clique fora fecha o menu aberto', async () => {
    const wrapper = await mountSuspended(MegaMenu, {
      props: { rotulo: 'Departamentos' },
      attachTo: document.body,
    })

    const detalhes = wrapper.get('details').element as HTMLDetailsElement
    detalhes.open = true
    await detalhes.dispatchEvent(new Event('toggle'))
    expect(detalhes.open).toBe(true)

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(detalhes.open).toBe(false)
    wrapper.unmount()
  })

  test('abrir um mega menu fecha os outros fornecidos pelo mesmo coordenador', async () => {
    const ComponenteDeProva = defineComponent({
      components: { MegaMenu },
      setup() {
        fornecerCoordenadorMegaMenu()
        return {}
      },
      template: `
        <div>
          <MegaMenu ref="a" rotulo="A">A</MegaMenu>
          <MegaMenu ref="b" rotulo="B">B</MegaMenu>
        </div>
      `,
    })
    const wrapper = await mountSuspended(ComponenteDeProva)

    const [detalhesA, detalhesB] = wrapper
      .findAll('details')
      .map((d) => d.element as HTMLDetailsElement)

    detalhesA!.open = true
    await detalhesA!.dispatchEvent(new Event('toggle'))
    detalhesB!.open = true
    await detalhesB!.dispatchEvent(new Event('toggle'))

    expect(detalhesA!.open).toBe(false)
    expect(detalhesB!.open).toBe(true)
  })
})
