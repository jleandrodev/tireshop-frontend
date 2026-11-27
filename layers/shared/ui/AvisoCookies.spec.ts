import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import AvisoCookies from './AvisoCookies.vue'

// T-0212 · REQ-02-14: "no HTML do servidor não aparece" é garantido pelo `<ClientOnly>` (mecanismo
// do próprio Nuxt) — o ambiente "nuxt" do Vitest é client-only (achado já registrado na T-0118),
// então essa parte não dá para observar aqui; confirmado à mão com `bin/pnpm dev` (ver Decisões).

describe('AvisoCookies', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('sem aceite gravado, aparece com o texto e o link "Política de privacidade"', async () => {
    const wrapper = await mountSuspended(AvisoCookies)

    const regiao = wrapper.get('[aria-label="Aviso de cookies"]')
    expect(regiao.text()).toContain('cookies')
    const link = regiao.get('a')
    expect(link.attributes('href')).toBe('/ajuda/privacidade')
    expect(link.text()).toBe('Política de privacidade')
  })

  test('é uma região com aria-label="Aviso de cookies"', async () => {
    const wrapper = await mountSuspended(AvisoCookies)

    expect(wrapper.find('[role="region"][aria-label="Aviso de cookies"]').exists()).toBe(true)
  })

  test('"Entendi" esconde o aviso e grava ts-cookies = 1 em localStorage', async () => {
    const wrapper = await mountSuspended(AvisoCookies)

    await wrapper.get('button').trigger('click')

    expect(wrapper.find('[aria-label="Aviso de cookies"]').exists()).toBe(false)
    expect(localStorage.getItem('ts-cookies')).toBe('1')
  })

  test('com o aceite gravado, não aparece', async () => {
    localStorage.setItem('ts-cookies', '1')

    const wrapper = await mountSuspended(AvisoCookies)

    expect(wrapper.find('[aria-label="Aviso de cookies"]').exists()).toBe(false)
  })

  test('com localStorage lançando erro, o aviso aparece, some no "Entendi" e nada quebra', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('localStorage bloqueado')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('localStorage bloqueado')
    })

    const wrapper = await mountSuspended(AvisoCookies)
    expect(wrapper.find('[aria-label="Aviso de cookies"]').exists()).toBe(true)

    await expect(wrapper.get('button').trigger('click')).resolves.toBeUndefined()
    expect(wrapper.find('[aria-label="Aviso de cookies"]').exists()).toBe(false)
  })
})
