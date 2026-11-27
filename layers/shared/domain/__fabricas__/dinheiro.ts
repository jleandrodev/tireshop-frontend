import { Dinheiro } from '../dinheiro'

// T-0102 (docs/testing.md, "Fábricas"): um Dinheiro válido, para outros testes não lidarem com o
// Result de deCentavos quando o dinheiro não é o que está sob teste.
export function umDinheiro(centavos = 1000): Dinheiro {
  const resultado = Dinheiro.deCentavos(centavos)
  if (!resultado.ok) {
    throw new Error(`umDinheiro(${centavos}): ${resultado.erro.motivo}`)
  }
  return resultado.valor
}
