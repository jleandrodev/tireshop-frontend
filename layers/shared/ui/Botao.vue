<script setup lang="ts">
// T-0119 · REQ-01-20 (ADR 0006, RNF-02): contorno por padrão; só `variante="acao"` pega o verde
// — seguir, comprar ou confirmar (ADR 0006), decisão de cada tela, nunca o padrão do componente.
withDefaults(
  defineProps<{
    href?: string
    variante?: 'contorno' | 'acao'
    carregando?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { href: undefined, variante: 'contorno', carregando: false, type: 'button' },
)
</script>

<template>
  <a
    v-if="href"
    class="ts-btn"
    :class="variante === 'acao' ? 'ts-btn--acao' : 'ts-btn--outline'"
    :href="href"
  >
    <slot />
  </a>
  <button
    v-else
    class="ts-btn"
    :class="variante === 'acao' ? 'ts-btn--acao' : 'ts-btn--outline'"
    :type="type"
    :disabled="carregando"
    :aria-busy="carregando"
  >
    <slot />
  </button>
</template>
