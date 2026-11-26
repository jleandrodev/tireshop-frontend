# Spec 08 — Comparar pneus

| | |
|---|---|
| Marco | M7 |
| Contexto do domínio | [Catálogo](../../docs/domain/catalogo.md) (agregado `Comparacao`) |
| Telas do protótipo | `comparar.html` |
| ADRs que se aplicam | 0002, 0003, 0004, 0007, 0008, 0010, 0011 |
| Depende de | 00, 01, 02, 03, 04 (e 05 e 06 para o filtro compacto e o botão Comprar) |

## 1. Objetivo

O cliente escolhe de 2 a 4 pneus e os vê lado a lado: preço, frete, índices, ficha, nota e etiqueta
do INMETRO, com o melhor valor de cada linha realçado e a opção de ver só o que muda. A escolha fica
na URL (`/comparar?p=3084,3026`), para ser compartilhada, e na sessão do navegador, para sobreviver à
navegação.

Entra-se na página pelo link "Comparar com outros pneus" do produto e pelo link "Comparar pneus" do
rodapé. **Não existe** caixa "Comparar" nos cards da listagem nem bandeja de comparação (pedido do
cliente em 23/11).

## 2. Requisitos

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-08-01 | A comparação aceita no máximo 4 pneus, sem repetidos, e só é comparável a partir de 2. | RF-11 |
| REQ-08-02 | A escolha vive na URL (`?p=id,id`) e na sessão do navegador. Com `?p` na URL, ela vence; sem `?p`, vale a da sessão; toda mudança atualiza as duas. Nada pessoal é guardado. | RF-11, ADR 0007, RNF-08 |
| REQ-08-03 | O passo "1. Escolha os pneus" tem três filtros (medida, marca e preço à vista) e uma lista marcável com foto, marca, medida, nome, preço à vista e nota. A medida já vem filtrada pela do primeiro pneu escolhido. | RF-11, 23/11 |
| REQ-08-04 | Ao chegar a 4 escolhidos, as caixas dos outros pneus ficam desativadas. O contador mostra "N de 4 escolhidos". | RF-11 |
| REQ-08-05 | Os escolhidos aparecem como etiquetas com "×" para remover; "Limpar a escolha" esvazia tudo. | RF-11, 23/11 |
| REQ-08-06 | O passo "2. Compare" é uma tabela com uma coluna por pneu (foto, marca, nome com link e Remover). A primeira coluna, dos rótulos, fica fixa; no celular a tabela rola para o lado dentro do próprio bloco. | RF-11 |
| REQ-08-07 | A tabela tem as linhas: preço à vista, parcelado, frete, medida, índice de carga, índice de velocidade, treadwear, tração, temperatura, construção, desenho, run flat, garantia, nota dos clientes, fotos em 360° e etiqueta do INMETRO. Valor ausente aparece como "—". | RF-11 |
| REQ-08-08 | O melhor valor da linha é realçado: **menor** preço à vista; **maior** índice de carga, índice de velocidade, treadwear e nota. Empate realça todos; linha com todos iguais não realça ninguém. | RF-11 |
| REQ-08-09 | A chave "Só as diferenças" esconde as linhas em que todos os pneus têm o mesmo valor. A etiqueta do INMETRO e as ações nunca somem. | RF-11 |
| REQ-08-10 | Quando os escolhidos têm medidas diferentes, aparece o aviso "Atenção: são medidas diferentes. Compare só pneus que servem no mesmo veículo." | RF-11 |
| REQ-08-11 | A etiqueta do INMETRO aparece como imagem, com link para a seção do INMETRO do produto. | RF-11 |
| REQ-08-12 | Cada coluna termina com "Ver produto" e "Comprar" (verde, uma unidade). Pneu sem estoque mostra "—" no preço, não entra no melhor preço e troca o Comprar por "Avise-me", com link para o produto. | RF-11, RF-09, RF-08 |
| REQ-08-13 | Abaixo da tabela, o acordeão "Para decidir", **centralizado**, tem "Qual escolher?" (menor preço, melhor avaliado e maior índice de carga, marcado como ilustrativo) e "Como ler esta tabela". | RF-11, 23/11 |
| REQ-08-14 | Com menos de 2 pneus, a página mostra "Escolha pelo menos 2 pneus para comparar." no lugar da tabela, das ferramentas e do acordeão. | RF-11, RNF-06 |
| REQ-08-15 | As entradas são o link "Comparar com outros pneus" do produto (que traz o pneu já escolhido) e o link "Comparar pneus" do rodapé. Não há caixa "Comparar" nos cards nem bandeja. | RF-11, 23/11 |
| REQ-08-16 | A página tem o filtro compacto, migalhas, H1 "Comparar pneus", título, descrição e canônica sem `?p`. Não tem banner nem faixa de avaliações. | RNF-01 |
| REQ-08-17 | Abrir a URL com `?p` mostra a tabela já renderizada no servidor. Código inexistente é ignorado, e a URL é corrigida. Falha da lista ou da comparação mostra o erro do próprio bloco. | RNF-01, RNF-06 |

