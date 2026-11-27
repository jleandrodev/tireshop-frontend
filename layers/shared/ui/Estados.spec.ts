import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import { erroDeContrato, erroDeRede, naoEncontrado } from '../domain/erros'
import EstadoDeErro from './EstadoDeErro.vue'
import EstadoVazio from './EstadoVazio.vue'
import Esqueleto from './Esqueleto.vue'

// T-0113 · REQ-01-14: os estados que não são sucesso — tijolos de todos os outros módulos.

describe('EstadoVazio', () => {
  test('mostra o título, o texto e a ação recebida pelo slot', async () => {
    const wrapper = await mountSuspended(EstadoVazio, {
      props: { titulo: 'Nenhum pneu encontrado', texto: 'Tente outra medida ou outro aro.' },
      slots: { default: '<a href="/pneus">Ver todos os pneus</a>' },
    })

    expect(wrapper.text()).toContain('Nenhum pneu encontrado')
    expect(wrapper.text()).toContain('Tente outra medida ou outro aro.')
    expect(wrapper.find('a[href="/pneus"]').text()).toBe('Ver todos os pneus')
  })

  test('tem role="status"', async () => {
    const wrapper = await mountSuspended(EstadoVazio, {
      props: { titulo: 'Nenhum pneu encontrado', texto: 'Tente outra medida ou outro aro.' },
    })

    expect(wrapper.attributes('role')).toBe('status')
  })
})

describe('EstadoDeErro', () => {
  test('com ErroDeRede mostra a mensagem de conexão e "Tentar de novo", que emite tentar', async () => {
    const wrapper = await mountSuspended(EstadoDeErro, {
      props: { erro: erroDeRede('timeout') },
    })

    expect(wrapper.text()).toContain(
      'Não foi possível carregar. Confira a conexão e tente de novo.',
    )
    const botao = wrapper.find('button')
    expect(botao.text()).toBe('Tentar de novo')

    await botao.trigger('click')
    expect(wrapper.emitted('tentar')).toHaveLength(1)
  })

  test('com ErroDeContrato mostra a mensagem genérica, sem botão e sem expor o caminho do campo', async () => {
    const wrapper = await mountSuspended(EstadoDeErro, {
      props: { erro: erroDeContrato('GET /produtos/:slug', 'preco.centavos', 'tipo inválido') },
    })

    expect(wrapper.text()).toContain('Tivemos um problema ao mostrar esta parte da página.')
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('preco.centavos')
    expect(wrapper.text()).not.toContain('GET /produtos/:slug')
  })

  test('com NaoEncontrado mostra o título recebido', async () => {
    const wrapper = await mountSuspended(EstadoDeErro, {
      props: { erro: naoEncontrado('Esta loja não existe mais.') },
    })

    expect(wrapper.text()).toContain('Esta loja não existe mais.')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  test('tem role="alert"', async () => {
    const wrapper = await mountSuspended(EstadoDeErro, { props: { erro: erroDeRede('timeout') } })

    expect(wrapper.attributes('role')).toBe('alert')
  })

  test('"Tentar de novo" usa a variante de contorno, não a verde', async () => {
    const wrapper = await mountSuspended(EstadoDeErro, { props: { erro: erroDeRede('timeout') } })

    const botao = wrapper.find('button')
    expect(botao.classes()).toContain('ts-btn--outline')
    expect(botao.classes()).not.toContain('ts-btn--acao')
  })
})

describe('Esqueleto', () => {
  test('reserva a largura e a altura recebidas e tem aria-hidden="true"', async () => {
    const wrapper = await mountSuspended(Esqueleto, { props: { largura: 320, altura: 284 } })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('style')).toContain('width: 320px')
    expect(wrapper.attributes('style')).toContain('height: 284px')
  })

  test('aceita largura/altura como texto (ex.: "100%")', async () => {
    const wrapper = await mountSuspended(Esqueleto, { props: { largura: '100%', altura: 48 } })

    expect(wrapper.attributes('style')).toContain('width: 100%')
    expect(wrapper.attributes('style')).toContain('height: 48px')
  })
})
