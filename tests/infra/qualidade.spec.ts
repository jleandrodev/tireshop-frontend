import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, test } from 'vitest'

// T-0002 · REQ-00-02: pnpm lint, pnpm typecheck e pnpm format:check existem e falham quando devem.
// Este teste de fumaça escreve um arquivo de prova com o defeito, roda o binário de verdade (não a
// regra isolada) e confere a falha; depois remove o arquivo e confere que a baseline volta a passar.

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function rodar(script: 'typecheck' | 'lint' | 'format:check'): boolean {
  try {
    execFileSync('pnpm', ['run', script], { cwd: raiz, stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

// O typecheck do Nuxt só enxerga o que os tsconfig.*.json gerados incluem; tests/nuxt/** é um dos
// padrões que o Nuxt já reconhece (CA pensado para não exigir mexer em nuxt.config.ts nesta task).
const arquivoTipoInvalido = join(raiz, 'tests', 'nuxt', '_prova', 'tipo-invalido.ts')
const arquivoVariavelNaoUsada = join(raiz, 'tests', 'infra', '_prova', 'variavel-nao-usada.ts')
const arquivoMalFormatado = join(raiz, 'tests', 'infra', '_prova', 'mal-formatado.ts')

afterEach(() => {
  rmSync(arquivoTipoInvalido, { force: true })
  rmSync(arquivoVariavelNaoUsada, { force: true })
  rmSync(arquivoMalFormatado, { force: true })
})

describe('qualidade: lint, typecheck e formatação reprovam o que devem', () => {
  test('pnpm typecheck falha com um arquivo de prova que usa any implícito', () => {
    mkdirSync(dirname(arquivoTipoInvalido), { recursive: true })
    writeFileSync(
      arquivoTipoInvalido,
      'export function semTipo(valor) {\n  return valor.algumaCoisaQueNaoExiste\n}\n',
    )

    expect(rodar('typecheck')).toBe(false)
  }, 60_000)

  test('pnpm lint falha com um arquivo de prova que tem variável não usada', () => {
    mkdirSync(dirname(arquivoVariavelNaoUsada), { recursive: true })
    writeFileSync(
      arquivoVariavelNaoUsada,
      'export function comVariavelSolta(): number {\n  const naoUsada = 1\n  return 2\n}\n',
    )

    expect(rodar('lint')).toBe(false)
  }, 30_000)

  test('pnpm format:check falha com um arquivo de prova mal formatado', () => {
    mkdirSync(dirname(arquivoMalFormatado), { recursive: true })
    writeFileSync(arquivoMalFormatado, 'export const malFormatado = {a:1,   b:  2};\n')

    expect(rodar('format:check')).toBe(false)
  }, 30_000)

  test('os três passam sem os arquivos de prova', () => {
    expect(rodar('typecheck')).toBe(true)
    expect(rodar('lint')).toBe(true)
    expect(rodar('format:check')).toBe(true)
  }, 90_000)
})
