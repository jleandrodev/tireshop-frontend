# Spec 03 — Catálogo: listagem

| | |
|---|---|
| Marco | M3 |
| Contexto do domínio | [Catálogo](../../docs/domain/catalogo.md) |
| Telas do protótipo | `categoria-pneus-para-carros.html`, `categoria-carros-aro-17.html`, `categoria-225-45-r17.html`, `categoria-hankook.html` |
| ADRs que se aplicam | 0002, 0003, 0004, 0007, 0008, 0010, 0011 |
| Depende de | 00, 01, 02 |

## 1. Objetivo

O cliente abre uma categoria (departamento, aro, medida ou marca), vê os pneus em cards, filtra por
facetas com contagem, ordena e pagina. O estado dos filtros fica na URL.

O filtro de pneus do topo (busca por medida, aro e veículo) é do módulo 05; aqui a página só reserva
o lugar dele e recebe o componente quando existir.

## 2. Requisitos

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-03-01 | A página mostra migalhas, H1 com o ícone do departamento, contagem de pneus e a arte da categoria, na primeira dobra. | RF-03 |
| REQ-03-02 | A vitrine mostra 12 produtos por página: 3 por linha no computador e 2 no celular. | RF-03 |
| REQ-03-03 | O card mostra foto, selos (Promoção, frete grátis, 360°), nome em H2, estrelas, preço parcelado, parcela, preço à vista e o botão Comprar. | RF-03 |
| REQ-03-04 | Produto sem estoque no card não mostra preço nem Comprar; mostra "Avise-me" com link para o produto. | RF-08 |
| REQ-03-05 | As facetas vêm da API, na ordem recebida, com a contagem por opção. Faceta com uma opção só não aparece. | RF-04 |
| REQ-03-06 | Marcar ou desmarcar uma opção refaz a busca, volta para a página 1 e atualiza a URL (`?aro=17&marca=hankook`). | RF-04 |
| REQ-03-07 | Abrir uma URL com filtros mostra a listagem já filtrada, renderizada no servidor. | RF-04, RNF-01 |
| REQ-03-08 | "Limpar" remove todos os filtros. Aparece só quando há filtro marcado. | RF-04 |
| REQ-03-09 | Ordenar por mais vendidos, menor preço, maior preço ou melhor avaliados refaz a busca e volta para a página 1. | RF-05 |
| REQ-03-10 | A paginação mostra os números e "Próxima página" na mesma linha; a página atual é marcada. | RF-05 |
| REQ-03-11 | No celular, uma barra fixa "Filtrar · Ordenar" abre um painel lateral com as mesmas facetas e a ordenação; o botão do painel mostra o total ("Ver 24 pneus"). | RF-04 |
| REQ-03-12 | Sem resultado, a vitrine mostra "Nenhum pneu com esses filtros" e a ação de limpar. | RNF-06 |
| REQ-03-13 | O texto de apoio (H2, "Ler mais", centralizado) e o FAQ da categoria aparecem depois da vitrine, quando existem. | RF-03 |
| REQ-03-14 | A página não tem a faixa de avaliações nem o bloco "Veja também". | 04/11 |
| REQ-03-15 | Metadados: título e descrição da categoria, canônica sem parâmetros de ordenação, `BreadcrumbList` e `FAQPage`. Páginas com filtro de faceta levam `noindex`. | RNF-01 |
| REQ-03-16 | Categoria inexistente responde 404 no servidor, com a página de não encontrado. | RNF-06 |

## 3. Critérios de aceite

**CA-03-01 · Abrir o departamento**
- **Dado** a categoria `pneus-para-carros` com 26 produtos
- **Quando** abro `/c/pneus-para-carros`
- **Então** vejo o H1 "Pneus para carros", "26 pneus · página 1 de 3", 12 cards em 3 colunas e a faceta Aro como primeira

**CA-03-02 · Filtrar por aro**
- **Dado** a listagem do departamento aberta
- **Quando** marco "Aro 17"
- **Então** a URL passa a ter `?aro=17`, todos os cards visíveis são de aro 17, a contagem mostra o novo total e a página atual é a 1

**CA-03-03 · Combinar facetas**
- **Dado** "Aro 17" marcado
- **Quando** marco também a marca "Hankook" e a marca "Fortune"
- **Então** vejo pneus de aro 17 que são Hankook **ou** Fortune, e as contagens das outras facetas refletem o filtro

**CA-03-04 · URL compartilhável**
- **Dado** a URL `/c/pneus-para-carros?aro=17&ordem=menor_preco`
- **Quando** peço a página sem executar JavaScript
- **Então** o HTML já traz os cards filtrados, em ordem crescente de preço, com "Aro 17" marcado

**CA-03-05 · Categoria de medida abre com a busca preenchida**
- **Dado** a categoria `225-45-r17`
- **Quando** abro a página
- **Então** o filtro de pneus mostra 225 / 45 R 17, e a faceta Aro não aparece (só há um aro)

**CA-03-06 · Painel do celular**
- **Dado** a listagem em 390 px
- **Quando** toco em "Filtrar", marco uma marca e toco em "Ver N pneus"
- **Então** o painel fecha, a vitrine mostra só aquela marca em 2 colunas e o botão do WhatsApp não cobre a barra fixa

**CA-03-07 · Sem resultado**
- **Dado** uma combinação de filtros sem produto
- **Quando** a busca responde vazia
- **Então** vejo "Nenhum pneu com esses filtros" e "Limpar os filtros", e não vejo paginação

**CA-03-08 · Falha da API**
- **Dado** o mock com `?_falha=500` em `/produtos`
- **Quando** abro a categoria
- **Então** o topo da página aparece, a vitrine mostra o estado de erro com "Tentar de novo", e o status da página é 200

## 4. Contratos

| Endpoint | Schema | Usado para |
|---|---|---|
| `GET /categorias/{slug}` | `Categoria` | Topo, arte, busca inicial, texto de apoio, FAQ, metadados |
| `GET /produtos` | `ListaDeProdutos` | Vitrine, facetas, ordenação, paginação |

Detalhes em [docs/api/endpoints/catalogo.md](../../docs/api/endpoints/catalogo.md).

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Topo (H1, arte) | No servidor, não há | Categoria | 404 | Página de erro |
| Vitrine | 12 esqueletos de card | Cards | "Nenhum pneu com esses filtros" + Limpar | Mensagem + "Tentar de novo" |
| Facetas | Esqueleto de 3 grupos | Grupos | Some | Some (a vitrine já avisa) |
| Texto de apoio e FAQ | — | Bloco | Some | Some |

Ao trocar filtro no cliente, a vitrine anterior fica visível e esmaecida até a nova chegar (sem salto).

## 6. Regras de marca, acessibilidade e SEO do módulo

- Nome do produto em **H2** no card (LS08); H1 é o tema da página; texto de apoio em H2.
- Verde de ação só no botão Comprar e em "Ver N pneus" do painel.
- Facetas são `fieldset` com `legend`; cada opção é um `label` de pelo menos 44 px de altura.
- A mudança de total é anunciada (`aria-live="polite"`) ao filtrar.
- O painel do celular é um `dialog` modal: prende o foco, fecha com Esc e devolve o foco ao botão.
- Selo de frete com texto alternativo "Frete grátis {região} acima de {valor}".

## 7. Fora do escopo

- Filtro de pneus do topo (módulo 05), minicart e comportamento do Comprar (módulo 06).
- Caixa "Comparar" nos cards: **não existe** (pedido do cliente em 23/11).
- Faixa de avaliações e "Veja também" na listagem.
- Rolagem infinita.
