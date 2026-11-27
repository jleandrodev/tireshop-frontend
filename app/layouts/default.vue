<script setup lang="ts">
// T-0205..T-0218 · REQ-02-02 (RNF-01, RNF-02): a moldura do site, nesta ordem — link "Pular para
// o conteúdo", cabeçalho, main#conteudo, lugar da faixa de avaliações, rodapé, botão do
// WhatsApp, aviso de cookies e lugar do minicart. "faixa" (avaliações) e "minicart" (carrinho)
// ficam vazios até os módulos 07 e 06. O botão do WhatsApp é montado dentro de `SiteRodape` (não
// aqui) — ver Decisões da T-0211 em specs/02-conteudo-navegacao/tasks.md: um `useNavegacao()` a
// mais neste nível quebrava "uma única chamada à porta" (o pai termina a própria busca antes dos
// filhos começarem a deles, fora da janela em que o Nuxt reaproveita a mesma promessa).
// `AvisoCookies` não busca nada (só localStorage) — sem esse risco, entra aqui direto.
// `FormularioNewsletter` (T-0218) não busca nada ao montar (só envia, sob ação do usuário) — vai
// no lugar "newsletter" de `SiteRodape`, passado por aqui, sem o mesmo risco do WhatsApp.
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
  <SiteRodape>
    <template #newsletter>
      <FormularioNewsletter />
    </template>
  </SiteRodape>
  <AvisoCookies />
  <slot name="minicart" />
</template>
