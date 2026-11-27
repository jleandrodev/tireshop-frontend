// T-0103 · REQ-01-03 (ADR 0010, RNF-06): os erros comuns do kernel, união fechada por `tipo`.
// Cada um leva o que a tela precisa para reagir (ADR 0010: quatro estados por bloco).
export type ErroDeRede = {
  readonly tipo: 'ErroDeRede'
  readonly tentarDeNovo: true
  readonly mensagem: string
}

export type ErroDeContrato = {
  readonly tipo: 'ErroDeContrato'
  readonly endpoint: string
  readonly caminho: string
  readonly mensagem: string
}

export type NaoEncontrado = {
  readonly tipo: 'NaoEncontrado'
  readonly titulo: string
}

export type CampoInvalido = { readonly campo: string; readonly mensagem: string }

export type ErroDeValidacao = {
  readonly tipo: 'ErroDeValidacao'
  readonly campos: readonly CampoInvalido[]
}

export type ErroDoKernel = ErroDeRede | ErroDeContrato | NaoEncontrado | ErroDeValidacao

export function erroDeRede(mensagem: string): ErroDeRede {
  return { tipo: 'ErroDeRede', tentarDeNovo: true, mensagem }
}

export function erroDeContrato(
  endpoint: string,
  caminho: string,
  mensagem: string,
): ErroDeContrato {
  return { tipo: 'ErroDeContrato', endpoint, caminho, mensagem }
}

export function naoEncontrado(titulo: string): NaoEncontrado {
  return { tipo: 'NaoEncontrado', titulo }
}

export function erroDeValidacao(campos: readonly CampoInvalido[]): ErroDeValidacao {
  return { tipo: 'ErroDeValidacao', campos }
}
