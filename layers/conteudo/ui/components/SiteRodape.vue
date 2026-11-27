<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { linkDeTelefone } from '#layers/shared'
import { linksVisiveis } from '../../domain/navegacao'
import { useNavegacao } from '../composables/use-navegacao'

// T-0205/T-0210 · REQ-02-10, REQ-02-11: colunas, redes, selos, pagamentos e os dados fiscais. A
// nota real do selo "Loja confiável" vem de Avaliações (fora do escopo, ver Pendências) — mostra
// o selo sem número. O lugar "newsletter" nasce aqui; o formulário é da T-0218.
const { navegacao } = useNavegacao()

// "Abertas a partir de 900px, fechadas abaixo, também ao redimensionar" (REQ-02-10): o padrão
// (antes do primeiro `onMounted`) é aberto — a coluna funciona sem JavaScript, igual ao protótipo.
const LARGURA_MINIMA_ABERTA = 900
const colunaAberta = ref(true)

function sincronizarLargura(): void {
  colunaAberta.value = window.innerWidth >= LARGURA_MINIMA_ABERTA
}

onMounted(() => {
  sincronizarLargura()
  window.addEventListener('resize', sincronizarLargura)
})
onUnmounted(() => window.removeEventListener('resize', sincronizarLargura))

// `useState`: calculado uma vez no servidor e reaproveitado no cliente (sem isso, o ano
// recalculado na hidratação podia divergir do que o SSR já mandou, por volta da virada do ano).
const ano = useState('ano-do-rodape', () => new Date().getFullYear())
</script>

<template>
  <footer v-if="navegacao" class="ts-rodape">
    <div class="ts-container">
      <div class="ts-rodape__grade">
        <div class="ts-rodape__marca">
          <img src="/img/logo-tireshop-sobre-preto.svg" width="147" height="40" alt="TireShop" />
          <p>
            Pneus novos com nota fiscal e garantia de fábrica, desde 2001. Cinco lojas físicas e
            entrega para todo o Brasil.
          </p>
          <ul class="ts-redes" aria-label="Redes sociais">
            <li v-for="rede in navegacao.redes" :key="rede.id">
              <a :href="rede.href" :aria-label="`TireShop no ${rede.nome}`">
                <Icone :nome="rede.id" />
              </a>
            </li>
          </ul>
        </div>
        <details
          v-for="coluna in navegacao.rodape.colunas"
          :key="coluna.titulo"
          class="ts-rodape__coluna"
          :open="colunaAberta"
        >
          <summary>
            <span class="ts-rodape__titulo">{{ coluna.titulo }}</span>
          </summary>
          <ul class="ts-rodape__lista">
            <li v-for="link in linksVisiveis(coluna.links)" :key="link.rotulo">
              <a :href="link.href">{{ link.rotulo }}</a>
            </li>
          </ul>
        </details>
      </div>

      <slot name="newsletter" />

      <div class="ts-rodape__selos">
        <ul class="ts-selos-loja" aria-label="Selos de confiança">
          <li>
            <span class="ts-selo-loja">
              <span class="ts-selo-loja__texto"><strong>Loja confiável</strong></span>
            </span>
          </li>
          <li>
            <span class="ts-selo-loja ts-selo-loja--img">
              <img
                src="/img/selos/site-seguro-google.webp"
                width="325"
                height="125"
                loading="lazy"
                alt="Site Seguro Google"
              />
            </span>
          </li>
          <li>
            <span class="ts-selo-loja">
              <Icone class="ts-selo-loja__icone" nome="shield-check" />
              <span class="ts-selo-loja__texto"><strong>Certificado SSL</strong></span>
            </span>
          </li>
        </ul>
        <ul class="ts-pagamentos" aria-label="Formas de pagamento">
          <li class="ts-pagamento ts-pagamento--texto">
            <img src="/img/pagamentos/pix.svg" width="16" height="16" alt="" />
            Pix
          </li>
          <li class="ts-pagamento ts-pagamento--texto">
            <Icone nome="barcode" />
            Boleto
          </li>
          <li class="ts-pagamento">
            <img src="/img/pagamentos/visa.svg" width="40" height="24" alt="Visa" />
          </li>
          <li class="ts-pagamento">
            <img src="/img/pagamentos/mastercard.svg" width="40" height="24" alt="Mastercard" />
          </li>
          <li class="ts-pagamento">
            <img src="/img/pagamentos/amex.svg" width="40" height="24" alt="American Express" />
          </li>
          <li class="ts-pagamento">
            <img src="/img/pagamentos/elo.svg" width="40" height="24" alt="Elo" />
          </li>
          <li class="ts-pagamento">
            <img src="/img/pagamentos/diners.svg" width="40" height="24" alt="Diners Club" />
          </li>
        </ul>
      </div>

      <div class="ts-rodape__base">
        <p class="ts-rodape__fiscal">{{ navegacao.rodape.textoFiscal }}</p>
        <p class="ts-rodape__empresa">
          {{ navegacao.contato.razaoSocial }} · CNPJ: {{ navegacao.contato.cnpj }} · Fone:
          <a :href="linkDeTelefone(navegacao.contato.telefone)">{{ navegacao.contato.telefone }}</a>
          · E-mail:
          <a :href="`mailto:${navegacao.contato.email}`">{{ navegacao.contato.email }}</a> ·
          Atendimento: {{ navegacao.contato.atendimento }}.
        </p>
        <p class="ts-rodape__direitos">Todos os direitos reservados {{ ano }}</p>
      </div>
    </div>
  </footer>
  <footer v-else class="ts-rodape" />
</template>
