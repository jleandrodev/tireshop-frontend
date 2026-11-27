// T-0003 · REQ-00-02: prova de que o Vitest mede cobertura em **/domain/** com o limite de 90%.
// O domínio de verdade (Result, Dinheiro...) nasce no módulo 01; esta função some quando o
// primeiro arquivo real de domínio existir.
export function somar(a: number, b: number): number {
  return a + b
}
