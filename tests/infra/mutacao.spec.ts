import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { beforeAll, describe, expect, test } from 'vitest'

// T-0121 · REQ-01-21 (RNF-07, ADR 0005): o teste de mutação mostra onde os testes do domínio e
// da aplicação não pegam defeito. Este teste lê a configuração como dado (não roda o Stryker:
// uma mutação de verdade leva minutos) e confere a forma dela.

const raiz = join(import.meta.dirname, '..', '..')
const SHA_COMPLETO = /^[0-9a-f]{40}$/

type Passo = { uses?: string; run?: string }
type Job = { steps?: Passo[] }
type Workflow = {
  on: Record<string, unknown>
  permissions?: Record<string, string>
  jobs: Record<string, Job>
}

let stryker: {
  testRunner: string
  vitest?: { configFile?: string }
  mutate: string[]
  thresholds: { break: number }
}
let vitestMutacao: string
let mutacaoYml: Workflow
let pacote: { scripts: Record<string, string> }

beforeAll(async () => {
  stryker = (await import('../../stryker.config.mjs')).default
  vitestMutacao = readFileSync(join(raiz, 'vitest.mutacao.config.ts'), 'utf8')
  mutacaoYml = parse(readFileSync(join(raiz, '.github', 'workflows', 'mutacao.yml'), 'utf8'))
  pacote = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8'))
})

describe('stryker.config.mjs: muta só domain e application do kernel', () => {
  test('inclui layers/*/domain/** e layers/*/application/**', () => {
    expect(stryker.mutate).toContain('layers/*/domain/**/*.ts')
    expect(stryker.mutate).toContain('layers/*/application/**/*.ts')
  })

  test('exclui *.spec.ts, __fabricas__/ e __falsos__/', () => {
    const exclusoes = stryker.mutate.filter((padrao) => padrao.startsWith('!'))
    expect(exclusoes.some((p) => p.includes('*.spec.ts'))).toBe(true)
    expect(exclusoes.some((p) => p.includes('__fabricas__'))).toBe(true)
    expect(exclusoes.some((p) => p.includes('__falsos__'))).toBe(true)
  })
})

describe('stryker.config.mjs: usa o executor do Vitest, só o projeto "unidade"', () => {
  test('testRunner é vitest, com uma config dedicada', () => {
    expect(stryker.testRunner).toBe('vitest')
    expect(stryker.vitest?.configFile).toBe('vitest.mutacao.config.ts')
  })

  test('a config dedicada não define múltiplos projetos (sem "nuxt")', () => {
    // só o comentário pode citar "nuxt" (explicando por que ele está de fora); a config em si
    // não pode ter um array "projects" — é isso que provaria que só roda o "unidade".
    expect(vitestMutacao).not.toContain('projects:')
  })
})

describe('stryker.config.mjs: o limite que reprova é 80, em um lugar só', () => {
  test('thresholds.break é 80', () => {
    expect(stryker.thresholds.break).toBe(80)
  })
})

describe('package.json: o script test:mutacao existe', () => {
  test('chama o Stryker', () => {
    expect(pacote.scripts['test:mutacao']).toBe('stryker run')
  })
})

describe('mutacao.yml: agenda semanal e sob demanda, nunca em pull_request', () => {
  test('gatilhos', () => {
    expect(mutacaoYml.on).not.toHaveProperty('pull_request')
    expect(mutacaoYml.on).toHaveProperty('workflow_dispatch')
    const agenda = (mutacaoYml.on as { schedule?: Array<{ cron: string }> }).schedule
    expect(agenda).toEqual([{ cron: '0 6 * * 1' }])
  })

  test('permissions mínimas: só contents: read', () => {
    expect(mutacaoYml.permissions).toEqual({ contents: 'read' })
  })

  test('toda action fixada por SHA completo', () => {
    const usos = Object.values(mutacaoYml.jobs)
      .flatMap((job) => job.steps ?? [])
      .map((passo) => passo.uses)
      .filter((uso): uso is string => Boolean(uso))

    expect(usos.length).toBeGreaterThan(0)
    for (const uso of usos) {
      const sha = uso.split('@')[1]
      expect(sha, `"${uso}" não está fixado por SHA de 40 caracteres`).toMatch(SHA_COMPLETO)
    }
  })

  test('o relatório fica como artefato por 30 dias', () => {
    const passos = Object.values(mutacaoYml.jobs).flatMap((job) => job.steps ?? [])
    const uploadDeArtefato = passos.find((passo) =>
      passo.uses?.startsWith('actions/upload-artifact@'),
    ) as (Passo & { with?: { 'retention-days'?: number } }) | undefined

    expect(uploadDeArtefato?.with?.['retention-days']).toBe(30)
  })
})
