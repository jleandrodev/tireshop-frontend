import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { beforeAll, describe, expect, test } from 'vitest'

// T-0012 · REQ-00-10: o CI roda qualidade, testes, e2e e build, e cresce com o projeto. Este teste
// lê os arquivos de .github/ como dado (não os executa) e confere a forma deles.

const raiz = join(import.meta.dirname, '..', '..')
const SHA_COMPLETO = /^[0-9a-f]{40}$/

type Passo = {
  id?: string
  name?: string
  uses?: string
  run?: string
  with?: Record<string, unknown>
  if?: string
}
type Job = {
  name?: string
  if?: string
  needs?: string | string[]
  steps?: Passo[]
}
type Workflow = {
  on: Record<string, { branches?: string[] }>
  concurrency?: { group?: string; 'cancel-in-progress'?: boolean }
  permissions?: Record<string, string>
  jobs: Record<string, Job>
}

let ci: Workflow
let pr: Workflow
let ruleset: { rules: Array<{ type: string; parameters?: Record<string, unknown> }> }
let pacote: {
  scripts: Record<string, string>
  packageManager: string
  devDependencies: Record<string, string>
}
let dockerfile: string

beforeAll(() => {
  ci = parse(readFileSync(join(raiz, '.github', 'workflows', 'ci.yml'), 'utf8'))
  pr = parse(readFileSync(join(raiz, '.github', 'workflows', 'pr.yml'), 'utf8'))
  ruleset = JSON.parse(readFileSync(join(raiz, '.github', 'ruleset-main.json'), 'utf8'))
  pacote = JSON.parse(readFileSync(join(raiz, 'package.json'), 'utf8'))
  dockerfile = readFileSync(join(raiz, 'Dockerfile'), 'utf8')
})

function todosOsPassos(workflow: Workflow): Passo[] {
  return Object.values(workflow.jobs).flatMap((job) => job.steps ?? [])
}

function nomesDosJobs(...workflows: Workflow[]): Set<string> {
  return new Set(workflows.flatMap((w) => Object.values(w.jobs)).map((job) => job.name ?? ''))
}

// Só "pnpm run <script>" conta como script do pacote; "pnpm install" é comando do próprio pnpm,
// não um script de package.json — por isso o "run" aqui não é opcional.
function scriptsChamados(texto: string): string[] {
  return [...texto.matchAll(/\bpnpm run ([a-z][a-z0-9:_-]*)/g)].map((m) => m[1]!)
}

describe('ci.yml: gatilhos, concorrência e permissões', () => {
  test('roda em pull_request e em push na main', () => {
    expect(ci.on.pull_request?.branches).toContain('main')
    expect(ci.on.push?.branches).toContain('main')
  })

  test('cancela a execução anterior da mesma ref', () => {
    expect(ci.concurrency?.group).toBeTruthy()
    expect(ci.concurrency?.['cancel-in-progress']).toBe(true)
  })

  test('só lê o conteúdo do repositório', () => {
    expect(ci.permissions?.contents).toBe('read')
  })
})

describe('ci.yml e pr.yml: toda action fixada por SHA completo', () => {
  test('nenhum "uses" usa tag ou branch', () => {
    const usos = [...todosOsPassos(ci), ...todosOsPassos(pr)]
      .map((passo) => passo.uses)
      .filter((uso): uso is string => Boolean(uso))

    expect(usos.length).toBeGreaterThan(0)
    for (const uso of usos) {
      const sha = uso.split('@')[1]
      expect(sha, `"${uso}" não está fixado por SHA de 40 caracteres`).toMatch(SHA_COMPLETO)
    }
  })
})

describe('ci.yml: todo script chamado existe no package.json', () => {
  test('cada "pnpm <script>" citado em run: é um script real', () => {
    const chamados = new Set(
      todosOsPassos(ci)
        .map((passo) => passo.run)
        .filter((run): run is string => Boolean(run))
        .flatMap(scriptsChamados),
    )

    expect(chamados.size).toBeGreaterThan(0)
    for (const script of chamados) {
      expect(pacote.scripts, `pnpm ${script} não existe em package.json`).toHaveProperty(script)
    }
  })
})

describe('ci.yml: a imagem dev é construída com a versão certa do Node e com cache', () => {
  test('todo job que builda o alvo "dev" lê o .nvmrc e usa cache do GitHub Actions', () => {
    const jobsComBuild = Object.values(ci.jobs).filter((job) =>
      job.steps?.some(
        (p) => p.uses?.includes('docker/build-push-action') && p.with?.target === 'dev',
      ),
    )

    expect(jobsComBuild.length).toBeGreaterThan(0)
    for (const job of jobsComBuild) {
      const passoNvmrc = job.steps?.find((p) => p.id === 'node')
      expect(passoNvmrc?.run, `job "${job.name}" não lê a versão do .nvmrc`).toMatch(/\.nvmrc/)

      const passoBuild = job.steps?.find((p) => p.uses?.includes('docker/build-push-action'))
      const args = String(passoBuild?.with?.['build-args'] ?? '')
      expect(args, `job "${job.name}" não repassa NODE_VERSION do .nvmrc`).toMatch(
        /NODE_VERSION=\$\{\{\s*steps\.node\.outputs\.versao\s*\}\}/,
      )
      expect(passoBuild?.with?.['cache-from'], `job "${job.name}" não usa cache do build`).toMatch(
        /type=gha/,
      )
    }
  })
})

