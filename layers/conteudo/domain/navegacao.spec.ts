import { describe, expect, test } from 'vitest'
import { rotas } from '#layers/shared'
import { umaNavegacao } from './__fabricas__/navegacao'
import {
  linkDoWhatsapp,
  linksVisiveis,
  temAros,
  tipoDoItemDeMenu,
  totalDeLinksDeAro,
  type Departamento,
} from './navegacao'

// T-0201 · REQ-02-01, REQ-02-05, REQ-02-18: Navegacao é o modelo raso do cabeçalho, mega menu e
// rodapé — sem agregado rico, é quase só leitura e exibição (docs/domain/conteudo.md).

describe('temAros', () => {
  test('é falso para a lista vazia (a tela mostra só o título e o resumoAros)', () => {
    const departamento: Departamento = {
      slug: 'otr',
      nome: 'OTR',
      icone: 'otr',
      href: '/c/otr',
      resumoAros: 'Sem aro cadastrado',
      aros: [],
    }
    expect(temAros(departamento)).toBe(false)
  })

  test('é verdadeiro quando há pelo menos um aro', () => {
    const departamento: Departamento = {
      slug: 'utv',
      nome: 'UTV',
      icone: 'utv',
      href: '/c/utv',
      resumoAros: 'Aro 15',
      aros: [{ aro: '15', href: '/c/utv-aro-15' }],
    }
    expect(temAros(departamento)).toBe(true)
  })
})

describe('totalDeLinksDeAro', () => {
  test('soma os aros de todos os departamentos (59 com os dados do exemplo)', () => {
    expect(totalDeLinksDeAro(umaNavegacao())).toBe(59)
  })
})

describe('linksVisiveis', () => {
  test('tira os itens com href nulo ("Meus Pedidos", "Rastrear pedido", "Aros")', () => {
    const links = [
      { rotulo: 'Fale conosco', href: '/contato' },
      { rotulo: 'Meus Pedidos', href: null },
      { rotulo: 'Rastrear pedido', href: null },
      { rotulo: 'Aros', href: null },
      { rotulo: 'Garantia', href: '/ajuda/garantia' },
    ]

    expect(linksVisiveis(links).map((link) => link.rotulo)).toEqual(['Fale conosco', 'Garantia'])
  })
})

describe('tipoDoItemDeMenu', () => {
  test('devolve "lojas" para o item que aponta para o hub de lojas', () => {
    expect(tipoDoItemDeMenu({ rotulo: 'Lojas Físicas', href: rotas.lojas() })).toBe('lojas')
  })

  test('devolve "marcas" para o item que aponta para #marcas', () => {
    expect(tipoDoItemDeMenu({ rotulo: 'Marcas', href: rotas.home({ ancora: 'marcas' }) })).toBe(
      'marcas',
    )
  })

  test('devolve "link" para os outros', () => {
    expect(tipoDoItemDeMenu({ rotulo: 'Blog', href: 'https://www.tireshop.com.br/Blog' })).toBe(
      'link',
    )
  })
})

describe('linkDoWhatsapp', () => {
  test('devolve https://wa.me/554133172251', () => {
    expect(linkDoWhatsapp(umaNavegacao().contato)).toBe('https://wa.me/554133172251')
  })
})

describe('umaNavegacao (fábrica)', () => {
  test('cria uma navegação válida e aceita sobrescritas', () => {
    const padrao = umaNavegacao()
    expect(padrao.departamentos.length).toBeGreaterThan(0)
    expect(padrao.rodape.colunas.length).toBeGreaterThan(0)

    const comSobrescrita = umaNavegacao({ menu: [] })
    expect(comSobrescrita.menu).toEqual([])
    expect(comSobrescrita.departamentos.length).toBeGreaterThan(0)
  })
})
