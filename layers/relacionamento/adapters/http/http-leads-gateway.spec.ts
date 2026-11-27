import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'vitest'
import { criarClienteHttpFalso, erroDeRede, erroDeValidacao } from '#layers/shared'
import { InscricaoNewsletter } from '../../domain/inscricao-newsletter'
import { criarHttpLeadsGateway } from './http-leads-gateway'
import { ConfirmacaoSchema, InscricaoNewsletterSchema } from './newsletter.schema'

// T-0216 · REQ-02-12, REQ-02-13 (ADR 0003, ADR 0004): o adaptador HTTP de `LeadsGateway`. 404/422
// e falha de rede já chegam prontos do `ClienteHttp` (ADR 0010) — o próprio kernel já cobre isso
// (cliente-http.spec.ts); aqui só a tradução do contexto.

const raiz = join(import.meta.dirname, '..', '..', '..', '..')

function fixture(nome: string): unknown {
  return JSON.parse(readFileSync(join(raiz, 'mocks', 'fixtures', `${nome}.json`), 'utf8'))
}

describe('InscricaoNewsletterSchema', () => {
  test('mocks/fixtures/newsletter.requisicao.json valida no schema', () => {
    expect(InscricaoNewsletterSchema.safeParse(fixture('newsletter.requisicao')).success).toBe(true)
  })
})

describe('ConfirmacaoSchema', () => {
  test('mocks/fixtures/confirmacao.json valida no schema', () => {
    expect(ConfirmacaoSchema.safeParse(fixture('confirmacao')).success).toBe(true)
  })

  test('sem "mensagem" é recusado', () => {
    expect(ConfirmacaoSchema.safeParse({}).success).toBe(false)
  })
})

describe('criarHttpLeadsGateway', () => {
  function inscricaoValida(whatsapp?: string): InscricaoNewsletter {
    const resultado = InscricaoNewsletter.de({ email: 'cliente@exemplo.com.br', whatsapp })
    if (!resultado.ok) throw new Error('inscrição de prova inválida')
    return resultado.valor
  }

  test('envia POST /newsletter com o corpo igual a newsletter.requisicao.json', async () => {
    const clienteHttp = criarClienteHttpFalso()
    clienteHttp.programarSucesso('/newsletter', { mensagem: 'ok' })
    const gateway = criarHttpLeadsGateway(clienteHttp)

    await gateway.assinar(inscricaoValida('41999990000'))

    expect(clienteHttp.chamadas).toEqual([
      { metodo: 'POST', caminho: '/newsletter', corpo: fixture('newsletter.requisicao') },
    ])
  })

  test('sem WhatsApp, envia whatsapp: null', async () => {
    const clienteHttp = criarClienteHttpFalso()
    clienteHttp.programarSucesso('/newsletter', { mensagem: 'ok' })
    const gateway = criarHttpLeadsGateway(clienteHttp)

    await gateway.assinar(inscricaoValida())

    expect(clienteHttp.chamadas[0]?.corpo).toEqual({
      email: 'cliente@exemplo.com.br',
      whatsapp: null,
    })
  })

  test('201 com { mensagem } vira a confirmação', async () => {
    const clienteHttp = criarClienteHttpFalso()
    clienteHttp.programarSucesso('/newsletter', { mensagem: 'Inscrição confirmada!' })
    const gateway = criarHttpLeadsGateway(clienteHttp)

    const resultado = await gateway.assinar(inscricaoValida())

    expect(resultado).toEqual({ ok: true, valor: { mensagem: 'Inscrição confirmada!' } })
  })

  test('ErroDeValidacao vindo do ClienteHttp (422) é repassado com os campos', async () => {
    const clienteHttp = criarClienteHttpFalso()
    const erro = erroDeValidacao([{ campo: 'email', mensagem: 'e-mail já cadastrado' }])
    clienteHttp.programarFalha('/newsletter', erro)
    const gateway = criarHttpLeadsGateway(clienteHttp)

    const resultado = await gateway.assinar(inscricaoValida())

    expect(resultado).toEqual({ ok: false, erro })
  })

  test('falha de rede vira ErroDeRede', async () => {
    const clienteHttp = criarClienteHttpFalso()
    clienteHttp.programarFalha('/newsletter', erroDeRede('tempo esgotado'))
    const gateway = criarHttpLeadsGateway(clienteHttp)

    const resultado = await gateway.assinar(inscricaoValida())

    if (resultado.ok) throw new Error('esperava falha')
    expect(resultado.erro.tipo).toBe('ErroDeRede')
  })
})
