import type { ErroDoKernel } from '../../domain/erros'
import { ok, type Result } from '../../domain/result'
import type { ClienteHttp } from '../cliente-http'

// T-0103 (docs/testing.md, "Portas falsas"): implementação em memória do ClienteHttp, para os
// adaptadores dos contextos testarem sem subir rede nenhuma.
export type ClienteHttpFalso = ClienteHttp & {
  programarSucesso: (caminho: string, valor: unknown) => void
  programarFalha: (caminho: string, erro: ErroDoKernel) => void
}

export function criarClienteHttpFalso(): ClienteHttpFalso {
  const respostas = new Map<string, Result<unknown, ErroDoKernel>>()

  function resposta<T>(caminho: string): Result<T, ErroDoKernel> {
    const programada = respostas.get(caminho)
    return (programada ?? ok(undefined)) as Result<T, ErroDoKernel>
  }

  return {
    programarSucesso: (caminho, valor) => respostas.set(caminho, ok(valor)),
    programarFalha: (caminho, erro) => respostas.set(caminho, { ok: false, erro }),
    obter: async (caminho) => resposta(caminho),
    enviar: async (_metodo, caminho) => resposta(caminho),
  }
}
