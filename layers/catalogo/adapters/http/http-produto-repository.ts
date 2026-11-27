import {
  erroDeContrato,
  type ClienteHttp,
  type Consulta,
  type ErroDoKernel,
  type Result,
} from '#layers/shared'
import { paraListaDeProdutos } from './lista-de-produtos.mapper'
import { ListaDeProdutosSchema } from './lista-de-produtos.schema'
import type { CriterioDeListagem } from '../../domain/criterio-de-listagem'
import type { ErroDeCatalogo, ListaDeProdutos, ProdutoRepository } from '../../domain/portas'

const ENDPOINT = 'GET /produtos'

// 404 (NaoEncontrado) e 422 (ErroDeValidacao) do ErroDoKernel não fazem sentido para `/produtos`
// (sem parâmetro de caminho), mas o ClienteHttp os admite para qualquer endpoint — mesmo padrão
// de http-navegacao-repository.ts.
function paraErroDeCatalogo(erro: ErroDoKernel): ErroDeCatalogo {
  if (erro.tipo === 'ErroDeRede' || erro.tipo === 'ErroDeContrato') return erro
  return erroDeContrato(ENDPOINT, '', `resposta inesperada do servidor: ${erro.tipo}`)
}

function paraConsulta(criterio: CriterioDeListagem): Consulta {
  const consulta: Consulta = {}
  if (criterio.categoria) consulta.categoria = criterio.categoria
  for (const [chave, valores] of criterio.facetas) consulta[chave] = [...valores]
  consulta.ordem = criterio.ordem
  consulta.pagina = criterio.pagina
  consulta.porPagina = criterio.porPagina
  return consulta
}

// T-0309 · REQ-03-06, REQ-03-07 (ADR 0003): a porta de saída que fala HTTP para `listar`. 404 e
// 422 nunca chegam aqui (sem parâmetro de caminho); 5xx e falha de rede já chegam como
// `ErroDeRede` do `ClienteHttp`.
export function criarHttpProdutoRepository(clienteHttp: ClienteHttp): ProdutoRepository {
  return {
    listar: async (criterio): Promise<Result<ListaDeProdutos, ErroDeCatalogo>> => {
      const resultado = await clienteHttp.obter('/produtos', {
        consulta: paraConsulta(criterio),
        schema: ListaDeProdutosSchema,
      })
      if (!resultado.ok) return { ok: false, erro: paraErroDeCatalogo(resultado.erro) }
      return paraListaDeProdutos(resultado.valor)
    },
  }
}
