import type { ErroDeContrato, ErroDeRede, ErroDeValidacao, Result } from '#layers/shared'
import type { InscricaoNewsletter } from './inscricao-newsletter'

// T-0215 · REQ-02-12, REQ-02-13 (docs/domain/relacionamento.md): a porta de saída do contexto.
// `pedirAviso` (PedidoAviso) é declarado e implementado no módulo 04 — fora do escopo aqui.
export type Confirmacao = { readonly mensagem: string }

export type ErroDeRelacionamento = ErroDeRede | ErroDeContrato | ErroDeValidacao

export type LeadsGateway = {
  assinar: (inscricao: InscricaoNewsletter) => Promise<Result<Confirmacao, ErroDeRelacionamento>>
}
