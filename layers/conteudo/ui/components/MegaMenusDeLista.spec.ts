import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, describe, expect, test } from 'vitest'
import { Imagem } from '#layers/shared'
import { criarNavegacaoRepositoryFalso } from '../../application/__falsos__/navegacao-repository-falso'
import { umaNavegacao } from '../../domain/__fabricas__/navegacao'
import type { LojaDoMenu, Marca } from '../../domain/navegacao'
import { SIMBOLO_NAVEGACAO_REPOSITORY } from '../composables/use-navegacao'
import SiteCabecalho from './SiteCabecalho.vue'

// T-0208 · REQ-02-06..REQ-02-08: os mega menus de Lojas Físicas e de Marcas, e os itens do menu
// que não são mega menu nenhum — tudo dentro do `SiteCabecalho` (quem decide o tipo de cada item
// é `tipoDoItemDeMenu`, lido do próprio `navegacao.menu`).

function umaFoto(): Imagem {
  const resultado = Imagem.de({
    src: '/img/lojas/curitiba.webp',
    largura: 320,
    altura: 240,
    alt: '',
  })
  if (!resultado.ok) throw new Error('foto inválida na prova')
  return resultado.valor
}

function umaLoja(sobrescritas: Partial<LojaDoMenu> = {}): LojaDoMenu {
  return {
    slug: 'curitiba',
    cidade: 'Curitiba',
    uf: 'PR',
    endereco: 'Rua das Palmeiras, 100',
    foto: umaFoto(),
    ...sobrescritas,
  }
}

function umaMarca(sobrescritas: Partial<Marca> = {}): Marca {
  return { slug: 'generica', nome: 'Genérica', logo: umaFoto(), href: null, ...sobrescritas }
}

const MENU_COM_LINKS_SIMPLES = [
  { rotulo: 'Lojas Físicas', href: '/lojas' },
  { rotulo: 'Marcas', href: '/#marcas' },
  { rotulo: 'Promoções', href: '/#ofertas' },
  { rotulo: 'Blog', href: 'https://www.tireshop.com.br/Blog' },
  { rotulo: 'Sobre Nós', href: '/sobre-nos' },
]

// Um falso só, reprogramado por teste (não um novo a cada `montar`): a primeira chamada a
// `useAsyncData('navegacao', …)` no arquivo de teste fixa o *handler* — e o que ele capturou —
// para as chamadas seguintes com a mesma chave (achado na T-0204). Com o mesmo objeto mutável,
// o handler de qualquer teste sempre lê a programação atual.
const falso = criarNavegacaoRepositoryFalso()

function montar(opcoes: { lojas?: readonly LojaDoMenu[]; marcas?: readonly Marca[] } = {}) {
  falso.programarSucesso(
    umaNavegacao({ menu: MENU_COM_LINKS_SIMPLES, marcas: opcoes.marcas ?? [umaMarca()] }),
  )
  return mountSuspended(SiteCabecalho, {
    props: { quantidadeNoCarrinho: 0, lojas: opcoes.lojas ?? [] },
    global: { provide: { [SIMBOLO_NAVEGACAO_REPOSITORY as unknown as string]: falso } },
  })
}

