<script setup lang="ts">
import '~/assets/css/catalogo.css'

// T-0219 · REQ-02-15: só pro e2e provar que `BotaoWhatsapp` com `acima-da-barra` não cobre uma
// barra fixa nem o aviso de cookies — nenhuma página real tem uma barra fixa ainda (chega nos
// módulos 03 e 04, ver Fora do escopo da T-0211); igual a `/_prova/kernel`, nunca uma tela de
// verdade. `layout: false`: sem cabeçalho/rodapé reais, que montariam um segundo
// `BotaoWhatsapp` (o de `SiteRodape`) sem `acima-da-barra`, concorrendo com a prova.
definePageMeta({ layout: false })
</script>

<template>
  <div>
    <p>Página de prova: barra fixa</p>
    <div class="ts-barra-compra">Barra fixa de prova</div>
    <AvisoCookies />
    <BotaoWhatsapp numero="41999990000" acima-da-barra />
  </div>
</template>
