<script setup lang="ts">
// T-0007: injeta o sprite uma vez por página (app/app.vue), para o <use> de cada <Icone>
// encontrar o <symbol> correspondente no mesmo documento.
import { sprite } from './sprite'
</script>

<template>
  <div v-html="sprite" />
</template>
