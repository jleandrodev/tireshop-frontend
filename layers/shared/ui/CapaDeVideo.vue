<script setup lang="ts">
import { nextTick, ref } from 'vue'
import type { Imagem } from '../domain/imagem'

// T-0117 · REQ-01-18 (RNF-03): nenhum pedido ao YouTube antes do toque. A capa é um link real
// (funciona sem JavaScript); o clique com JS cancela a navegação e troca pelo iframe no lugar.
defineProps<{
  idDoVideo: string
  titulo: string
  capa: Imagem
}>()

const tocado = ref(false)
const iframeRef = ref<HTMLIFrameElement>()

async function aoTocar(evento: MouseEvent): Promise<void> {
  evento.preventDefault()
  tocado.value = true
  await nextTick()
  iframeRef.value?.focus()
}
</script>

<template>
  <a
    v-if="!tocado"
    class="ts-video__capa"
    :href="`https://www.youtube.com/watch?v=${idDoVideo}`"
    target="_blank"
    rel="noopener"
    :aria-label="`Assistir: ${titulo}`"
    @click="aoTocar"
  >
    <img
      :src="capa.src"
      :width="capa.largura"
      :height="capa.altura"
      :alt="capa.alt"
      loading="lazy"
    />
    <span class="ts-video__play" aria-hidden="true"
      ><svg><use href="#i-play" /></svg
    ></span>
  </a>
  <iframe
    v-else
    ref="iframeRef"
    class="ts-video__quadro"
    :src="`https://www.youtube-nocookie.com/embed/${idDoVideo}`"
    :title="titulo"
    allowfullscreen
  />
</template>
