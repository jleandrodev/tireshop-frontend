import { falha, ok, type Result } from '#layers/shared'
import type { CriterioDeListagem } from '../../domain/criterio-de-listagem'
import type { ErroDeCatalogo, ListaDeProdutos, ProdutoRepository } from '../../domain/portas'

// T-0306 (docs/testing.md, "Portas falsas"): implementação em memória, para o caso de uso
// testar sem rede nenhuma. Guarda os critérios recebidos: o caso de uso precisa provar o que
// pediu à porta (ex.: nunca mais de 12 por página), não só o que a porta devolveu.
export type ProdutoRepositoryFalso = ProdutoRepository & {
  programarSucesso: (lista: ListaDeProdutos) => void
  programarFalha: (erro: ErroDeCatalogo) => void
  readonly chamadas: CriterioDeListagem[]
}

export function criarProdutoRepositoryFalso(): ProdutoRepositoryFalso {
  let resposta: Result<ListaDeProdutos, ErroDeCatalogo> | undefined
  const chamadas: CriterioDeListagem[] = []

  return {
    chamadas,
    programarSucesso: (lista) => {
      resposta = ok(lista)
    },
    programarFalha: (erro) => {
      resposta = falha(erro)
    },
    listar: async (criterio) => {
      chamadas.push(criterio)
      if (!resposta) throw new Error('ProdutoRepositoryFalso: programe o resultado antes de chamar')
      return resposta
    },
  }
}
