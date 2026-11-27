// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  // SSR é decisão de arquitetura (ADR 0001); fica explícito para ninguém desligar por engano.
  ssr: true,
  devtools: { enabled: false },
  // T-0005 (REQ-00-04, ADR 0006): tokens, fontes e componentes do protótipo, em toda página. As
  // folhas de página (catalogo, comparar, home, institucional) ficam em app/assets/css/ para
  // import explícito de cada página, não entram aqui.
  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/tokens-web.css',
    '~/assets/css/tokens-acao.css',
    '~/assets/css/tokens-terceiros.css',
    '~/assets/css/tokens-fonts-web.css',
    '~/assets/css/base.css',
    '~/assets/css/componentes.css',
  ],
  // T-0004 (REQ-00-03, ADR 0002): o kernel compartilhado e as sete layers de contexto. O Nuxt já
  // descobre tudo em layers/* por convenção; listar aqui deixa a ordem explícita e documentada,
  // em vez de depender só da varredura automática.
  extends: [
    './layers/shared',
    './layers/catalogo',
    './layers/carrinho',
    './layers/entrega',
    './layers/lojas',
    './layers/conteudo',
    './layers/avaliacoes',
    './layers/relacionamento',
  ],
})
