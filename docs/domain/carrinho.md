# Contexto: Carrinho (suporte)

Guardar o que o cliente quer comprar e os totais. O checkout está fora do escopo: este contexto vai
até o minicart.

**Dentro:** itens, quantidade, totais à vista e parcelado, contagem no cabeçalho, minicart.
**Fora:** frete (Entrega), cupom, pagamento, pedido.

## Modelo

**`Carrinho`** (raiz). Identidade: a sessão do cliente (definida pelo backend).

| Parte | Campos | Invariantes |
|---|---|---|
| `ItemCarrinho` | `produto: ProdutoResumo`, `quantidade: number`, `subtotalAVista: Dinheiro` (vem da API) | Quantidade inteira de **1 a 8**. Um item por produto. |
| `Totais` | `aVista: Dinheiro`, `parcelado: { total, parcelas, valorParcela }`, `quantidade: number` | Vêm da API. O front não soma preço: só exibe. |

Comportamento (intenções; o cálculo é do servidor):

- `adicionar(produtoId, quantidade = 1)`: se o item já existe, soma, respeitando o máximo de 8.
- `alterarQuantidade(produtoId, quantidade)`: recusa fora de 1 a 8.
- `remover(produtoId)`.
- `estaVazio()`, `quantidadeTotal()`.

Erros: `QuantidadeInvalida` · `ProdutoIndisponivel` (sem estoque) · `ErroDeRede` · `ErroDeContrato`.

## Casos de uso

| Caso de uso | Entrada | Saída | Observação |
|---|---|---|---|
| `obterCarrinho` | — | `Carrinho` | Na abertura do site (cliente) |
| `adicionarAoCarrinho` | `ProdutoId`, quantidade | `Carrinho` | Abre o minicart com o aviso "adicionado" |
| `alterarQuantidade` | `ProdutoId`, quantidade | `Carrinho` | |
| `removerDoCarrinho` | `ProdutoId` | `Carrinho` | |

A tela atualiza de forma **otimista** (mostra a mudança na hora) e reconcilia com a resposta. Se a
API recusar, volta ao estado anterior e mostra o erro no minicart.

## Porta

```ts
interface CarrinhoRepository {
  obter(): Promise<Result<Carrinho, ErroDeCarrinho>>
  adicionar(id: ProdutoId, quantidade: number): Promise<Result<Carrinho, ErroDeCarrinho>>
  alterar(id: ProdutoId, quantidade: number): Promise<Result<Carrinho, ErroDeCarrinho>>
  remover(id: ProdutoId): Promise<Result<Carrinho, ErroDeCarrinho>>
}
```

No mock, o carrinho vive em memória, por cookie de sessão. Com o backend real, o adaptador só muda
de URL (dúvida D1 do PRD: autenticação e sessão).

## Telas

Minicart (em todas as páginas do e-commerce), botão "Comprar" do card, da página de produto, da barra
fixa do celular e do Comparar. **Não existe** na página de loja física.
