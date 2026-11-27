import { Dinheiro } from '#layers/shared'
import { Preco } from '../preco'
import type { ProdutoResumo } from '../produto-resumo'

// T-0303 (docs/testing.md, "Fábricas"): um ProdutoResumo válido, em estoque e em promoção, com
// o selo de frete padrão ("Frete grátis Sul e Sudeste acima de R$ 1.000,00").
function umDinheiro(centavos: number): Dinheiro {
  const resultado = Dinheiro.deCentavos(centavos)
  if (!resultado.ok) throw new Error(`umProdutoResumo: ${resultado.erro.motivo}`)
  return resultado.valor
}

function umPreco(): Preco {
  const resultado = Preco.de({
    parcelado: { total: umDinheiro(60000), parcelas: 12, valorParcela: umDinheiro(5000) },
    aVista: { valor: umDinheiro(54000), descontoPercentual: 10 },
    de: umDinheiro(70000),
  })
  if (!resultado.ok) throw new Error(`umProdutoResumo: ${resultado.erro.motivo}`)
  return resultado.valor
}

export function umProdutoResumo(sobrescritas: Partial<ProdutoResumo> = {}): ProdutoResumo {
  return {
    disponibilidade: 'em_estoque',
    preco: umPreco(),
    nota: 4.5,
    frete: { regiao: 'Sul e Sudeste', valorMinimo: umDinheiro(100000) },
    ...sobrescritas,
  }
}
