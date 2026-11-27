<script setup lang="ts">
import { classificarHref, linkDoWhatsapp } from '#layers/shared'
import { linksVisiveis, temAros, type Departamento, type Link } from '../../domain/navegacao'
import { iconeDoDepartamento } from '../icone-do-departamento'

// T-0209 · REQ-02-09 (RF-01, RNF-02): a gaveta do celular — Departamentos e cada departamento em
// acordeão (`<details>`, como o `MegaMenu` do computador); Lojas e Marcas, aqui, são links
// simples (fora do escopo um painel próprio no celular). "Entrar" ainda não tem destino (login
// fora do escopo, ver Pendências de specs/02-conteudo-navegacao/tasks.md).
defineProps<{
  aberto: boolean
  departamentos: readonly Departamento[]
  menu: readonly Link[]
  ajuda: readonly Link[]
  telefone: string
  whatsapp: string
  atendimento: string
}>()
const emit = defineEmits<{ fechar: [] }>()
</script>

<template>
  <Dialogo
    :aberto="aberto"
    rotulo="Menu"
    rotulo-fechar="Fechar o menu"
    variante="esquerda"
    :fechar-acima-de="900"
    @fechar="emit('fechar')"
  >
    <nav>
      <ul class="ts-menu__lista">
        <li>
          <details class="ts-menu__grupo">
            <summary>
              Departamentos
              <Icone nome="chevron-right" />
            </summary>
            <ul class="ts-menu__sublista">
              <li v-for="departamento in departamentos" :key="departamento.slug">
                <details class="ts-menu__sub">
                  <summary>
                    <Icone class="ts-menu__icone" :nome="iconeDoDepartamento(departamento.icone)" />
                    {{ departamento.nome }}
                    <Icone nome="chevron-right" />
                  </summary>
                  <ul v-if="temAros(departamento)" class="ts-menu__aros">
                    <li>
                      <NuxtLink
                        v-if="classificarHref(departamento.href) === 'interno'"
                        :to="departamento.href!"
                        @click="emit('fechar')"
                      >
                        Todos os pneus de {{ departamento.nome.toLowerCase() }}
                      </NuxtLink>
                      <a
                        v-else-if="departamento.href"
                        :href="departamento.href"
                        target="_blank"
                        rel="noopener noreferrer"
                        @click="emit('fechar')"
                      >
                        Todos os pneus de {{ departamento.nome.toLowerCase() }}
                      </a>
                    </li>
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
                  <p v-else class="ts-menu__aviso">{{ departamento.resumoAros }}</p>
                </details>
              </li>
            </ul>
          </details>
        </li>
        <li v-for="item in menu" :key="item.rotulo">
          <NuxtLink
            v-if="classificarHref(item.href) === 'interno'"
            :to="item.href!"
            @click="emit('fechar')"
          >
            {{ item.rotulo }}
            <Icone nome="chevron-right" />
          </NuxtLink>
          <a
            v-else-if="item.href"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
            @click="emit('fechar')"
          >
            {{ item.rotulo }}
            <Icone nome="chevron-right" />
          </a>
        </li>
      </ul>

      <details class="ts-menu__grupo">
        <summary>
          Ajuda para escolher
          <Icone nome="chevron-right" />
        </summary>
        <ul class="ts-menu__sublista">
          <li v-for="link in linksVisiveis(ajuda)" :key="link.rotulo">
            <NuxtLink
              v-if="classificarHref(link.href) === 'interno'"
              :to="link.href"
              class="ts-menu__link"
              @click="emit('fechar')"
            >
              {{ link.rotulo }}
            </NuxtLink>
            <a
              v-else
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="ts-menu__link"
              @click="emit('fechar')"
            >
              {{ link.rotulo }}
            </a>
          </li>
        </ul>
      </details>

      <ul class="ts-menu__lista ts-menu__lista--conta">
        <li>
          <button type="button" @click="emit('fechar')">
            <Icone nome="user" />
            Entrar ou criar conta
          </button>
        </li>
      </ul>
    </nav>
    <div class="ts-menu__rodape">
      <a :href="linkDoWhatsapp(whatsapp)" @click="emit('fechar')">
        <Icone nome="whatsapp" />
        WhatsApp {{ telefone }}
      </a>
      <p>{{ atendimento }}</p>
    </div>
  </Dialogo>
</template>
