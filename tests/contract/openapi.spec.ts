import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  arquivosDeFixtureCitados,
  carregarOpenApi,
  FIXTURES,
  lerFixture,
  listarOperacoes,
  validarContraSchema,
} from './_validador'

// T-0009 · REQ-00-08: todo exemplo citado no openapi.yaml valida no schema da operação, em modo
// estrito; toda fixture (fora de _base) é citada; toda operação com resposta 2xx em JSON tem
// exemplo. Substitui scripts/handoff/validar_contratos.py (mantido por ora — ver Pendências).
//
// Carregado no topo do módulo, não em beforeAll: os test() de cada operação são gerados agora,
// na coleção dos testes — beforeAll só roda depois, tarde demais para isso.
const doc = carregarOpenApi()
const esquemas = doc.components.schemas as Record<string, unknown>
const operacoes = listarOperacoes(doc)

describe('todo exemplo citado no openapi.yaml valida no schema da operação', () => {
  test('existe ao menos um exemplo para validar', () => {
    const total = operacoes.flatMap((o) => [
      ...o.exemplosDoCorpo,
      ...o.respostas.flatMap((r) => r.exemplos),
    ])
    expect(total.length).toBeGreaterThan(0)
  })

  for (const op of operacoes) {
    for (const exemplo of op.exemplosDoCorpo) {
      test(exemplo.onde, () => {
        expect(
          existsSync(join(FIXTURES, exemplo.arquivoFixture)),
          `não existe: ${exemplo.arquivoFixture}`,
        ).toBe(true)
        const erros = validarContraSchema(
          lerFixture(exemplo.arquivoFixture),
          exemplo.schema,
          esquemas,
        )
        expect(erros, erros.join('\n')).toEqual([])
      })
    }
    for (const resposta of op.respostas) {
      for (const exemplo of resposta.exemplos) {
        test(exemplo.onde, () => {
          expect(
            existsSync(join(FIXTURES, exemplo.arquivoFixture)),
            `não existe: ${exemplo.arquivoFixture}`,
          ).toBe(true)
          const erros = validarContraSchema(
            lerFixture(exemplo.arquivoFixture),
            exemplo.schema,
            esquemas,
          )
          expect(erros, erros.join('\n')).toEqual([])
        })
      }
    }
  }
})

describe('toda operação com corpo ou resposta 2xx em JSON tem exemplo', () => {
  for (const op of operacoes) {
    test(op.onde, () => {
      if (op.temRequestBody && op.metodo !== 'patch') {
        expect(
          op.exemplosDoCorpo.length,
          `${op.onde}: corpo da requisição sem exemplo`,
        ).toBeGreaterThan(0)
      }
      const temOk = op.respostas.some((r) => r.status.startsWith('2') && r.exemplos.length > 0)
      if (op.metodo !== 'patch' && op.operationId !== 'assinarNewsletter') {
        expect(temOk, `${op.onde}: resposta 2xx sem exemplo`).toBe(true)
      }
    })
  }
})

describe('toda fixture (fora de _base) é citada por algum exemplo do openapi.yaml', () => {
  test.each(
    readdirSync(FIXTURES)
      .filter((nome) => nome.endsWith('.json'))
      .sort(),
  )('%s', (nome) => {
    expect(arquivosDeFixtureCitados(doc).has(nome), `${nome} não é citado em nenhum exemplo`).toBe(
      true,
    )
  })
})

describe('_base/: os conjuntos completos do servidor de mocks validam', () => {
  const porArquivo: Record<string, string> = {
    'produtos.json': 'Produto',
    'categorias.json': 'Categoria',
    'politicas.json': 'Politica',
    'lojas.json': 'Loja',
  }

  test.each(Object.entries(porArquivo))('_base/%s (schema %s)', (arquivo) => {
    const lista = JSON.parse(readFileSync(join(FIXTURES, '_base', arquivo), 'utf8')) as unknown[]
    const nomeSchema = porArquivo[arquivo]!
    expect(lista.length).toBeGreaterThan(0)
    for (const [i, item] of lista.entries()) {
      const erros = validarContraSchema(
        item,
        { $ref: `#/components/schemas/${nomeSchema}` },
        esquemas,
      )
      expect(erros, `_base/${arquivo}[${i}]: ${erros.join('\n')}`).toEqual([])
    }
  })
})

describe('uma fixture adulterada é reprovada, com o caminho do campo', () => {
  test('campo obrigatório removido reprova', () => {
    const op = operacoes.find((o) => o.onde === 'GET /navegacao')
    const exemplo = op?.exemplosDoCorpo[0] ?? op?.respostas.flatMap((r) => r.exemplos)[0]
    expect(exemplo, 'não achei um exemplo de GET /navegacao para adulterar').toBeTruthy()

    const dado = lerFixture(exemplo!.arquivoFixture) as Record<string, unknown>
    const primeiraChave = Object.keys(dado)[0]!
    delete dado[primeiraChave]

    const erros = validarContraSchema(dado, exemplo!.schema, esquemas)
    expect(erros.length).toBeGreaterThan(0)
    expect(erros.join('\n')).toContain(primeiraChave)
  })
})
