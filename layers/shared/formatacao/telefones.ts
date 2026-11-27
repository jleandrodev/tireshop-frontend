// T-0108 · REQ-01-09 (RNF-07): telefone em pt-BR e os links que abrem o discador e o WhatsApp.
// Sem validar o telefone (é do Relacionamento) nem mascarar campo: só formata o que já é dígito.
function soDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

/** "(DD) NNNN-NNNN" com 10 dígitos, "(DD) NNNNN-NNNN" com 11. Fora disso: o texto original. */
export function formatarTelefone(valor: string): string {
  const digitos = soDigitos(valor)
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  }
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
  }
  return valor
}

/** `tel:+55` seguido só dos dígitos — aceita o telefone já formatado. */
export function linkDeTelefone(valor: string): string {
  return `tel:+55${soDigitos(valor)}`
}

/** `https://wa.me/` seguido só dos dígitos — aceita o número já com o código do país. */
export function linkDoWhatsapp(valor: string): string {
  return `https://wa.me/${soDigitos(valor)}`
}
