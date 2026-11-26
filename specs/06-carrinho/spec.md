# Spec 06 — Carrinho e minicart

| | |
|---|---|
| Marco | M6 |
| Contexto do domínio | [Carrinho](../../docs/domain/carrinho.md) |
| Telas do protótipo | o minicart de `base.html.j2`, o botão do carrinho de `partials/cabecalho.html.j2`, o botão Comprar de `partials/card.html.j2` e o bloco "Minicart" de `ui/js/site.js` |
| ADRs que se aplicam | 0002, 0003, 0004, 0007, 0009, 0010 |
| Depende de | Módulos 00, 01, 02, 03, 05 |

## 1. Objetivo

O cliente toca em "Comprar" e vê o pneu entrar no carrinho: o minicart abre pela lateral com o aviso
"Adicionado", os itens, a quantidade de cada um (de 1 a 8) e os totais à vista e em 12x. O número no
cabeçalho acompanha. A mudança aparece na hora e é acertada com a resposta da API; se a API recusar,
a tela volta ao que era e explica.

Este módulo vai até o minicart. O botão "Comprar" é ligado aqui no card da listagem; a página de
produto (módulo 04) e o Comparar (módulo 08) usam o mesmo composable.

## 2. Requisitos

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-06-01 | O carrinho tem um item por produto, e a quantidade de cada item é um inteiro de 1 a 8. | RF-09 |
| REQ-06-02 | Adicionar um produto que já está no carrinho soma à quantidade, sem passar de 8. Produto sem estoque não entra. | RF-09, RF-08 |
| REQ-06-03 | Dá para alterar a quantidade de um item (de 1 a 8) e remover o item. | RF-09 |
| REQ-06-04 | Os totais (à vista, parcelado, parcelas, valor da parcela e quantidade) vêm da API. O frontend não soma nem multiplica preço: só formata. | RF-09, premissa P3 do PRD |
| REQ-06-05 | O carrinho é lido e alterado pela porta `CarrinhoRepository`, com adaptador HTTP para as quatro operações; toda operação devolve o carrinho inteiro. A sessão é do backend, por cookie. | RNF-05, premissa P4 do PRD |
| REQ-06-06 | No mock, o carrinho vive em memória, um por cookie de sessão, com as mesmas regras da API (soma, limite de 8, sem estoque, totais). | ADR 0003, premissa P4 do PRD |
| REQ-06-07 | A tela é um espelho otimista: mostra a mudança na hora, acerta com a resposta e, se a API recusar, volta ao estado anterior e mostra o erro no minicart. | ADR 0007, RNF-06 |
| REQ-06-08 | "Comprar" adiciona uma unidade (ou a quantidade pedida), abre o minicart e mostra o aviso "Adicionado: {nome do pneu}". Card, página de produto e Comparar usam o mesmo composable. | RF-09 |
| REQ-06-09 | O minicart é um painel lateral modal com: título "Seu carrinho", os itens (foto, nome, preço à vista de cada um, quantidade, "Remover"), o total à vista, o total em 12x, o texto do frete, "Ir para o carrinho" e "Continuar comprando". | RF-09 |
| REQ-06-10 | No seletor de quantidade, "Tirar um" trava em 1 e "Pôr mais um" trava em 8; o foco não se perde ao travar. | RF-09, RNF-02 |
| REQ-06-11 | Com o carrinho vazio, o minicart mostra "Seu carrinho está vazio." e o botão "Buscar pela medida", que fecha o painel e leva o foco ao filtro de pneus da página ou, se não houver, à busca do cabeçalho. | RF-09, RF-02 |
| REQ-06-12 | O botão do carrinho no cabeçalho mostra a soma das quantidades e abre o minicart. Vazio, não mostra número. | RF-09 |
| REQ-06-13 | O carrinho tem os estados carregando, vazio e erro. Falha ao ler ou ao alterar o carrinho não derruba a página nem impede a navegação. | RNF-06 |
| REQ-06-14 | O carrinho é buscado no navegador, depois que a página abre; nada dele é gravado em `localStorage` ou `sessionStorage`. | RNF-08, ADR 0007 |
| REQ-06-15 | O minicart, a contagem e o botão Comprar não existem na página de loja física. | RF-15, ADR 0009 |

