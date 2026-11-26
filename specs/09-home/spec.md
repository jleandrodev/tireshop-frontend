# Spec 09 — Home

| | |
|---|---|
| Marco | M8 |
| Contexto do domínio | [Conteúdo](../../docs/domain/conteudo.md) (`PaginaInicial`), com blocos de [Catálogo](../../docs/domain/catalogo.md), [Lojas](../../docs/domain/lojas.md) e [Avaliações](../../docs/domain/avaliacoes.md) |
| Telas do protótipo | `home.html` |
| ADRs que se aplicam | 0002, 0003, 0004, 0007, 0008, 0010, 0011, 0012 |
| Depende de | 00, 01, 02, 03, 05, 06, 07 (e o contexto Lojas para a seção de lojas) |

## 1. Objetivo

O cliente chega à Home e, na primeira dobra, vê as campanhas e já pode buscar o pneu pela medida.
Rolando, encontra as ofertas da semana, as condições de compra, as lojas físicas, os departamentos,
as formas de entrega, as marcas, as avaliações, os artigos do blog, o texto de apoio e as perguntas.

A Home é uma página de **composição**: cada bloco vem do seu contexto, pela API pública dele, e a
página junta. Nenhum contexto importa o outro (Conteúdo não conhece Catálogo, Lojas nem Avaliações).

## 2. Requisitos

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-09-01 | A primeira dobra tem o carrossel de banners (até 3) com arte própria por tela: 1440×320 no computador e 390×290, mais alta, no celular. O texto da campanha vai no `alt`. | RF-17 |
| REQ-09-02 | O banner só troca por ação do usuário (setas, pontos, arraste ou teclado): **não há rotação automática**. Com um banner só, não há controles. | RF-17, RNF-02 |
| REQ-09-03 | O filtro de pneus (módulo 05) fica sobreposto ao banner. No celular, o primeiro campo da medida aparece sem rolar (até 844 px). | RF-17, RF-02 |
| REQ-09-04 | "Ofertas da semana" mostra os 8 produtos da vitrine de ofertas: 2 linhas de 4 no computador e 3 linhas de 2 no celular (6 visíveis). | RF-17 |
| REQ-09-05 | O bloco de benefícios mostra os 4 itens da API (ícone, título, texto), em fundo claro, logo depois das ofertas. | RF-17 |
| REQ-09-06 | A seção de lojas físicas mostra as lojas de `GET /lojas`, na ordem recebida, em cards com foto, cidade e UF, endereço, horário, telefone e o botão amarelo "Ver a loja". No celular é um carrossel manual. | RF-17, RF-14 |
| REQ-09-07 | A seção de departamentos mostra cada departamento com ícone, nome e resumo dos aros, com link para a categoria. | RF-17, RF-01 |
| REQ-09-08 | A seção de entrega mostra os dois cartões: "No seu endereço" e "Em uma oficina conveniada". | RF-17 |
| REQ-09-09 | A seção de marcas mostra os logos das marcas em carrossel manual. | RF-17 |
| REQ-09-10 | A faixa de avaliações "O que dizem os clientes" (módulo 07) aparece como seção da página, e não repetida acima do rodapé. | RF-17, RF-10 |
| REQ-09-11 | "Compre com segurança" mostra os 4 itens da API e o botão do WhatsApp. | RF-17 |
| REQ-09-12 | "Guia do Pneu" mostra os 3 artigos mais recentes (arte, categoria, data, título e resumo), com link para o blog atual. No celular é um carrossel manual. | RF-17 |
| REQ-09-13 | O texto de apoio aparece recolhido, com "Ler mais" e a imagem fixa ao lado, e **o H1 da página é o título dele** (pedido da liveSEO). Nenhum outro bloco tem H1. | RF-17, RNF-01 |
| REQ-09-14 | As perguntas frequentes aparecem em acordeão, com o convite ao WhatsApp ao lado. | RF-17 |
| REQ-09-15 | Os blocos aparecem na ordem do protótipo: banner e filtro, ofertas, benefícios, lojas, departamentos, entrega, marcas, avaliações, segurança, blog, texto de apoio, perguntas. | RF-17 |
| REQ-09-16 | Cada bloco de outro contexto (ofertas, lojas, avaliações) busca o próprio dado, e a falha ou a demora de um não derruba nem segura os outros. | RNF-06, ADR 0002 |
| REQ-09-17 | Metadados: título e descrição de `seo`, canônica `/` e JSON-LD `FAQPage` com as perguntas, no HTML do servidor. | RNF-01 |
| REQ-09-18 | A primeira dobra respeita o desempenho: o primeiro banner carrega com prioridade, os outros e as imagens abaixo da dobra são preguiçosos, e toda imagem tem largura e altura. | RNF-03 |

