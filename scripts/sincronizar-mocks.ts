#!/usr/bin/env node
// T-0008 · REQ-00-07 (ADR 0003): mocks/fixtures é cópia viva de docs/api/examples.
//   node scripts/sincronizar-mocks.ts              # copia
//   node scripts/sincronizar-mocks.ts --conferir   # só confere (é o que o CI roda)
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const ORIGEM = join(raiz, 'docs', 'api', 'examples')
const DESTINO = join(raiz, 'mocks', 'fixtures')

function arquivosJson(pasta: string): string[] {
  if (!existsSync(pasta)) return []
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome)
    return statSync(caminho).isDirectory()
      ? arquivosJson(caminho)
      : nome.endsWith('.json')
        ? [caminho]
        : []
  })
}

function conferir(): void {
  const origem = new Map(arquivosJson(ORIGEM).map((c) => [relative(ORIGEM, c), c]))
  const destino = new Map(arquivosJson(DESTINO).map((c) => [relative(DESTINO, c), c]))
  const problemas: string[] = []

  for (const [rel, caminho] of origem) {
    const destinoCaminho = destino.get(rel)
    if (!destinoCaminho) {
      problemas.push(`faltando em mocks/fixtures: ${rel}`)
    } else if (readFileSync(caminho, 'utf8') !== readFileSync(destinoCaminho, 'utf8')) {
      problemas.push(`desatualizado em mocks/fixtures: ${rel}`)
    }
  }
  for (const rel of destino.keys()) {
    if (!origem.has(rel))
      problemas.push(`sobrando em mocks/fixtures (não existe em docs/api/examples): ${rel}`)
  }

  if (problemas.length > 0) {
    console.error('mocks/fixtures diverge de docs/api/examples:')
    console.error(problemas.map((p) => `  ${p}`).join('\n'))
    console.error('Rode: pnpm mocks:sincronizar')
    process.exit(1)
  }
  console.log(`mocks/fixtures em dia ....... ok (${origem.size} arquivos)`)
}

function sincronizar(): void {
  rmSync(DESTINO, { recursive: true, force: true })
  for (const caminho of arquivosJson(ORIGEM)) {
    const destino = join(DESTINO, relative(ORIGEM, caminho))
    mkdirSync(dirname(destino), { recursive: true })
    cpSync(caminho, destino)
  }
  console.log(`mocks/fixtures sincronizado (${arquivosJson(ORIGEM).length} arquivos)`)
}

if (process.argv.includes('--conferir')) {
  conferir()
} else {
  sincronizar()
}
