<script setup lang="ts">
import { rotas } from '#layers/shared'
import { useNavegacao } from '../composables/use-navegacao'

// T-0205/T-0206 · REQ-02-02..REQ-02-04: barra de topo, logo, busca por medida, "Entrar" e
// carrinho. "Entrar" ainda não tem destino (login fora do escopo, ver Pendências de
// specs/02-conteudo-navegacao/tasks.md): mostrado como botão, sem ação. O cabeçalho não importa
// Catálogo nem Carrinho — a contagem chega por prop; os menus (Departamentos, Lojas, Marcas) e o
// drawer do celular são das próximas tasks.
defineProps<{ quantidadeNoCarrinho: number }>()
const emit = defineEmits<{
  buscar: [texto: string]
  'abrir-carrinho': []
  'abrir-menu': []
}>()

const { navegacao } = useNavegacao()

function rotuloDoCarrinho(quantidade: number): string {
  if (quantidade === 0) return 'Carrinho, vazio'
  return `Carrinho, ${quantidade} pneu${quantidade === 1 ? '' : 's'}`
}
</script>

<template>
  <header class="ts-header">
    <BarraDeTopo
      v-if="navegacao"
      :telefone="navegacao.contato.telefone"
      :whatsapp="navegacao.contato.whatsapp"
    />
    <div class="ts-container ts-header__row">
      <button
        type="button"
        class="ts-header__menu-btn"
        aria-label="Abrir menu"
        @click="emit('abrir-menu')"
      >
        <Icone nome="menu" />
      </button>
      <NuxtLink :to="rotas.home()" class="ts-header__logo" aria-label="TireShop, página inicial">
        <img src="/img/logo-tireshop.svg" alt="" width="168" height="32" />
      </NuxtLink>
      <BuscaPorMedida @buscar="emit('buscar', $event)" />
      <div class="ts-header__acoes">
        <button type="button" class="ts-header__acao">
          <Icone nome="user" />
          <span>Entrar</span>
        </button>
        <button
          type="button"
          class="ts-header__acao ts-header__carrinho"
          :aria-label="rotuloDoCarrinho(quantidadeNoCarrinho)"
          @click="emit('abrir-carrinho')"
        >
          <Icone nome="shopping-cart" />
          <span v-if="quantidadeNoCarrinho > 0" class="ts-header__qtd">{{
            quantidadeNoCarrinho
          }}</span>
        </button>
      </div>
    </div>
  </header>
</template>
