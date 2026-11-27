import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { sprite } from '../../layers/shared/ui/sprite'

// T-0007 · REQ-00-06: as imagens e os ícones do protótipo estão no projeto. A fundo (como cada
// ícone chega ao sprite) é testada em layers/shared/ui/sprite.spec.ts; aqui é o contrato:
// o que a API cita, e o que o projeto usa, existe de verdade.

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function arquivosJson(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome)
    if (statSync(caminho).isDirectory()) return arquivosJson(caminho)
    return nome.endsWith('.json') ? [caminho] : []
  })
}

function imagensCitadas(): string[] {
  const citadas = new Set<string>()
  for (const arquivo of arquivosJson(join(raiz, 'docs', 'api', 'examples'))) {
    const conteudo = readFileSync(arquivo, 'utf8')
    for (const achado of conteudo.matchAll(/"(\/img\/[^"]+\.(?:png|jpe?g|webp|gif|svg))"/g)) {
      citadas.add(achado[1]!)
    }
  }
  return [...citadas].sort()
}

describe('imagens: todo src citado em docs/api/examples existe em public/', () => {
  const imagens = imagensCitadas()

  test('as fixtures citam alguma imagem', () => {
    expect(imagens.length).toBeGreaterThan(0)
  })

  test.each(imagens)('%s', (caminho) => {
    expect(existsSync(join(raiz, 'public', caminho)), `não existe public${caminho}`).toBe(true)
  })
})

describe('ícones: o sprite contém os usados pelo protótipo', () => {
  test.each(['i-whatsapp', 'i-shopping-cart', 'i-chevron-down', 'i-mdi-car-side', 'i-star-cheia'])(
    '%s',
    (id) => {
      expect(sprite, `falta o símbolo ${id}`).toContain(`id="${id}"`)
    },
  )
})
