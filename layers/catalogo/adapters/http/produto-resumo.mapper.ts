import {
  Dinheiro,
  erroDeContrato,
  falha,
  ok,
  type ErroDeContrato,
  type Result,
} from '#layers/shared'
import { Preco } from '../../domain/preco'
import type { ProdutoResumo, SeloFrete } from '../../domain/produto-resumo'
import type { ProdutoResumoDTO } from './produto-resumo.schema'

// T-0308 · REQ-03-03, REQ-03-04 (docs/api/openapi.yaml): traduz o DTO pro modelo do contexto. O
// DTO não sai de adapters/ — quem chama este mapper só vê `ProdutoResumo`. Só os campos que esta
// task testa (preço, selo de frete, nota, disponibilidade) — nome, imagem, marca etc. entram
// quando a task que os mostrar (o card) precisar.
const ENDPOINT = 'GET /produtos'

function paraDinheiro(
  dto: { centavos: number; moeda: string },
  caminho: string,
): Result<Dinheiro, ErroDeContrato> {
  const resultado = Dinheiro.deCentavos(dto.centavos, dto.moeda)
  if (!resultado.ok) return falha(erroDeContrato(ENDPOINT, caminho, resultado.erro.motivo))
  return resultado
}

function paraPreco(
  dto: ProdutoResumoDTO['preco'],
  caminho: string,
): Result<Preco | undefined, ErroDeContrato> {
  if (!dto) return ok(undefined)

  const total = paraDinheiro(dto.parcelado.total, `${caminho}.parcelado.total`)
  if (!total.ok) return total
  const valorParcela = paraDinheiro(dto.parcelado.valorParcela, `${caminho}.parcelado.valorParcela`)
  if (!valorParcela.ok) return valorParcela
  const aVistaValor = paraDinheiro(dto.aVista.valor, `${caminho}.aVista.valor`)
  if (!aVistaValor.ok) return aVistaValor

  let de: Dinheiro | undefined
  if (dto.de) {
    const resultadoDe = paraDinheiro(dto.de, `${caminho}.de`)
    if (!resultadoDe.ok) return resultadoDe
    de = resultadoDe.valor
  }

  const preco = Preco.de({
    parcelado: {
      total: total.valor,
      parcelas: dto.parcelado.parcelas,
      valorParcela: valorParcela.valor,
    },
    aVista: { valor: aVistaValor.valor, descontoPercentual: dto.aVista.descontoPercentual },
    de,
  })
  if (!preco.ok) return falha(erroDeContrato(ENDPOINT, caminho, preco.erro.motivo))
  return preco
}

export function paraProdutoResumo(dto: ProdutoResumoDTO): Result<ProdutoResumo, ErroDeContrato> {
  const preco = paraPreco(dto.preco, 'preco')
  if (!preco.ok) return preco

  let frete: SeloFrete | undefined
  if (dto.freteGratis) {
    const valorMinimo = paraDinheiro(dto.freteGratis.valorMinimo, 'freteGratis.valorMinimo')
    if (!valorMinimo.ok) return valorMinimo
    frete = { regiao: dto.freteGratis.regiao, valorMinimo: valorMinimo.valor }
  }

  return ok({
    disponibilidade: dto.disponibilidade,
    preco: preco.valor,
    nota: dto.avaliacao?.nota,
    frete,
  })
}
