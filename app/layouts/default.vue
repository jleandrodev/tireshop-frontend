<script setup lang="ts">
// T-0205..T-0212 · REQ-02-02 (RNF-01, RNF-02): a moldura do site, nesta ordem — link "Pular para
// o conteúdo", cabeçalho, main#conteudo, lugar da faixa de avaliações, rodapé, botão do
// WhatsApp, aviso de cookies e lugar do minicart. O conteúdo de "faixa"/"minicart" chega na
// T-0218. O botão do WhatsApp é montado dentro de `SiteRodape` (não aqui) — ver Decisões da
// T-0211 em specs/02-conteudo-navegacao/tasks.md: um `useNavegacao()` a mais neste nível
// quebrava "uma única chamada à porta" (o pai termina a própria busca antes dos filhos
// começarem a deles, fora da janela em que o Nuxt reaproveita a mesma promessa). `AvisoCookies`
// não busca nada (só localStorage) — sem esse risco, entra aqui direto.
</script>

<template>
  <a href="#conteudo" class="ts-skip">Pular para o conteúdo</a>
  <!-- T-0206/T-0208: a contagem real do carrinho e a lista de lojas são dos módulos 06 e 12
       (fora do escopo até lá). -->
  <SiteCabecalho :quantidade-no-carrinho="0" :lojas="[]" />
  <main id="conteudo" tabindex="-1">
    <slot />
  </main>
  <slot name="faixa" />
  <SiteRodape />
  <AvisoCookies />
  <slot name="minicart" />
</template>
