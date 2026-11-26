# Carrinho

Schema: `Carrinho`. O carrinho é da sessão do cliente e é mantido pelo **backend** (premissa P4). O
frontend mostra na hora a mudança (otimista) e acerta com a resposta. Todas as operações devolvem o
carrinho inteiro, já com os totais: **o frontend não soma preços**.

Checkout e cupom estão fora desta versão.

| Operação | Corpo | Regra |
|---|---|---|
| `GET /carrinho` | — | Sessão nova devolve carrinho vazio (200), não 404. [Com itens](../examples/carrinho.json), [vazio](../examples/carrinho-vazio.json) |
| `POST /carrinho/itens` | `{ "produtoId", "quantidade" }` ([exemplo](../examples/carrinho-item.requisicao.json)) | Se o item já existe, **soma**. Passou de 8: 422 |
| `PATCH /carrinho/itens/{id}` | `{ "quantidade" }` | Define a quantidade (1 a 8) |
| `DELETE /carrinho/itens/{id}` | — | Remove. Devolve o carrinho |

| Campo | Regra | A tela faz |
|---|---|---|
| `itens[].produto` | `ProdutoResumo` (nome, imagem, preços) | Linha do minicart |
| `itens[].quantidade` | 1 a 8 | Seletor; os botões travam nos limites |
| `itens[].subtotalAVista` | Preço à vista × quantidade, calculado pelo backend | Valor à direita da linha |
| `totais.quantidade` | Soma das quantidades | Número no ícone do carrinho |
| `totais.aVista` | Total com o desconto à vista | "Total à vista" |
| `totais.parcelado` | Total, parcelas e valor da parcela | "ou R$ … em até 12x sem juros" |

**Erros:** 404 se o produto não existe; 422 se a quantidade é inválida ou o produto está sem estoque
(a `title` aparece no minicart).

**Sessão:** dúvida D1. O frontend assume cookie de sessão `HttpOnly` definido pelo backend na primeira
chamada. O mock guarda o carrinho em memória por cookie.
