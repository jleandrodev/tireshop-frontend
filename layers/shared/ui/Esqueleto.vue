<script setup lang="ts">
// T-0113 · REQ-01-14: o próprio estado de carregando — um bloco cinza do tamanho final, pra não
// pular o layout quando o conteúdo de verdade chegar.
defineProps<{
  largura: number | string
  altura: number | string
}>()

function comUnidade(valor: number | string): string {
  return typeof valor === 'number' ? `${valor}px` : valor
}
</script>

<template>
  <div
    class="ts-esqueleto"
    aria-hidden="true"
    :style="{ width: comUnidade(largura), height: comUnidade(altura) }"
  />
</template>
