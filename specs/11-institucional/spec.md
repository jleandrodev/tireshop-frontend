# Spec 11 — Institucional: Sobre nós

| | |
|---|---|
| Marco | M8 |
| Contexto do domínio | [Conteúdo](../../docs/domain/conteudo.md); os cartões das lojas recebem dados de [Lojas físicas](../../docs/domain/lojas.md), juntados na página |
| Telas do protótipo | `sobre-nos.html` |
| ADRs que se aplicam | 0002, 0003, 0004, 0010, 0011, 0012 |
| Depende de | 00, 01, 02, 10 (e 05 e 07 para o filtro compacto e a faixa de avaliações; 12 para os dados das lojas) |

## 1. Objetivo

O cliente conhece a TireShop em uma página no formato de landing page: quem é a empresa, missão e
visão, os dois vídeos, as cinco lojas físicas e o estoque. No computador, cada faixa tem texto de um
lado e vídeo ou texto do outro; no celular, tudo empilha.

Os vídeos aparecem como capa com botão de play. O player do YouTube só é carregado quando o cliente
toca na capa.

## 2. Requisitos

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-11-01 | A página `/sobre-nos` abre com um hero preto: o H1 (`titulo`) e os parágrafos da primeira seção de um lado, o vídeo dessa seção do outro. | RF-13 |
| REQ-11-02 | Abaixo do hero, os fatos (`fatos`) aparecem em cartões: 4 colunas no computador, 2 no celular. | RF-13 |
| REQ-11-03 | As seções com título são montadas em linhas de duas colunas, na ordem: o texto de cada seção e, em seguida, o vídeo dela, se houver. Com o conteúdo atual: missão e visão lado a lado; depois o segundo vídeo de um lado e o texto das lojas, com a lista das cidades, do outro. | RF-13, pedido de 23/11 |
| REQ-11-04 | Cada vídeo é uma capa com botão de play e legenda (título e canal). O `iframe` de `youtube-nocookie.com` só é criado ao tocar, com `title` igual ao título do vídeo, e recebe o foco. Sem JavaScript, a capa é um link para o vídeo no YouTube. | RF-13, RNF-03, ADR 0012 |
| REQ-11-05 | O cartão de loja mostra foto, nome em H3, telefone (link de ligação), endereço, horário, os 6 primeiros serviços, "Ver todos os N serviços" quando há mais de 6, e o botão "Conheça a loja", que leva à página da loja. | RF-13, RF-14 |
| REQ-11-06 | A seção das lojas mostra os cartões em 3 colunas no computador e fecha com o texto de apoio (`lojasTexto`) e o botão "Ver todas as lojas". | RF-13, RF-14 |
| REQ-11-07 | A seção Estoque mostra dois textos lado a lado (o segundo começa no primeiro `titulo` dos blocos) e, abaixo, as 3 fotos. | RF-13 |
| REQ-11-08 | No celular (390 px) toda faixa vira uma coluna, sem rolagem horizontal. | RF-13, RNF-02 |
| REQ-11-09 | A página leva o filtro compacto no topo (módulo 05), as migalhas Home › Sobre nós e a faixa de avaliações antes do rodapé (módulo 07). | RF-02, RF-10 |
| REQ-11-10 | O item "Sobre Nós" do menu e o link "Sobre nós" do rodapé abrem `/sobre-nos`. | RF-13, pedido de 23/11 |
| REQ-11-11 | Metadados: título e descrição de `seo`, canônica e `BreadcrumbList`; um H1 e títulos sem pulo de nível. | RNF-01 |
| REQ-11-12 | Falha ao buscar `/institucional` mostra o estado de erro com "Tentar de novo". Sem os dados das lojas (falha ou lista vazia), a seção das lojas mostra só o texto de apoio e "Ver todas as lojas". | RNF-06 |
| REQ-11-13 | A resposta de `GET /institucional` é validada por schema na borda, e o bloco `video` passa a fazer parte de `BlocoDeTexto`. | RNF-05, ADR 0004 |

## 3. Critérios de aceite

**CA-11-01 · Abrir o Sobre nós**
- **Dado** o conteúdo de `GET /institucional`
- **Quando** abro `/sobre-nos` em 1440 px
- **Então** vejo o H1 "Olá, somos a TireShop!" sobre fundo preto, com o texto à esquerda e a capa do vídeo "TireShop - A evolução nos conecta com você!" à direita, e quatro cartões: "Desde 2001", "5 lojas físicas", "Estoque 100% próprio" e "Até 12x sem juros"

**CA-11-02 · Texto de um lado, vídeo ou texto do outro**
- **Dado** a página em 1440 px
- **Quando** rolo até as seções
- **Então** "Missão da TireShop" e "Nossa visão" estão lado a lado; na linha seguinte, a capa do vídeo "Comprar na TireShop é confiável? Uma dica do Tarso Marques!" está à esquerda e "Conheça nossas lojas físicas", com as cinco cidades em lista, à direita

**CA-11-03 · O vídeo só carrega ao tocar**
- **Dado** a página recém-aberta, sem nenhum `iframe`
- **Quando** toco na primeira capa
- **Então** aparece um `iframe` com `src` começando por `https://www.youtube-nocookie.com/embed/NUM0AGJL3dU`, com `title` "TireShop - A evolução nos conecta com você!", e o foco está nele

**CA-11-04 · Sem JavaScript, a capa é um link**
- **Dado** a página pedida sem executar JavaScript
- **Quando** leio o HTML
- **Então** as duas capas são links para `https://www.youtube.com/watch?v=NUM0AGJL3dU` e `…?v=gn6iypnkRhA`, e não há `iframe`

