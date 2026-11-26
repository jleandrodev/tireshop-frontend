# Contexto: Relacionamento (suporte)

Captar contatos do cliente: newsletter e "Avise-me".

## Modelo

| VO | Invariantes |
|---|---|
| `Email` | Formato válido; guardado em minúsculas. |
| `Telefone` | 10 ou 11 dígitos, com DDD. Opcional na newsletter. |
| `InscricaoNewsletter` | `email` obrigatório, `whatsapp` opcional (R2-22). |
| `PedidoAviso` | `produtoId` + `email`. Só para produto sem estoque. |

Erros: `EmailInvalido` · `TelefoneInvalido` · `ErroDeRede` · `ErroDeContrato`.

## Casos de uso

| Caso de uso | Entrada | Saída |
|---|---|---|
| `assinarNewsletter` | e-mail, WhatsApp? | confirmação (mensagem para a tela) |
| `pedirAviso` | `ProdutoId`, e-mail | confirmação ("avisamos {email} assim que o pneu voltar ao estoque") |

Regras: validação local antes de chamar a API; a confirmação é anunciada a leitores de tela; os dados
não ficam guardados no navegador.

## Porta

```ts
interface LeadsGateway {
  assinar(i: InscricaoNewsletter): Promise<Result<Confirmacao, ErroDeRelacionamento>>   // Confirmacao = { mensagem }
  pedirAviso(p: PedidoAviso): Promise<Result<Confirmacao, ErroDeRelacionamento>>
}
```

## Telas

Formulário de newsletter no rodapé do e-commerce; "Avise-me" na página de produto sem estoque.
