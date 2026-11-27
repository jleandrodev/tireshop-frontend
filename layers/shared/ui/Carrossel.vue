<script setup lang="ts" generic="T">
import { ref } from 'vue'

// T-0111 · REQ-01-12 (RF-17, RNF-02): só anda por ação do usuário — sem `setInterval`, sem prop
// de rotação automática. "Ir para o slide" chama `scrollIntoView` no item, em vez de calcular a
// distância na mão (largura + espaço): o navegador já faz essa conta certa, com scroll-snap.
const props = defineProps<{
  slides: readonly T[]
  ariaLabel: string
  comPontos?: boolean
}>()

const indiceAtual = ref(0)
const itensRef = ref<HTMLElement[]>([])

function movimentoReduzido(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function irPara(indice: number): void {
  indiceAtual.value = indice
  itensRef.value[indice]?.scrollIntoView({
    behavior: movimentoReduzido() ? 'instant' : 'smooth',
    inline: 'start',
    block: 'nearest',
  })
}

function anterior(): void {
  if (indiceAtual.value > 0) irPara(indiceAtual.value - 1)
}

function proximo(): void {
  if (indiceAtual.value < props.slides.length - 1) irPara(indiceAtual.value + 1)
}
</script>

<template>
  <div v-if="slides.length" class="ts-carrossel">
    <ul ref="trilhoRef" class="ts-carrossel__trilho" tabindex="0" :aria-label="ariaLabel">
      <li v-for="(slide, indice) in slides" ref="itensRef" :key="indice" class="ts-carrossel__item">
        <slot name="slide" :slide="slide" :indice="indice" />
      </li>
    </ul>
    <div class="ts-carrossel__controles">
      <button
        type="button"
        class="ts-carrossel__seta"
        aria-label="Anterior"
        :disabled="indiceAtual === 0"
        @click="anterior"
      >
        <svg aria-hidden="true"><use href="#i-chevron-left" /></svg>
      </button>
      <button
        type="button"
        class="ts-carrossel__seta"
        aria-label="Próximo"
        :disabled="indiceAtual === slides.length - 1"
        @click="proximo"
      >
        <svg aria-hidden="true"><use href="#i-chevron-right" /></svg>
      </button>
    </div>
    <div v-if="comPontos" class="ts-carrossel__pontos">
      <button
        v-for="(slide, indice) in slides"
        :key="indice"
        type="button"
        class="ts-carrossel__ponto"
        :aria-current="indice === indiceAtual"
        :aria-label="`Ir para o slide ${indice + 1} de ${slides.length}`"
        @click="irPara(indice)"
      />
    </div>
  </div>
</template>
