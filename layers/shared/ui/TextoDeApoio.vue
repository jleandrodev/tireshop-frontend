<script setup lang="ts">
import { ref, useId } from 'vue'
import type { HtmlSeguro } from '../domain/html-seguro'
import type { Imagem } from '../domain/imagem'

// T-0115 · REQ-01-16 (ADR 0011): texto de apoio de SEO — recolhido por padrão (a máscara em CSS
// corta visualmente, mas o texto inteiro fica no HTML, pra indexar certo). O nível do título vem
// por prop: h1 na Home, h2 nas páginas de categoria (não pode haver dois h1 na mesma página).
defineProps<{
  titulo: string
  nivelTitulo: 'h1' | 'h2'
  corpo: HtmlSeguro
  imagem?: Imagem
}>()

const idCorpo = useId()
const aberto = ref(false)

function alternar(): void {
  aberto.value = !aberto.value
}
</script>

<template>
  <div class="ts-seo" :class="{ 'ts-seo--sem-imagem': !imagem }">
    <img
      v-if="imagem"
      class="ts-seo__img"
      :src="imagem.src"
      :width="imagem.largura"
      :height="imagem.altura"
      :alt="imagem.alt"
      loading="lazy"
    />
    <div class="ts-seo__texto">
      <component :is="nivelTitulo" class="ts-seo__titulo">
        {{ titulo }}
      </component>
      <div :id="idCorpo" class="ts-seo__corpo" :data-recolhido="!aberto" v-html="corpo.html" />
      <button
        type="button"
        class="ts-btn ts-btn--outline"
        :aria-expanded="aberto"
        :aria-controls="idCorpo"
        @click="alternar"
      >
        {{ aberto ? 'Ler menos' : 'Ler mais' }}
      </button>
    </div>
  </div>
</template>
