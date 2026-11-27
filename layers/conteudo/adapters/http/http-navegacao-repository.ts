import { erroDeContrato, type ClienteHttp, type ErroDoKernel, type Result } from '#layers/shared'
import type { Navegacao } from '../../domain/navegacao'
import type { ErroDeConteudo, NavegacaoRepository } from '../../domain/portas'
import { paraNavegacao } from './navegacao.mapper'
import { NavegacaoSchema } from './navegacao.schema'

const ENDPOINT = 'GET /navegacao'

// `/navegacao` é um recurso global, sem parâmetro: 404 (NaoEncontrado) e 422 (ErroDeValidacao) do
// ErroDoKernel não fazem sentido aqui, mas o ClienteHttp os admite para qualquer endpoint. Vira
// ErroDeContrato — a resposta não é a esperada, mesmo sem ser um erro de rede ou de schema.
function paraErroDeConteudo(erro: ErroDoKernel): ErroDeConteudo {
  if (erro.tipo === 'ErroDeRede' || erro.tipo === 'ErroDeContrato') return erro
  return erroDeContrato(ENDPOINT, '', `resposta inesperada do servidor: ${erro.tipo}`)
}

// T-0202 · REQ-02-01, REQ-02-18 (ADR 0003): a única porta de saída que fala HTTP. `GET
// /navegacao` pelo ClienteHttp, validado pelo NavegacaoSchema e traduzido pelo mapper.
export function criarHttpNavegacaoRepository(clienteHttp: ClienteHttp): NavegacaoRepository {
  return {
    obter: async (): Promise<Result<Navegacao, ErroDeConteudo>> => {
      const resultado = await clienteHttp.obter('/navegacao', { schema: NavegacaoSchema })
      if (!resultado.ok) return { ok: false, erro: paraErroDeConteudo(resultado.erro) }
      return paraNavegacao(resultado.valor)
    },
  }
}
