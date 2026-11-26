# Spec 07 — Avaliações

| | |
|---|---|
| Marco | M7 |
| Contexto do domínio | [Avaliações](../../docs/domain/avaliacoes.md) |
| Telas do protótipo | `produto-3084.html` (seção "Avaliações de quem comprou"), `home.html` (faixa "O que dizem os clientes") |
| ADRs que se aplicam | 0002, 0003, 0004, 0007, 0010, 0012 |
| Depende de | 00, 01, 04 |

## 1. Objetivo

O cliente vê o que outros compradores dizem: na página de produto, a nota do pneu, seis depoimentos
em carrossel e a lista "Todas as avaliações", que cresce de 5 em 5; nas páginas que levam a faixa
"O que dizem os clientes", a nota geral da loja e os depoimentos em destaque.

Este módulo entrega o contexto Avaliações inteiro e a seção do produto. A faixa é entregue como
componente pronto; quem a coloca na Home, nas políticas e no hub de lojas são os módulos 09, 10 e 12.

## 2. Requisitos

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-07-01 | A nota vai de 1 a 5, com uma casa decimal na média, é escrita com vírgula ("4,9") e vira estrelas cheias por arredondamento. | RF-10 |
| REQ-07-02 | A faixa "O que dizem os clientes" mostra a nota geral, "de 5", as estrelas, a legenda com o total e os depoimentos em carrossel manual. | RF-10 |
| REQ-07-03 | A mesma faixa tem a variante **embutida** (sem seção nem título próprios) para a página de produto, com a nota do produto, a legenda "31 avaliações de compras verificadas, pela Trustvox." e **6** depoimentos. | RF-10, 04/11 |
| REQ-07-04 | Abaixo do carrossel, "Todas as avaliações" começa na **7ª** avaliação e mostra **5 por vez**: avatar com as iniciais, nome, cidade, data, estrelas e comentário. Cidade nula some da linha. | RF-10, 04/11 |
| REQ-07-05 | O botão "Ver mais avaliações (restam N)" busca mais 5, atualiza o N, leva o foco à primeira avaliação nova e some quando acabam. No celular ocupa a largura total. | RF-10, 04/11 |
| REQ-07-06 | Produto sem avaliações (`total` 0) não mostra a seção. Com 6 ou menos, mostra o carrossel sem a lista. | RF-10 |
| REQ-07-07 | Falha em qualquer chamada de avaliações não derruba a página: a faixa some; a seção do produto mostra o próprio erro, com "Tentar de novo"; falha no "Ver mais" mantém o que já estava na tela. | RNF-06 |
| REQ-07-08 | As estrelas do título do produto levam à seção `#avaliacoes-produto`, que recebe o foco. | RF-10, 04/11 |
| REQ-07-09 | O frontend fala só com a API da TireShop: nenhum script, `iframe` ou pedido a terceiro (Trustvox) sai da página. | ADR 0012 |
| REQ-07-10 | As avaliações do produto não seguram o HTML da página: o produto renderiza no servidor mesmo com o endpoint de avaliações lento. | RNF-03, RNF-06 |

## 3. Critérios de aceite

**CA-07-01 · Carrossel do produto**
- **Dado** o produto 3084, com nota 4,9 e 31 avaliações
- **Quando** abro a página e rolo até "Avaliações de quem comprou"
- **Então** vejo "4,9 de 5", "31 avaliações de compras verificadas, pela Trustvox." e um carrossel com 6 depoimentos, o primeiro de "Fernanda S."; o carrossel só anda pelas setas, pelo arraste ou pelo teclado

**CA-07-02 · A lista começa na 7ª**
- **Dado** a mesma página
- **Quando** olho "Todas as avaliações"
- **Então** vejo 5 avaliações, a primeira de "Rafael J." (Sorocaba, SP · 03/08/2026), com o avatar "RJ", e o botão "Ver mais avaliações (restam 20)"

**CA-07-03 · Ver mais, de 5 em 5**
- **Dado** a lista com 5 avaliações e "restam 20"
- **Quando** toco no botão
- **Então** a lista passa a ter 10, o botão diz "restam 15" e o foco está na 6ª avaliação da lista
- **Quando** toco mais três vezes **Então** a lista tem 25 avaliações e o botão não existe mais

**CA-07-04 · Estrelas do título**
- **Dado** o topo da página do produto 3084
- **Quando** toco nas estrelas "4,9 (31 avaliações)"
- **Então** a página rola até `#avaliacoes-produto`

