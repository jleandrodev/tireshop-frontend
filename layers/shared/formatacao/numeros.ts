// T-0108 · REQ-01-09 (RNF-07): número e plural em pt-BR (vírgula decimal, ponto de milhar).
export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat('pt-BR').format(valor)
}

/** `quantidade` seguida da forma singular ou plural, conforme o valor. */
export function plural(quantidade: number, singular: string, pluralForma: string): string {
  return `${quantidade} ${quantidade === 1 ? singular : pluralForma}`
}
