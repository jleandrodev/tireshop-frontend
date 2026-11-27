import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import BotaoWhatsapp from './BotaoWhatsapp.vue'

// T-0211 · REQ-02-15: componente em shared/ui — o layout da loja física (módulo 12) usa o mesmo,
// com o número da loja, não só o da navegação.

describe('BotaoWhatsapp', () => {
  test('é um link para https://wa.me/554133172251, a partir do número recebido', async () => {
    const wrapper = await mountSuspended(BotaoWhatsapp, { props: { numero: '554133172251' } })

    const link = wrapper.get('a')
    expect(link.attributes('href')).toBe('https://wa.me/554133172251')
  })

  test('tem aria-label "Falar no WhatsApp: (41) 3317-2251"', async () => {
    const wrapper = await mountSuspended(BotaoWhatsapp, { props: { numero: '554133172251' } })

    expect(wrapper.get('a').attributes('aria-label')).toBe('Falar no WhatsApp: (41) 3317-2251')
  })

  test('o ícone é decorativo (aria-hidden)', async () => {
    const wrapper = await mountSuspended(BotaoWhatsapp, { props: { numero: '554133172251' } })

    expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
  })

  test('com acimaDaBarra, recebe a classe que o sobe acima da barra fixa', async () => {
    const semBarra = await mountSuspended(BotaoWhatsapp, { props: { numero: '554133172251' } })
    expect(semBarra.get('a').classes()).not.toContain('ts-fab--acima')

    const comBarra = await mountSuspended(BotaoWhatsapp, {
      props: { numero: '554133172251', acimaDaBarra: true },
    })
    expect(comBarra.get('a').classes()).toContain('ts-fab--acima')
  })

  test('sem número, não renderiza', async () => {
    const wrapper = await mountSuspended(BotaoWhatsapp, { props: { numero: null } })

    expect(wrapper.find('a').exists()).toBe(false)
  })
})
