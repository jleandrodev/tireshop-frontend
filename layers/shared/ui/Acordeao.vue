<script setup lang="ts">
import { reactive } from 'vue'
import type { HtmlSeguro } from '../domain/html-seguro'

// T-0109 · REQ-01-10 (RF-17, RNF-02): cada pergunta abre e fecha sozinha — não é "só uma aberta
// por vez" — por isso o estado é por id, não um índice único. `abrir(id)` é exposto para a página
// abrir uma pergunta específica a partir de um link (ex.: "Onde encontro a medida?").
export type ItemDoAcordeao = {
  readonly id: string
  readonly pergunta: string
  readonly resposta: HtmlSeguro
}

const props = withDefaults(
  defineProps<{
    itens: readonly ItemDoAcordeao[]
    prefixoId: string
    nivelTitulo?: 'h2' | 'h3' | 'h4'
  }>(),
  { nivelTitulo: 'h3' },
)

const abertos = reactive<Record<string, boolean>>(
  Object.fromEntries(props.itens.map((item, indice) => [item.id, indice === 0])),
)

function alternar(id: string): void {
  abertos[id] = !abertos[id]
}

function abrir(id: string): void {
  abertos[id] = true
}

defineExpose({ abrir })
</script>

<template>
  <div class="ts-faq">
    <div v-for="item in itens" :key="item.id" class="ts-faq__item">
      <component :is="nivelTitulo" class="ts-faq__pergunta">
        <button
          class="ts-faq__botao"
          type="button"
          :aria-expanded="abertos[item.id]"
          :aria-controls="`${prefixoId}-${item.id}`"
          @click="alternar(item.id)"
          @keydown.enter.prevent="alternar(item.id)"
          @keydown.space.prevent="alternar(item.id)"
        >
          {{ item.pergunta }}<span class="ts-faq__icone" aria-hidden="true" />
        </button>
      </component>
      <div
        :id="`${prefixoId}-${item.id}`"
        class="ts-faq__resposta"
        :hidden="!abertos[item.id]"
        v-html="item.resposta.html"
      />
    </div>
  </div>
</template>
