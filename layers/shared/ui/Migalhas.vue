<script setup lang="ts">
import { computed } from 'vue'
import { rotas } from '../routing/rotas'
import type { Migalha } from '../seo/metadados'

// T-0116 · REQ-01-17 (ADR 0008): da Home até a página atual. `migalhas` traz só o resto da
// trilha — Home é sempre prepended aqui, por `rotas.home()`, nunca pelo chamador.
const props = defineProps<{
  migalhas: readonly Migalha[]
}>()

const completa = computed<readonly Migalha[]>(() => [
  { rotulo: 'Home', href: rotas.home() },
  ...props.migalhas,
])
</script>

<template>
  <nav class="ts-migalhas" aria-label="Você está em">
    <ol>
      <li v-for="(migalha, indice) in completa" :key="indice">
        <span v-if="indice === completa.length - 1" aria-current="page">{{ migalha.rotulo }}</span>
        <span v-else-if="!migalha.href">{{ migalha.rotulo }}</span>
        <a v-else :href="migalha.href">{{ migalha.rotulo }}</a>
      </li>
    </ol>
  </nav>
</template>