## 3. Critérios de aceite

**CA-06-01 · Comprar pelo card**
- **Dado** a listagem `/c/pneus-para-carros` e o carrinho vazio
- **Quando** toco em "Comprar" no card do Pneu Hankook Ventus Prime 2 K115 225/45 R17 91V (código 3084)
- **Então** o minicart abre com o aviso "Adicionado: Pneu Hankook Ventus Prime 2 K115 225/45 R17 91V (Pneu Original Hyundai i30 e VW Golf)", um item com quantidade 1, "Total à vista" de R$ 502,55, e o cabeçalho passa a dizer "Carrinho, 1 pneu"

**CA-06-02 · Aumentar a quantidade**
- **Dado** o minicart com uma unidade do produto 3084
- **Quando** toco em "Pôr mais um"
- **Então** a quantidade vira 2 na hora, e depois da resposta leio "Total à vista" R$ 1.005,10 e "R$ 1.058,00 em até 12x sem juros"; o cabeçalho mostra 2

**CA-06-03 · Limites de 1 e de 8**
- **Dado** um item com quantidade 1
- **Quando** olho o seletor, e depois subo a quantidade até 8
- **Então** com 1, "Tirar um" está travado; com 8, "Pôr mais um" está travado e o foco continua no seletor

**CA-06-04 · Comprar de novo o mesmo pneu**
- **Dado** o carrinho com 2 unidades do produto 3084
- **Quando** toco em "Comprar" no mesmo card
- **Então** o minicart continua com um item só, agora com quantidade 3

**CA-06-05 · Remover até esvaziar**
- **Dado** o minicart com um item
- **Quando** toco em "Remover"
- **Então** leio "Pneu removido do carrinho.", vejo "Seu carrinho está vazio." com o botão "Buscar pela medida", os totais somem e o cabeçalho diz "Carrinho, vazio"

**CA-06-06 · Buscar pela medida**
- **Dado** o minicart vazio, aberto na listagem
- **Quando** toco em "Buscar pela medida"
- **Então** o minicart fecha e o foco vai para o campo Largura do filtro de pneus

**CA-06-07 · A API recusa**
- **Dado** o minicart com 2 unidades e a chamada de alteração respondendo 500
- **Quando** toco em "Pôr mais um"
- **Então** a quantidade vai a 3 e volta a 2, os totais continuam os de antes, e o minicart mostra a mensagem de erro, anunciada a leitores de tela

**CA-06-08 · O carrinho é da sessão**
- **Dado** o carrinho com 2 unidades
- **Quando** recarrego a página e abro outra página do e-commerce
- **Então** o cabeçalho volta a mostrar 2 depois de carregar, e não há nada do carrinho em `localStorage` nem em `sessionStorage`

**CA-06-09 · Fechar o minicart**
- **Dado** o minicart aberto pelo botão "Comprar" de um card
- **Quando** aperto Esc, toco em "Continuar comprando" ou clico fora do painel
- **Então** o minicart fecha e o foco volta ao botão que o abriu

## 4. Contratos

| Endpoint | Schema | Usado para |
|---|---|---|
| `GET /carrinho` | `Carrinho` | Contagem no cabeçalho e conteúdo do minicart, na abertura do site |
| `POST /carrinho/itens` | `{ produtoId, quantidade }` → `Carrinho` | Botão Comprar |
| `PATCH /carrinho/itens/{id}` | `{ quantidade }` → `Carrinho` | Seletor de quantidade do minicart |
| `DELETE /carrinho/itens/{id}` | — → `Carrinho` | "Remover" |

