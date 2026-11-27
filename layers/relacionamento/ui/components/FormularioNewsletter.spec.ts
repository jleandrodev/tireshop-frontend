import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { erroDeRede, erroDeValidacao } from '#layers/shared'
import { criarLeadsGatewayFalso } from '../../application/__falsos__/leads-gateway-falso'
import type { LeadsGateway } from '../../domain/portas'
import { SIMBOLO_LEADS_GATEWAY } from '../composables/use-relacionamento'
import FormularioNewsletter from './FormularioNewsletter.vue'

// T-0218 · REQ-02-12, REQ-02-13: o formulário valida com o mesmo `InscricaoNewsletter.de` do
// domínio antes de chamar o caso de uso — um e-mail obviamente errado nunca gera a chamada. O que
// só o servidor sabe (ex.: "e-mail já cadastrado") chega como `ErroDeValidacao` do caso de uso.

function montar(gateway: LeadsGateway) {
  return mountSuspended(FormularioNewsletter, {
    global: { provide: { [SIMBOLO_LEADS_GATEWAY as unknown as string]: gateway } },
  })
}

async function preencher(
  wrapper: VueWrapper,
  dados: { email?: string; whatsapp?: string },
): Promise<void> {
  if (dados.email !== undefined) await wrapper.get('#newsletter-email').setValue(dados.email)
  if (dados.whatsapp !== undefined) {
    await wrapper.get('#newsletter-whatsapp').setValue(dados.whatsapp)
  }
}

describe('FormularioNewsletter', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('tem os campos "Seu e-mail" e "Seu WhatsApp" e o botão "Assinar"', async () => {
    const wrapper = await montar(criarLeadsGatewayFalso())

    const email = wrapper.get('#newsletter-email')
    expect(email.attributes('type')).toBe('email')
    expect(email.attributes('autocomplete')).toBe('email')
    expect(wrapper.find('label[for="newsletter-email"]').text()).toBe('Seu e-mail')

    const whatsapp = wrapper.get('#newsletter-whatsapp')
    expect(whatsapp.attributes('type')).toBe('tel')
    expect(whatsapp.attributes('autocomplete')).toBe('tel')
    expect(wrapper.find('label[for="newsletter-whatsapp"]').text()).toBe('Seu WhatsApp')

    expect(wrapper.find('button[type="submit"]').text()).toBe('Assinar')
  })

  test('com "cliente@", não chama o caso de uso, marca o e-mail com aria-invalid e a mensagem, e leva o foco a ele', async () => {
    const gateway = criarLeadsGatewayFalso()
    const wrapper = await montar(gateway)
    document.body.appendChild(wrapper.element)

    await preencher(wrapper, { email: 'cliente@' })
    await wrapper.get('form').trigger('submit')

    expect(gateway.chamadas).toHaveLength(0)
    const email = wrapper.get('#newsletter-email')
    expect(email.attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Digite um e-mail válido, como nome@exemplo.com.br.')
    expect(email.element).toBe(document.activeElement)

    wrapper.element.remove()
  })

  test('com dados válidos, chama o caso de uso com o e-mail e o WhatsApp digitados', async () => {
    const gateway = criarLeadsGatewayFalso()
    gateway.programarSucesso({ mensagem: 'Inscrição confirmada!' })
    const wrapper = await montar(gateway)

    await preencher(wrapper, { email: 'cliente@exemplo.com.br', whatsapp: '41999990000' })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(gateway.chamadas).toHaveLength(1)
    expect(gateway.chamadas[0]?.email.valor).toBe('cliente@exemplo.com.br')
    expect(gateway.chamadas[0]?.whatsapp?.valor).toBe('41999990000')
  })

  test('enquanto envia, o botão fica ocupado e não aceita segundo envio', async () => {
    let chamadas = 0
    let resolver: (() => void) | undefined
    const gateway: LeadsGateway = {
      assinar: () =>
        new Promise((resolve) => {
          chamadas += 1
          resolver = () => resolve({ ok: true, valor: { mensagem: 'ok' } })
        }),
    }
    const wrapper = await montar(gateway)

    await preencher(wrapper, { email: 'cliente@exemplo.com.br' })
    await wrapper.get('form').trigger('submit')

    const botao = wrapper.get('button[type="submit"]')
    expect(botao.attributes('aria-busy')).toBe('true')
    expect(botao.attributes('disabled')).toBeDefined()

    await wrapper.get('form').trigger('submit')
    expect(chamadas).toBe(1)

    resolver?.()
    await vi.waitFor(() =>
      expect(wrapper.get('button[type="submit"]').attributes('aria-busy')).toBe('false'),
    )
  })

  test('no sucesso, mostra a mensagem recebida em role="status" e limpa os campos', async () => {
    const gateway = criarLeadsGatewayFalso()
    gateway.programarSucesso({ mensagem: 'Pronto! Você vai receber nossas novidades.' })
    const wrapper = await montar(gateway)

    await preencher(wrapper, { email: 'cliente@exemplo.com.br', whatsapp: '41999990000' })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const status = wrapper.get('[role="status"]')
    expect(status.text()).toBe('Pronto! Você vai receber nossas novidades.')
    expect((wrapper.get('#newsletter-email').element as HTMLInputElement).value).toBe('')
    expect((wrapper.get('#newsletter-whatsapp').element as HTMLInputElement).value).toBe('')
  })

  test('ErroDeValidacao do servidor marca o campo indicado', async () => {
    const gateway = criarLeadsGatewayFalso()
    gateway.programarFalha(
      erroDeValidacao([{ campo: 'email', mensagem: 'Este e-mail já está inscrito.' }]),
    )
    const wrapper = await montar(gateway)

    await preencher(wrapper, { email: 'cliente@exemplo.com.br' })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const email = wrapper.get('#newsletter-email')
    expect(email.attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Este e-mail já está inscrito.')
  })

  test('ErroDeRede mostra a mensagem com "Tentar de novo" e mantém o que foi digitado', async () => {
    const gateway = criarLeadsGatewayFalso()
    gateway.programarFalha(erroDeRede('sem conexão'))
    const wrapper = await montar(gateway)

    await preencher(wrapper, { email: 'cliente@exemplo.com.br', whatsapp: '41999990000' })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('sem conexão')
    expect(wrapper.findAll('button').some((botao) => botao.text() === 'Tentar de novo')).toBe(true)
    expect((wrapper.get('#newsletter-email').element as HTMLInputElement).value).toBe(
      'cliente@exemplo.com.br',
    )
    expect((wrapper.get('#newsletter-whatsapp').element as HTMLInputElement).value).toBe(
      '41999990000',
    )
  })

  test('nada é escrito em localStorage nem em sessionStorage', async () => {
    const escreveLocal = vi.spyOn(Storage.prototype, 'setItem')
    const gateway = criarLeadsGatewayFalso()
    gateway.programarSucesso({ mensagem: 'ok' })
    const wrapper = await montar(gateway)

    await preencher(wrapper, { email: 'cliente@exemplo.com.br' })
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(escreveLocal).not.toHaveBeenCalled()
  })
})
