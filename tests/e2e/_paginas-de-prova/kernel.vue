<script setup lang="ts">
import { ref } from 'vue'
import { erroDeRede, HtmlSeguro, Imagem } from '~~/layers/shared'
// Folhas de página explícitas (nuxt.config.ts só carrega componentes.css globalmente): Paginacao
// usa .ts-paginacao* (catalogo.css); CapaDeVideo/CapaDeMapa usam .ts-video*/.ts-mapa* (institucional.css).
import '~/assets/css/catalogo.css'
import '~/assets/css/institucional.css'

// T-0120 · REQ-01-10..REQ-01-20: um exemplo de cada componente de shared/ui, só pro e2e exercitar
// — nunca uma tela de verdade (por isso a rota só existe fora de produção, nuxt.config.ts).

function corpo(html: string): HtmlSeguro {
  const resultado = HtmlSeguro.criar(html)
  if (!resultado.ok) throw new Error('corpo inválido na página de prova')
  return resultado.valor
}

function imagem(alt: string): Imagem {
  // Arquivo real de /public (precisa carregar de verdade: conferirInvariantes confere
  // naturalWidth > 0), não importa que seja de outro contexto — é só prova.
  const resultado = Imagem.de({
    src: '/img/banners/seo-q@2x.webp',
    largura: 320,
    altura: 180,
    alt,
  })
  if (!resultado.ok) throw new Error('imagem inválida na página de prova')
  return resultado.valor
}

const ITENS_DO_ACORDEAO = [
  {
    id: 'medida',
    pergunta: 'Onde encontro a medida?',
    resposta: corpo('<p>Na lateral do pneu.</p>'),
  },
  { id: 'garantia', pergunta: 'Tem garantia?', resposta: corpo('<p>Sim, 5 anos.</p>') },
]

const GUIAS = [
  { id: 'medida', rotulo: 'Por medida' },
  { id: 'aro', rotulo: 'Por aro' },
]

const SLIDES_DO_CARROSSEL = ['Pneu A', 'Pneu B', 'Pneu C']

const dialogoAberto = ref(false)
const paginaAtual = ref(1)
const erroDeTentativa = ref(erroDeRede('tempo esgotado'))

const TEXTO_DE_APOIO_CORPO = corpo(
  '<p>Este é o texto de apoio inteiro, usado pelo e2e para confirmar que o HTML do servidor já traz o texto completo antes de qualquer clique em "Ler mais" — a página de prova do kernel não esconde nada no carregamento inicial.</p>',
)
</script>

<template>
  <main>
    <h1>Página de prova — componentes do kernel</h1>

    <section aria-labelledby="t-acordeao">
      <h2 id="t-acordeao">Acordeao</h2>
      <Acordeao :itens="ITENS_DO_ACORDEAO" prefixo-id="prova-faq" />
    </section>

    <section aria-labelledby="t-guias">
      <h2 id="t-guias">Guias</h2>
      <Guias :guias="GUIAS" aria-label="Como buscar" guia-inicial="medida">
        <template #medida>
          <p>Painel de medida.</p>
        </template>
        <template #aro>
          <p>Painel de aro.</p>
        </template>
      </Guias>
    </section>

    <section aria-labelledby="t-carrossel">
      <h2 id="t-carrossel">Carrossel</h2>
      <Carrossel :slides="SLIDES_DO_CARROSSEL" aria-label="Produtos de prova" com-pontos>
        <template #slide="{ slide }">
          {{ slide }}
        </template>
      </Carrossel>
    </section>

    <section aria-labelledby="t-dialogo">
      <h2 id="t-dialogo">Dialogo</h2>
      <Botao @click="dialogoAberto = true"> Abrir diálogo </Botao>
      <Dialogo
        :aberto="dialogoAberto"
        rotulo-fechar="Fechar o diálogo de prova"
        titulo="Diálogo de prova"
        @fechar="dialogoAberto = false"
      >
        <p>Conteúdo do diálogo de prova.</p>
      </Dialogo>
    </section>

    <section aria-labelledby="t-estado-vazio">
      <h2 id="t-estado-vazio">EstadoVazio</h2>
      <EstadoVazio titulo="Nenhum pneu encontrado" texto="Tente outra medida.">
        <Botao href="/_prova/kernel"> Ver todos </Botao>
      </EstadoVazio>
    </section>

    <section aria-labelledby="t-estado-de-erro">
      <h2 id="t-estado-de-erro">EstadoDeErro</h2>
      <EstadoDeErro
        :erro="erroDeTentativa"
        @tentar="erroDeTentativa = erroDeRede('tempo esgotado')"
      />
    </section>

    <section aria-labelledby="t-esqueleto">
      <h2 id="t-esqueleto">Esqueleto</h2>
      <Esqueleto :largura="200" :altura="48" />
    </section>

    <section aria-labelledby="t-paginacao">
      <h2 id="t-paginacao">Paginacao</h2>
      <Paginacao
        :pagina-atual="paginaAtual"
        :total-paginas="3"
        :href="(n: number) => `/_prova/kernel?pagina=${n}`"
        @ir="paginaAtual = $event"
      />
    </section>

    <section aria-labelledby="t-texto-de-apoio">
      <h2 id="t-texto-de-apoio">TextoDeApoio</h2>
      <TextoDeApoio
        titulo="Texto de apoio de prova"
        nivel-titulo="h3"
        :corpo="TEXTO_DE_APOIO_CORPO"
      />
    </section>

    <section aria-labelledby="t-migalhas">
      <h2 id="t-migalhas">Migalhas</h2>
      <Migalhas :migalhas="[{ rotulo: 'Pneus para carros', href: null }]" />
    </section>

    <section aria-labelledby="t-capa-de-video">
      <h2 id="t-capa-de-video">CapaDeVideo</h2>
      <CapaDeVideo id-do-video="dQw4w9WgXcQ" titulo="Vídeo de prova" :capa="imagem('')" />
    </section>

    <section aria-labelledby="t-capa-de-mapa">
      <h2 id="t-capa-de-mapa">CapaDeMapa</h2>
      <CapaDeMapa
        url-de-incorporacao="https://www.google.com/maps/embed?pb=prova"
        url-do-google-maps="https://goo.gl/maps/prova"
        titulo="Mapa de prova"
      />
    </section>

    <section aria-labelledby="t-botao">
      <h2 id="t-botao">Botao</h2>
      <Botao>Contorno</Botao>
      <Botao variante="acao"> Comprar </Botao>
    </section>

    <section aria-labelledby="t-campo">
      <h2 id="t-campo">Campo</h2>
      <Campo v-slot="atributos" rotulo="E-mail">
        <input v-bind="atributos" type="email" style="min-height: 44px; min-width: 44px" />
      </Campo>
    </section>
  </main>
</template>
