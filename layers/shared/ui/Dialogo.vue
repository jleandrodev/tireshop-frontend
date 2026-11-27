<script setup lang="ts">
import { onMounted, onUnmounted, ref, useId, watch } from 'vue'

// T-0112 · REQ-01-13 (RF-09, RNF-02): usa o `dialog` nativo — é o navegador que prende o foco e
// deixa o fundo inerte com `showModal()`. Este componente só cuida do que o nativo não garante
// sozinho: Esc explícito (alguns ambientes não disparam o `cancel` nativo), fechar ao clicar no
// fundo, e guardar/devolver o foco a quem tinha antes de abrir.
const props = defineProps<{
  aberto: boolean
  rotuloFechar: string
  titulo?: string
  rotulo?: string
  fecharAcimaDe?: number
  variante?: 'direita' | 'esquerda'
}>()

const emit = defineEmits<{ fechar: [] }>()

const dialogoRef = ref<HTMLDialogElement>()
const idTitulo = useId()
let elementoAnterior: HTMLElement | null = null

function fechar(): void {
  dialogoRef.value?.close()
}

function aoFechar(): void {
  emit('fechar')
  elementoAnterior?.focus()
}

function aoClicarNoFundo(evento: MouseEvent): void {
  if (evento.target === dialogoRef.value) fechar()
}

function aoRedimensionar(): void {
  if (
    props.aberto &&
    props.fecharAcimaDe !== undefined &&
    window.innerWidth > props.fecharAcimaDe
  ) {
    fechar()
  }
}

function sincronizar(aberto: boolean): void {
  if (aberto) {
    elementoAnterior = document.activeElement as HTMLElement | null
    dialogoRef.value?.showModal()
  } else {
    dialogoRef.value?.close()
  }
}

watch(() => props.aberto, sincronizar)

onMounted(() => {
  // `dialogoRef` só existe depois do mount: o estado inicial não pode vir de um watcher
  // `immediate` (ele roda ainda em `setup()`, antes do template existir).
  sincronizar(props.aberto)
  window.addEventListener('resize', aoRedimensionar)
})
onUnmounted(() => window.removeEventListener('resize', aoRedimensionar))
</script>

<template>
  <dialog
    ref="dialogoRef"
    class="ts-dialogo"
    :class="variante ? `ts-dialogo--${variante}` : undefined"
    :aria-label="titulo ? undefined : rotulo"
    :aria-labelledby="titulo ? idTitulo : undefined"
    @close="aoFechar"
    @click="aoClicarNoFundo"
    @keydown.esc.prevent="fechar"
  >
    <div class="ts-dialogo__cabeca">
      <h2 v-if="titulo" :id="idTitulo" class="ts-dialogo__titulo">
        {{ titulo }}
      </h2>
      <button type="button" class="ts-dialogo__fechar" :aria-label="rotuloFechar" @click="fechar">
        <svg aria-hidden="true"><use href="#i-x" /></svg>
      </button>
    </div>
    <slot />
  </dialog>
</template>
