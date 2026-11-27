// T-0007 · REQ-00-06 (ADR 0006): porta tools/hifi/build.py (sprite()) do repositório de
// discovery. Um <svg> escondido com um <symbol> por ícone; Icone.vue referencia por #id.
// `import.meta.glob` resolve os SVGs em tempo de build (Vite): nada de node:fs em runtime,
// funciona igual no servidor e no cliente.
const TRACO =
  'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'

export type ArquivosDeIcones = {
  marcas: Record<string, string>
  mdi: Record<string, string>
  lucide: Record<string, string>
  custom: Record<string, string>
}

function nomeDoArquivo(caminho: string): string {
  return caminho
    .split('/')
    .pop()!
    .replace(/\.svg$/, '')
}

function corpoDoSvg(conteudo: string): string {
  const inicio = conteudo.indexOf('>', conteudo.indexOf('<svg')) + 1
  const fim = conteudo.lastIndexOf('</svg>')
  return conteudo.slice(inicio, fim)
}

function porNome(mapa: Record<string, string>): Array<[string, string]> {
  return Object.entries(mapa).sort(([a], [b]) => nomeDoArquivo(a).localeCompare(nomeDoArquivo(b)))
}

/** Porta tools/hifi/build.py: Lucide (ISC) + 3 próprios, de traço; marcas (Simple Icons) e
 *  departamentos (MDI, prefixo i-mdi-), de preenchimento. */
export function montarSprite(arquivos: ArquivosDeIcones): string {
  const simbolos: string[] = []

  for (const [pasta, prefixo] of [
    [arquivos.marcas, 'i-'],
    [arquivos.mdi, 'i-mdi-'],
  ] as const) {
    for (const [caminho, conteudo] of porNome(pasta)) {
      const corpo = corpoDoSvg(conteudo).replace(/<title>[\s\S]*?<\/title>/, '')
      simbolos.push(
        `<symbol id="${prefixo}${nomeDoArquivo(caminho)}" viewBox="0 0 24 24" fill="currentColor">${corpo}</symbol>`,
      )
    }
  }

  for (const pasta of [arquivos.lucide, arquivos.custom]) {
    for (const [caminho, conteudo] of porNome(pasta)) {
      const nome = nomeDoArquivo(caminho)
      const corpo = corpoDoSvg(conteudo)
        .replace(/<!--[\s\S]*?-->/g, '')
        .trim()
      simbolos.push(`<symbol id="i-${nome}" ${TRACO}>${corpo}</symbol>`)
      if (nome === 'star') {
        const cheia = TRACO.replace('fill="none"', 'fill="currentColor"')
        simbolos.push(`<symbol id="i-star-cheia" ${cheia}>${corpo}</symbol>`)
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${simbolos.join('')}</svg>`
}

// Relativo ao próprio arquivo (layers/shared/ui/sprite.ts → ../../../app/assets/icons/): um glob
// relativo nunca depende de qual "root" o Vite está usando no momento (dev, build ou Vitest
// podem diferir — foi isso que quebrou com um glob a partir de "/", raiz do projeto).
const arquivosReais: ArquivosDeIcones = {
  marcas: import.meta.glob('../../../app/assets/icons/marcas/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
  mdi: import.meta.glob('../../../app/assets/icons/mdi/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
  lucide: import.meta.glob('../../../app/assets/icons/lucide/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
  custom: import.meta.glob('../../../app/assets/icons/custom/*.svg', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>,
}

/** O sprite com todos os ícones do projeto, pronto para ir ao DOM uma vez por página. */
export const sprite: string = montarSprite(arquivosReais)
