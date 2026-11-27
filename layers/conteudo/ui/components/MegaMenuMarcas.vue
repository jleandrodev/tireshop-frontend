<script setup lang="ts">
import { classificarHref } from '#layers/shared'
import type { Marca } from '../../domain/navegacao'

// T-0208 · REQ-02-08: marca sem página (`href: null`) mostra só o logotipo, sem link — confirmar
// com o cliente se devia apontar para outro lugar (ver Pendências).
defineProps<{ marcas: readonly Marca[] }>()
defineEmits<{ fechar: [] }>()
</script>

<template>
  <MegaMenu rotulo="Marcas" variante="marcas" v-slot="{ fechar }">
    <ul class="ts-mega__marcas">
      <li v-for="marca in marcas" :key="marca.slug">
        <NuxtLink
          v-if="classificarHref(marca.href) === 'interno'"
          :to="marca.href!"
          class="ts-mega__marca"
          :aria-label="`Pneus ${marca.nome}`"
          @click="fechar"
        >
          <img
            :src="marca.logo.src"
            :width="marca.logo.largura"
            :height="marca.logo.altura"
            :alt="marca.nome"
          />
        </NuxtLink>
        <a
          v-else-if="marca.href"
          :href="marca.href"
          class="ts-mega__marca"
          :aria-label="`Pneus ${marca.nome}`"
          target="_blank"
          rel="noopener noreferrer"
          @click="fechar"
        >
          <img
            :src="marca.logo.src"
            :width="marca.logo.largura"
            :height="marca.logo.altura"
            :alt="marca.nome"
          />
        </a>
        <span v-else class="ts-mega__marca">
          <img
            :src="marca.logo.src"
            :width="marca.logo.largura"
            :height="marca.logo.altura"
            :alt="marca.nome"
          />
        </span>
      </li>
    </ul>
  </MegaMenu>
</template>