## 3. Critérios de aceite

**CA-08-01 · Abrir uma comparação pela URL**
- **Dado** a URL `/comparar?p=3084,3026,4223`
- **Quando** peço a página sem executar JavaScript
- **Então** o HTML traz o H1 "Comparar pneus", "3 de 4 escolhidos", 3 etiquetas e a tabela com 3 colunas, na ordem Hankook, Bridgestone e Firestone

**CA-08-02 · Melhor valor por linha**
- **Dado** a comparação de 3084, 3026 e 4223
- **Quando** olho a tabela
- **Então** estão realçados: R$ 445,55 (Firestone) no preço à vista; "W: até 270 km/h" nas colunas do Bridgestone e do Firestone; treadwear 380 (Bridgestone); nota 4,9 (Hankook). A linha do índice de carga (91 nos três) não tem realce

**CA-08-03 · Só as diferenças**
- **Dado** a mesma comparação
- **Quando** ligo "Só as diferenças"
- **Então** somem as 7 linhas iguais (frete, medida, índice de carga, construção, run flat, garantia e fotos em 360°); continuam preço à vista, parcelado, índice de velocidade, treadwear, tração, temperatura, desenho e nota, além da etiqueta do INMETRO e das ações

**CA-08-04 · Escolher pelo seletor**
- **Dado** `/comparar?p=3084` (vindo do link do produto)
- **Quando** a página abre
- **Então** o filtro de medida está em "225/45 R17", a lista mostra os 6 pneus dessa medida, o 3084 está marcado, vejo "1 de 4 escolhidos" e "Escolha pelo menos 2 pneus para comparar."
- **Quando** marco o Firestone F-700+ **Então** a URL vira `?p=3084,4223` e a tabela aparece com 2 colunas

**CA-08-05 · Filtros do seletor**
- **Dado** o seletor na medida 225/45 R17
- **Quando** escolho a marca "Hankook" **Então** a lista mostra só o 3084
- **Quando** volto para "Todas as marcas" e escolho o preço "Até R$ 450" **Então** a lista mostra só o Fortune (R$ 401,85) e o Firestone (R$ 445,55)
- **Quando** a combinação não tem pneu **Então** vejo "Nenhum pneu com esses filtros. Mude a medida, a marca ou o preço."

**CA-08-06 · Limite de 4**
- **Dado** 4 pneus escolhidos
- **Quando** olho a lista
- **Então** as caixas dos não escolhidos estão desativadas e vejo "4 de 4 escolhidos"; ao remover um, elas voltam a funcionar

**CA-08-07 · Remover e limpar**
- **Dado** 3 pneus na tabela
- **Quando** toco em "Remover" na coluna do Bridgestone **Então** a tabela fica com 2 colunas, a etiqueta dele some e a URL vira `?p=3084,4223`
- **Quando** toco em "Limpar a escolha" **Então** a URL fica `/comparar`, vejo "0 de 4 escolhidos" e o estado de menos de 2 pneus

**CA-08-08 · Medidas diferentes**
- **Dado** o 3084 (225/45 R17) e um pneu de outra medida escolhidos
- **Quando** a tabela aparece
- **Então** vejo o aviso de medidas diferentes, anunciado a leitores de tela

**CA-08-09 · A escolha sobrevive à navegação**
- **Dado** 3084 e 4223 escolhidos
- **Quando** vou a outra página e volto por "Comparar pneus" no rodapé (sem `?p`)
- **Então** a tabela abre com os mesmos 2 pneus e a URL passa a ter `?p=3084,4223`

**CA-08-10 · Celular**
- **Dado** a comparação de 3 pneus em 390 px
- **Quando** arrasto a tabela para o lado
- **Então** a coluna dos rótulos fica parada, só a tabela rola (a página não tem rolagem horizontal) e os botões de cada coluna têm pelo menos 44 px

