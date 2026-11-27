import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  estrelasCheias,
  mostraPreco,
  seloFrete,
  type ProdutoResumo,
} from '../../domain/produto-resumo'
import { paraProdutoResumo } from './produto-resumo.mapper'
import { ProdutoResumoSchema } from './produto-resumo.schema'

// T-0308 · REQ-03-03, REQ-03-04 (docs/api/openapi.yaml, ProdutoResumo): o schema confere o
// contrato inteiro; o mapper só traduz, para `ProdutoResumo`, o que esta task precisa — campos
// de exibição (nome, imagem, marca…) entram quando a task que os mostrar precisar.

const raiz = join(import.meta.dirname, '..', '..', '..', '..')
const fixtureBruto = readFileSync(join(raiz, 'mocks', 'fixtures', 'produtos-lista.json'), 'utf8')

function itensDaFixture(): unknown[] {
  return (JSON.parse(fixtureBruto) as { itens: unknown[] }).itens
}

function umItemValido(sobrescritas: Record<string, unknown> = {}): Record<string, unknown> {
  const base = itensDaFixture()[0] as Record<string, unknown>
  return { ...base, ...sobrescritas }
}

describe('ProdutoResumoSchema', () => {
  test('todo item de produtos-lista.json valida no schema', () => {
    for (const item of itensDaFixture()) {
      expect(ProdutoResumoSchema.safeParse(item).success).toBe(true)
    }
  })

  test('falta de campo obrigatório é recusada, com o caminho do campo', () => {
    const item = umItemValido()
    delete item.nome

    const resultado = ProdutoResumoSchema.safeParse(item)

    expect(resultado.success).toBe(false)
    if (resultado.success) throw new Error('esperava falha')
    expect(resultado.error.issues[0]?.path).toEqual(['nome'])
  })

  test('campo desconhecido é ignorado', () => {
    const item = umItemValido({ campoQueNaoExiste: 'valor qualquer' })

    expect(ProdutoResumoSchema.safeParse(item).success).toBe(true)
  })
})

describe('paraProdutoResumo', () => {
  function mapear(sobrescritas: Record<string, unknown> = {}): ProdutoResumo {
    const dto = ProdutoResumoSchema.parse(umItemValido(sobrescritas))
    const resultado = paraProdutoResumo(dto)
    if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))
    return resultado.valor
  }

  test('todo item de produtos-lista.json vira ProdutoResumo', () => {
    for (const item of itensDaFixture()) {
      const dto = ProdutoResumoSchema.parse(item)
      const resultado = paraProdutoResumo(dto)
      expect(resultado.ok).toBe(true)
    }
  })

  test('preco: null (sem estoque) vira produto sem preço exibível', () => {
    const produto = mapear({ preco: null, disponibilidade: 'sem_estoque' })

    expect(produto.preco).toBeUndefined()
    expect(mostraPreco(produto)).toBe(false)
  })

  test('preco.de: null vira preço sem valor anterior', () => {
    const base = umItemValido()
    const precoBase = base.preco as { de: unknown; parcelado: unknown; aVista: unknown }
    const produto = mapear({ preco: { ...precoBase, de: null } })

    expect(produto.preco?.de).toBeUndefined()
    expect(produto.preco!.emPromocao()).toBe(false)
  })

  test('freteGratis: null e avaliacao: null viram ausência, sem erro', () => {
    const produto = mapear({ freteGratis: null, avaliacao: null })

    expect(seloFrete(produto)).toBeUndefined()
    expect(estrelasCheias(produto)).toBeUndefined()
  })
})
