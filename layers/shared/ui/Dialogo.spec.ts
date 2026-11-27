import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import Dialogo from './Dialogo.vue'

// T-0112 · REQ-01-13 (RF-09, RNF-02): `Dialogo` usa o `<dialog>` nativo — o navegador prende o
// foco e deixa o fundo inerte. Serve ao minicart, ao menu do celular e ao painel de filtros.

describe('Dialogo', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('com aberto, o dialog é aberto por showModal(); sem, fica fechado', async () => {
    const espiao = vi.spyOn(HTMLDialogElement.prototype, 'showModal')

    const fechado = await mountSuspended(Dialogo, {
      props: { aberto: false, rotuloFechar: 'Fechar o carrinho', rotulo: 'Carrinho' },
    })
    expect(fechado.find('dialog').element.open).toBe(false)
    expect(espiao).not.toHaveBeenCalled()

    const aberto = await mountSuspended(Dialogo, {
      props: { aberto: true, rotuloFechar: 'Fechar o carrinho', rotulo: 'Carrinho' },
    })
    expect(aberto.find('dialog').element.open).toBe(true)
    expect(espiao).toHaveBeenCalledOnce()
  })

  test('Esc fecha e emite fechar', async () => {
    const wrapper = await mountSuspended(Dialogo, {
      props: { aberto: true, rotuloFechar: 'Fechar o carrinho', rotulo: 'Carrinho' },
    })

    await wrapper.find('dialog').trigger('keydown', { key: 'Escape' })

    expect(wrapper.find('dialog').element.open).toBe(false)
    expect(wrapper.emitted('fechar')).toHaveLength(1)
  })

  test('o botão de fechar tem o aria-label recebido e emite fechar', async () => {
    const wrapper = await mountSuspended(Dialogo, {
      props: { aberto: true, rotuloFechar: 'Fechar o carrinho', rotulo: 'Carrinho' },
    })

    const botao = wrapper.find('button[aria-label="Fechar o carrinho"]')
    expect(botao.exists()).toBe(true)
    await botao.trigger('click')

    expect(wrapper.emitted('fechar')).toHaveLength(1)
  })

  test('clique fora da caixa fecha; clique dentro, não', async () => {
    const wrapper = await mountSuspended(Dialogo, {
      props: { aberto: true, rotuloFechar: 'Fechar o carrinho', rotulo: 'Carrinho' },
      slots: { default: '<p>Conteúdo</p>' },
    })

    await wrapper.find('p').trigger('click')
    expect(wrapper.emitted('fechar')).toBeUndefined()

    await wrapper.find('dialog').trigger('click')
    expect(wrapper.emitted('fechar')).toHaveLength(1)
  })

  test('ao fechar, o foco volta ao elemento que tinha o foco na abertura', async () => {
    const botaoExterno = document.createElement('button')
    document.body.appendChild(botaoExterno)
    botaoExterno.focus()

    const wrapper = await mountSuspended(Dialogo, {
      attachTo: document.body,
      props: { aberto: false, rotuloFechar: 'Fechar o carrinho', rotulo: 'Carrinho' },
    })

    await wrapper.setProps({ aberto: true })
    // happy-dom não move o foco pra dentro do dialog em showModal(); simula o que um navegador
    // real faria, pra exercitar de verdade a restauração do foco (não um no-op por acaso).
    wrapper.find<HTMLButtonElement>('button[aria-label="Fechar o carrinho"]').element.focus()
    expect(document.activeElement).not.toBe(botaoExterno)

    await wrapper.find('button[aria-label="Fechar o carrinho"]').trigger('click')

    expect(document.activeElement).toBe(botaoExterno)
    botaoExterno.remove()
  })

  test('o nome acessível vem de aria-labelledby (com título) ou de aria-label (sem título)', async () => {
    const comTitulo = await mountSuspended(Dialogo, {
      props: { aberto: true, rotuloFechar: 'Fechar o carrinho', titulo: 'Seu carrinho' },
    })
    const idTitulo = comTitulo.find('dialog').attributes('aria-labelledby')!
    expect(idTitulo).toBeTruthy()
    expect(comTitulo.find(`#${idTitulo}`).text()).toBe('Seu carrinho')
    expect(comTitulo.find('dialog').attributes('aria-label')).toBeUndefined()

    const semTitulo = await mountSuspended(Dialogo, {
      props: { aberto: true, rotuloFechar: 'Fechar o carrinho', rotulo: 'Carrinho' },
    })
    expect(semTitulo.find('dialog').attributes('aria-label')).toBe('Carrinho')
    expect(semTitulo.find('dialog').attributes('aria-labelledby')).toBeUndefined()
  })

  test('com fecharAcimaDe: 900, fecha quando a janela passa de 900 px', async () => {
    const wrapper = await mountSuspended(Dialogo, {
      props: {
        aberto: true,
        rotuloFechar: 'Fechar o menu',
        rotulo: 'Menu',
        fecharAcimaDe: 900,
        variante: 'esquerda',
      },
    })

    window.innerWidth = 1000
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()

    expect(wrapper.find('dialog').element.open).toBe(false)
    expect(wrapper.emitted('fechar')).toHaveLength(1)
  })

  describe('variante', () => {
    beforeEach(() => {
      window.innerWidth = 1024
    })

    test.each([
      ['direita', 'ts-dialogo--direita'],
      ['esquerda', 'ts-dialogo--esquerda'],
    ] as const)('%s aplica a classe %s', async (variante, classe) => {
      const wrapper = await mountSuspended(Dialogo, {
        props: { aberto: true, rotuloFechar: 'Fechar', rotulo: 'Gaveta', variante },
      })

      expect(wrapper.find('dialog').classes()).toContain(classe)
    })
  })
})
