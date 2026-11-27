<script setup lang="ts">
import { ref } from 'vue'

// T-0117 · REQ-01-18 (RNF-03): nenhum pedido ao Google Maps antes do toque. "Abrir no Google
// Maps" é um link real (funciona sem JavaScript), independente de tocar ou não em "Ver o mapa".
defineProps<{
  urlDeIncorporacao: string
  urlDoGoogleMaps: string
  titulo: string
}>()

const tocado = ref(false)
</script>

<template>
  <div class="ts-mapa">
    <div v-if="!tocado" class="ts-mapa__capa">
      <button type="button" class="ts-btn ts-btn--outline" @click="tocado = true">
        Ver o mapa
      </button>
      <a class="ts-link" :href="urlDoGoogleMaps" target="_blank" rel="noopener">
        Abrir no Google Maps
      </a>
    </div>
    <iframe
      v-else
      :src="urlDeIncorporacao"
      :title="titulo"
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade"
      allowfullscreen
    />
  </div>
</template>
