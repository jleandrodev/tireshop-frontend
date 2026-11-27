<script setup lang="ts">
import { rotas } from '~~/layers/shared'

// T-0213 · REQ-02-17 (ADR 0010): esta página substitui `app.vue` inteiro quando o Nuxt mostra um
// erro fatal — por isso o `<NuxtLayout>` aqui dentro (cabeçalho e rodapé não vêm de outro lugar).
// O rodapé já traz o link do WhatsApp (SiteRodape); só o link para a Home é conteúdo desta
// página. `statusCode` vem de `createError({ statusCode })`, lançado pelas páginas dos contextos
// quando o caso de uso devolve `NaoEncontrado` (404) ou por qualquer erro inesperado (os demais).
const props = defineProps<{ error: { statusCode: number } }>()

const ehNaoEncontrado = props.error.statusCode === 404
const titulo = ehNaoEncontrado ? 'Página não encontrada' : 'Algo deu errado'
const mensagem = ehNaoEncontrado
  ? 'O endereço que você tentou abrir não existe mais ou nunca existiu.'
  : 'Algo deu errado do nosso lado. Tente de novo em alguns minutos.'
</script>

<template>
  <NuxtLayout name="default">
    <div class="ts-container ts-erro">
      <h1>{{ titulo }}</h1>
      <p>{{ mensagem }}</p>
      <Botao :href="rotas.home()" variante="acao">Voltar para a Home</Botao>
    </div>
  </NuxtLayout>
</template>
