<script setup lang="ts">
// T-0213 · REQ-02-17: só pra o e2e provocar um erro inesperado (500) e conferir que
// `app/error.vue` mostra "Algo deu errado" com o status certo — nunca uma tela de verdade (por
// isso a rota só existe fora de produção, nuxt.config.ts).
throw createError({ statusCode: 500, statusMessage: 'erro de prova' })
</script>

<template>
  <div />
</template>
