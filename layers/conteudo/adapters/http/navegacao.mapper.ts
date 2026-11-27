import { erroDeContrato, falha, Imagem, ok, type ErroDeContrato, type Result } from '#layers/shared'
import type { Marca, Navegacao } from '../../domain/navegacao'
import type { NavegacaoDTO } from './navegacao.schema'

// T-0202 · REQ-02-01, REQ-02-18 (ADR 0004): traduz o DTO pro modelo do contexto. O DTO não sai
// de adapters/ — quem chama este mapper só vê `Navegacao`.
function paraMarca(dto: NavegacaoDTO['marcas'][number]): Result<Marca, ErroDeContrato> {
  const logo = Imagem.de(dto.logo)
  if (!logo.ok) {
    return falha(erroDeContrato('GET /navegacao', `marcas.${dto.slug}.logo`, logo.erro.motivo))
  }
  return ok({ ...dto, logo: logo.valor })
}

export function paraNavegacao(dto: NavegacaoDTO): Result<Navegacao, ErroDeContrato> {
  const marcas: Marca[] = []
  for (const marcaDto of dto.marcas) {
    const marca = paraMarca(marcaDto)
    if (!marca.ok) return marca
    marcas.push(marca.valor)
  }

  return ok({ ...dto, marcas })
}
