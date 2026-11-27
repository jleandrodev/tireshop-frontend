#!/usr/bin/env node
import { globSync, readFileSync } from 'node:fs'

// T-0006 · REQ-00-05 (ADR 0006): a identidade visual mora só nos tokens. Porta
// tools/brand_lint.py (repositório de discovery) para o projeto, mais duas regras que não
// existiam lá: nome de cor (não só #hex/rgb/hsl) e o verde de ação restrito a botão de ação.
//
//   node scripts/lint-marca.ts    # é o que `pnpm run lint:marca` chama

const IGNORA_DIRETORIOS = ['node_modules', '.nuxt', '.output', '.data', 'dist', 'coverage']

const COR_FUNCAO = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/
const FAMILIA = /font-family:\s*([^;}\n]*)/
const AMARELO_TEXTO = /(?<![-\w])color:\s*var\(--(ts-brand|brand-amarelo)\)/
const EXCECAO_AMARELO = '/* sobre preto */'
const TS_ACAO = /var\(--(ts-acao(?:-escuro)?|ts-on-acao)\)/g
const SELETOR_ACAO = '.ts-btn--acao'

// Exceções nomeadas: nenhuma sem seletor e motivo (mesmo padrão de tests/e2e/_axe-excecoes.ts).
// Revisar com o design antes da T-1314: o ícone de selo é decorativo, mas usar o verde de ação
// fora de um controle clicável está no limite do que a ADR 0006 descreve.
const EXCECOES_ACAO = new Set<string>([
  '.ts-selo-loja__icone', // ícone do selo de confiança no rodapé da loja, não é botão
])

