import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, test } from 'vitest'
import { rotas } from '#layers/shared'
import { criarNavegacaoRepositoryFalso } from '../../application/__falsos__/navegacao-repository-falso'
import { umaNavegacao } from '../../domain/__fabricas__/navegacao'
import { SIMBOLO_NAVEGACAO_REPOSITORY } from '../composables/use-navegacao'
import SiteCabecalho from './SiteCabecalho.vue'

// T-0206 · REQ-02-03, REQ-02-04: `BarraDeTopo` e `BuscaPorMedida` são componentes próprios,
// usados por `SiteCabecalho` — ele não importa Catálogo nem Carrinho.

function montar(quantidadeNoCarrinho = 0) {
  const falso = criarNavegacaoRepositoryFalso()
  falso.programarSucesso(umaNavegacao())
  return mountSuspended(SiteCabecalho, {
    props: { quantidadeNoCarrinho, lojas: [] },
    global: { provide: { [SIMBOLO_NAVEGACAO_REPOSITORY as unknown as string]: falso } },
  })
}

describe('SiteCabecalho', () => {
  afterEach(() => {
    clearNuxtData('navegacao')
  })

  test('a barra de topo é um link só para o WhatsApp, com o número e o rótulo "Telefone e WhatsApp"', async () => {
    const wrapper = await montar()

    const links = wrapper.get('.ts-topbar').findAll('a[href="https://wa.me/554133172251"]')
    expect(links).toHaveLength(1)
    expect(links[0]!.attributes('aria-label')).toBe('Telefone e WhatsApp')
    expect(links[0]!.text()).toContain('(41) 3317-2251')
  })

  test('a nav "Atalhos" tem "Ajuda", com link para rotas.politica(\'perguntas-frequentes\')', async () => {
    const wrapper = await montar()

    const nav = wrapper.get('nav[aria-label="Atalhos"]')
    expect(nav.text()).toContain('Ajuda')
    const ajuda = nav.get('a')
    expect(ajuda.text()).toBe('Ajuda')
    expect(ajuda.attributes('href')).toBe(rotas.politica('perguntas-frequentes'))
  })

  test('o logo é um link para rotas.home() com o nome "TireShop, página inicial"', async () => {
    const wrapper = await montar()

    const logo = wrapper.get('[aria-label="TireShop, página inicial"]')
    expect(logo.attributes('href')).toBe(rotas.home())
  })

  test('a busca é um form com role="search", rótulo "Busca por Medida" e o texto de exemplo', async () => {
    const wrapper = await montar()

    const form = wrapper.get('form[role="search"]')
    expect(form.text()).toContain('Busca por Medida')
    expect(form.get('input').attributes('placeholder')).toBe('Encontre o pneu ex: 225/45R17')
  })

  test('enviar a busca com "225/45R17" emite buscar com o texto; com o campo vazio, não emite', async () => {
    const wrapper = await montar()

    const form = wrapper.get('form[role="search"]')
    await form.get('input').setValue('225/45R17')
    await form.trigger('submit')

    expect(wrapper.emitted('buscar')).toEqual([['225/45R17']])
  })

  test('com o campo de busca vazio, enviar não emite buscar', async () => {
    const wrapper = await montar()

    const form = wrapper.get('form[role="search"]')
    await form.trigger('submit')

    expect(wrapper.emitted('buscar')).toBeUndefined()
  })

  test('com quantidadeNoCarrinho: 2, aria-label "Carrinho, 2 pneus" e mostra o número 2', async () => {
    const wrapper = await montar(2)

    const carrinho = wrapper.get('[aria-label="Carrinho, 2 pneus"]')
    expect(carrinho.text()).toContain('2')
  })

  test('com quantidadeNoCarrinho: 1, aria-label "Carrinho, 1 pneu"', async () => {
    const wrapper = await montar(1)

    expect(wrapper.find('[aria-label="Carrinho, 1 pneu"]').exists()).toBe(true)
  })

  test('com quantidadeNoCarrinho: 0, aria-label "Carrinho, vazio" e o número não aparece', async () => {
    const wrapper = await montar(0)

    const carrinho = wrapper.get('[aria-label="Carrinho, vazio"]')
    expect(carrinho.text()).toBe('')
  })

  test('clicar no carrinho emite abrir-carrinho; clicar no botão de menu emite abrir-menu', async () => {
    const wrapper = await montar()

    await wrapper.get('[aria-label="Carrinho, vazio"]').trigger('click')
    await wrapper.get('.ts-header__menu-btn').trigger('click')

    expect(wrapper.emitted('abrir-carrinho')).toHaveLength(1)
    expect(wrapper.emitted('abrir-menu')).toHaveLength(1)
  })
})