**CA-11-05 · Cartão de loja**
- **Dado** a loja de Novo Hamburgo, com 11 serviços
- **Quando** o cartão é mostrado
- **Então** vejo "TireShop Autocenter Novo Hamburgo", "(51) 3593-8888", "Rua Coronel Frederico Linck, 88", os dois horários, 6 serviços, "Ver todos os 11 serviços" e o botão "Conheça a loja" apontando para `/lojas/novo-hamburgo`

**CA-11-06 · Estoque**
- **Dado** a página em 1440 px
- **Quando** rolo até "Estoque"
- **Então** vejo o H2 "Estoque" com dois parágrafos à esquerda, o H3 "Produto indisponível ou Sob Consulta" com o texto à direita, e três fotos com o texto alternativo "Estoque da TireShop, foto 1", "foto 2" e "foto 3"

**CA-11-07 · No celular tudo empilha**
- **Dado** a página em 390 px
- **Quando** percorro as faixas
- **Então** o vídeo do hero está abaixo do texto, missão vem antes de visão, os cartões de loja e as fotos do estoque estão em uma coluna, os fatos em duas, e não há rolagem horizontal

**CA-11-08 · Menu e rodapé levam à página**
- **Dado** a Home
- **Quando** clico em "Sobre Nós" no menu, ou em "Sobre nós" no rodapé
- **Então** chego a `/sobre-nos`

**CA-11-09 · Sem os dados das lojas**
- **Dado** a página sem as lojas (lista vazia, ou o mock com `?_falha=500` em `/lojas`)
- **Quando** abro `/sobre-nos`
- **Então** todo o resto aparece, a seção das lojas mostra o texto de apoio e "Ver todas as lojas", e o status é 200

## 4. Contratos

| Endpoint | Schema | Usado para |
|---|---|---|
| `GET /institucional` | `Institucional` (com `BlocoDeTexto[]`, incluindo `video`) | Hero, fatos, seções, texto das lojas, estoque, metadados |
| `GET /lojas` | `HubDeLojas` → `LojaResumo[]` | Cartões das cinco lojas (o adaptador, o mock e a ligação são do módulo 12) |

Detalhes em [docs/api/endpoints/conteudo.md](../../docs/api/endpoints/conteudo.md).

O contexto Conteúdo **não importa** o contexto Lojas (ver [context-map](../../docs/domain/context-map.md)).
O cartão de loja deste módulo recebe os dados por `props`, em um formato próprio da tela; quem
converte `LojaResumo` para esse formato é a página (`app/`). Por isso a task que liga os cartões a
`GET /lojas` está no módulo 12 (T-1215), e este módulo fecha com a seção das lojas no estado "sem dados".

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Página (hero, fatos, seções, estoque) | No servidor, não há | Conteúdo | Seção sem blocos some | `EstadoDeErro` + "Tentar de novo" no lugar do conteúdo |
| Vídeo | — | Capa; player depois do toque | Seção sem vídeo ocupa a largura inteira | Capa quebrada: fica o link com o título |
| Cartões das lojas | Esqueleto de 3 cartões | 5 cartões + texto de apoio | Só o texto de apoio e "Ver todas as lojas" | Igual ao vazio (a página não avisa erro de um bloco secundário) |
| Fotos do estoque | — | 3 fotos | Lista some | — |

## 6. Regras de marca, acessibilidade e SEO do módulo

- H1 é o `titulo` ("Olá, somos a TireShop!"). Títulos das seções e "Estoque" em H2; nome da loja e o subtítulo do estoque em H3.
- O título "Conheça nossas lojas físicas" aparece **uma vez só** (no texto ao lado do vídeo); a seção dos cartões tem nome acessível por `aria-label="Lojas físicas"`, sem título visível repetido.
- Sobre o fundo preto do hero, texto branco; nenhum amarelo como texto sobre branco no resto da página.
- "Conheça a loja" usa a variante da marca; "Ver todas as lojas", contorno. Nenhum verde de ação na página.
- A capa do vídeo tem nome acessível com o título do vídeo; a imagem da capa é decorativa (`alt=""`). O `iframe` leva `title`, `allowfullscreen` e `referrerpolicy="strict-origin-when-cross-origin"`.
- "Ver todos os N serviços" é um `details`: funciona sem JavaScript e com teclado.
- Telefone é link `tel:`; endereço em `address`.
- Fotos e capas com `width`, `height` e `loading="lazy"` (a capa do hero fica na primeira dobra do celular: sem `lazy`).
- Nenhum `iframe` na abertura (antipadrão A15).

Invariantes herdados do `tools/hifi/verify.py` (regra `_institucional`), que viram e2e: H1 igual ao do
site; os dois vídeos, nesta ordem, como capa; zero `iframe` antes do toque; capa sem imagem quebrada;
tocar abre o player de `youtube-nocookie` com título; 3 fotos do estoque; no computador, hero com
texto à esquerda e vídeo à direita, e toda linha dupla com duas colunas alinhadas; o rodapé leva ao
Sobre nós. A regra "5 lojas, cada uma levando à própria página" é conferida na T-1215 (módulo 12).

## 7. Fora do escopo

- Adaptador, mock e casos de uso de `GET /lojas` (módulo 12).
- Filtro compacto (módulo 05) e faixa de avaliações (módulo 07).
- O menu e o rodapé em si (módulo 02): aqui só se confere que o link aponta para a página.
- Outras páginas institucionais (trabalhe conosco, imprensa).
- Vídeo na página de produto.
