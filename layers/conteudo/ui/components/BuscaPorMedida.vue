<script setup lang="ts">
// T-0206 · REQ-02-04 (RF-09): só emite o texto digitado — interpretar a medida e navegar é do
// módulo 05 (busca-pneu). Campo vazio não emite.
const emit = defineEmits<{ buscar: [texto: string] }>()

const texto = ref('')

function enviar(): void {
  const valor = texto.value.trim()
  if (!valor) return
  emit('buscar', valor)
}
</script>

<template>
  <form class="ts-busca" role="search" @submit.prevent="enviar">
    <label class="ts-busca__rotulo" for="busca-por-medida">Busca por Medida</label>
    <div class="ts-busca__campo">
      <input
        id="busca-por-medida"
        v-model="texto"
        type="search"
        placeholder="Encontre o pneu ex: 225/45R17"
      />
      <button type="submit" aria-label="Buscar">
        <Icone nome="search" />
      </button>
    </div>
  </form>
</template>
