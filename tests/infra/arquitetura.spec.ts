import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, test } from 'vitest'

// T-0004 · REQ-00-03: a estrutura de layers existe e a regra de dependência entre camadas e entre
// contextos é verificada pelo lint (ADR 0002). Como em T-0002, escreve um arquivo de prova com a
// violação, roda `pnpm lint` de verdade e confere a reprovação; depois remove e confere a baseline.

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function lintPassa(): boolean {
  try {
    execFileSync('pnpm', ['run', 'lint'], { cwd: raiz, stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

function escrever(caminhoRelativo: string, conteudo: string): string {
  const caminho = join(raiz, caminhoRelativo)
  mkdirSync(dirname(caminho), { recursive: true })
  writeFileSync(caminho, conteudo)
  return caminho
}

const arquivosDeProva: string[] = []
function prova(caminhoRelativo: string, conteudo: string): void {
  arquivosDeProva.push(escrever(caminhoRelativo, conteudo))
}

afterEach(() => {
  for (const arquivo of arquivosDeProva.splice(0)) {
    rmSync(arquivo, { force: true })
  }
})

describe('arquitetura: a regra de dependência entre camadas e contextos é verificada', () => {
  test('domain/ reprova importar vue, #imports, zod ou qualquer adapters/', () => {
    prova(
      'layers/catalogo/domain/_prova-vue.ts',
      "import { ref } from 'vue'\nexport const resultado = ref(1)\n",
    )
    prova(
      'layers/catalogo/domain/_prova-imports.ts',
      "import { useRuntimeConfig } from '#imports'\nexport const resultado = useRuntimeConfig()\n",
    )
    prova(
      'layers/catalogo/domain/_prova-zod.ts',
      "import { z } from 'zod'\nexport const resultado = z.string()\n",
    )
    prova(
      'layers/catalogo/domain/_prova-adapters.ts',
      "import { x } from '../adapters/http/produto.schema'\nexport const resultado = x\n",
    )

    expect(lintPassa()).toBe(false)
  }, 30_000)

  test('application/ reprova importar adapters/ ou ui/', () => {
    prova(
      'layers/catalogo/application/_prova-adapters.ts',
      "import { x } from '../adapters/http/produto'\nexport const resultado = x\n",
    )
    prova(
      'layers/catalogo/application/_prova-ui.ts',
      "import Card from '../ui/components/Card.vue'\nexport const resultado = Card\n",
    )

    expect(lintPassa()).toBe(false)
  }, 30_000)

  test('ui/ reprova importar adapters/', () => {
    prova(
      'layers/catalogo/ui/_prova.ts',
      "import { x } from '../adapters/http/produto'\nexport const resultado = x\n",
    )

    expect(lintPassa()).toBe(false)
  }, 30_000)

  test('um contexto reprova importar caminho interno de outro contexto', () => {
    prova(
      'layers/catalogo/application/_prova-cruzado.ts',
      "import { x } from '../../carrinho/domain/carrinho'\nexport const resultado = x\n",
    )

    expect(lintPassa()).toBe(false)
  }, 30_000)

  test('$fetch, useFetch e fetch reprovam fora de adapters/http e de server/', () => {
    prova(
      'layers/catalogo/application/_prova-fetch.ts',
      'export function chama() {\n  return $fetch("/api")\n}\n',
    )

    expect(lintPassa()).toBe(false)
  }, 30_000)

  test('a mesma chamada é aprovada dentro de adapters/http', () => {
    prova(
      'layers/catalogo/adapters/http/_prova-fetch.ts',
      'export function chama() {\n  return $fetch("/api")\n}\n',
    )

    expect(lintPassa()).toBe(true)
  }, 30_000)

  test('aprova a estrutura vazia criada nesta task', () => {
    expect(lintPassa()).toBe(true)
  }, 30_000)
})
