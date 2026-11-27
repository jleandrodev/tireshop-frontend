import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import Paginacao from './Paginacao.vue'

// T-0114 · REQ-01-15: números e "Próxima página" na mesma linha; a tela decide entre navegar e
// refazer a busca (por isso o componente só emite `ir`, nunca navega sozinho).

const href = (pagina: number) => `/c/pneus-para-carros?pagina=${pagina}`

describe('Paginacao', () => {
  test('com 3 páginas e a atual 1, mostra 1, 2 e 3 e o link "Próxima página"', async () => {
    const wrapper = await mountSuspended(Paginacao, {
      props: { paginaAtual: 1, totalPaginas: 3, href },
    })

    const itens = wrapper.findAll('li')
    expect(itens.map((item) => item.text())).toEqual(['1', '2', '3'])
    expect(wrapper.text()).toContain('Próxima página')
  })

  test('a página atual é um span com aria-current="page", não um link', async () => {
    const wrapper = await mountSuspended(Paginacao, {
      props: { paginaAtual: 2, totalPaginas: 3, href },
    })

    const atual = wrapper.find('[aria-current="page"]')
    expect(atual.element.tagName).toBe('SPAN')
    expect(atual.text()).toBe('2')
  })

  test('cada número é um link com o href devolvido pela função recebida', async () => {
    const wrapper = await mountSuspended(Paginacao, {
      props: { paginaAtual: 1, totalPaginas: 3, href },
    })

    const links = wrapper.findAll('ol a')
    expect(links.map((link) => link.attributes('href'))).toEqual([
      '/c/pneus-para-carros?pagina=2',
      '/c/pneus-para-carros?pagina=3',
    ])
  })

  test('na última página não há "Próxima página"', async () => {
    const wrapper = await mountSuspended(Paginacao, {
      props: { paginaAtual: 3, totalPaginas: 3, href },
    })

    expect(wrapper.text()).not.toContain('Próxima página')
  })

  test('com uma página só, não renderiza nada', async () => {
    const wrapper = await mountSuspended(Paginacao, {
      props: { paginaAtual: 1, totalPaginas: 1, href },
    })

    expect(wrapper.find('nav').exists()).toBe(false)
  })

  test('clicar em um número emite ir com a página', async () => {
    const wrapper = await mountSuspended(Paginacao, {
      props: { paginaAtual: 1, totalPaginas: 3, href },
    })

    await wrapper.findAll('ol a')[0]!.trigger('click')

    expect(wrapper.emitted('ir')).toEqual([[2]])
  })

  test('aceita um Pagina<T> inteiro em vez dos números soltos', async () => {
    const { Pagina } = await import('../domain/pagina')
    const resultado = Pagina.de({ pagina: 1, porPagina: 12, total: 26, itens: [] })
    if (!resultado.ok) throw new Error('esperava sucesso')

    const wrapper = await mountSuspended(Paginacao, {
      props: { dados: resultado.valor, href },
    })

    expect(wrapper.findAll('li').map((item) => item.text())).toEqual(['1', '2', '3'])
  })
})
