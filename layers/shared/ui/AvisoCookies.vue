<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { rotas } from '../routing/rotas'

// T-0212 · REQ-02-14: `<ClientOnly>` garante que o aviso nunca sai no HTML do servidor (precisa
// de localStorage, que só existe no navegador) — não é um `v-if` escondendo depois. A chave
// guarda só "1": nenhum dado pessoal, nenhuma categoria de consentimento (fora do escopo).
const CHAVE = 'ts-cookies'
const mostrar = ref(false)

function temAceite(): boolean {
  try {
    return localStorage.getItem(CHAVE) === '1'
  } catch {
    return false
  }
}

onMounted(() => {
  mostrar.value = !temAceite()
})

function aceitar(): void {
  mostrar.value = false
  try {
    localStorage.setItem(CHAVE, '1')
  } catch {
    // localStorage indisponível (navegação privada, bloqueio do navegador): só não grava — o
    // aviso volta na próxima visita, não é erro para quem está vendo a página agora.
  }
}
</script>

<template>
  <ClientOnly>
    <div v-if="mostrar" class="ts-cookies" role="region" aria-label="Aviso de cookies">
      <p>
        Usamos cookies para lembrar o seu carrinho e entender como o site é usado.
        <NuxtLink class="ts-link" :to="rotas.politica('privacidade')">
          Política de privacidade
        </NuxtLink>
      </p>
      <Botao variante="acao" @click="aceitar">Entendi</Botao>
    </div>
  </ClientOnly>
</template>
