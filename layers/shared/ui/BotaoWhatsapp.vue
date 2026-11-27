<script setup lang="ts">
import { formatarNumeroDeWhatsapp, linkDoWhatsapp } from '../formatacao/telefones'

// T-0211 · REQ-02-15 (ADR 0006): o botão flutuante do WhatsApp — o layout da loja física (módulo
// 12) usa o mesmo, com o número da própria loja. `acimaDaBarra`: a página tem uma barra fixa no
// rodapé (compra, filtros) que o botão não pode cobrir.
defineProps<{ numero: string | null; acimaDaBarra?: boolean }>()
</script>

<template>
  <a
    v-if="numero"
    :href="linkDoWhatsapp(numero)"
    class="ts-fab"
    :class="{ 'ts-fab--acima': acimaDaBarra }"
    :aria-label="`Falar no WhatsApp: ${formatarNumeroDeWhatsapp(numero)}`"
  >
    <Icone nome="whatsapp" />
  </a>
</template>
