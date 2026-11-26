# Entrega

Schemas: `PedidoDeSimulacao`, `SimulacaoDeFrete`. **Hoje ilustrativo** (o mock simula por faixa de CEP).

## POST /frete/simulacoes

**Tela:** bloco "Prazo e frete pelo CEP" da página de produto. Não aparece em produto sem estoque.
Exemplos: [requisição](../examples/frete-simulacao.requisicao.json), [resposta](../examples/frete-simulacao.json).

Requisição:

| Campo | Regra |
|---|---|
| `cep` | 8 dígitos, sem traço. O frontend valida antes de enviar e **não guarda** o CEP |
| `itens[]` | `produtoId` e `quantidade` (1 a 8) |
| `tipo` | `endereco` ou `oficina` (oficina conveniada; não é ponto de retirada) |

Resposta:

| Campo | Regra | A tela faz |
|---|---|---|
| `prazo` | Mínimo e máximo, em dias úteis | "Chega em 2 a 4 dias úteis" |
| `frete.tipo` | `gratis`, `valor` (com `valor`) ou `a_calcular` | "Frete grátis", "R$ 39,90" ou "Frete calculado no carrinho" |
| `mensagem` | Frase pronta, opcionalmente usada como complemento | Anunciada a leitores de tela |

**Erros:** 422 com `erros[].campo = "cep"` para CEP inexistente ou não atendido; a `mensagem` aparece
abaixo do campo.
