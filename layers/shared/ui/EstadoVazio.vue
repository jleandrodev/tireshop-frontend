<script setup lang="ts">
// T-0113 · REQ-01-14: título, texto e a ação de cada tela (o slot) — este componente não sabe o
// que fazer a seguir, cada contexto decide.
defineProps<{
  titulo: string
  texto: string
}>()
</script>

<template>
  <div class="ts-estado-vazio" role="status">
    <h2 class="ts-estado-vazio__titulo">
      {{ titulo }}
    </h2>
    <p class="ts-estado-vazio__texto">
      {{ texto }}
    </p>
    <slot />
  </div>
</template>
