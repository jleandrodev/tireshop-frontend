<script setup lang="ts">
import { classificarHref } from '#layers/shared'
import { linksVisiveis, temAros, type Departamento, type Link } from '../../domain/navegacao'
import { iconeDoDepartamento } from '../icone-do-departamento'

// T-0207 · REQ-02-05, REQ-02-06: os aros de cada departamento, com os grupos de ajuda no pé.
defineProps<{
  departamentos: readonly Departamento[]
  ajuda: readonly Link[]
  extras: readonly Link[]
}>()
const emit = defineEmits<{ fechar: [] }>()
</script>

<template>
  <ul class="ts-mega__deps">
    <li v-for="departamento in departamentos" :key="departamento.slug">
      <NuxtLink
        v-if="classificarHref(departamento.href) === 'interno'"
        :to="departamento.href!"
        class="ts-mega__titulo"
        @click="emit('fechar')"
      >
        <Icone :nome="iconeDoDepartamento(departamento.icone)" />
        {{ departamento.nome }}
      </NuxtLink>
      <a
        v-else-if="departamento.href"
        :href="departamento.href"
        target="_blank"
        rel="noopener noreferrer"
        class="ts-mega__titulo"
        @click="emit('fechar')"
      >
        <Icone :nome="iconeDoDepartamento(departamento.icone)" />
        {{ departamento.nome }}
      </a>
      <p v-if="!temAros(departamento)" class="ts-mega__aviso">{{ departamento.resumoAros }}</p>
      <ul v-else class="ts-mega__aros" :aria-label="`Aros de ${departamento.nome}`">
        <li v-for="aro in departamento.aros" :key="aro.aro">
          <NuxtLink
            v-if="classificarHref(aro.href) === 'interno'"
            :to="aro.href!"
            @click="emit('fechar')"
          >
            Aro {{ aro.aro }}
          </NuxtLink>
          <a
            v-else-if="aro.href"
            :href="aro.href"
            target="_blank"
            rel="noopener noreferrer"
            @click="emit('fechar')"
          >
            Aro {{ aro.aro }}
          </a>
        </li>
      </ul>
    </li>
  </ul>
  <div class="ts-mega__rodape">
    <div class="ts-mega__grupo">
      <span>Ajuda para escolher</span>
      <template v-for="link in linksVisiveis(ajuda)" :key="link.rotulo">
        <NuxtLink
          v-if="classificarHref(link.href) === 'interno'"
          :to="link.href"
          @click="emit('fechar')"
        >
          {{ link.rotulo }}
        </NuxtLink>
        <a
          v-else
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          @click="emit('fechar')"
        >
          {{ link.rotulo }}
        </a>
      </template>
    </div>
    <div class="ts-mega__grupo">
      <span>Também vendemos</span>
      <template v-for="link in linksVisiveis(extras)" :key="link.rotulo">
        <NuxtLink
          v-if="classificarHref(link.href) === 'interno'"
          :to="link.href"
          @click="emit('fechar')"
        >
          {{ link.rotulo }}
        </NuxtLink>
        <a
          v-else
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          @click="emit('fechar')"
        >
          {{ link.rotulo }}
        </a>
      </template>
    </div>
  </div>
</template>
