// T-0108 · REQ-01-09 (RNF-07): telefone em pt-BR e os links que abrem o discador e o WhatsApp.
// Sem validar o telefone (é do Relacionamento) nem mascarar campo: só formata o que já é dígito.
function soDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

/** "(DD) NNNN-NNNN" com 10 dígitos, "(DD) NNNNN-NNNN" com 11. Fora disso: `valorOriginal`. */
function formatarDigitosLocais(digitos: string, valorOriginal: string): string {
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  }
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
  }
  return valorOriginal
}

export function formatarTelefone(valor: string): string {
  return formatarDigitosLocais(soDigitos(valor), valor)
}

// T-0211 · REQ-02-15: `Contato.whatsapp`/o número de uma loja vêm com o DDI ("55..."), formato
// diferente de `Contato.telefone` (já local) — por isso uma função própria, não um uso a mais de
// `formatarTelefone`. Só tira o "55" quando o resultado bate 12 ou 13 dígitos (DDI + local);
// fora disso, é texto solto, não telefone — devolve sem tocar.
export function formatarNumeroDeWhatsapp(valor: string): string {
  const digitos = soDigitos(valor)
  const local =
    digitos.startsWith('55') && (digitos.length === 12 || digitos.length === 13)
      ? digitos.slice(2)
      : digitos
  return formatarDigitosLocais(local, valor)
}

/** `tel:+55` seguido só dos dígitos — aceita o telefone já formatado. */
export function linkDeTelefone(valor: string): string {
  return `tel:+55${soDigitos(valor)}`
}

/** `https://wa.me/` seguido só dos dígitos — aceita o número já com o código do país. */
export function linkDoWhatsapp(valor: string): string {
  return `https://wa.me/${soDigitos(valor)}`
}
