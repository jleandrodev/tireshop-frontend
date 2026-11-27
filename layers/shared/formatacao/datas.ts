// T-0108 · REQ-01-09 (RNF-07): data em pt-BR, independente do fuso do servidor — a data chega como
// "AAAA-MM-DD" (sem hora) e é tratada em UTC do início ao fim, nunca convertida pelo fuso local.
const FORMATO_ISO = /^(\d{4})-(\d{2})-(\d{2})$/

function dataUtcValida(iso: string): Date | undefined {
  const partes = FORMATO_ISO.exec(iso)
  if (!partes) return undefined

  const [, anoTexto, mesTexto, diaTexto] = partes as unknown as [string, string, string, string]
  const ano = Number(anoTexto)
  const mes = Number(mesTexto)
  const dia = Number(diaTexto)
  const data = new Date(Date.UTC(ano, mes - 1, dia))

  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return undefined
  }
  return data
}

/** "12 de dezembro", ou "12 de dezembro de 2026" com `{ ano: true }`. Entrada inválida: o texto original. */
export function formatarData(iso: string, opcoes?: { ano?: boolean }): string {
  const data = dataUtcValida(iso)
  if (!data) return iso

  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: opcoes?.ano ? 'numeric' : undefined,
    timeZone: 'UTC',
  }).format(data)
}
