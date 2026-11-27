<script setup lang="ts">
import { useNavegacao } from '../composables/use-navegacao'

// T-0205 · REQ-02-10, REQ-02-11: versão mínima (texto fiscal) — a T-0210 acrescenta colunas,
// redes, selos e pagamentos por cima disto; o lugar "newsletter" nasce na T-0218.
const { navegacao } = useNavegacao()
</script>

<template>
  <footer v-if="navegacao" class="ts-rodape">
    <div class="ts-container">
      <p>{{ navegacao.rodape.textoFiscal }}</p>
    </div>
  </footer>
  <footer v-else class="ts-rodape" />
</template>
