// T-0009 · REQ-00-08: porta scripts/handoff/validar_contratos.py para TypeScript. Valida as
// fixtures que o servidor de mocks serve (mocks/fixtures/**, T-0008) contra o schema da operação
// do openapi.yaml, em modo estrito (campo não documentado reprova) — sem Zod, que é escopo do
// schema de cada adaptador (T-13xx).
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020'
import addFormats from 'ajv-formats'
import { parse } from 'yaml'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DOCS_API = join(raiz, 'docs', 'api')
export const FIXTURES = join(raiz, 'mocks', 'fixtures')

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- schema do OpenAPI, dinâmico por natureza
type Json = any

export type Exemplo = {
  nome: string
  schema: Json
  arquivoFixture: string
  onde: string
}

export type Operacao = {
  caminho: string
  metodo: string
  onde: string
  operationId: string
  temRequestBody: boolean
  exemplosDoCorpo: Exemplo[]
  respostas: Array<{ status: string; exemplos: Exemplo[] }>
}

export function carregarOpenApi(): Json {
  return parse(readFileSync(join(DOCS_API, 'openapi.yaml'), 'utf8'))
}

/** Cópia do schema com allOf achatado e additionalProperties: false onde há `properties`. */
export function tornarEstrito(no: Json, esquemas: Record<string, Json>): Json {
  if (Array.isArray(no)) {
    return no.map((item) => tornarEstrito(item, esquemas))
  }
  if (typeof no !== 'object' || no === null) {
    return no
  }
  if ('$ref' in no && Object.keys(no).length === 1) {
    const nome = String(no.$ref).split('/').pop()!
    return tornarEstrito(structuredClone(esquemas[nome]), esquemas)
  }
  if ('allOf' in no) {
    const junto: {
      type: string
      required: string[]
      properties: Record<string, Json>
      additionalProperties: false
    } = {
      type: 'object',
      required: [],
      properties: {},
      additionalProperties: false,
    }
    for (const parte of no.allOf as Json[]) {
      const p = tornarEstrito(parte, esquemas)
      junto.required.push(...(p.required ?? []))
      Object.assign(junto.properties, p.properties ?? {})
    }
    return junto
  }
  const saida: Record<string, Json> = {}
  for (const [chave, valor] of Object.entries(no)) {
    saida[chave] = tornarEstrito(valor, esquemas)
  }
  if ('properties' in saida && !('additionalProperties' in saida)) {
    saida.additionalProperties = false
  }
  return saida
}

function nomeFixture(externalValue: string): string {
  return externalValue.replace(/^\.?\/?examples\//, '')
}

function exemplosDoConteudo(conteudo: Record<string, Json> | undefined, onde: string): Exemplo[] {
  const saida: Exemplo[] = []
  for (const corpo of Object.values(conteudo ?? {})) {
    for (const [nome, exemplo] of Object.entries<Json>(corpo.examples ?? {})) {
      saida.push({
        nome,
        schema: corpo.schema,
        arquivoFixture: nomeFixture(exemplo.externalValue),
        onde: `${onde} [${nome}]`,
      })
    }
  }
  return saida
}

export function listarOperacoes(doc: Json): Operacao[] {
  const respostasComuns = doc.components?.responses ?? {}
  const operacoes: Operacao[] = []
  for (const [caminho, ops] of Object.entries<Json>(doc.paths)) {
    for (const [metodo, op] of Object.entries<Json>(ops)) {
      const onde = `${metodo.toUpperCase()} ${caminho}`
      const exemplosDoCorpo = op.requestBody
        ? exemplosDoConteudo(op.requestBody.content, `${onde} (corpo)`)
        : []
      const respostas = Object.entries<Json>(op.responses ?? {}).map(([status, resposta]) => {
        const resolvida = resposta.$ref ? respostasComuns[resposta.$ref.split('/').pop()] : resposta
        return { status, exemplos: exemplosDoConteudo(resolvida?.content, `${onde} → ${status}`) }
      })
      operacoes.push({
        caminho,
        metodo,
        onde,
        operationId: op.operationId,
        temRequestBody: Boolean(op.requestBody),
        exemplosDoCorpo,
        respostas,
      })
    }
  }
  return operacoes
}

export function lerFixture(arquivoFixture: string): Json {
  return JSON.parse(readFileSync(join(FIXTURES, arquivoFixture), 'utf8'))
}

/** Valida um exemplo contra o schema estrito. Devolve a lista de erros (vazia = passou). */
export function validarContraSchema(
  dado: Json,
  schema: Json,
  esquemas: Record<string, Json>,
): string[] {
  const ajv = addFormats(new Ajv2020({ allErrors: true, strict: false }))
  const validar = ajv.compile(tornarEstrito(schema, esquemas))
  if (validar(dado)) return []
  return (validar.errors ?? []).map((e) => `${e.instancePath || '/'}: ${e.message}`)
}

export function arquivosDeFixtureCitados(doc: Json): Set<string> {
  const citados = new Set<string>()
  for (const op of listarOperacoes(doc)) {
    for (const exemplo of [...op.exemplosDoCorpo, ...op.respostas.flatMap((r) => r.exemplos)]) {
      citados.add(exemplo.arquivoFixture)
    }
  }
  return citados
}
