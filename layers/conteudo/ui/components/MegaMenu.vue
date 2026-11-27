<script setup lang="ts">
import { onMounted, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useCoordenadorMegaMenu } from '../composables/use-coordenador-mega-menu'

// T-0207/T-0208 · REQ-02-05, REQ-02-06: invólucro genérico — Lojas e Marcas (T-0208) usam o
// mesmo componente, só com outro `rotulo`/slot/`variante`. É um `<details>`: abre sem
// JavaScript; o JS só fecha no Esc (devolvendo o foco ao summary), no clique fora e quando
// outro mega menu abre. `variante`: sufixo de `ts-mega--<variante>` (estilo do summary do
// protótipo para Lojas/Marcas); omitido, é só `ts-mega` (Departamentos).
const props = defineProps<{ rotulo: string; variante?: string }>()

const aberto = ref(false)
const detalhes = useTemplateRef('detalhes')
const summary = useTemplateRef('summary')
const { abertoId } = useCoordenadorMegaMenu()
const meuId = Symbol('megaMenu')

function fechar(): void {
  if (detalhes.value) detalhes.value.open = false
  aberto.value = false
}

function onToggle(): void {
  aberto.value = detalhes.value?.open ?? false
  if (aberto.value) abertoId.value = meuId
}

function onKeydown(evento: KeyboardEvent): void {
  if (evento.key !== 'Escape' || !aberto.value) return
  fechar()
  summary.value?.focus()
}

function onCliqueFora(evento: MouseEvent): void {
  if (aberto.value && detalhes.value && !detalhes.value.contains(evento.target as Node)) {
    fechar()
  }
}

watch(abertoId, (id) => {
  if (id !== meuId && aberto.value) fechar()
})

onMounted(() => document.addEventListener('click', onCliqueFora))
onUnmounted(() => document.removeEventListener('click', onCliqueFora))

defineExpose({ fechar })
</script>

<template>
  <details
    ref="detalhes"
    class="ts-mega"
    :class="props.variante && `ts-mega--${props.variante}`"
    @toggle="onToggle"
    @keydown="onKeydown"
  >
    <summary ref="summary">
      {{ rotulo }}
      <Icone nome="chevron-down" />
    </summary>
    <div class="ts-mega__painel">
      <slot :fechar="fechar" />
    </div>
  </details>
</template>
