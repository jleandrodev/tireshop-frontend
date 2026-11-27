import type { ErroDoKernel } from '../../domain/erros'
import { ok, type Result } from '../../domain/result'
import type { ClienteHttp } from '../cliente-http'

// T-0103 (docs/testing.md, "Portas falsas"): implementação em memória do ClienteHttp, para os
// adaptadores dos contextos testarem sem subir rede nenhuma.
// T-0216: `chamadas` guarda o que cada adaptador de fato enviou — primeiro consumidor que precisa
// conferir o corpo de um POST (os anteriores só liam, com `obter`).
export type ChamadaHttp = {
  readonly metodo: string
  readonly caminho: string
  readonly corpo: unknown
}

export type ClienteHttpFalso = ClienteHttp & {
  programarSucesso: (caminho: string, valor: unknown) => void
  programarFalha: (caminho: string, erro: ErroDoKernel) => void
  readonly chamadas: ChamadaHttp[]
}

export function criarClienteHttpFalso(): ClienteHttpFalso {
  const respostas = new Map<string, Result<unknown, ErroDoKernel>>()
  const chamadas: ChamadaHttp[] = []

  function resposta<T>(caminho: string): Result<T, ErroDoKernel> {
    const programada = respostas.get(caminho)
    return (programada ?? ok(undefined)) as Result<T, ErroDoKernel>
  }

  return {
    chamadas,
    programarSucesso: (caminho, valor) => respostas.set(caminho, ok(valor)),
    programarFalha: (caminho, erro) => respostas.set(caminho, { ok: false, erro }),
    obter: async (caminho) => {
      chamadas.push({ metodo: 'GET', caminho, corpo: undefined })
      return resposta(caminho)
    },
    enviar: async (metodo, caminho, corpo) => {
      chamadas.push({ metodo, caminho, corpo })
      return resposta(caminho)
    },
  }
}