Exemplos: [carrinho.json](../../docs/api/examples/carrinho.json),
[carrinho-vazio.json](../../docs/api/examples/carrinho-vazio.json),
[carrinho-item.requisicao.json](../../docs/api/examples/carrinho-item.requisicao.json).
Detalhes em [docs/api/endpoints/carrinho.md](../../docs/api/endpoints/carrinho.md).

Regras do contrato que o módulo respeita: sessão nova devolve carrinho vazio com 200 (não 404);
`POST` de item que já existe **soma**; passar de 8 dá 422; produto inexistente dá 404; produto sem
estoque dá 422, e a `title` do erro é o texto mostrado no minicart. `itens[].produto` é um
`ProdutoResumo`, lido com o leitor publicado pelo Catálogo.

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Contagem no cabeçalho | Sem número (o espaço já é reservado) | Número com a soma das quantidades | Sem número; "Carrinho, vazio" | Sem número; o botão continua abrindo o minicart |
| Itens do minicart | Esqueleto de duas linhas | Lista de itens | "Seu carrinho está vazio." + "Buscar pela medida" | "Não foi possível carregar o carrinho." + "Tentar de novo" |
| Totais do minicart | Esmaecidos enquanto a resposta não chega | Total à vista e em 12x | Somem | Ficam os últimos confirmados |
| Aviso do minicart | — | "Adicionado: {nome}" ou "Pneu removido do carrinho." | Sem texto ao abrir pelo cabeçalho | Mensagem do erro (a `title` da API, ou a de rede) |

Durante uma alteração otimista, o número de itens e a quantidade mudam na hora; os valores em
dinheiro ficam esmaecidos até a resposta, porque só a API sabe o total.

## 6. Regras de marca, acessibilidade e SEO do módulo

- Verde de ação em "Comprar" (comprar), "Ir para o carrinho" (seguir) e "Buscar pela medida" (seguir).
  "Continuar comprando", "Remover", o seletor de quantidade e "Tentar de novo" não são verdes.
- O minicart usa o `Dialogo` do kernel, na variante que entra pela direita: modal, prende o foco,
  fecha com Esc, com o X ("Fechar o carrinho") e com clique fora, e devolve o foco a quem abriu.
- O título "Seu carrinho" é um `h2` dentro do diálogo e dá o nome a ele (`aria-labelledby`). Não
  conta como título da página: o diálogo fechado não está na árvore de títulos.
- O aviso tem `role="status"`; a mensagem de erro, `role="alert"`.
- Seletor de quantidade: grupo com `aria-label` "Quantidade de {nome}", botões "Tirar um" e "Pôr mais
  um" com 44 px, e a quantidade em `output` com `aria-live="polite"`.
- "Remover" tem `aria-label` "Remover {nome}"; depois de remover, o foco vai para o botão de fechar.
- Botão do carrinho no cabeçalho: `aria-label` "Carrinho, 2 pneus", "Carrinho, 1 pneu" ou "Carrinho,
  vazio"; `aria-haspopup="dialog"`.
- A foto do item é decorativa (`alt` vazio), com `width` e `height`; o nome vem ao lado.
- Preços com `Dinheiro.formatar()`. Nenhuma conta de preço em componente, store ou domínio do carrinho.
- O carrinho não entra no HTML do servidor (é da sessão; páginas continuam podendo ter cache).

## 7. Fora do escopo

- Página do carrinho, checkout, cupom, pagamento e pedido (fora da entrega): "Ir para o carrinho" só
  aponta para a URL configurada.
- Frete e prazo no minicart: são calculados pelo CEP (contexto Entrega, módulo 07).
- Botão Comprar e quantidade da página de produto e a barra fixa do celular (módulo 04); Comprar do
  Comparar (módulo 08). Eles chamam `useCarrinho().comprar`.
- Variante de loja do card ("Pedir no WhatsApp") e qualquer carrinho na página de loja física (módulo 12).
- "Avise-me" do produto sem estoque (módulo 04).
- Subtotal por linha do item: o contrato não traz, e o frontend não calcula (ver Pendências).
