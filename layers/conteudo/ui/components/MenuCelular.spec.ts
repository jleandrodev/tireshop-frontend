import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import { umaNavegacao } from '../../domain/__fabricas__/navegacao'
import MenuCelular from './MenuCelular.vue'

// T-0209 · REQ-02-09: a gaveta do celular, com o `Dialogo` (T-0112) pela esquerda. Lojas e Marcas
// não ganham painel aqui (fora do escopo): são links simples, como o resto do menu principal.

const navegacao = umaNavegacao()

function montar(aberto = true) {
  return mountSuspended(MenuCelular, {
    props: {
      aberto,
      departamentos: navegacao.departamentos,
      menu: navegacao.menu,
      ajuda: navegacao.ajuda,
      telefone: navegacao.contato.telefone,
      whatsapp: navegacao.contato.whatsapp,
      atendimento: navegacao.contato.atendimento,
    },
  })
}

describe('MenuCelular', () => {
  test('com aberto, é um diálogo modal com aria-label "Menu", na variante que entra pela esquerda', async () => {
    const wrapper = await montar(true)

    const dialogo = wrapper.get('dialog')
    expect(dialogo.element.open).toBe(true)
    expect(dialogo.attributes('aria-label')).toBe('Menu')
    expect(dialogo.classes()).toContain('ts-dialogo--esquerda')
  })

  test('"Departamentos" abre a lista dos 8 departamentos, cada um com o ícone, o nome ao lado e a seta à direita', async () => {
    const wrapper = await montar()

    const subs = wrapper.findAll('details.ts-menu__sub')
    expect(subs).toHaveLength(8)
    const primeiro = subs[0]!.get('summary')
    expect(primeiro.text()).toContain('Carros')
    expect(primeiro.find('.ts-menu__icone').exists()).toBe(true)
    expect(primeiro.findAll('svg')).toHaveLength(2)
  })

  test('abrir "Carros" mostra "Todos os pneus de carros" e os 14 aros', async () => {
    const wrapper = await montar()

    const carros = wrapper
      .findAll('details.ts-menu__sub')
      .find((d) => d.get('summary').text().includes('Carros'))!

    expect(carros.text()).toContain('Todos os pneus de carros')
    const aros = carros.findAll('.ts-menu__aros a').filter((a) => a.text().startsWith('Aro '))
    expect(aros).toHaveLength(14)
  })

  test('os itens do menu principal aparecem na ordem recebida, cada um com a seta à direita', async () => {
    const wrapper = await montar()

    const itens = wrapper.findAll('.ts-menu__lista > li > a')
    expect(itens.map((item) => item.text().replace(/\s+/g, ' ').trim())).toEqual(
      navegacao.menu.map((item) => item.rotulo),
    )
    for (const item of itens) {
      expect(item.find('svg').exists()).toBe(true)
    }
  })

  test('"Ajuda para escolher" abre os links de ajuda que têm href', async () => {
    const wrapper = await montar()

    const grupos = wrapper.findAll('details.ts-menu__grupo')
    const ajuda = grupos.find((g) => g.get('summary').text().includes('Ajuda para escolher'))!

    expect(ajuda.text()).toContain('Como Comprar')
    expect(ajuda.text()).not.toContain('Todos os aros')
  })

  test('a lista de conta mostra "Entrar ou criar conta" com o ícone e o nome', async () => {
    const wrapper = await montar()

    const conta = wrapper.get('.ts-menu__lista--conta')
    expect(conta.text()).toContain('Entrar ou criar conta')
    expect(conta.find('svg').exists()).toBe(true)
  })

  test('o pé tem o botão "WhatsApp (41) 3317-2251" e o horário de atendimento', async () => {
    const wrapper = await montar()

    const rodape = wrapper.get('.ts-menu__rodape')
    expect(rodape.text()).toContain('WhatsApp (41) 3317-2251')
    expect(rodape.find('a[href="https://wa.me/554133172251"]').exists()).toBe(true)
    expect(rodape.text()).toContain('Segunda a sexta, das 8h às 17h45')
  })

  test('escolher qualquer link emite fechar; o X tem aria-label "Fechar o menu"', async () => {
    const wrapper = await montar()

    expect(wrapper.find('button[aria-label="Fechar o menu"]').exists()).toBe(true)

    await wrapper.get('.ts-menu__lista--conta button, .ts-menu__lista--conta a').trigger('click')

    expect(wrapper.emitted('fechar')).toHaveLength(1)
  })
})
