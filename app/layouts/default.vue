<script setup lang="ts">
// T-0205 · REQ-02-02 (RNF-01, RNF-02): a moldura do site, nesta ordem — link "Pular para o
// conteúdo", cabeçalho, main#conteudo, lugar da faixa de avaliações, rodapé e lugar do minicart.
// Barra de topo, menus, WhatsApp, cookies e o conteúdo de "faixa"/"minicart" chegam nas próximas
// tasks (T-0206 a T-0212, T-0218); os lugares já existem, vazios, para não mudar o layout de novo.
</script>

<template>
  <a href="#conteudo" class="ts-skip">Pular para o conteúdo</a>
  <SiteCabecalho />
  <main id="conteudo" tabindex="-1">
    <slot />
  </main>
  <slot name="faixa" />
  <SiteRodape />
  <slot name="minicart" />
</template>
