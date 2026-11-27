// T-0120: o `nuxt dev` compila cada rota só na primeira visita (Vite/Nitro on-demand). A página
// de prova do kernel importa muito mais módulo que a Home (14 componentes, 2 folhas de CSS extra)
// — sem isso, os 6 workers batiam nela ao mesmo tempo, pela primeira vez, e a compilação disputada
// atrasava até testes de outro arquivo que nem usam essa página (achado rodando a suíte inteira
// repetidas vezes: sozinho sempre passava rápido; junto, o primeiro lote de testes esgotava o
// tempo limite). Esquenta a rota uma vez, sequencial, antes dos workers em paralelo.
export default async function globalSetup(): Promise<void> {
  await fetch('http://localhost:3000/_prova/kernel')
}
