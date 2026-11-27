// T-0008 · REQ-00-07 (ADR 0003): o mock é um conjunto de rotas Nitro, não um servidor aparte.
// `responderFixture` é a lógica pura — sem `#imports`, sem Nitro — para ser testável com Vitest
// puro; a rota (`server/api/mock/*.get.ts`) é só o invólucro que liga `getQuery`/`useRuntimeConfig`
// a isto.
//
// A base interna lida direto de `process.env`: é exatamente o que `useRuntimeConfig().public.apiBase`
// leria em runtime (Nuxt expõe `NUXT_PUBLIC_<CHAVE>` assim), sem depender do Nitro para testar.
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const BASE_INTERNA = '/api/mock'

export type Problema = {
  type: string
  title: string
  status: number
  instance?: string
}

export type ResultadoMock =
  | { tipo: 'desligado' }
  | { tipo: 'falha'; status: number; corpo: Problema }
  | { tipo: 'ok'; corpo: unknown }

export type ResultadoDeRede =
  { tipo: 'desligado' } | { tipo: 'falha'; status: number; corpo: Problema } | { tipo: 'pronto' }

export function apiBaseAtual(): string {
  return process.env.NUXT_PUBLIC_API_BASE || BASE_INTERNA
}

function numeroDaQuery(valor: unknown): number | undefined {
  const n = Number(valor)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/** `?_atraso`/`?_falha`/mock desligado — comum a toda rota do mock. Devolve `'pronto'` quando a
 *  rota deve seguir com a própria lógica (T-0217: a primeira rota além de servir uma fixture). */
export async function simularRede(
  query: Record<string, unknown>,
  instancia: string,
): Promise<ResultadoDeRede> {
  if (apiBaseAtual() !== BASE_INTERNA) {
    return { tipo: 'desligado' }
  }

  const atraso = numeroDaQuery(query._atraso)
  if (atraso) {
    await new Promise((resolve) => setTimeout(resolve, atraso))
  }

  const falha = numeroDaQuery(query._falha)
  if (falha) {
    return {
      tipo: 'falha',
      status: falha,
      corpo: {
        type: 'https://api.tireshop.com.br/erros/simulado',
        title: 'Falha simulada',
        status: falha,
        instance: instancia,
      },
    }
  }

  return { tipo: 'pronto' }
}

export async function responderFixture(opcoes: {
  query: Record<string, unknown>
  instancia: string
  lerFixture: () => Promise<unknown>
}): Promise<ResultadoMock> {
  const rede = await simularRede(opcoes.query, opcoes.instancia)
  if (rede.tipo !== 'pronto') return rede

  return { tipo: 'ok', corpo: await opcoes.lerFixture() }
}

/** Lê mocks/fixtures/{nome}.json (cópia viva de docs/api/examples, via `pnpm mocks:sincronizar`). */
export async function lerFixtureJson(nome: string): Promise<unknown> {
  const caminho = join(process.cwd(), 'mocks', 'fixtures', `${nome}.json`)
  return JSON.parse(await readFile(caminho, 'utf8'))
}
