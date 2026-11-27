<script setup lang="ts">
import { linkDoWhatsapp, rotas } from '#layers/shared'
import type { LojaDoMenu } from '../../domain/navegacao'

// T-0208 · REQ-02-07: sem lojas (módulo 12 ainda não busca — fora do escopo), "Lojas Físicas" é
// um link simples, sem painel nenhum; o `MegaMenu` só entra quando há alguma loja para mostrar.
defineProps<{ lojas: readonly LojaDoMenu[]; telefone: string; whatsapp: string }>()
defineEmits<{ fechar: [] }>()
</script>

<template>
  <a v-if="lojas.length === 0" :href="rotas.lojas()">Lojas Físicas</a>
  <MegaMenu v-else rotulo="Lojas Físicas" variante="lojas" v-slot="{ fechar }">
    <ul class="ts-mega__lojas">
      <li v-for="loja in lojas" :key="loja.slug">
        <NuxtLink :to="rotas.loja(loja.slug)" class="ts-mega__loja" @click="fechar">
          <img
            :src="loja.foto.src"
            :width="loja.foto.largura"
            :height="loja.foto.altura"
            :alt="loja.foto.alt"
          />
          <strong
            >{{ loja.cidade }} <span>{{ loja.uf }}</span></strong
          >
          <small>{{ loja.endereco }}</small>
        </NuxtLink>
      </li>
    </ul>
    <div class="ts-mega__rodape">
      <div class="ts-mega__grupo">
        <NuxtLink :to="rotas.lojas()" @click="fechar">Ver todas as lojas</NuxtLink>
        <a :href="linkDoWhatsapp(whatsapp)" @click="fechar">{{ telefone }}</a>
      </div>
    </div>
  </MegaMenu>
</template>