**CA-07-05 · Falha não derruba**
- **Dado** o mock com `?_falha=500` em `/produtos/3084/avaliacoes/resumo`
- **Quando** abro o produto
- **Então** a página responde 200, com H1, preço e Comprar; a seção de avaliações mostra o estado de erro com "Tentar de novo"
- **Dado** a falha só em `/produtos/3084/avaliacoes` **Quando** toco em "Ver mais" **Então** as 5 avaliações continuam na tela, com a mensagem de erro ao lado do botão

**CA-07-06 · Celular**
- **Dado** o produto 3084 em 390 px
- **Quando** rolo até a lista
- **Então** o botão "Ver mais avaliações" ocupa a largura total do bloco, a nota fica acima do carrossel e não há rolagem horizontal da página

**CA-07-07 · Produto sem avaliações**
- **Dado** um produto com `total: 0`
- **Quando** abro a página
- **Então** não há estrelas no título, nem a âncora "Avaliações", nem a seção

## 4. Contratos

| Endpoint | Schema | Usado para |
|---|---|---|
| `GET /avaliacoes/resumo` | `ResumoDeAvaliacoes` | Faixa "O que dizem os clientes" |
| `GET /produtos/{id}/avaliacoes/resumo` | `ResumoDeAvaliacoes` | Nota e os 6 depoimentos do carrossel do produto |
| `GET /produtos/{id}/avaliacoes?deslocamento=6&limite=5` | `FatiaDeAvaliacoes` | Lista "Todas as avaliações" e o "Ver mais" |

Detalhes em [docs/api/endpoints/avaliacoes.md](../../docs/api/endpoints/avaliacoes.md). Exemplos:
`avaliacoes-resumo.json`, `produto-3084-avaliacoes-resumo.json`, `produto-3084-avaliacoes.json`.
Os três são **ilustrativos** (`ilustrativo: true`) até o acesso à Trustvox (dúvida D4 do PRD).

A porta fala em **página** (`doProduto(id, pagina)`); o adaptador traduz para o contrato: a página
`n` é `deslocamento = 6 + (n − 1) × 5` e `limite = 5`.

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Faixa da loja | Esqueleto da nota e de 3 depoimentos | Nota e carrossel | Some | Some |
| Resumo do produto (nota e carrossel) | Esqueleto da nota e de 2 depoimentos | Nota e 6 depoimentos | A seção inteira some | Mensagem + "Tentar de novo" |
| Lista "Todas as avaliações" | 5 esqueletos de avaliação | 5 avaliações + botão | Some (6 ou menos avaliações) | Mensagem + "Tentar de novo" |
| "Ver mais" | Botão desativado, "Carregando…" | +5 e novo N; sem resto, o botão some | — | A lista fica; mensagem ao lado do botão |

## 6. Regras de marca, acessibilidade e SEO do módulo

- A faixa tem H2 "O que dizem os clientes". Na variante embutida, o H2 é o da seção do produto
  ("Avaliações de quem comprou") e "Todas as avaliações" é H3.
- O carrossel é o de `shared/ui`: trilho focável com rótulo "Depoimentos", setas com rótulo e nenhum
  avanço automático. Cada depoimento é `figure` com `blockquote` e `figcaption`.
- Estrelas de cada avaliação com `role="img"` e `aria-label` "5 de 5 estrelas". As estrelas da nota
  geral são decorativas (o número já está em texto).
- O avatar com iniciais é decorativo (`aria-hidden`); o nome vem em texto. A data usa `time` com `datetime` em ISO e mostra `03/08/2026`.
- A lista é uma `ol`. A chegada de novas avaliações é anunciada (`aria-live="polite"`) e o foco vai à primeira nova.
- "Ver mais" é botão de contorno, não verde. Nenhuma cor nova: as estrelas usam o token do protótipo.
- O texto das avaliações é texto puro: nunca entra por `v-html`.
- O `aggregateRating` do JSON-LD `Product` é do módulo 04 (usa a nota que vem no produto).

## 7. Fora do escopo

- Colocar a faixa na Home (módulo 09), nas políticas (10) e no hub de lojas (12).
- Escrever, responder ou filtrar avaliações; ordenar por nota; fotos de clientes.
- Embutir o widget da Trustvox (ADR 0012).
- JSON-LD `Review` por avaliação (os dados são ilustrativos).
- Avaliações na listagem, no Comparar e na página de loja: não existem.