describe('SiteCabecalho: mega menus de Lojas Físicas e de Marcas', () => {
  afterEach(() => {
    clearNuxtData('navegacao')
  })

  test('com 5 lojas, mostra a foto, a cidade, a UF e o endereço de cada uma, com link para rotas.loja(slug)', async () => {
    const lojas = Array.from({ length: 5 }, (_, i) =>
      umaLoja({ slug: `loja-${i}`, cidade: `Cidade ${i}` }),
    )
    const wrapper = await montar({ lojas })

    const cartoes = wrapper.findAll('.ts-mega__loja')
    expect(cartoes).toHaveLength(5)
    expect(cartoes[0]!.get('img').attributes('src')).toBe(lojas[0]!.foto.src)
    expect(cartoes[0]!.text()).toContain('Cidade 0')
    expect(cartoes[0]!.text()).toContain('PR')
    expect(cartoes[0]!.text()).toContain('Rua das Palmeiras, 100')
    expect(cartoes[0]!.attributes('href')).toBe('/lojas/loja-0')
  })

  test('o pé do menu de lojas tem "Ver todas as lojas" e o WhatsApp com o telefone', async () => {
    const wrapper = await montar({ lojas: [umaLoja()] })

    const rodape = wrapper.get('.ts-mega__lojas').element.parentElement!
    expect(rodape.textContent).toContain('Ver todas as lojas')
    expect(wrapper.find('a[href="https://wa.me/554133172251"]').exists()).toBe(true)
  })

  test('sem lojas, "Lojas Físicas" é um link simples para rotas.lojas(), sem painel', async () => {
    const wrapper = await montar({ lojas: [] })

    expect(wrapper.find('details.ts-mega--lojas').exists()).toBe(false)
    const link = wrapper.findAll('a').find((a) => a.text() === 'Lojas Físicas')
    expect(link?.attributes('href')).toBe('/lojas')
  })

  test('o menu de marcas mostra os logotipos, cada um com alt igual ao nome, width e height', async () => {
    const marcas = Array.from({ length: 17 }, (_, i) =>
      umaMarca({ slug: `marca-${i}`, nome: `Marca ${i}` }),
    )
    const wrapper = await montar({ marcas })

    const logos = wrapper.findAll('.ts-mega__marca img')
    expect(logos).toHaveLength(17)
    expect(logos[0]!.attributes('alt')).toBe('Marca 0')
    expect(logos[0]!.attributes('width')).toBe(String(umaFoto().largura))
    expect(logos[0]!.attributes('height')).toBe(String(umaFoto().altura))
  })

  test('Hankook tem link para /c/hankook com o nome "Pneus Hankook"; marca com href nulo é só o logotipo', async () => {
    const marcas = [
      umaMarca({ slug: 'hankook', nome: 'Hankook', href: '/c/hankook' }),
      umaMarca({ slug: 'sem-pagina', nome: 'Sem Página', href: null }),
    ]
    const wrapper = await montar({ marcas })

    const linkHankook = wrapper.get('[aria-label="Pneus Hankook"]')
    expect(linkHankook.attributes('href')).toBe('/c/hankook')

    const semPagina = wrapper
      .findAll('.ts-mega__marca')
      .find((el) => el.find('img').attributes('alt') === 'Sem Página')!
    expect(semPagina.element.tagName).not.toBe('A')
  })

  test('os itens do menu que não são mega menu saem como links simples, na ordem recebida', async () => {
    const wrapper = await montar()

    const itens = wrapper.findAll('.ts-nav__lista > li')
    const rotulos = itens.map((item) => {
      const summary = item.find('summary')
      return summary.exists() ? summary.text() : item.get('a').text()
    })
    expect(rotulos).toEqual([
      'Departamentos',
      'Lojas Físicas',
      'Marcas',
      'Promoções',
      'Blog',
      'Sobre Nós',
    ])

    const promocoes = wrapper.findAll('a').find((a) => a.text() === 'Promoções')
    expect(promocoes?.attributes('href')).toBe('/#ofertas')
    const blog = wrapper.findAll('a').find((a) => a.text() === 'Blog')
    expect(blog?.attributes('target')).toBe('_blank')
  })

  test('abrir "Marcas" com "Departamentos" aberto fecha "Departamentos"', async () => {
    const wrapper = await montar()

    const [departamentos, marcas] = wrapper
      .findAll('details')
      .map((d) => d.element as HTMLDetailsElement)

    departamentos!.open = true
    await departamentos!.dispatchEvent(new Event('toggle'))
    marcas!.open = true
    await marcas!.dispatchEvent(new Event('toggle'))

    expect(departamentos!.open).toBe(false)
    expect(marcas!.open).toBe(true)
  })
})
