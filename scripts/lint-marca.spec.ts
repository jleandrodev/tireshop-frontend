import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { analisar, blocosDeEstilo } from './lint-marca'

// T-0006 · REQ-00-05 (ADR 0006): o lint de marca reprova cor literal e verde fora de ação.

describe('analisar: cor literal fora dos tokens', () => {
  test('reprova #hex', () => {
    expect(analisar('.x { color: #ff0000; }')).toHaveLength(1)
  })

  test('reprova rgb()', () => {
    expect(analisar('.x { color: rgb(255, 0, 0); }')).toHaveLength(1)
  })

  test('reprova hsl()', () => {
    expect(analisar('.x { color: hsl(0, 100%, 50%); }')).toHaveLength(1)
  })

  test('reprova nome de cor', () => {
    expect(analisar('.x { color: red; }')).toHaveLength(1)
  })

  test('aprova var(--token)', () => {
    expect(analisar('.x { color: var(--ts-text); }')).toHaveLength(0)
  })

  test('não confunde nome de classe com nome de cor', () => {
    expect(analisar('.gold-badge { color: var(--ts-text); }')).toHaveLength(0)
  })
})

describe('analisar: tipografia fora dos tokens', () => {
  test('reprova @font-face', () => {
    expect(analisar("@font-face { font-family: 'X'; src: url(x.woff2); }")[0]?.mensagem).toMatch(
      /@font-face/,
    )
  })

  test('reprova font-family literal', () => {
    expect(analisar('.x { font-family: Arial, sans-serif; }')[0]?.mensagem).toMatch(/família/)
  })

  test('aprova font-family: var(...)', () => {
    expect(analisar('.x { font-family: var(--font-sans); }')).toHaveLength(0)
  })
})

describe('analisar: amarelo como cor de texto', () => {
  test('reprova sem o comentário', () => {
    expect(analisar('.x { color: var(--ts-brand); }')[0]?.mensagem).toMatch(/amarelo/)
  })

  test('aprova com /* sobre preto */', () => {
    expect(analisar('.x { color: var(--ts-brand); /* sobre preto */ }')).toHaveLength(0)
  })

  test('amarelo como fundo não é restrito (só como texto)', () => {
    expect(analisar('.x { background: var(--ts-brand); }')).toHaveLength(0)
  })
})

describe('analisar: verde de ação só no botão de ação', () => {
  test('reprova var(--ts-acao) fora de .ts-btn--acao', () => {
    const achados = analisar('.x { background: var(--ts-acao); }')
    expect(achados).toHaveLength(1)
    expect(achados[0]?.mensagem).toMatch(/ts-btn--acao/)
  })

  test('aprova dentro de .ts-btn--acao', () => {
    expect(
      analisar('.ts-btn--acao { background: var(--ts-acao); color: var(--ts-on-acao); }'),
    ).toHaveLength(0)
  })

  test('aprova em .ts-btn--acao:hover', () => {
    expect(analisar('.ts-btn--acao:hover { background: var(--ts-acao-escuro); }')).toHaveLength(0)
  })

  test('aprova em seletor composto que contém .ts-btn--acao', () => {
    expect(analisar('.ts-filtro .ts-btn--acao { background: var(--ts-acao); }')).toHaveLength(0)
  })

  test('reprova --ts-acao-escuro e --ts-on-acao também', () => {
    expect(analisar('.x:hover { background: var(--ts-acao-escuro); }')).toHaveLength(1)
    expect(analisar('.x { color: var(--ts-on-acao); }')).toHaveLength(1)
  })

  test('aprova a exceção nomeada do selo de confiança', () => {
    expect(analisar('.ts-selo-loja__icone { color: var(--ts-acao); }')).toHaveLength(0)
  })
})

describe('blocosDeEstilo: extrai só o <style> do .vue, preservando a linha', () => {
  test('o achado aponta a linha certa do arquivo .vue inteiro', () => {
    const vue = [
      '<template>',
      '  <div />',
      '</template>',
      '<style>',
      '.x { color: red; }',
      '</style>',
    ].join('\n')
    const achados = analisar(blocosDeEstilo(vue))
    expect(achados[0]?.linha).toBe(5)
  })

  test('sem <style>, não acusa nada do <template>', () => {
    const vue = ['<template>', '  <div style="color: red" />', '</template>'].join('\n')
    expect(analisar(blocosDeEstilo(vue))).toHaveLength(0)
  })
})

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')

describe('o CSS vindo do protótipo passa, sem alteração', () => {
  const arquivos = [
    'base.css',
    'componentes.css',
    'catalogo.css',
    'comparar.css',
    'home.css',
    'institucional.css',
  ]

  test.each(arquivos)('%s', (nome) => {
    const conteudo = readFileSync(join(raiz, 'app', 'assets', 'css', nome), 'utf8')
    expect(analisar(conteudo)).toEqual([])
  })
})

describe('pnpm run lint:marca', () => {
  test('passa no CSS atual do projeto', () => {
    expect(() =>
      execFileSync('pnpm', ['run', 'lint:marca'], { cwd: raiz, stdio: 'pipe' }),
    ).not.toThrow()
  }, 30_000)
})
