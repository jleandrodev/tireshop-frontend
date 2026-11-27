<script setup lang="ts">
import { computed } from 'vue'
import type { Pagina } from '../domain/pagina'

// T-0114 · REQ-01-15 (RF-17, RNF-02): só emite `ir` — a tela decide entre navegar pelo `href`
// (real, pra funcionar sem JS e ser rastreável) ou refazer a busca sem mudar de rota.
const props = defineProps<{
  dados?: Pagina<unknown>
  paginaAtual?: number
  totalPaginas?: number
  href: (pagina: number) => string
}>()

const emit = defineEmits<{ ir: [pagina: number] }>()

const paginaAtual = computed(() => props.dados?.pagina ?? props.paginaAtual ?? 1)
const totalPaginas = computed(() => props.dados?.totalPaginas ?? props.totalPaginas ?? 1)

function aoClicar(evento: MouseEvent, pagina: number): void {
  evento.preventDefault()
  emit('ir', pagina)
}
</script>

<template>
  <nav v-if="totalPaginas > 1" class="ts-paginacao" aria-label="Páginas">
    <ol>
      <li v-for="n in totalPaginas" :key="n">
        <span v-if="n === paginaAtual" aria-current="page">{{ n }}</span>
        <a v-else :href="href(n)" @click="aoClicar($event, n)">{{ n }}</a>
      </li>
    </ol>
    <a
      v-if="paginaAtual < totalPaginas"
      class="ts-btn ts-btn--outline"
      :href="href(paginaAtual + 1)"
      @click="aoClicar($event, paginaAtual + 1)"
    >
      Próxima página
      <svg aria-hidden="true"><use href="#i-chevron-right" /></svg>
    </a>
  </nav>
</template>