**CA-08-11 · Para decidir**
- **Dado** a comparação de 3084, 3026 e 4223 em 1440 px
- **Quando** abro "Qual escolher?"
- **Então** vejo "Menor preço: … Firestone F-700+ … (R$ 445,55 à vista)", "Melhor avaliado: … Hankook … (4,9 de 5)" e a nota de que o resumo é ilustrativo; o centro do acordeão coincide com o centro da página (desvio de até 2 px)

**CA-08-12 · Sem caixa nos cards**
- **Dado** a listagem de uma categoria e a vitrine da Home
- **Quando** procuro "Comparar" nos cards
- **Então** não existe caixa, botão nem bandeja de comparação

## 4. Contratos

| Endpoint | Schema | Usado para |
|---|---|---|
| `GET /produtos/comparar?ids=3084,3026,4223` | `ProdutosParaComparar` (`Produto[]`) | Colunas da tabela e o resumo |
| `GET /produtos?medida=…&marca=…&preco=…&porPagina=48` | `ListaDeProdutos` | Lista do seletor e as opções dos três filtros (pelas facetas) |
| `GET /produtos/{id}` | `Produto` | Nome e medida do pneu quando só há 1 escolhido |

Detalhes em [docs/api/endpoints/catalogo.md](../../docs/api/endpoints/catalogo.md). Exemplo:
`produtos-comparar.json`. O parâmetro da **página** é `p`; o da **API** é `ids`. Treadwear, tração,
temperatura e construção são lidos de `ficha`, pelo `rotulo`.

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Lista do seletor | 6 esqueletos de item | Itens marcáveis | "Nenhum pneu com esses filtros. Mude a medida, a marca ou o preço." | Mensagem + "Tentar de novo" (as etiquetas dos escolhidos continuam) |
| Etiquetas dos escolhidos | — | Uma por pneu | Lista vazia, "0 de 4 escolhidos" | — |
| Tabela | Esqueleto de colunas | Colunas e linhas | Menos de 2: "Escolha pelo menos 2 pneus para comparar." | Mensagem + "Tentar de novo" (o seletor continua usável) |
| Para decidir | — | Acordeão | Some com menos de 2 | Some |

Ao marcar ou remover um pneu, a tabela anterior fica visível e esmaecida até a nova chegar.

## 6. Regras de marca, acessibilidade e SEO do módulo

- H1 "Comparar pneus"; H2 "1. Escolha os pneus", "2. Compare" e "Para decidir"; as perguntas do acordeão em H3.
- A tabela tem `caption` (para leitor de tela), `th scope="col"` por pneu e `th scope="row"` por linha.
  O realce do melhor valor não depende só de cor: a célula leva o texto "melhor valor" para leitor de tela, e há a legenda "Melhor valor da linha".
- O bloco que rola é focável e tem rótulo; a primeira coluna usa `position: sticky`.
- Cada item da lista é um `label` de pelo menos 44 px com a caixa de marcar; os filtros são `select` com `label`.
- "Remover" e o "×" das etiquetas têm `aria-label` "Remover {nome} da comparação". O contador e o aviso de medidas usam `role="status"`.
- Verde de ação só no Comprar de cada coluna. "Ver produto" é contorno.
- A canônica é `/comparar`, sem `?p`. Com `?p`, a página leva `noindex, follow`.
- Regras herdadas de `_comparar` em `tools/hifi/verify.py`: de 2 a 4 colunas; primeira coluna fixa; ao menos um melhor valor realçado; etiqueta do INMETRO presente; acordeão centralizado; "Só as diferenças" esconde linha igual; Remover tira a coluna; 3 filtros no seletor; a lista abre com ao menos 2 pneus; etiquetas batem com a tabela; filtro de marca só deixa a marca; marcar devolve a coluna; com 1 pneu aparece o estado vazio; Limpar esvazia.

## 7. Fora do escopo

- Caixa "Comparar" nos cards e bandeja de comparação: **não existem** (pedido do cliente em 23/11).
- INMETRO em notas de A a G, lista final de linhas e a regra editorial do "Qual escolher": dúvida D5 do PRD.
- Prazo de entrega por coluna (depende de CEP; a simulação é da página de produto).
- Comparar pneus de departamentos diferentes com regras próprias; imprimir ou exportar a comparação.
- O minicart e o caso de uso de adicionar ao carrinho (módulo 06); o componente do filtro compacto (módulo 05).
- Guardar a escolha entre sessões (`localStorage`) ou no servidor.
