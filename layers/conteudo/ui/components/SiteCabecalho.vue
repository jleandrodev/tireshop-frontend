<script setup lang="ts">
import { linkDeTelefone, rotas } from '#layers/shared'
import { useNavegacao } from '../composables/use-navegacao'

// T-0205 · REQ-02-02, REQ-02-03: versão mínima (logo e telefone) — a T-0206 acrescenta a barra de
// topo, a busca por medida, "Entrar" e o carrinho por cima disto.
const { navegacao } = useNavegacao()
</script>

<template>
  <header class="ts-header">
    <div class="ts-container ts-header__row">
      <NuxtLink :to="rotas.home()" class="ts-header__logo" aria-label="TireShop, página inicial">
        <img src="/img/logo-tireshop.svg" alt="" width="168" height="32" />
      </NuxtLink>
      <a
        v-if="navegacao"
        :href="linkDeTelefone(navegacao.contato.telefone)"
        class="ts-header__acao"
      >
        {{ navegacao.contato.telefone }}
      </a>
    </div>
  </header>
</template>