## 3. Critérios de aceite

**CA-09-01 · Primeira dobra no computador**
- **Dado** a Home em 1440 px
- **Quando** a página abre
- **Então** vejo o banner "Ofertas em pneus aro 17 a 22" (1440×320), os controles "Campanha anterior", 3 pontos e "Próxima campanha", e o filtro de pneus sobreposto à base do banner

**CA-09-02 · O banner não anda sozinho**
- **Dado** a Home aberta
- **Quando** espero 8 segundos sem tocar em nada
- **Então** o primeiro banner continua na tela
- **Quando** toco em "Próxima campanha" **Então** vejo o banner "Frete grátis acima de R$ 1.000 no Sul e Sudeste" e o segundo ponto fica marcado

**CA-09-03 · Primeira dobra no celular**
- **Dado** a Home em 390×844
- **Quando** a página abre
- **Então** o banner usa a arte de 390×290 e o campo de largura do filtro está inteiro acima de 844 px

**CA-09-04 · Ofertas da semana**
- **Dado** a vitrine de ofertas com 8 produtos
- **Quando** olho a seção em 1440 px **Então** vejo 8 cards em 2 linhas de 4, o primeiro "Pneu Hankook Ventus Prime 2 K115 225/45 R17 91V…" com "R$ 529,00", "12x de R$ 44,08" e "R$ 502,55 à vista"
- **Quando** olho em 390 px **Então** vejo 6 cards em 3 linhas de 2

**CA-09-05 · Lojas físicas**
- **Dado** as 5 lojas da API
- **Quando** olho a seção em 1440 px **Então** vejo 5 cards, de Novo Hamburgo a Ribeirão Preto, cada um com o botão amarelo "Ver a loja" levando à página da loja
- **Quando** olho em 390 px **Então** a lista é um carrossel que só anda pelas setas "Loja anterior" e "Próxima loja" ou pelo arraste

**CA-09-06 · H1 no texto de apoio**
- **Dado** a URL `/`
- **Quando** peço a página sem executar JavaScript
- **Então** o HTML tem um único H1, "Loja de pneus TireShop: referência em confiança e variedade desde 2001", dentro do bloco de texto de apoio, com a imagem ao lado; os títulos das outras seções são H2

**CA-09-07 · Blog**
- **Dado** os 3 artigos da API
- **Quando** olho "Guia do Pneu"
- **Então** vejo 3 artigos, o primeiro "Pneu ressecado: causas, riscos e como identificar", com link para `https://www.tireshop.com.br/Blog/pneu-ressecado`

**CA-09-08 · Ordem e composição**
- **Dado** a Home carregada
- **Quando** leio as seções de cima para baixo
- **Então** a ordem é: ofertas, benefícios, lojas, departamentos, entrega, marcas, avaliações, segurança, blog, texto de apoio e perguntas; a faixa de avaliações aparece uma vez só

**CA-09-09 · Um bloco que falha não derruba a página**
- **Dado** o mock com `?_falha=500` em `/produtos` (vitrine)
- **Quando** abro a Home
- **Então** a página responde 200, a seção de ofertas mostra o estado de erro com "Tentar de novo" e os outros blocos aparecem
- **Dado** a falha em `/lojas` ou em `/avaliacoes/resumo` **Então** só aquela seção some

**CA-09-10 · SEO**
- **Dado** a URL `/`
- **Quando** peço a página sem executar JavaScript
- **Então** o `<title>` é "TireShop: pneus novos com nota fiscal e garantia, em até 12x sem juros" e há um JSON-LD `FAQPage` com 6 perguntas

## 4. Contratos

