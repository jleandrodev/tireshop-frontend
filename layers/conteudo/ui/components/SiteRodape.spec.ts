import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, test } from 'vitest'
import { rotas } from '#layers/shared'
import { criarNavegacaoRepositoryFalso } from '../../application/__falsos__/navegacao-repository-falso'
import { umaNavegacao } from '../../domain/__fabricas__/navegacao'
import { SIMBOLO_NAVEGACAO_REPOSITORY } from '../composables/use-navegacao'
import SiteRodape from './SiteRodape.vue'

// T-0210 · REQ-02-10, REQ-02-11: colunas, redes, selos, pagamentos e os dados fiscais. A nota do
// selo "Loja confiável" e o formulário de newsletter não são desta task (ver Pendências/T-0218).

const COLUNAS = [
  {
    titulo: 'Comprar',
    links: [
      { rotulo: 'Departamentos', href: '/#departamentos' },
      { rotulo: 'Aros', href: null },
    ],
  },
  {
    titulo: 'Ajuda para escolher',
    links: [
      { rotulo: 'Como Comprar', href: '/ajuda/como-comprar' },
      { rotulo: 'Comparar pneus', href: '/comparar' },
    ],
  },
  {
    titulo: 'Entrega e pagamento',
    links: [
      { rotulo: 'Prazo de entrega', href: '/ajuda/prazo-de-entrega' },
      { rotulo: 'Rastrear pedido', href: null },
    ],
  },
  {
    titulo: 'Atendimento e empresa',
    links: [
      { rotulo: 'Fale conosco', href: 'https://www.tireshop.com.br/Contato' },
      { rotulo: 'Meus Pedidos', href: null },
    ],
  },
]

const REDES = [
  { id: 'instagram', nome: 'Instagram', href: 'https://www.instagram.com/tireshop.com.br/' },
  { id: 'facebook', nome: 'Facebook', href: 'https://www.facebook.com/TireShopBR/' },
  { id: 'youtube', nome: 'YouTube', href: 'https://www.youtube.com/@canaldatireshop132' },
  { id: 'tiktok', nome: 'TikTok', href: 'https://www.tiktok.com/@tireshop.com.br' },
]

const falso = criarNavegacaoRepositoryFalso()

function montar() {
  falso.programarSucesso(
    umaNavegacao({ rodape: { colunas: COLUNAS, textoFiscal: TEXTO_FISCAL }, redes: REDES }),
  )
  return mountSuspended(SiteRodape, {
    global: { provide: { [SIMBOLO_NAVEGACAO_REPOSITORY as unknown as string]: falso } },
  })
}

const TEXTO_FISCAL =
  '© Todos os direitos reservados. Os preços, as promoções, o frete de entrega e as condições de pagamento informados no site, são válidos apenas para compras via Internet.'

describe('SiteRodape', () => {
  afterEach(() => {
    clearNuxtData('navegacao')
  })

  test('mostra as 4 colunas recebidas, cada uma em um details', async () => {
    const wrapper = await montar()

    const detalhes = wrapper.findAll('details.ts-rodape__coluna')
    expect(detalhes).toHaveLength(4)
    expect(detalhes.map((d) => d.get('summary').text())).toEqual([
      'Comprar',
      'Ajuda para escolher',
      'Entrega e pagamento',
      'Atendimento e empresa',
    ])
  })

  test('a coluna "Ajuda para escolher" tem o link "Comparar pneus" para rotas.comparar()', async () => {
    const wrapper = await montar()

    const coluna = wrapper
      .findAll('details.ts-rodape__coluna')
      .find((d) => d.get('summary').text() === 'Ajuda para escolher')!
    const link = coluna.findAll('a').find((a) => a.text() === 'Comparar pneus')!
    expect(link.attributes('href')).toBe(rotas.comparar())
  })

  test('links com href nulo ("Rastrear pedido", "Meus Pedidos") não são renderizados', async () => {
    const wrapper = await montar()

    expect(wrapper.text()).not.toContain('Rastrear pedido')
    expect(wrapper.text()).not.toContain('Meus Pedidos')
  })

  test('as 4 redes têm aria-label "TireShop no <rede>"', async () => {
    const wrapper = await montar()

    for (const rede of REDES) {
      expect(wrapper.find(`a[aria-label="TireShop no ${rede.nome}"]`).exists()).toBe(true)
    }
  })

  test('não existe h2 nem h3 dentro do rodapé', async () => {
    const wrapper = await montar()

    expect(wrapper.find('h2').exists()).toBe(false)
    expect(wrapper.find('h3').exists()).toBe(false)
  })

  test('o texto fiscal recebido aparece inteiro', async () => {
    const wrapper = await montar()

    expect(wrapper.text()).toContain(TEXTO_FISCAL)
  })

  test('a linha da empresa traz a razão social, o CNPJ, o telefone e o e-mail', async () => {
    const wrapper = await montar()

    const empresa = wrapper.get('.ts-rodape__empresa')
    expect(empresa.text()).toContain('TireShop Comércio de Pneus e Rodas LTDA')
    expect(empresa.text()).toContain('CNPJ: 80.171.671/0001-54')
    expect(empresa.find('a[href="tel:+554133172251"]').exists()).toBe(true)
    expect(empresa.find('a[href="mailto:contato@tireshop.com.br"]').exists()).toBe(true)
  })

  test('os selos e as 7 formas de pagamento aparecem, com alt nas imagens', async () => {
    const wrapper = await montar()

    expect(wrapper.text()).toContain('Loja confiável')
    expect(wrapper.text()).toContain('Certificado SSL')
    expect(wrapper.find('img[alt="Site Seguro Google"]').exists()).toBe(true)

    const pagamentos = wrapper.findAll('.ts-pagamento')
    expect(pagamentos).toHaveLength(7)
    for (const img of wrapper.get('.ts-pagamentos').findAll('img')) {
      expect(img.attributes('alt')).not.toBeUndefined()
    }
  })

  test('as colunas abrem a partir de 900px e fecham abaixo, também ao redimensionar', async () => {
    const original = window.innerWidth
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 })
    const wrapper = await montar()
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()

    expect((wrapper.get('details.ts-rodape__coluna').element as HTMLDetailsElement).open).toBe(true)

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 600 })
    window.dispatchEvent(new Event('resize'))
    await wrapper.vm.$nextTick()

    expect((wrapper.get('details.ts-rodape__coluna').element as HTMLDetailsElement).open).toBe(
      false,
    )

    Object.defineProperty(window, 'innerWidth', { configurable: true, value: original })
  })

  test('"Todos os direitos reservados" mostra o ano atual', async () => {
    const wrapper = await montar()

    expect(wrapper.get('.ts-rodape__direitos').text()).toContain(String(new Date().getFullYear()))
  })

  test('expõe o lugar "newsletter"', async () => {
    const falsoComSlot = criarNavegacaoRepositoryFalso()
    falsoComSlot.programarSucesso(
      umaNavegacao({ rodape: { colunas: COLUNAS, textoFiscal: TEXTO_FISCAL } }),
    )
    const wrapper = await mountSuspended(SiteRodape, {
      slots: { newsletter: '<p data-prova="newsletter">marcador</p>' },
      global: { provide: { [SIMBOLO_NAVEGACAO_REPOSITORY as unknown as string]: falsoComSlot } },
    })

    expect(wrapper.find('[data-prova="newsletter"]').exists()).toBe(true)
  })
})
