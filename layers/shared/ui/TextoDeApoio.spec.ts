import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import { HtmlSeguro } from '../domain/html-seguro'
import { Imagem } from '../domain/imagem'
import TextoDeApoio from './TextoDeApoio.vue'

// T-0115 · REQ-01-16: texto de apoio de SEO, recolhido por padrão, com "Ler mais".

function corpo(html: string): HtmlSeguro {
  const resultado = HtmlSeguro.criar(html)
  if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))
  return resultado.valor
}

function imagem(): Imagem {
  const resultado = Imagem.de({ src: '/img/seo.webp', largura: 560, altura: 560, alt: '' })
  if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))
  return resultado.valor
}

const TITULO = 'Loja de pneus TireShop'
const CORPO = corpo('<p>Texto inteiro de apoio, bem maior que o espaço visível.</p>')

describe('TextoDeApoio', () => {
  test('o título sai no nível pedido (h1 na Home, h2 nas categorias)', async () => {
    const naHome = await mountSuspended(TextoDeApoio, {
      props: { titulo: TITULO, nivelTitulo: 'h1', corpo: CORPO },
    })
    expect(naHome.find('h1').text()).toBe(TITULO)

    const naCategoria = await mountSuspended(TextoDeApoio, {
      props: { titulo: TITULO, nivelTitulo: 'h2', corpo: CORPO },
    })
    expect(naCategoria.find('h2').text()).toBe(TITULO)
  })

  test('o corpo começa recolhido, e o texto inteiro está no HTML', async () => {
    const wrapper = await mountSuspended(TextoDeApoio, {
      props: { titulo: TITULO, nivelTitulo: 'h1', corpo: CORPO },
    })

    const corpoEl = wrapper.find('.ts-seo__corpo')
    expect(corpoEl.attributes('data-recolhido')).toBe('true')
    expect(corpoEl.text()).toBe('Texto inteiro de apoio, bem maior que o espaço visível.')
  })

  test('"Ler mais" abre, vira "Ler menos" e marca aria-expanded="true"; clicar de novo recolhe', async () => {
    const wrapper = await mountSuspended(TextoDeApoio, {
      props: { titulo: TITULO, nivelTitulo: 'h1', corpo: CORPO },
    })

    const botao = wrapper.find('button')
    expect(botao.text()).toBe('Ler mais')
    expect(botao.attributes('aria-expanded')).toBe('false')

    await botao.trigger('click')
    expect(botao.text()).toBe('Ler menos')
    expect(botao.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.ts-seo__corpo').attributes('data-recolhido')).toBe('false')

    await botao.trigger('click')
    expect(botao.text()).toBe('Ler mais')
    expect(botao.attributes('aria-expanded')).toBe('false')
  })

  test('o botão aponta para o corpo com aria-controls', async () => {
    const wrapper = await mountSuspended(TextoDeApoio, {
      props: { titulo: TITULO, nivelTitulo: 'h1', corpo: CORPO },
    })

    const idCorpo = wrapper.find('.ts-seo__corpo').attributes('id')!
    expect(idCorpo).toBeTruthy()
    expect(wrapper.find('button').attributes('aria-controls')).toBe(idCorpo)
  })

  test('sem imagem, aplica a variante centralizada; com imagem, a imagem tem width, height e alt', async () => {
    const semImagem = await mountSuspended(TextoDeApoio, {
      props: { titulo: TITULO, nivelTitulo: 'h2', corpo: CORPO },
    })
    expect(semImagem.find('.ts-seo').classes()).toContain('ts-seo--sem-imagem')
    expect(semImagem.find('img').exists()).toBe(false)

    const comImagem = await mountSuspended(TextoDeApoio, {
      props: { titulo: TITULO, nivelTitulo: 'h1', corpo: CORPO, imagem: imagem() },
    })
    expect(comImagem.find('.ts-seo').classes()).not.toContain('ts-seo--sem-imagem')
    const img = comImagem.find('img')
    expect(img.attributes('width')).toBe('560')
    expect(img.attributes('height')).toBe('560')
    expect(img.attributes('alt')).toBe('')
  })

  test('o corpo só aceita HtmlSeguro, renderizado como HTML', async () => {
    const wrapper = await mountSuspended(TextoDeApoio, {
      props: {
        titulo: TITULO,
        nivelTitulo: 'h1',
        corpo: corpo('<p>Com <strong>destaque</strong>.</p>'),
      },
    })

    expect(wrapper.find('.ts-seo__corpo strong').text()).toBe('destaque')
  })
})
