import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import Botao from './Botao.vue'
import Campo from './Campo.vue'

// T-0119 · REQ-01-20 (ADR 0006, RNF-02): a marca (`ts-btn*`/`ts-campo*`) e o alvo de 44 px.

describe('Botao', () => {
  test('sem variante é de contorno; só variante="acao" recebe a classe verde', async () => {
    const semVariante = await mountSuspended(Botao, { slots: { default: 'Continuar' } })
    expect(semVariante.classes()).toContain('ts-btn--outline')
    expect(semVariante.classes()).not.toContain('ts-btn--acao')

    const comAcao = await mountSuspended(Botao, {
      props: { variante: 'acao' },
      slots: { default: 'Comprar' },
    })
    expect(comAcao.classes()).toContain('ts-btn--acao')
  })

  test('com href, renderiza um link; sem, um button com type="button" por padrão', async () => {
    const link = await mountSuspended(Botao, {
      props: { href: '/carrinho' },
      slots: { default: 'Ver carrinho' },
    })
    expect(link.element.tagName).toBe('A')
    expect(link.attributes('href')).toBe('/carrinho')

    const botao = await mountSuspended(Botao, { slots: { default: 'Continuar' } })
    expect(botao.element.tagName).toBe('BUTTON')
    expect(botao.attributes('type')).toBe('button')
  })

  test('carregando desativa o botão e marca aria-busy="true", mantendo o texto', async () => {
    const wrapper = await mountSuspended(Botao, {
      props: { carregando: true },
      slots: { default: 'Confirmar pedido' },
    })

    expect(wrapper.attributes('disabled')).toBe('')
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.text()).toBe('Confirmar pedido')
  })
})

describe('Campo', () => {
  test('liga o rótulo ao controle pelo id; o rótulo pode ser só para leitor de tela', async () => {
    const comum = await mountSuspended(Campo, {
      props: { rotulo: 'E-mail' },
      slots: { default: '<template #default="c"><input v-bind="c" /></template>' },
    })
    const rotulo = comum.find('label')
    const controle = comum.find('input')
    expect(rotulo.attributes('for')).toBe(controle.attributes('id'))
    expect(rotulo.classes()).not.toContain('ts-sr-only')

    const soLeitor = await mountSuspended(Campo, {
      props: { rotulo: 'Buscar', rotuloSoLeitor: true },
      slots: { default: '<template #default="c"><input v-bind="c" /></template>' },
    })
    expect(soLeitor.find('label').classes()).toContain('ts-sr-only')
  })

  test('com erro, o controle recebe aria-invalid="true" e aria-describedby apontando para a mensagem', async () => {
    const wrapper = await mountSuspended(Campo, {
      props: { rotulo: 'CEP', erro: 'Digite um CEP válido.' },
      slots: { default: '<template #default="c"><input v-bind="c" /></template>' },
    })

    const controle = wrapper.find('input')
    const idErro = controle.attributes('aria-describedby')!
    expect(controle.attributes('aria-invalid')).toBe('true')
    expect(idErro).toBeTruthy()
    expect(wrapper.find(`#${idErro}`).text()).toBe('Digite um CEP válido.')
  })

  test('sem erro, o controle não recebe aria-invalid nem aria-describedby', async () => {
    const wrapper = await mountSuspended(Campo, {
      props: { rotulo: 'CEP' },
      slots: { default: '<template #default="c"><input v-bind="c" /></template>' },
    })

    const controle = wrapper.find('input')
    expect(controle.attributes('aria-invalid')).toBeUndefined()
    expect(controle.attributes('aria-describedby')).toBeUndefined()
  })

  test('aceita input e select pelo slot, sem mudar o comportamento', async () => {
    const comInput = await mountSuspended(Campo, {
      props: { rotulo: 'Nome' },
      slots: { default: '<template #default="c"><input v-bind="c" type="text" /></template>' },
    })
    expect(comInput.find('input').attributes('id')).toBeTruthy()

    const comSelect = await mountSuspended(Campo, {
      props: { rotulo: 'Aro' },
      slots: {
        default:
          '<template #default="c"><select v-bind="c"><option value="17">17</option></select></template>',
      },
    })
    expect(comSelect.find('select').attributes('id')).toBeTruthy()
  })
})
