// T-0217 · REQ-02-12, REQ-02-13: rota do mock para `POST /newsletter` — não grava nada em disco
// (não revela quem já assinou: o mesmo e-mail duas vezes dá 201 nas duas, sempre).
import {
  createError,
  defineEventHandler,
  getQuery,
  readBody,
  setResponseHeader,
  setResponseStatus,
} from 'h3'
import type { Problema } from '../../utils/mock'
import { simularRede } from '../../utils/mock'

type ProblemaDeValidacao = {
  type: string
  title: string
  status: 422
  detail: string
  erros: ReadonlyArray<{ campo: string; mensagem: string }>
}

export type ResultadoNewsletter =
  | { tipo: 'desligado' }
  | { tipo: 'falha'; status: number; corpo: Problema }
  | { tipo: 'invalido'; corpo: ProblemaDeValidacao }
  | { tipo: 'ok'; corpo: { mensagem: string } }

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const WHATSAPP_VALIDO = /^[0-9]{10,11}$/

function validarCorpo(corpo: unknown): ReadonlyArray<{ campo: string; mensagem: string }> {
  const dados = (corpo ?? {}) as { email?: unknown; whatsapp?: unknown }
  const erros: Array<{ campo: string; mensagem: string }> = []

  if (typeof dados.email !== 'string' || !EMAIL_VALIDO.test(dados.email)) {
    erros.push({ campo: 'email', mensagem: 'Digite um e-mail válido, como nome@exemplo.com.br.' })
  }
  if (dados.whatsapp !== null && dados.whatsapp !== undefined) {
    if (typeof dados.whatsapp !== 'string' || !WHATSAPP_VALIDO.test(dados.whatsapp)) {
      erros.push({ campo: 'whatsapp', mensagem: 'Digite o WhatsApp com DDD: 10 ou 11 números.' })
    }
  }
  return erros
}

export async function responderNewsletter(opcoes: {
  query: Record<string, unknown>
  instancia: string
  corpo: unknown
}): Promise<ResultadoNewsletter> {
  const rede = await simularRede(opcoes.query, opcoes.instancia)
  if (rede.tipo !== 'pronto') return rede

  const erros = validarCorpo(opcoes.corpo)
  if (erros.length > 0) {
    return {
      tipo: 'invalido',
      corpo: {
        type: 'https://api.tireshop.com.br/erros/validacao',
        title: 'Dados inválidos',
        status: 422,
        detail: 'Confira os campos destacados.',
        erros,
      },
    }
  }

  return {
    tipo: 'ok',
    corpo: { mensagem: 'Inscrição confirmada! Você vai receber nossas novidades.' },
  }
}

export default defineEventHandler(async (event) => {
  const resultado = await responderNewsletter({
    query: getQuery(event),
    instancia: event.path,
    corpo: await readBody(event),
  })

  if (resultado.tipo === 'desligado') {
    throw createError({ statusCode: 404, statusMessage: 'Mock desligado' })
  }

  if (resultado.tipo === 'falha') {
    setResponseStatus(event, resultado.status)
    setResponseHeader(event, 'content-type', 'application/problem+json')
    return resultado.corpo
  }

  if (resultado.tipo === 'invalido') {
    setResponseStatus(event, 422)
    setResponseHeader(event, 'content-type', 'application/problem+json')
    return resultado.corpo
  }

  setResponseStatus(event, 201)
  return resultado.corpo
})
