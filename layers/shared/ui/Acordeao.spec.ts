import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import { HtmlSeguro } from '../domain/html-seguro'
import Acordeao from './Acordeao.vue'

// T-0109 · REQ-01-10 (RF-17, RNF-02): cada pergunta abre e fecha sozinha, com os atributos ARIA
// do padrão de acordeão da WAI-ARIA.

function resposta(html: string): HtmlSeguro {
  const resultado = HtmlSeguro.criar(html)
  if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))
  return resultado.valor
}

const ITENS = [
  {
    id: 'medida',
    pergunta: 'Onde encontro a medida?',
    resposta: resposta('<p>Na lateral do pneu.</p>'),
  },
  { id: 'garantia', pergunta: 'Tem garantia?', resposta: resposta('<p>Sim, 5 anos.</p>') },
  { id: 'entrega', pergunta: 'Quanto tempo leva?', resposta: resposta('<p>2 dias úteis.</p>') },
]

describe('Acordeao', () => {
  test('cada pergunta é um button dentro de um h3 (nível padrão)', async () => {
    const wrapper = await mountSuspended(Acordeao, { props: { itens: ITENS, prefixoId: 'faq' } })

    const titulos = wrapper.findAll('h3.ts-faq__pergunta')
    expect(titulos).toHaveLength(3)
    expect(titulos[0]!.find('button.ts-faq__botao').exists()).toBe(true)
  })

  test('aceita outro nível de título por prop', async () => {
    const wrapper = await mountSuspended(Acordeao, {
      props: { itens: ITENS, prefixoId: 'faq', nivelTitulo: 'h2' },
    })

    expect(wrapper.findAll('h2.ts-faq__pergunta')).toHaveLength(3)
  })

  test('o primeiro item começa aberto; os outros, fechados e com o painel hidden', async () => {
    const wrapper = await mountSuspended(Acordeao, { props: { itens: ITENS, prefixoId: 'faq' } })
    const botoes = wrapper.findAll('button.ts-faq__botao')
    const paineis = wrapper.findAll('.ts-faq__resposta')

    expect(botoes[0]!.attributes('aria-expanded')).toBe('true')
    expect(paineis[0]!.attributes('hidden')).toBeUndefined()

    expect(botoes[1]!.attributes('aria-expanded')).toBe('false')
    expect(paineis[1]!.attributes('hidden')).toBe('')
    expect(botoes[2]!.attributes('aria-expanded')).toBe('false')
    expect(paineis[2]!.attributes('hidden')).toBe('')
  })

  test('clicar alterna aria-expanded e mostra/esconde o painel apontado por aria-controls', async () => {
    const wrapper = await mountSuspended(Acordeao, { props: { itens: ITENS, prefixoId: 'faq' } })
    const botao = wrapper.findAll('button.ts-faq__botao')[1]!

    await botao.trigger('click')

    expect(botao.attributes('aria-expanded')).toBe('true')
    const idPainel = botao.attributes('aria-controls')!
    const painel = wrapper.find(`#${idPainel}`)
    expect(painel.attributes('hidden')).toBeUndefined()
  })

  test('abrir um item não fecha os outros', async () => {
    const wrapper = await mountSuspended(Acordeao, { props: { itens: ITENS, prefixoId: 'faq' } })
    const botoes = wrapper.findAll('button.ts-faq__botao')

    await botoes[1]!.trigger('click')

    expect(botoes[0]!.attributes('aria-expanded')).toBe('true')
    expect(botoes[1]!.attributes('aria-expanded')).toBe('true')
  })

  test.each([
    ['Enter', 'Enter'],
    ['Espaço', ' '],
  ])('%s no botão tem o mesmo efeito do clique', async (_nome, tecla) => {
    const wrapper = await mountSuspended(Acordeao, { props: { itens: ITENS, prefixoId: 'faq' } })
    const botao = wrapper.findAll('button.ts-faq__botao')[1]!

    await botao.trigger('keydown', { key: tecla })

    expect(botao.attributes('aria-expanded')).toBe('true')
  })

  test('a resposta aceita HtmlSeguro e é renderizada como HTML', async () => {
    const wrapper = await mountSuspended(Acordeao, { props: { itens: ITENS, prefixoId: 'faq' } })

    expect(wrapper.find('.ts-faq__resposta p').exists()).toBe(true)
    expect(wrapper.find('.ts-faq__resposta').html()).toContain('Na lateral do pneu.')
  })

  test('abrir(id), exposto pelo componente, abre o item pedido', async () => {
    const wrapper = await mountSuspended(Acordeao, { props: { itens: ITENS, prefixoId: 'faq' } })

    ;(wrapper.vm as unknown as { abrir: (id: string) => void }).abrir('entrega')
    await wrapper.vm.$nextTick()

    const botaoEntrega = wrapper.findAll('button.ts-faq__botao')[2]!
    expect(botaoEntrega.attributes('aria-expanded')).toBe('true')
  })

  test('o prefixo dos ids vem por prop, para dois acordeões não colidirem', async () => {
    const a = await mountSuspended(Acordeao, { props: { itens: ITENS, prefixoId: 'faq-a' } })
    const b = await mountSuspended(Acordeao, { props: { itens: ITENS, prefixoId: 'faq-b' } })

    expect(a.findAll('button.ts-faq__botao')[0]!.attributes('aria-controls')).toBe('faq-a-medida')
    expect(b.findAll('button.ts-faq__botao')[0]!.attributes('aria-controls')).toBe('faq-b-medida')
  })
})
