import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { criarClienteHttpFalso, erroDeRede } from '#layers/shared'
import { criarHttpNavegacaoRepository } from './http-navegacao-repository'
import { paraNavegacao } from './navegacao.mapper'
import { NavegacaoSchema } from './navegacao.schema'

// T-0202 · REQ-02-01, REQ-02-18 (ADR 0003, ADR 0004): o adaptador HTTP do contexto — o DTO nunca
// sai de adapters/, só a `Navegacao` do domínio.

const raiz = join(import.meta.dirname, '..', '..', '..', '..')
const fixtureBruto = readFileSync(join(raiz, 'mocks', 'fixtures', 'navegacao.json'), 'utf8')

function fixture(): unknown {
  return JSON.parse(fixtureBruto)
}

describe('NavegacaoSchema', () => {
  test('mocks/fixtures/navegacao.json valida no schema', () => {
    const resultado = NavegacaoSchema.safeParse(fixture())
    expect(resultado.success).toBe(true)
  })

  test('departamento com aros: [] é aceito', () => {
    const navegacao = fixture() as { departamentos: Array<{ aros: unknown[] }> }
    navegacao.departamentos[0]!.aros = []

    const resultado = NavegacaoSchema.safeParse(navegacao)
    expect(resultado.success).toBe(true)
  })

  test('falta de contato.whatsapp vira erro com o caminho do campo', () => {
    const navegacao = fixture() as { contato: Record<string, unknown> }
    delete navegacao.contato.whatsapp

    const resultado = NavegacaoSchema.safeParse(navegacao)
    if (resultado.success) throw new Error('esperava falha')

    expect(resultado.error.issues[0]?.path).toEqual(['contato', 'whatsapp'])
  })

  test('campo desconhecido é ignorado', () => {
    const navegacao = fixture() as Record<string, unknown>
    navegacao.campoQueNaoExiste = 'valor qualquer'

    const resultado = NavegacaoSchema.safeParse(navegacao)
    expect(resultado.success).toBe(true)
  })
})

describe('paraNavegacao', () => {
  test('vira Navegacao, com 8 departamentos, 17 marcas e 4 colunas de rodapé', () => {
    const validado = NavegacaoSchema.parse(fixture())
    const resultado = paraNavegacao(validado)
    if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))

    expect(resultado.valor.departamentos).toHaveLength(8)
    expect(resultado.valor.marcas).toHaveLength(17)
    expect(resultado.valor.rodape.colunas).toHaveLength(4)
  })

  test('o logotipo de cada marca vira Imagem (alliance.webp, 152×25)', () => {
    const validado = NavegacaoSchema.parse(fixture())
    const resultado = paraNavegacao(validado)
    if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))

    const alliance = resultado.valor.marcas.find((marca) => marca.slug === 'alliance')
    expect(alliance?.logo.src).toBe('/img/marcas-web/alliance.webp')
    expect(alliance?.logo.largura).toBe(152)
    expect(alliance?.logo.altura).toBe(25)
  })

  test('href: null (marca sem página, "Meus Pedidos") é aceito e vira ausência de link', () => {
    const validado = NavegacaoSchema.parse(fixture())
    const resultado = paraNavegacao(validado)
    if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))

    const alliance = resultado.valor.marcas.find((marca) => marca.slug === 'alliance')
    expect(alliance?.href).toBeNull()

    const meusPedidos = resultado.valor.rodape.colunas
      .flatMap((coluna) => coluna.links)
      .find((link) => link.rotulo === 'Meus Pedidos')
    expect(meusPedidos?.href).toBeNull()
  })
})

describe('criarHttpNavegacaoRepository', () => {
  test('busca GET /navegacao pelo ClienteHttp e devolve a Navegacao', async () => {
    const clienteHttp = criarClienteHttpFalso()
    clienteHttp.programarSucesso('/navegacao', fixture())
    const repositorio = criarHttpNavegacaoRepository(clienteHttp)

    const resultado = await repositorio.obter()

    if (!resultado.ok) throw new Error('esperava sucesso: ' + JSON.stringify(resultado.erro))
    expect(resultado.valor.departamentos).toHaveLength(8)
  })

  test('falha de rede vira ErroDeRede', async () => {
    const clienteHttp = criarClienteHttpFalso()
    clienteHttp.programarFalha('/navegacao', erroDeRede('tempo esgotado'))
    const repositorio = criarHttpNavegacaoRepository(clienteHttp)

    const resultado = await repositorio.obter()

    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('ErroDeRede')
  })
})
