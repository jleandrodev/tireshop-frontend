<script setup lang="ts">
import { nextTick, ref, useTemplateRef } from 'vue'
import { InscricaoNewsletter } from '../../domain/inscricao-newsletter'
import { useRelacionamento } from '../composables/use-relacionamento'

// T-0218 · REQ-02-12, REQ-02-13: valida com o mesmo `InscricaoNewsletter.de` do domínio antes de
// chamar o caso de uso — um e-mail obviamente errado nunca gera a chamada. O que só o servidor
// sabe (ex.: "e-mail já cadastrado") chega como `ErroDeValidacao` do caso de uso, tratado do
// mesmo jeito: os dois caminhos marcam o mesmo campo, com a mesma mensagem para o usuário.
const email = ref('')
const whatsapp = ref('')
const enviando = ref(false)
const mensagemDeSucesso = ref<string | null>(null)
const erroGeral = ref<string | null>(null)
const erroDoCampo = ref<{ email?: string; whatsapp?: string }>({})

const campoEmail = useTemplateRef<HTMLInputElement>('campoEmail')
const { assinarNewsletter } = useRelacionamento()

function dadosDigitados(): { email: string; whatsapp?: string } {
  const valorWhatsapp = whatsapp.value.trim()
  return { email: email.value.trim(), whatsapp: valorWhatsapp || undefined }
}

async function focarCampoComErro(): Promise<void> {
  await nextTick()
  if (erroDoCampo.value.email) campoEmail.value?.focus()
}

async function enviar(): Promise<void> {
  if (enviando.value) return

  erroDoCampo.value = {}
  erroGeral.value = null

  const dados = dadosDigitados()
  const validacaoLocal = InscricaoNewsletter.de(dados)
  if (!validacaoLocal.ok) {
    erroDoCampo.value = { [validacaoLocal.erro.campo]: validacaoLocal.erro.mensagem }
    await focarCampoComErro()
    return
  }

  enviando.value = true
  try {
    const resultado = await assinarNewsletter(dados)
    if (resultado.ok) {
      mensagemDeSucesso.value = resultado.valor.mensagem
      email.value = ''
      whatsapp.value = ''
      return
    }
    if (resultado.erro.tipo === 'ErroDeValidacao') {
      for (const campo of resultado.erro.campos) {
        erroDoCampo.value = { ...erroDoCampo.value, [campo.campo]: campo.mensagem }
      }
      await focarCampoComErro()
      return
    }
    erroGeral.value = resultado.erro.mensagem
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div class="ts-rodape__news">
    <div>
      <p class="ts-rodape__titulo ts-rodape__titulo--news"><Icone nome="mail" />Fique por dentro</p>
      <p>Promoções e lançamentos, direto no seu e-mail.</p>
    </div>

    <form novalidate @submit.prevent="enviar">
      <div class="ts-news">
        <div>
          <label class="ts-sr-only" for="newsletter-email">Seu e-mail</label>
          <input
            id="newsletter-email"
            ref="campoEmail"
            v-model="email"
            type="email"
            autocomplete="email"
            placeholder="Seu e-mail"
            :aria-invalid="erroDoCampo.email ? 'true' : 'false'"
            :aria-describedby="erroDoCampo.email ? 'newsletter-erro-email' : undefined"
          />
        </div>
        <div>
          <label class="ts-sr-only" for="newsletter-whatsapp">Seu WhatsApp</label>
          <input
            id="newsletter-whatsapp"
            v-model="whatsapp"
            type="tel"
            autocomplete="tel"
            placeholder="Seu WhatsApp (opcional)"
            :aria-invalid="erroDoCampo.whatsapp ? 'true' : 'false'"
            :aria-describedby="erroDoCampo.whatsapp ? 'newsletter-erro-whatsapp' : undefined"
          />
        </div>
        <Botao type="submit" variante="acao" :carregando="enviando">Assinar</Botao>
      </div>

      <p v-if="erroDoCampo.email" id="newsletter-erro-email">{{ erroDoCampo.email }}</p>
      <p v-if="erroDoCampo.whatsapp" id="newsletter-erro-whatsapp">{{ erroDoCampo.whatsapp }}</p>

      <p v-if="mensagemDeSucesso" role="status">{{ mensagemDeSucesso }}</p>

      <p v-if="erroGeral">
        {{ erroGeral }}
        <Botao type="button" @click="enviar">Tentar de novo</Botao>
      </p>
    </form>
  </div>
</template>
