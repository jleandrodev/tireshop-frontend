<script setup lang="ts">
import { ref } from 'vue'
import { classificarHref, rotas } from '#layers/shared'
import { tipoDoItemDeMenu, type LojaDoMenu } from '../../domain/navegacao'
import { fornecerCoordenadorMegaMenu } from '../composables/use-coordenador-mega-menu'
import { useNavegacao } from '../composables/use-navegacao'

// T-0205..T-0209 · REQ-02-02..REQ-02-09: barra de topo, logo, busca por medida, "Entrar",
// carrinho, os mega menus do computador e a gaveta do celular. "Entrar" ainda não tem destino
// (login fora do escopo, ver Pendências de specs/02-conteudo-navegacao/tasks.md): mostrado como
// botão, sem ação. O cabeçalho não importa Catálogo, Carrinho nem Lojas — a contagem e a lista
// de lojas chegam por prop (REQ-02-01, A5).
defineProps<{ quantidadeNoCarrinho: number; lojas: readonly LojaDoMenu[] }>()
const emit = defineEmits<{
  buscar: [texto: string]
  'abrir-carrinho': []
  'abrir-menu': []
}>()

const { navegacao } = useNavegacao()
fornecerCoordenadorMegaMenu()
const gavetaAberta = ref(false)

function abrirGaveta(): void {
  gavetaAberta.value = true
  emit('abrir-menu')
}

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
        @click="abrirGaveta"
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
    <nav v-if="navegacao" class="ts-nav">
      <ul class="ts-nav__lista">
        <li class="ts-nav__deps">
          <MegaMenu rotulo="Departamentos">
            <template #default="{ fechar }">
              <MegaMenuDepartamentos
                :departamentos="navegacao.departamentos"
                :ajuda="navegacao.ajuda"
                :extras="navegacao.extras"
                @fechar="fechar"
              />
            </template>
          </MegaMenu>
        </li>
        <template v-for="item in navegacao.menu" :key="item.rotulo">
          <li v-if="tipoDoItemDeMenu(item) === 'lojas'">
            <MegaMenuLojas
              :lojas="lojas"
              :telefone="navegacao.contato.telefone"
              :whatsapp="navegacao.contato.whatsapp"
            />
          </li>
          <li v-else-if="tipoDoItemDeMenu(item) === 'marcas'">
            <MegaMenuMarcas :marcas="navegacao.marcas" />
          </li>
          <li v-else>
            <NuxtLink v-if="classificarHref(item.href) === 'interno'" :to="item.href!">
              {{ item.rotulo }}
            </NuxtLink>
            <a v-else-if="item.href" :href="item.href" target="_blank" rel="noopener noreferrer">
              {{ item.rotulo }}
            </a>
          </li>
        </template>
      </ul>
    </nav>
    <MenuCelular
      v-if="navegacao"
      :aberto="gavetaAberta"
      :departamentos="navegacao.departamentos"
      :menu="navegacao.menu"
      :ajuda="navegacao.ajuda"
      :telefone="navegacao.contato.telefone"
      :whatsapp="navegacao.contato.whatsapp"
      :atendimento="navegacao.contato.atendimento"
      @fechar="gavetaAberta = false"
    />
  </header>
</template>
