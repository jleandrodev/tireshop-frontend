<script setup lang="ts">
import { ref } from 'vue'

// T-0110 · REQ-01-11 (RF-15, RNF-02): padrão de abas da WAI-ARIA. Painel fica no HTML sempre (o
// atributo `hidden`, não `v-if`), igual ao Acordeao (T-0109) — o conteúdo é de cada contexto
// (módulo 05, 12…), este componente só comanda o `tablist`.
export type Guia = {
  readonly id: string
  readonly rotulo: string
}

const props = defineProps<{
  guias: readonly Guia[]
  ariaLabel: string
  guiaInicial: string
}>()

const emit = defineEmits<{ mudar: [id: string] }>()

const ativa = ref(props.guiaInicial)
const botoes = ref<HTMLButtonElement[]>([])

function selecionar(id: string): void {
  if (id === ativa.value) return
  ativa.value = id
  emit('mudar', id)
}

function moverPara(indice: number): void {
  const total = props.guias.length
  const proximo = ((indice % total) + total) % total
  const guia = props.guias[proximo]!
  selecionar(guia.id)
  botoes.value[proximo]?.focus()
}

function aoTeclar(evento: KeyboardEvent, indiceAtual: number): void {
  switch (evento.key) {
    case 'ArrowRight':
      evento.preventDefault()
      moverPara(indiceAtual + 1)
      break
    case 'ArrowLeft':
      evento.preventDefault()
      moverPara(indiceAtual - 1)
      break
    case 'Home':
      evento.preventDefault()
      moverPara(0)
      break
    case 'End':
      evento.preventDefault()
      moverPara(props.guias.length - 1)
      break
  }
}
</script>

<template>
  <div>
    <div class="ts-abas" role="tablist" :aria-label="ariaLabel">
      <button
        v-for="(guia, indice) in guias"
        :id="`aba-${guia.id}`"
        :key="guia.id"
        ref="botoes"
        class="ts-abas__aba"
        role="tab"
        type="button"
        :aria-controls="`painel-${guia.id}`"
        :aria-selected="guia.id === ativa"
        :tabindex="guia.id === ativa ? 0 : -1"
        @click="selecionar(guia.id)"
        @keydown="aoTeclar($event, indice)"
      >
        {{ guia.rotulo }}
      </button>
    </div>
    <div
      v-for="guia in guias"
      :id="`painel-${guia.id}`"
      :key="guia.id"
      class="ts-painel"
      role="tabpanel"
      :aria-labelledby="`aba-${guia.id}`"
      :hidden="guia.id !== ativa"
    >
      <slot :name="guia.id" />
    </div>
  </div>
</template>
