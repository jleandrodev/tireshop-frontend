import {
  erroDeContrato,
  erroDeRede,
  erroDeValidacao,
  naoEncontrado,
  type ErroDoKernel,
} from '../domain/erros'
import { falha, ok, type Result } from '../domain/result'

// T-0103 · REQ-01-03, REQ-01-04 (RNF-05, ADR 0003, ADR 0004): a única saída HTTP do projeto.
// Nunca lança: toda falha (rede, tempo esgotado, status, contrato) vira um erro do kernel.

const TEMPO_LIMITE_PADRAO_MS = 8000

/** O formato de SafeParseReturnType do Zod (`{ success, data }` | `{ success, error: { issues } }`),
 *  sem importar o pacote — um schema Zod de verdade já satisfaz este tipo. */
export type SchemaComSafeParse<T> = {
  safeParse: (dado: unknown) => { success: true; data: T } | { success: false; error: ErroDeParse }
}

export type ErroDeParse = {
  issues: ReadonlyArray<{ path: ReadonlyArray<string | number>; message: string }>
}

export type ValorDeConsulta = string | number | boolean | undefined
export type Consulta = Record<string, ValorDeConsulta | readonly ValorDeConsulta[]>

export type ClienteHttp = {
  obter: <T>(
    caminho: string,
    opcoes: { consulta?: Consulta; schema: SchemaComSafeParse<T> },
  ) => Promise<Result<T, ErroDoKernel>>
  enviar: <T = undefined>(
    metodo: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    caminho: string,
    corpo?: unknown,
    opcoes?: { schema?: SchemaComSafeParse<T> },
  ) => Promise<Result<T, ErroDoKernel>>
}

export type ConfiguracaoClienteHttp = {
  readonly apiBase: string
  readonly tempoLimiteMs?: number
  readonly cabecalhos?: { readonly cookie?: string }
  readonly fetch: typeof fetch
}

function construirConsulta(consulta?: Consulta): string {
  const params = new URLSearchParams()
  for (const [chave, valor] of Object.entries(consulta ?? {})) {
    if (valor === undefined) continue
    for (const item of Array.isArray(valor) ? valor : [valor]) {
      if (item !== undefined) params.append(chave, String(item))
    }
  }
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}

/** 404 e 422 têm forma própria (problem+json, ADR 0010); qualquer outra falha é ErroDeRede. */
function erroDaResposta(status: number, corpo: unknown): ErroDoKernel {
  const problema = (corpo ?? {}) as {
    title?: string
    erros?: ReadonlyArray<{ campo: string; mensagem: string }>
  }
  if (status === 404) {
    return naoEncontrado(problema.title ?? 'Não encontrado')
  }
  if (status === 422) {
    return erroDeValidacao(problema.erros ?? [])
  }
  return erroDeRede(problema.title ?? `a API respondeu ${status}`)
}

export function criarClienteHttp(configuracao: ConfiguracaoClienteHttp): ClienteHttp {
  const tempoLimiteMs = configuracao.tempoLimiteMs ?? TEMPO_LIMITE_PADRAO_MS

  async function pedir<T>(
    metodo: string,
    caminho: string,
    opcoes: { consulta?: Consulta; corpo?: unknown; schema?: SchemaComSafeParse<T> },
  ): Promise<Result<T, ErroDoKernel>> {
    const endpoint = `${metodo} ${caminho}`
    const url = `${configuracao.apiBase}${caminho}${construirConsulta(opcoes.consulta)}`

    const cabecalhos = new Headers()
    if (configuracao.cabecalhos?.cookie) {
      cabecalhos.set('cookie', configuracao.cabecalhos.cookie)
    }
    const temCorpo = opcoes.corpo !== undefined
    if (temCorpo) {
      cabecalhos.set('content-type', 'application/json')
    }

    const controlador = new AbortController()
    const temporizador = setTimeout(() => controlador.abort(), tempoLimiteMs)

    let resposta: Response
    try {
      resposta = await configuracao.fetch(url, {
        method: metodo,
        headers: cabecalhos,
        // O navegador decide o que mandar por "same-origin"; no servidor, é o cookie acima que
        // de fato repassa a sessão (fetch do Node não tem cookie jar ligado à requisição original).
        credentials: 'include',
        signal: controlador.signal,
        ...(temCorpo ? { body: JSON.stringify(opcoes.corpo) } : {}),
      })
    } catch {
      return falha(erroDeRede(`falha ao chamar ${endpoint}`))
    } finally {
      clearTimeout(temporizador)
    }

    if (resposta.status === 204) {
      return ok(undefined as T)
    }

    const corpoBruto = await resposta.text()
    const corpo: unknown = corpoBruto ? JSON.parse(corpoBruto) : undefined

    if (!resposta.ok) {
      return falha(erroDaResposta(resposta.status, corpo))
    }

    if (!opcoes.schema) {
      return ok(corpo as T)
    }

    const validado = opcoes.schema.safeParse(corpo)
    if (!validado.success) {
      const primeiro = validado.error.issues[0]
      return falha(
        erroDeContrato(
          endpoint,
          primeiro?.path.join('.') ?? '',
          primeiro?.message ?? 'resposta fora do contrato',
        ),
      )
    }
    return ok(validado.data)
  }

  return {
    obter: (caminho, opcoes) =>
      pedir('GET', caminho, { consulta: opcoes.consulta, schema: opcoes.schema }),
    enviar: (metodo, caminho, corpo, opcoes) =>
      pedir(metodo, caminho, { corpo, schema: opcoes?.schema }),
  }
}
