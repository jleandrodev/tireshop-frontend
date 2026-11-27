<script setup lang="ts">
// T-0007 · REQ-00-06: renderiza um ícone do sprite (layers/shared/ui/sprite.ts) por nome, igual
// ao <svg><use href="#i-..."/></svg> do protótipo. Decorativo por padrão (aria-hidden): o texto
// visível ao lado é que carrega o significado, como em todo o protótipo.
const props = defineProps<{ nome: string }>()

const href = computed(() => `#i-${props.nome}`)
</script>

<template>
  <svg class="ts-icon" aria-hidden="true" focusable="false">
    <use :href="href" />
  </svg>
</template>
