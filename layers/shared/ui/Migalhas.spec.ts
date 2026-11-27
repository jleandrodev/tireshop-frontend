import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import { rotas } from '../routing/rotas'
import Migalhas from './Migalhas.vue'

// T-0116 · REQ-01-17 (ADR 0008): da Home até a página atual. O prop `migalhas` traz só o resto
// da trilha — este componente sempre prepende a Home.

describe('Migalhas', () => {
  test('o primeiro item é sempre "Home", com link para rotas.home()', async () => {
    const wrapper = await mountSuspended(Migalhas, {
      props: { migalhas: [{ rotulo: 'Pneus para carros', href: null }] },
    })

    const primeiro = wrapper.findAll('li')[0]!
    expect(primeiro.text()).toBe('Home')
    expect(primeiro.find('a').attributes('href')).toBe(rotas.home())
  })

  test('os itens do meio são links para o href recebido', async () => {
    const wrapper = await mountSuspended(Migalhas, {
      props: {
        migalhas: [
          { rotulo: 'Pneus para carros', href: '/c/pneus-para-carros' },
          { rotulo: 'Aro 17', href: null },
        ],
      },
    })

    const meio = wrapper.findAll('li')[1]!
    expect(meio.find('a').attributes('href')).toBe('/c/pneus-para-carros')
  })

  test('o último item é texto, com aria-current="page", mesmo que venha com href', async () => {
    const wrapper = await mountSuspended(Migalhas, {
      props: {
        migalhas: [{ rotulo: 'Pneus para carros', href: '/c/pneus-para-carros' }],
      },
    })

    const ultimo = wrapper.findAll('li').at(-1)!
    expect(ultimo.find('a').exists()).toBe(false)
    expect(ultimo.find('[aria-current="page"]').text()).toBe('Pneus para carros')
  })

  test('item do meio sem href sai como texto', async () => {
    const wrapper = await mountSuspended(Migalhas, {
      props: {
        migalhas: [
          { rotulo: 'Sem página própria', href: null },
          { rotulo: 'Página atual', href: null },
        ],
      },
    })

    const meio = wrapper.findAll('li')[1]!
    expect(meio.find('a').exists()).toBe(false)
    expect(meio.find('[aria-current]').exists()).toBe(false)
    expect(meio.text()).toBe('Sem página própria')
  })

  test('a lista é um ol dentro de nav com aria-label="Você está em"', async () => {
    const wrapper = await mountSuspended(Migalhas, {
      props: { migalhas: [{ rotulo: 'Pneus para carros', href: null }] },
    })

    const nav = wrapper.find('nav')
    expect(nav.attributes('aria-label')).toBe('Você está em')
    expect(nav.find('ol').exists()).toBe(true)
  })
})
