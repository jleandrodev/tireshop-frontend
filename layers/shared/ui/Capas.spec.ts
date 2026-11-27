import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import { Imagem } from '../domain/imagem'
import CapaDeMapa from './CapaDeMapa.vue'
import CapaDeVideo from './CapaDeVideo.vue'

// T-0117 · REQ-01-18 (RNF-03): nenhum pedido a youtube/google antes do toque; a área reservada
// não muda de tamanho na troca.

function capa(): Imagem {
  const resultado = Imagem.de({
    src: '/img/institucional/video.webp',
    largura: 960,
    altura: 540,
    alt: '',
  })
  if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))
  return resultado.valor
}

describe('CapaDeVideo', () => {
  const props = {
    idDoVideo: 'NUM0AGJL3dU',
    titulo: 'TireShop - A evolução nos conecta com você!',
    capa: capa(),
  }

  test('antes do toque, mostra a imagem de capa e nenhum iframe', async () => {
    const wrapper = await mountSuspended(CapaDeVideo, { props })

    expect(wrapper.find('img').exists()).toBe(true)
    expect(wrapper.find('iframe').exists()).toBe(false)
  })

  test('a capa é um link para o vídeo no YouTube (funciona sem JS) e tem nome acessível', async () => {
    const wrapper = await mountSuspended(CapaDeVideo, { props })

    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('https://www.youtube.com/watch?v=NUM0AGJL3dU')
    expect(link.attributes('aria-label')).toBe(`Assistir: ${props.titulo}`)
  })

  test('as imagens de capa têm width, height e alt', async () => {
    const wrapper = await mountSuspended(CapaDeVideo, { props })

    const img = wrapper.find('img')
    expect(img.attributes('width')).toBe('960')
    expect(img.attributes('height')).toBe('540')
    expect(img.attributes('alt')).toBe('')
  })

  test('ao tocar, a capa dá lugar a um iframe de youtube-nocookie.com/embed, com title e foco', async () => {
    const wrapper = await mountSuspended(CapaDeVideo, {
      attachTo: document.body,
      props,
    })

    await wrapper.find('a').trigger('click')

    expect(wrapper.find('a').exists()).toBe(false)
    const iframe = wrapper.find('iframe')
    expect(iframe.attributes('src')).toBe('https://www.youtube-nocookie.com/embed/NUM0AGJL3dU')
    expect(iframe.attributes('title')).toBe(props.titulo)
    expect(document.activeElement).toBe(iframe.element)
  })
})

describe('CapaDeMapa', () => {
  const props = {
    urlDeIncorporacao: 'https://www.google.com/maps/embed?pb=xyz',
    urlDoGoogleMaps: 'https://goo.gl/maps/JVwDw5Xw4fx',
    titulo: 'Mapa da TireShop Curitiba no Google Maps',
  }

  test('mostra a capa com o botão "Ver o mapa" e nenhum iframe', async () => {
    const wrapper = await mountSuspended(CapaDeMapa, { props })

    expect(wrapper.find('button').text()).toBe('Ver o mapa')
    expect(wrapper.find('iframe').exists()).toBe(false)
  })

  test('ao tocar, cria o iframe com a URL de incorporação e o title recebidos', async () => {
    const wrapper = await mountSuspended(CapaDeMapa, { props })

    await wrapper.find('button').trigger('click')

    const iframe = wrapper.find('iframe')
    expect(iframe.attributes('src')).toBe(props.urlDeIncorporacao)
    expect(iframe.attributes('title')).toBe(props.titulo)
  })

  test('a capa do mapa traz o link "Abrir no Google Maps", que funciona sem JavaScript', async () => {
    const wrapper = await mountSuspended(CapaDeMapa, { props })

    const link = wrapper.find('a')
    expect(link.text()).toBe('Abrir no Google Maps')
    expect(link.attributes('href')).toBe(props.urlDoGoogleMaps)
  })
})