describe('ci.yml: instalação de dependências', () => {
  test('todo job que roda um script do pacote instala antes com --frozen-lockfile', () => {
    for (const [id, job] of Object.entries(ci.jobs)) {
      const passos = job.steps ?? []
      const rodaScript = passos.some((p) => p.run && scriptsChamados(p.run).length > 0)
      if (!rodaScript) continue

      const instala = passos.some(
        (p) => p.run?.includes('pnpm install') && p.run.includes('--frozen-lockfile'),
      )
      expect(
        instala,
        `job "${id}" roda um script do pacote sem "pnpm install --frozen-lockfile" antes`,
      ).toBe(true)
    }
  })
})

describe('ci.yml: os quatro jobs novos da T-0012 existem', () => {
  test('Qualidade roda format:check, lint, lint:marca e typecheck', () => {
    const job = Object.values(ci.jobs).find((j) => j.name === 'Qualidade')
    const run = job?.steps?.map((p) => p.run ?? '').join('\n') ?? ''

    expect(job, 'não existe um job chamado "Qualidade"').toBeTruthy()
    for (const script of ['format:check', 'lint', 'lint:marca', 'typecheck']) {
      expect(scriptsChamados(run), `job Qualidade não chama "pnpm ${script}"`).toContain(script)
    }
  })

  test('Testes roda a suíte de unidade com cobertura e guarda o relatório', () => {
    const job = Object.values(ci.jobs).find((j) => j.name === 'Testes')
    const run = job?.steps?.map((p) => p.run ?? '').join('\n') ?? ''
    const guardaCobertura = job?.steps?.some(
      (p) => p.uses?.includes('actions/upload-artifact') && p.with?.path === 'coverage/',
    )

    expect(job, 'não existe um job chamado "Testes"').toBeTruthy()
    expect(scriptsChamados(run)).toContain('test:cobertura')
    expect(guardaCobertura, 'o job Testes não guarda coverage/ como artefato').toBe(true)
  })

  test('E2E roda o Playwright dentro da imagem do projeto e guarda o relatório na falha', () => {
    const job = Object.values(ci.jobs).find((j) => j.name === 'E2E')
    const run = job?.steps?.map((p) => p.run ?? '').join('\n') ?? ''
    const constroiImagem = job?.steps?.some(
      (p) => p.uses?.includes('docker/build-push-action') && p.with?.target === 'dev',
    )
    const guardaRelatorio = job?.steps?.some(
      (p) => p.uses?.includes('actions/upload-artifact') && String(p.if ?? '').includes('failure'),
    )

    expect(job, 'não existe um job chamado "E2E"').toBeTruthy()
    expect(scriptsChamados(run)).toContain('test:e2e')
    expect(constroiImagem, 'o job E2E não builda a imagem dev do projeto').toBe(true)
    expect(guardaRelatorio, 'o job E2E não guarda o relatório do Playwright quando falha').toBe(
      true,
    )
  })

  test('Build roda o build de produção', () => {
    const job = Object.values(ci.jobs).find((j) => j.name === 'Build')
    const run = job?.steps?.map((p) => p.run ?? '').join('\n') ?? ''

    expect(job, 'não existe um job chamado "Build"').toBeTruthy()
    expect(scriptsChamados(run)).toContain('build')
  })
})

describe('ci.yml: todo job entra no agregador CI ok', () => {
  test('"ci-ok" espera por todos os outros jobs e nunca aprova um pulado', () => {
    const ciOk = ci.jobs['ci-ok']
    expect(ciOk?.if).toBe('always()')

    const outrosJobs = Object.keys(ci.jobs).filter((id) => id !== 'ci-ok')
    const needs = Array.isArray(ciOk?.needs) ? ciOk.needs : [ciOk?.needs].filter(Boolean)

    for (const id of outrosJobs) {
      expect(needs, `job "${id}" não está no needs do CI ok`).toContain(id)
    }
  })
})

describe('ruleset-main.json: só exige check que existe', () => {
  test('todo context de required_status_checks é o nome de um job real', () => {
    const regra = ruleset.rules.find((r) => r.type === 'required_status_checks')
    const contextos = (
      regra?.parameters?.required_status_checks as Array<{ context: string }> | undefined
    )?.map((c) => c.context)
    const existentes = nomesDosJobs(ci, pr)

    expect(contextos).toEqual(['CI ok', 'Título do PR'])
    for (const contexto of contextos ?? []) {
      expect(existentes, `o ruleset exige "${contexto}", que não é nome de nenhum job`).toContain(
        contexto,
      )
    }
  })
})

describe('Dockerfile e package.json: as mesmas versões', () => {
  test('PNPM_VERSION e PLAYWRIGHT_VERSION do Dockerfile batem com o package.json', () => {
    const pnpmDoDockerfile = dockerfile.match(/^ARG PNPM_VERSION=(.+)$/m)?.[1]
    const playwrightDoDockerfile = dockerfile.match(/^ARG PLAYWRIGHT_VERSION=(.+)$/m)?.[1]

    expect(pacote.packageManager).toBe(`pnpm@${pnpmDoDockerfile}`)
    expect(pacote.devDependencies['@playwright/test']).toBe(playwrightDoDockerfile)
  })
})