// As 147 cores nomeadas do CSS (Color Module Level 4), sem os keywords que não são "uma cor da
// paleta" (transparent, currentcolor, inherit...).
const CORES_NOMEADAS = new Set(
  `aliceblue antiquewhite aqua aquamarine azure beige bisque black blanchedalmond blue blueviolet
  brown burlywood cadetblue chartreuse chocolate coral cornflowerblue cornsilk crimson cyan
  darkblue darkcyan darkgoldenrod darkgray darkgreen darkgrey darkkhaki darkmagenta darkolivegreen
  darkorange darkorchid darkred darksalmon darkseagreen darkslateblue darkslategray darkslategrey
  darkturquoise darkviolet deeppink deepskyblue dimgray dimgrey dodgerblue firebrick floralwhite
  forestgreen fuchsia gainsboro ghostwhite gold goldenrod gray green greenyellow grey honeydew
  hotpink indianred indigo ivory khaki lavender lavenderblush lawngreen lemonchiffon lightblue
  lightcoral lightcyan lightgoldenrodyellow lightgray lightgreen lightgrey lightpink lightsalmon
  lightseagreen lightskyblue lightslategray lightslategrey lightsteelblue lightyellow lime
  limegreen linen magenta maroon mediumaquamarine mediumblue mediumorchid mediumpurple
  mediumseagreen mediumslateblue mediumspringgreen mediumturquoise mediumvioletred midnightblue
  mintcream mistyrose moccasin navajowhite navy oldlace olive olivedrab orange orangered orchid
  palegoldenrod palegreen paleturquoise palevioletred papayawhip peachpuff peru pink plum
  powderblue purple rebeccapurple red rosybrown royalblue saddlebrown salmon sandybrown seagreen
  seashell sienna silver skyblue slateblue slategray slategrey snow springgreen steelblue tan teal
  thistle tomato turquoise violet wheat white whitesmoke yellow yellowgreen`
    .split(/\s+/)
    .filter(Boolean),
)
const VALOR_NOMEADO =
  /(?<![-\w#.])(?:color|background|background-color|border(?:-\w+)?-color|fill|stroke)\s*:\s*([a-zA-Z]+)\s*(?:!important)?\s*[;}]/g

export type Achado = { linha: number; mensagem: string }

/** Tira /* ... *\/ do CSS, mantendo as quebras de linha (os números não podem mudar). */
function semComentarios(texto: string): string {
  return texto.replace(/\/\*[\s\S]*?\*\//g, (m) => '\n'.repeat(m.split('\n').length - 1))
}

function linhaDoIndice(texto: string, indice: number): number {
  return texto.slice(0, indice).split('\n').length
}

/** A regra nova: var(--ts-acao...) só dentro de um seletor que contém .ts-btn--acao. */
function achadosDeAcaoForaDoBotao(textoSemComentarios: string): Achado[] {
  const achados: Achado[] = []
  const blocos = textoSemComentarios.matchAll(/([^{}]*)\{([^{}]*)\}/g)
  for (const bloco of blocos) {
    const [, seletor, declaracoes] = bloco
    if (!declaracoes || !TS_ACAO.test(declaracoes)) continue
    TS_ACAO.lastIndex = 0
    const seletorLimpo = (seletor ?? '').trim()
    const temExcecao = [...EXCECOES_ACAO].some((excecao) => seletorLimpo.includes(excecao))
    if (!seletorLimpo.includes(SELETOR_ACAO) && !temExcecao) {
      achados.push({
        linha: linhaDoIndice(textoSemComentarios, bloco.index ?? 0),
        mensagem: `verde de ação fora de um seletor "${SELETOR_ACAO}" — seletor: ${(seletor ?? '').trim().slice(0, 60)}`,
      })
    }
  }
  return achados
}

/** Analisa um CSS (já isolado de <style>, se vier de .vue) e devolve os achados, 1 por problema. */
export function analisar(conteudo: string): Achado[] {
  const achados: Achado[] = []
  const semComentario = semComentarios(conteudo)
  const linhasCruas = conteudo.split('\n')
  const linhasLimpas = semComentario.split('\n')

  linhasLimpas.forEach((linha, i) => {
    const n = i + 1
    if (COR_FUNCAO.test(linha)) {
      achados.push({ linha: n, mensagem: `cor literal — ${linha.trim().slice(0, 70)}` })
    }
    if (linha.includes('@font-face')) {
      achados.push({ linha: n, mensagem: '@font-face fora dos tokens' })
    }
    for (const valor of linha.matchAll(new RegExp(FAMILIA, 'g'))) {
      if (!valor[1]?.trim().startsWith('var(')) {
        achados.push({ linha: n, mensagem: `família literal — ${valor[1]?.trim().slice(0, 60)}` })
      }
    }
    for (const valor of linha.matchAll(new RegExp(VALOR_NOMEADO, 'g'))) {
      if (CORES_NOMEADAS.has(valor[1]!.toLowerCase())) {
        achados.push({ linha: n, mensagem: `cor literal (nome) — ${linha.trim().slice(0, 70)}` })
      }
    }
    if (AMARELO_TEXTO.test(linha) && !(linhasCruas[i] ?? '').includes(EXCECAO_AMARELO)) {
      achados.push({
        linha: n,
        mensagem: `amarelo como cor de texto — ${linha.trim().slice(0, 60)}`,
      })
    }
  })

  achados.push(...achadosDeAcaoForaDoBotao(semComentario))
  return achados.sort((a, b) => a.linha - b.linha)
}

/** Extrai o conteúdo de cada bloco <style> de um .vue, com '\n' no lugar do que ficou fora, para
 *  o número de linha do achado continuar sendo o do arquivo .vue inteiro. */
export function blocosDeEstilo(conteudoVue: string): string {
  let ultimoFim = 0
  let saida = ''
  for (const bloco of conteudoVue.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    const inicioDoConteudo = (bloco.index ?? 0) + bloco[0].indexOf(bloco[1]!)
    saida += '\n'.repeat(conteudoVue.slice(ultimoFim, inicioDoConteudo).split('\n').length - 1)
    saida += bloco[1]
    ultimoFim = inicioDoConteudo + bloco[1]!.length
  }
  return saida
}

function arquivosAlvo(): string[] {
  // `exclude` do fs.globSync só poda diretório na varredura (não filtra o arquivo final):
  // https://nodejs.org/api/fs.html#fsglobsyncpattern-options — por isso o filtro vem depois.
  const css = globSync('app/assets/css/*.css').filter(
    (caminho) => !/^tokens.*\.css$/.test(caminho.split('/').pop() ?? ''),
  )
  const vue = globSync('**/*.vue', {
    exclude: (caminho) => IGNORA_DIRETORIOS.some((dir) => caminho.split('/').includes(dir)),
  })
  return [...css, ...vue]
}

function main(): void {
  const arquivos = arquivosAlvo()
  const problemas: string[] = []
  for (const arquivo of arquivos) {
    const bruto = readFileSync(arquivo, 'utf8')
    const conteudo = arquivo.endsWith('.vue') ? blocosDeEstilo(bruto) : bruto
    for (const achado of analisar(conteudo)) {
      problemas.push(`  ${arquivo}:${achado.linha}  ${achado.mensagem}`)
    }
  }
  if (problemas.length > 0) {
    console.error('LINT DE MARCA FALHOU — identidade vazando para fora dos tokens:')
    console.error(problemas.join('\n'))
    process.exit(1)
  }
  console.log(`lint de marca ....... ok (${arquivos.length} arquivos)`)
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main()
}
