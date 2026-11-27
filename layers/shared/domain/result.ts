// T-0101 · REQ-01-01 (ADR 0010, RNF-07): sucesso ou falha sem exceção. União discriminada por
// `ok`; o TypeScript só deixa ler `valor` depois de checar `ok === true` (e `erro`, depois de
// checar `ok === false`). Sem `throw`.
export type ResultadoOk<T> = { readonly ok: true; readonly valor: T }
export type ResultadoFalha<E> = { readonly ok: false; readonly erro: E }
export type Result<T, E> = ResultadoOk<T> | ResultadoFalha<E>

export function ok<T>(valor: T): Result<T, never> {
  return { ok: true, valor }
}

export function falha<E>(erro: E): Result<never, E> {
  return { ok: false, erro }
}

/** Transforma o valor do sucesso; a falha passa intacta. */
export function mapear<T, E, U>(resultado: Result<T, E>, fn: (valor: T) => U): Result<U, E> {
  return resultado.ok ? ok(fn(resultado.valor)) : resultado
}

/** Encadeia outra operação que também pode falhar; não chama `fn` se já é falha. */
export function encadear<T, E, U>(
  resultado: Result<T, E>,
  fn: (valor: T) => Result<U, E>,
): Result<U, E> {
  return resultado.ok ? fn(resultado.valor) : resultado
}

/** O valor do sucesso, ou `padrao` na falha. */
export function ouPadrao<T, E>(resultado: Result<T, E>, padrao: T): T {
  return resultado.ok ? resultado.valor : padrao
}
