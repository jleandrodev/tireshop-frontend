// T-0008 · REQ-00-07: a primeira rota do mock, para provar o mecanismo (server/utils/mock.ts).
// Import explícito (não `#imports`): mantém `server/utils/mock.ts` testável fora do Nitro.
import { createError, defineEventHandler, getQuery, setResponseHeader, setResponseStatus } from 'h3'
import { lerFixtureJson, responderFixture } from '../../utils/mock'

export default defineEventHandler(async (event) => {
  const resultado = await responderFixture({
    query: getQuery(event),
    instancia: event.path,
    lerFixture: () => lerFixtureJson('navegacao'),
  })

  if (resultado.tipo === 'desligado') {
    throw createError({ statusCode: 404, statusMessage: 'Mock desligado' })
  }

  if (resultado.tipo === 'falha') {
    setResponseStatus(event, resultado.status)
    setResponseHeader(event, 'content-type', 'application/problem+json')
    return resultado.corpo
  }

  return resultado.corpo
})
