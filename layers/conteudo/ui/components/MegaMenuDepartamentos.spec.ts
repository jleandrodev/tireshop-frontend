import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import type { Departamento } from '../../domain/navegacao'
import { umaNavegacao } from '../../domain/__fabricas__/navegacao'
import MegaMenuDepartamentos from './MegaMenuDepartamentos.vue'

// T-0207 · REQ-02-05, REQ-02-06: os aros de cada departamento, com o pé do painel ("Ajuda para
// escolher", "Também vendemos"). Link interno (departamento.href) usa a navegação do Nuxt; link
// externo (aro, na fábrica) sai com a URL completa — a T-0207 não tem dado nenhum aro interno.

const navegacao = umaNavegacao()

function montar(departamentos: readonly Departamento[] = navegacao.departamentos) {
  return mountSuspended(MegaMenuDepartamentos, {
    props: { departamentos, ajuda: navegacao.ajuda, extras: navegacao.extras },
  })
}

describe('MegaMenuDepartamentos', () => {
  test('lista os 8 departamentos, cada um com ícone e link para a categoria', async () => {
    const wrapper = await montar()

    const titulos = wrapper.findAll('.ts-mega__titulo')
    expect(titulos).toHaveLength(8)
    expect(titulos[0]!.text()).toContain('Carros')
    expect(titulos[0]!.find('svg').exists()).toBe(true)
    expect(titulos[0]!.attributes('href')).toBe('/c/pneus-para-carros')
  })

  test('Carros mostra 14 links, de "Aro 10" a "Aro 24"; Vans mostra "Aro 14", "Aro 15" e "Aro 16"', async () => {
    const wrapper = await montar()

    const grupos = wrapper.findAll('.ts-mega__aros')
    const carros = grupos.find((g) => g.attributes('aria-label') === 'Aros de Carros')!
    const arosDeCarros = carros.findAll('a').map((a) => a.text())
    expect(arosDeCarros).toHaveLength(14)
    expect(arosDeCarros[0]).toBe('Aro 10')
    expect(arosDeCarros.at(-1)).toBe('Aro 24')

    const vans = grupos.find((g) => g.attributes('aria-label') === 'Aros de Vans')!
    expect(vans.findAll('a').map((a) => a.text())).toEqual(['Aro 14', 'Aro 15', 'Aro 16'])
  })

  test('a lista de aros tem aria-label "Aros de Carros"', async () => {
    const wrapper = await montar()

    expect(wrapper.find('[aria-label="Aros de Carros"]').exists()).toBe(true)
  })

  test('departamento sem aros mostra o resumoAros como texto, sem lista', async () => {
    const semAros: Departamento = {
      slug: 'sem-aros',
      nome: 'Sem Aros',
      icone: 'carro',
      href: '/c/sem-aros',
      resumoAros: 'Aros variados',
      aros: [],
    }
    const wrapper = await montar([semAros])

    expect(wrapper.find('[aria-label="Aros de Sem Aros"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Aros variados')
  })

  test('o pé do painel tem "Ajuda para escolher" e "Também vendemos", só com os links que têm href', async () => {
    const wrapper = await montar()

    const rodape = wrapper.get('.ts-mega__rodape')
    expect(rodape.text()).toContain('Ajuda para escolher')
    expect(rodape.text()).toContain('Como Comprar')
    expect(rodape.text()).not.toContain('Todos os aros')
    expect(rodape.text()).toContain('Também vendemos')
    expect(rodape.text()).toContain('Capotas Marítimas')
  })

  test('link interno (departamento) usa a navegação do Nuxt; link externo (aro) sai com a URL completa', async () => {
    const wrapper = await montar()

    const tituloCarros = wrapper.get('.ts-mega__titulo')
    expect(tituloCarros.attributes('target')).toBeUndefined()

    const primeiroAro = wrapper.get('.ts-mega__aros a')
    expect(primeiroAro.attributes('href')).toMatch(/^https:\/\/www\.tireshop\.com\.br\//)
    expect(primeiroAro.attributes('target')).toBe('_blank')
  })

  test('escolher um link emite fechar', async () => {
    const wrapper = await montar()

    await wrapper.get('.ts-mega__titulo').trigger('click')

    expect(wrapper.emitted('fechar')).toHaveLength(1)
  })
})
