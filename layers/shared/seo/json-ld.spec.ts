import { describe, expect, test } from 'vitest'
import { breadcrumbList, faqPage } from './json-ld'

// T-0106 · REQ-01-07 (ADR 0011): JSON-LD comum a toda página. Product e AutomotiveBusiness são
// de cada contexto.

const ORIGEM = 'https://www.tireshop.com.br'

describe('breadcrumbList', () => {
  const migalhas = [
    { rotulo: 'Home', href: '/' },
    { rotulo: 'Pneus para carros', href: '/c/pneus-para-carros' },
    { rotulo: 'Aro 17', href: null },
  ]

  test('gera um ListItem por migalha, com position 1, 2 e 3', () => {
    const resultado = breadcrumbList(migalhas, ORIGEM)

    expect(resultado['@type']).toBe('BreadcrumbList')
    expect(resultado.itemListElement).toHaveLength(3)
    expect(resultado.itemListElement.map((i) => i.position)).toEqual([1, 2, 3])
  })

  test('cada item com href vira URL absoluta a partir da origem', () => {
    const resultado = breadcrumbList(migalhas, ORIGEM)

    expect(resultado.itemListElement[1]).toMatchObject({
      name: 'Pneus para carros',
      item: 'https://www.tireshop.com.br/c/pneus-para-carros',
    })
  })

  test('o último item, sem href, sai sem "item"', () => {
    const resultado = breadcrumbList(migalhas, ORIGEM)
    const ultimo = resultado.itemListElement[2]!

    expect(ultimo.name).toBe('Aro 17')
    expect('item' in ultimo).toBe(false)
  })

  test('passa por JSON.stringify e JSON.parse sem perda', () => {
    const resultado = breadcrumbList(migalhas, ORIGEM)

    expect(JSON.parse(JSON.stringify(resultado))).toEqual(resultado)
  })
})

describe('faqPage', () => {
  const perguntas = [
    {
      pergunta: 'Qual a medida do meu pneu?',
      respostaHtml: '<p>Veja o <strong>flanco</strong> do pneu.</p>',
    },
    { pergunta: 'Tem garantia?', respostaHtml: '<p>Sim, 5 anos.</p>' },
  ]

  test('gera uma Question por pergunta, com a resposta em texto sem tags', () => {
    const resultado = faqPage(perguntas)

    expect(resultado?.['@type']).toBe('FAQPage')
    expect(resultado?.mainEntity).toHaveLength(2)
    expect(resultado?.mainEntity[0]).toMatchObject({
      name: 'Qual a medida do meu pneu?',
      acceptedAnswer: { '@type': 'Answer', text: 'Veja o flanco do pneu.' },
    })
  })

  test('com a lista vazia, devolve nada (a página não emite o bloco)', () => {
    expect(faqPage([])).toBeUndefined()
  })

  test('passa por JSON.stringify e JSON.parse sem perda', () => {
    const resultado = faqPage(perguntas)

    expect(JSON.parse(JSON.stringify(resultado))).toEqual(resultado)
  })
})
