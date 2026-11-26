# Relacionamento

Schemas: `InscricaoNewsletter`, `PedidoDeAviso`, `Confirmacao`.

## POST /newsletter

**Tela:** formulário do rodapé. [Exemplo de requisição](../examples/newsletter.requisicao.json).

| Campo | Regra |
|---|---|
| `email` | Obrigatório |
| `whatsapp` | Opcional. DDD + número, só dígitos (10 ou 11) |

Resposta 201 com `{ "mensagem" }`, mostrada ao usuário. E-mail já inscrito: responder 201 do mesmo
jeito (não revelar se o e-mail existe). **Erros:** 422 com o campo.

## POST /produtos/{id}/avise-me

**Tela:** produto sem estoque. [Requisição](../examples/avise-me.requisicao.json),
[resposta](../examples/confirmacao.json).

Corpo: `{ "email" }`. Resposta 201 com `{ "mensagem" }` ("Pronto: avisamos … assim que o pneu voltar
ao estoque."). **Erros:** 404 se o produto não existe; 422 se o e-mail é inválido.

## Privacidade

O frontend não guarda e-mail nem telefone no navegador. Consentimento e base legal (LGPD) são
tratados no texto ao lado do formulário, que hoje é fixo no componente (com link para a Política de Privacidade).
