import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'
import type { Navegacao } from '../../domain/navegacao'
import type { NavegacaoRepository } from '../../domain/portas'

// T-0204 · REQ-02-01 (ADR 0002, ADR 0007): o `NavegacaoRepository` nasce num lugar só
// (app/plugins/12.conteudo.ts) e chega aqui por injeção — nunca por `criarHttpNavegacaoRepository`
// direto num composable de tela. A navegação não é copiada para store: `useAsyncData` já guarda o
// resultado no payload do Nuxt, com a chave fixa abaixo.
export const SIMBOLO_NAVEGACAO_REPOSITORY: InjectionKey<NavegacaoRepository> =
  Symbol('navegacaoRepository')

export type EstadoNavegacao = 'sucesso' | 'erro'

type DadosDeNavegacao = { navegacao: Navegacao | null; estado: EstadoNavegacao }

export function useNavegacao(): {
  navegacao: ComputedRef<Navegacao | null>
  estado: ComputedRef<EstadoNavegacao>
} {
  const repositorio = inject(SIMBOLO_NAVEGACAO_REPOSITORY)
  if (!repositorio) {
    throw new Error(
      'useNavegacao: nenhum NavegacaoRepository foi fornecido (ver app/plugins/12.conteudo.ts)',
    )
  }

  // Chave fixa: duas chamadas a useNavegacao() na mesma página (dois componentes) compartilham a
  // mesma busca — o Nuxt dedupe por chave, não chama a porta duas vezes (docs do useAsyncData).
  // `dedupe: 'defer'`: o padrão do Nuxt ('cancel') cancelaria a primeira busca e recomeçaria a
  // cada chamada — o oposto de "uma única chamada à porta" quando dois componentes usam a mesma
  // chave na mesma página. Com 'defer', a segunda chamada reaproveita a promessa da primeira.
  const { data } = useAsyncData<DadosDeNavegacao>(
    'navegacao',
    async () => {
      const resultado = await repositorio.obter()
      return resultado.ok
        ? { navegacao: resultado.valor, estado: 'sucesso' }
        : { navegacao: null, estado: 'erro' }
    },
    { dedupe: 'defer' },
  )

  return {
    navegacao: computed(() => data.value?.navegacao ?? null),
    estado: computed(() => data.value?.estado ?? 'erro'),
  }
}
