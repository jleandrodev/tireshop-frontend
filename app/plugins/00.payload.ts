import { Imagem } from '~~/layers/shared'

// T-0205: `Imagem` (T-0107) é uma classe — o serializador do payload do Nuxt (devalue) só sabe
// serializar POJOs; sem isto, qualquer `useAsyncData` que devolva uma `Imagem` em algum campo
// (ex.: o logo de cada marca em `Navegacao`) derruba o SSR com "Cannot stringify arbitrary
// non-POJOs" (achado só ao renderizar, de verdade, a primeira página com dado real — nenhum
// teste de unidade serializa o payload). Nomeado "00." para registrar antes de qualquer outro
// plugin produzir dado para o payload.
type ImagemSerializada = [src: string, largura: number, altura: number, alt: string]

export default definePayloadPlugin(() => {
  definePayloadReducer(
    'Imagem',
    (dado): ImagemSerializada | false =>
      dado instanceof Imagem && [dado.src, dado.largura, dado.altura, dado.alt],
  )
  definePayloadReviver('Imagem', ([src, largura, altura, alt]: ImagemSerializada) => {
    const resultado = Imagem.de({ src, largura, altura, alt })
    return resultado.ok ? resultado.valor : undefined
  })
})
