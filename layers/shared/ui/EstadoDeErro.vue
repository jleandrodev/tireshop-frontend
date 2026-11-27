<script setup lang="ts">
import type { ErroDoKernel } from '../domain/erros'

// T-0113 · REQ-01-14 (seção 5 da spec): a mensagem depende só do `tipo` do erro — nunca de
// `caminho` ou `endpoint` de `ErroDeContrato` (são detalhes técnicos, não algo pra mostrar).
const MENSAGEM_REDE = 'Não foi possível carregar. Confira a conexão e tente de novo.'
const MENSAGEM_GENERICA = 'Tivemos um problema ao mostrar esta parte da página.'

defineProps<{
  erro: ErroDoKernel
}>()

const emit = defineEmits<{ tentar: [] }>()

function mensagem(erro: ErroDoKernel): string {
  switch (erro.tipo) {
    case 'ErroDeRede':
      return MENSAGEM_REDE
    case 'NaoEncontrado':
      return erro.titulo
    case 'ErroDeContrato':
    case 'ErroDeValidacao':
      return MENSAGEM_GENERICA
  }
}
</script>

<template>
  <div class="ts-estado-erro" role="alert">
    <p class="ts-estado-erro__texto">
      {{ mensagem(erro) }}
    </p>
    <button
      v-if="erro.tipo === 'ErroDeRede'"
      type="button"
      class="ts-btn ts-btn--outline"
      @click="emit('tentar')"
    >
      Tentar de novo
    </button>
  </div>
</template>
