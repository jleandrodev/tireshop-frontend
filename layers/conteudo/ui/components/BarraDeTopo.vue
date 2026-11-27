<script setup lang="ts">
import { linkDoWhatsapp, rotas } from '#layers/shared'

// T-0206 · REQ-02-03 (RF-01): um link só para o WhatsApp (não para o discador — o protótipo trata
// os dois ícones como um atalho só). "Meus Pedidos" não tem destino (login fora do escopo,
// ver Pendências de specs/02-conteudo-navegacao/tasks.md): mostrado, sem link.
defineProps<{ telefone: string; whatsapp: string }>()
</script>

<template>
  <div class="ts-topbar">
    <div class="ts-container ts-topbar__row">
      <a
        :href="linkDoWhatsapp(whatsapp)"
        class="ts-topbar__contato"
        aria-label="Telefone e WhatsApp"
      >
        <span class="ts-topbar__icones">
          <Icone nome="phone" />
          <Icone nome="whatsapp" />
        </span>
        <span class="ts-topbar__numero">{{ telefone }}</span>
      </a>
      <nav aria-label="Atalhos" class="ts-topbar__links">
        <span>Meus Pedidos</span>
        <a :href="rotas.politica('perguntas-frequentes')">Ajuda</a>
      </nav>
    </div>
  </div>
</template>
