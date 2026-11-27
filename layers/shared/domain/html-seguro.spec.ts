import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { HtmlSeguro } from './html-seguro'

// T-0104 · REQ-01-05 (RNF-06, ADR 0004): HtmlSeguro só aceita a lista branca de tags. Roda em
// node, sem DOM: o kernel recusa o que não é seguro, não conserta (quem conserta é o backend).

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

function aceita(html: string, opcoes?: { tabelas?: boolean }): boolean {
  return HtmlSeguro.criar(html, opcoes).ok
}

describe('HtmlSeguro.criar: tags', () => {
  test.each(['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br'])(
    'aceita <%s>',
    (tag) => {
      expect(aceita(`<${tag}>texto</${tag}>`)).toBe(true)
    },
  )

  test.each(['script', 'style', 'iframe', 'img'])('recusa <%s>, dizendo a tag', (tag) => {
    const resultado = HtmlSeguro.criar(`<${tag}>x</${tag}>`)

    expect(resultado.ok).toBe(false)
    expect(!resultado.ok && resultado.erro.mensagem).toContain(tag)
  })

  test('table, tr e td só passam com { tabelas: true }', () => {
    const html = '<table><tr><td>pneu</td></tr></table>'

    expect(aceita(html)).toBe(false)
    expect(aceita(html, { tabelas: true })).toBe(true)
  })
})

describe('HtmlSeguro.criar: atributos', () => {
  test.each(['onclick', 'style', 'class'])('recusa o atributo %s, dizendo o nome', (atributo) => {
    const resultado = HtmlSeguro.criar(`<p ${atributo}="x">texto</p>`)

    expect(resultado.ok).toBe(false)
    expect(!resultado.ok && resultado.erro.mensagem).toContain(atributo)
  })

  test('aceita href em <a>', () => {
    expect(aceita('<a href="/ajuda/garantia">garantia</a>')).toBe(true)
  })
})

describe('HtmlSeguro.criar: esquema do href', () => {
  test('recusa javascript:', () => {
    expect(aceita('<a href="javascript:alert(1)">x</a>')).toBe(false)
  })

  test.each([
    ['https:', 'https://www.tireshop.com.br/pneu'],
    ['mailto:', 'mailto:contato@tireshop.com.br'],
    ['tel:', 'tel:+554133172251'],
    ['caminho', '/ajuda/garantia'],
    ['âncora', '#faq-medida'],
  ])('aceita %s', (_rotulo, href) => {
    expect(aceita(`<a href="${href}">x</a>`)).toBe(true)
  })
})

describe('HtmlSeguro.criar: texto puro', () => {
  test('aceita texto sem tag nenhuma', () => {
    expect(aceita('só texto, sem tag')).toBe(true)
  })

  test('aceita texto vazio', () => {
    expect(aceita('')).toBe(true)
  })
})

describe('HtmlSeguro.criar: fixture real', () => {
  test('o texto de apoio de categoria-pneus-para-carros.json é aceito sem alteração', () => {
    const fixture = JSON.parse(
      readFileSync(join(raiz, 'mocks', 'fixtures', 'categoria-pneus-para-carros.json'), 'utf8'),
    ) as { textoApoio: { html: string } }

    const resultado = HtmlSeguro.criar(fixture.textoApoio.html)

    expect(resultado.ok, !resultado.ok ? resultado.erro.mensagem : '').toBe(true)
    expect(resultado.ok && resultado.valor.html).toBe(fixture.textoApoio.html)
  })
})
