<script setup lang="ts">
import { useId } from 'vue'

// T-0119 · REQ-01-20 (ADR 0006, RNF-02): rótulo e controle ligados pelo `id`; quem escolhe o
// controle (input ou select) é quem usa o componente, pelo slot — Campo só monta a amarração de
// acessibilidade (id, aria-invalid, aria-describedby), nunca o próprio controle.
defineProps<{
  rotulo: string
  rotuloSoLeitor?: boolean
  erro?: string
}>()

const idControle = useId()
const idErro = useId()
</script>

<template>
  <div class="ts-campo">
    <label :for="idControle" class="ts-campo__rotulo" :class="{ 'ts-sr-only': rotuloSoLeitor }">
      {{ rotulo }}
    </label>
    <div class="ts-campo__caixa">
      <slot
        v-bind="{
          id: idControle,
          'aria-invalid': erro ? true : undefined,
          'aria-describedby': erro ? idErro : undefined,
        }"
      />
    </div>
    <p v-if="erro" :id="idErro">
      {{ erro }}
    </p>
  </div>
</template>