| Endpoint | Schema | Contexto | Usado para |
|---|---|---|---|
| `GET /home` | `PaginaInicial` | Conteúdo | Banners, benefícios, entrega, segurança, blog, texto de apoio, perguntas, metadados |
| `GET /produtos?vitrine=ofertas&porPagina=8` | `ListaDeProdutos` | Catálogo | "Ofertas da semana" |
| `GET /lojas` | `HubDeLojas` | Lojas | Seção de lojas físicas |
| `GET /avaliacoes/resumo` | `ResumoDeAvaliacoes` | Avaliações | Faixa "O que dizem os clientes" |
| `GET /navegacao` | `Navegacao` | Conteúdo | Departamentos, marcas e contato (WhatsApp); já carregado pelo layout |

Detalhes em [conteudo.md](../../docs/api/endpoints/conteudo.md), [catalogo.md](../../docs/api/endpoints/catalogo.md),
[lojas.md](../../docs/api/endpoints/lojas.md) e [avaliacoes.md](../../docs/api/endpoints/avaliacoes.md).
Exemplos: `home.json`, `produtos-vitrine-ofertas.json`, `lojas.json`, `avaliacoes-resumo.json`, `navegacao.json`.

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Página (`GET /home`) | No servidor, não há | Blocos editoriais | — | Página de erro (sem `/home` não há H1) |
| Banners | Espaço reservado na proporção da arte | Carrossel | Sem banner: o filtro sobe para o topo | — |
| Ofertas da semana | 8 esqueletos de card | 8 cards | Seção some | Mensagem + "Tentar de novo" |
| Lojas físicas | 5 esqueletos de cartão | Cartões | Seção some | Seção some |
| Faixa de avaliações | Esqueleto da nota | Nota e depoimentos | Some | Some |
| Benefícios, entrega, segurança, blog, perguntas | — | Bloco | Lista vazia: o bloco some | — |
| Departamentos e marcas | — | Grade e carrossel | Somem | Somem (a navegação já tratou o erro) |
| Texto de apoio | — | Título em H1, texto recolhido | — (obrigatório no contrato) | — |

## 6. Regras de marca, acessibilidade e SEO do módulo

- Um único H1, o título do texto de apoio. Títulos de seção em H2; benefícios, lojas, entrega,
  segurança, artigos e perguntas em H3; nome do produto em H2 dentro do card (como na listagem).
- Verde de ação só no Comprar dos cards. "Ver a loja" é o botão amarelo da marca (`ts-btn--brand`),
  com texto escuro; amarelo nunca como texto sobre branco. WhatsApp usa o token de terceiros.
- O carrossel de banners tem `aria-roledescription="carrossel"` e rótulo "Campanhas"; cada slide diz
  "1 de 3"; o ponto atual leva `aria-current`; pontos com alvo de 24 px, setas com 44 px.
- **Nenhum carrossel anda sozinho** (banners, lojas, marcas, depoimentos, blog). Respeita `prefers-reduced-motion`.
- O banner usa `picture`, com a arte de celular até 899 px. O primeiro tem `fetchpriority="high"`; os outros, `loading="lazy"`.
- As artes do blog têm `alt` vazio (o título já está escrito na arte e no H3 ao lado). Os links do blog são externos.
- Texto de apoio e respostas das perguntas só entram por `v-html` como `HtmlSeguro`.
- Regra herdada de `_home` em `tools/hifi/verify.py`: no celular, o primeiro campo da medida fica acima da dobra (844 px).
- Nenhuma URL montada à mão: `rotas.categoria`, `rotas.loja`, `rotas.lojas` (antipadrão A11).

## 7. Fora do escopo

- O filtro de pneus (módulo 05), o card e o Comprar (módulos 03 e 06), a faixa de avaliações (módulo 07), o cartão de loja e `listarLojas` (contexto Lojas).
- Cabeçalho, rodapé, newsletter, cookies e botão flutuante do WhatsApp (módulo 02).
- Blog dentro do site: a Home só lista 3 artigos e aponta para o blog atual.
- Lista de oficinas conveniadas; personalização por região ou por cliente; teste A/B de banners.
- Rotação automática de banners: proibida (decisão H-2 do protótipo, RNF-02).
