# Spec 12 — Lojas físicas

| | |
|---|---|
| Marco | M9 |
| Contexto do domínio | [Lojas físicas](../../docs/domain/lojas.md) |
| Telas do protótipo | `lojas.html` (hub), `loja-curitiba.html`, `loja-sao-paulo.html`, `loja-ribeirao-preto.html`, `loja-joinville.html`, `loja-novo-hamburgo.html`, `loja-curitiba-sem-banners.html` |
| ADRs que se aplicam | 0002, 0003, 0004, 0008, 0009, 0010, 0011, 0012 |
| Depende de | 00, 01, 02, 03 (`ProdutoResumo` e `CardProduto`), 07 (faixa de avaliações no hub), 11 (cartões do Sobre nós) |

## 1. Objetivo

O cliente vê as cinco lojas físicas em uma página (o hub, com o layout do e-commerce) e abre a página
de cada uma. A **página de loja é independente do e-commerce** (ADR 0009): tem cabeçalho, rodapé,
contatos e botão de WhatsApp da própria loja, e um único link para o site (o logo do cabeçalho, que leva à Home). Ela não
vende pelo site: leva ao WhatsApp, ao orçamento e ao agendamento da loja.

A página se monta pelo conteúdo. Com banners, abre com o carrossel e a introdução clara; sem banners,
com o hero preto. A vitrine "Ofertas da loja" só aparece se a loja anunciar produtos.

## 2. Requisitos

**Hub (`/lojas`)**

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-12-01 | O hub usa o layout do e-commerce e abre com as migalhas Home › Lojas físicas, o H1 "Lojas físicas TireShop: pneus e serviços automotivos" (o `titulo` da API), **sem marcação sob as letras**, e a introdução (`intro`). | RF-14 |
| REQ-12-02 | O hub mostra as 5 lojas na ordem da API. Cada cartão tem fachada, cidade e UF em H2 com link, endereço, horário, os 6 primeiros serviços, o botão do WhatsApp da loja com o número, "Ver a loja" e "Como chegar". | RF-14 |
| REQ-12-03 | O hub mostra "Três jeitos de comprar" (receber em casa; montar em oficina conveniada, que não é ponto de retirada, com o link do regulamento; ir a uma das lojas, dizendo em quais dá para agendar pelo site). | RF-14 |
| REQ-12-04 | O hub mostra "Onde estamos": os 5 endereços com "Abrir no Google Maps" e o mapa como capa, que só carrega ao tocar. | RF-14, RNF-03 |
| REQ-12-05 | O hub fecha com o texto de apoio da liveSEO, com "Ler mais", **no lugar do FAQ**. Sem texto de apoio, mostra o FAQ em acordeão. | RF-14 |
| REQ-12-06 | O hub não leva o filtro de pneus, nem o completo nem o compacto. Leva a faixa de avaliações antes do rodapé (componente do módulo 07). | RF-14, RF-10 |
| REQ-12-07 | Metadados do hub: título e descrição de `seo`, canônica, `BreadcrumbList` e `FAQPage` com as perguntas de `faq`. | RNF-01 |

**Página de loja (`/lojas/<slug>`)**

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-12-08 | A página usa o layout `loja`, independente do e-commerce: sem cabeçalho, menu, busca, minicart, rodapé, faixa de avaliações, migalhas e "outras lojas" do site, e sem o telefone e o WhatsApp do e-commerce. | RF-15, ADR 0009 |
| REQ-12-09 | O cabeçalho da loja mostra o logo, "Autocenter <cidade>", o telefone e o WhatsApp da loja, "Agendar serviço" só quando há URL de agendamento, "Solicite orçamento" e as redes da loja; o logo é link para a Home do e-commerce (26/11: sem botão "Loja online"). "Loja online" é o **único** link da página para o e-commerce. | RF-15 |
| REQ-12-10 | A abertura tem três componentes: com banners, o carrossel e, logo abaixo, a introdução clara; sem banners, o hero preto. Nunca os dois. O H1 "TireShop Autocenter / Loja de pneus em <cidade>" fica no que aparecer, e é único. | RF-15, pedido de 26/11 |
| REQ-12-11 | O carrossel de banners fica logo abaixo do cabeçalho, em faixa de 1600×250, só anda por ação do usuário, e cada banner leva ao destino dele (mapa, WhatsApp da loja, orçamento ou URL). No celular usa a arte própria (`imagemCelular`) quando houver. | RF-15 |
| REQ-12-12 | A introdução clara tem fundo branco, a cidade com um traço amarelo embaixo (nunca amarelo como cor do texto), a frase de apresentação, o WhatsApp, "Agendar serviços" (quando há) e a fachada; no computador tem até 420 px de altura. O hero preto tem o mesmo conteúdo, com a cidade em amarelo sobre o preto, e até 640 px. Nenhum dos dois leva endereço, orçamento ou "Como chegar". | RF-15, RNF-04 |
| REQ-12-13 | Abaixo da abertura, quatro cards: Endereço (com "Como chegar"), Horário, Telefone e WhatsApp (sem repetir o número quando o WhatsApp é o próprio telefone) e Orçamento ("Solicite um orçamento"). Em 4 colunas no computador e 1 no celular, sem botão passando da borda. | RF-15 |
| REQ-12-14 | A vitrine "Ofertas da loja" é opcional: aparece só quando há produtos, com a variante de loja do card (preço da loja como vem da API, botão "Pedir no WhatsApp" para o WhatsApp da loja, sem selo de frete e sem Comprar), em 4 colunas no computador e 2 no celular. | RF-15 |
| REQ-12-15 | Os serviços aparecem em grade, com foto, nome em H3 e texto. | RF-15 |
| REQ-12-16 | As marcas aparecem em guias, na ordem pneus, freios, suspensão, filtros, óleo e outras; grupo vazio não vira guia; **Pneus abre primeiro**; setas, Home e End trocam de guia; todo item é um logo com texto alternativo. | RF-15, RNF-02 |
| REQ-12-17 | "Como chegar" mostra endereço, CNPJ (quando há), "Abrir no Google Maps", o Instagram da loja e o mapa como capa, que só carrega ao tocar. | RF-15, RNF-03, ADR 0012 |
| REQ-12-18 | As condições da loja aparecem em 3 cartões, com o que a API mandar em `condicoes`. | RF-15 |
| REQ-12-19 | A página fecha com o texto de apoio da liveSEO quando ele existe; senão, com o FAQ da loja em acordeão e o botão do WhatsApp da loja. | RF-15 |
| REQ-12-20 | O rodapé da loja mostra nome, redes, endereço, CNPJ (quando há), horário, telefone e WhatsApp da loja e o link da Política de Privacidade. O botão flutuante abre o WhatsApp da loja. | RF-15 |
| REQ-12-21 | Nenhum texto fixo, texto alternativo ou conteúdo de exemplo da página de loja diz "cobrimos qualquer oferta", "ou compre na loja online" ou "compre online e instale". | RF-15, pedido de 23/11 |
| REQ-12-22 | Metadados da loja: título e descrição de `seo`, canônica e JSON-LD `AutomotiveBusiness` com nome, endereço, telefone, imagem, mapa e redes; mais `FAQPage` quando há perguntas. | RNF-01 |
| REQ-12-23 | Slug de loja que não existe responde 404 no servidor, com a página de não encontrado. Falha da API mostra o estado de erro com "Tentar de novo". | RNF-06 |

**Estrutura e ligações com o resto do site**

| Id | Requisito | Origem |
|---|---|---|
| REQ-12-24 | O contexto Lojas não importa Carrinho, Entrega nem a navegação do e-commerce. Do Catálogo usa só o que a API pública dele expõe para a vitrine (`ProdutoResumo`). | ADR 0009, RNF-07 |
| REQ-12-25 | As respostas de `GET /lojas` e `GET /lojas/{slug}` são validadas por schema na borda; resposta fora do contrato vira `ErroDeContrato`. | RNF-05, ADR 0004 |
| REQ-12-26 | No Sobre nós, os cartões das cinco lojas usam os dados de `GET /lojas`, e cada um leva à página da própria loja. | RF-13, RF-14 |
| REQ-12-27 | No cabeçalho do e-commerce, o mega menu "Lojas Físicas" mostra as cinco lojas com os dados de `GET /lojas`. Sem os dados, o item continua um link simples para o hub. | RF-14, RF-01 |
| REQ-12-28 | Existe o cartão compacto de loja (`CartaoLoja`: foto, cidade e UF, endereço, horário, telefone e "Ver a loja"), usado pela seção de lojas da Home. | RF-14, RF-17 |

## 3. Critérios de aceite

**CA-12-01 · Abrir o hub**
- **Dado** as 5 lojas de `GET /lojas`
- **Quando** abro `/lojas` em 1440 px
- **Então** vejo o H1 "Lojas físicas TireShop: pneus e serviços automotivos" sem destaque sob as letras, 5 cartões começando por Novo Hamburgo, cada um com fachada, endereço, horário, 6 serviços, o botão do WhatsApp, "Ver a loja" e "Como chegar", e não vejo o filtro de pneus

**CA-12-02 · O hub fecha com o texto da liveSEO**
- **Dado** o hub com `textoApoio` e 8 perguntas em `faq`
- **Quando** rolo até o fim
- **Então** vejo o texto "Lojas físicas TireShop: pneus e soluções automotivas presenciais" em H2, com "Ler mais", não vejo acordeão de FAQ, e o HTML traz um `FAQPage` com 8 perguntas

**CA-12-03 · Do hub para a loja**
- **Dado** o hub aberto
- **Quando** clico em "Ver a loja" no cartão de Curitiba
- **Então** chego a `/lojas/curitiba`, com o cabeçalho da loja no lugar do cabeçalho do site

**CA-12-04 · Loja com banners**
- **Dado** a loja `curitiba`, com 3 banners
- **Quando** abro `/lojas/curitiba` em 1440 px
- **Então** vejo o carrossel logo abaixo do cabeçalho, depois a introdução de fundo branco com o H1 "TireShop Autocenter Loja de pneus em Curitiba", de até 420 px de altura, e não existe hero preto

**CA-12-05 · Loja sem banners**
- **Dado** a loja de Curitiba sem banners (`loja-curitiba-sem-banners.json`)
- **Quando** abro a página
- **Então** vejo o hero preto com o mesmo H1, não existe carrossel nem introdução clara, não existe a seção "Ofertas da loja" (a vitrine veio vazia), e há um H1 só

**CA-12-06 · Agendamento só onde existe**
- **Dado** `novo-hamburgo` (com `agendamentoUrl`) e `curitiba` (sem)
- **Quando** abro cada página
- **Então** em Novo Hamburgo há "Agendar serviço" no cabeçalho e "Agendar serviços" na abertura, apontando para a URL de agendamento; em Curitiba não há nenhum dos dois

**CA-12-07 · Telefone e WhatsApp sem repetição**
- **Dado** Novo Hamburgo (telefone "(51) 3593-8888" e WhatsApp `555135938888`) e Curitiba (telefone "(41) 3333-1777" e dois WhatsApps)
- **Quando** olho o card "Telefone e WhatsApp"
- **Então** em Novo Hamburgo o número aparece uma vez; em Curitiba vejo o telefone, "WhatsApp (41) 98481-6579" e "WhatsApp (41) 99155-8619"

**CA-12-08 · Vitrine da loja**
- **Dado** `curitiba`, com 4 produtos na vitrine
- **Quando** rolo até "Ofertas da loja"
- **Então** vejo 4 cards em 4 colunas; o primeiro mostra "R$ 529,00", "em até 10x de R$ 52,90 sem juros" e "R$ 497,26 à vista", tem o botão "Pedir no WhatsApp" apontando para `https://wa.me/5541984816579`, e não tem botão Comprar nem selo de frete

**CA-12-09 · Marcas em guias**
- **Dado** `curitiba`, com 6 grupos de marcas
- **Quando** chego à seção "Marcas que a loja trabalha"
- **Então** a guia "Pneus" está selecionada e só o painel dela aparece, com 5 logos; ao apertar a seta para a direita o foco vai para "Freios" e o painel mostra 14 logos; End leva a "Outras marcas"; Home volta a "Pneus"

**CA-12-10 · A loja é independente do e-commerce**
- **Dado** qualquer página de loja
- **Quando** examino a página inteira
- **Então** não existe cabeçalho, menu, busca, minicart, rodapé, faixa de avaliações nem migalhas do site; "(41) 3317-2251" e `554133172251` não aparecem; existe exatamente um link para a Home, que é o logo do cabeçalho; e o botão flutuante aponta para o WhatsApp da loja

**CA-12-11 · Texto da liveSEO ou FAQ**
- **Dado** `curitiba` (com `textoApoio`) e `novo-hamburgo` (sem)
- **Quando** rolo até o fim de cada página
- **Então** Curitiba mostra "TireShop Auto Center: a sua loja de pneus em Curitiba" com "Ler mais" e nenhum acordeão; Novo Hamburgo mostra "Perguntas sobre a loja" com 4 perguntas e o botão do WhatsApp da loja; as duas têm `AutomotiveBusiness` e `FAQPage` no HTML

**CA-12-12 · Mapa só ao tocar**
- **Dado** a página de loja recém-aberta
- **Quando** conto os `iframe`
- **Então** não há nenhum; depois de tocar em "Ver o mapa" há um, com o `title` "Mapa da TireShop Curitiba no Google Maps"

**CA-12-13 · Loja no celular**
- **Dado** `/lojas/curitiba` em 390 px
- **Quando** percorro a página
- **Então** os cards de contato estão em 1 coluna, a vitrine em 2, nenhum botão passa da borda do card, o H1 está nos primeiros 460 px e não há rolagem horizontal

**CA-12-14 · Loja que não existe**
- **Dado** o slug `florianopolis`
- **Quando** peço `/lojas/florianopolis`
- **Então** a resposta tem status 404 e mostra a página de não encontrado

**CA-12-15 · Sobre nós com as cinco lojas**
- **Dado** `/sobre-nos` com `GET /lojas` respondendo
- **Quando** rolo até as lojas
- **Então** vejo 5 cartões em 3 colunas, e os botões "Conheça a loja" apontam para `/lojas/novo-hamburgo`, `/lojas/joinville`, `/lojas/curitiba`, `/lojas/sao-paulo` e `/lojas/ribeirao-preto`

**CA-12-16 · Mega menu de lojas**
- **Dado** a Home em 1440 px, com `GET /lojas` respondendo
- **Quando** abro "Lojas Físicas" no menu
- **Então** vejo as 5 lojas, cada uma com foto, cidade, UF e endereço, levando à própria página, e "Ver todas as lojas"; com `?_falha=500` em `/lojas`, "Lojas Físicas" é um link simples para `/lojas`

## 4. Contratos

| Endpoint | Schema | Usado para |
|---|---|---|
| `GET /lojas` | `HubDeLojas` (com `LojaResumo[]`) | Hub; cartões do Sobre nós; mega menu "Lojas Físicas"; seção de lojas da Home (módulo 09) |
| `GET /lojas/{slug}` | `Loja` (inclui `ProdutoResumo[]` em `vitrine`) | Página de loja inteira: cabeçalho, abertura, cards, vitrine, serviços, marcas, mapa, condições, texto, FAQ, rodapé, metadados |

Detalhes em [docs/api/endpoints/lojas.md](../../docs/api/endpoints/lojas.md). Slugs atuais: `curitiba`,
`sao-paulo`, `ribeirao-preto`, `joinville`, `novo-hamburgo`.

A página de loja **não** chama `GET /navegacao`: tudo o que ela mostra vem de `GET /lojas/{slug}`.

No mock, `GET /lojas/curitiba-sem-banners` devolve `loja-curitiba-sem-banners.json` (a página de
demonstração `loja-curitiba-sem-banners.html` do protótipo). Esse slug não aparece no hub.

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Hub: cartões das lojas | Esqueleto de 5 cartões | 5 cartões | "Nenhuma loja para mostrar agora" | `EstadoDeErro` + "Tentar de novo" |
| Hub: texto de apoio | — | Texto com "Ler mais" | FAQ em acordeão; sem os dois, some | Some |
| Hub: faixa de avaliações | Do módulo 07 | Faixa | Some | Some |
| Mega menu "Lojas Físicas" | Link simples | Painel com as 5 lojas | Link simples para o hub | Link simples para o hub |
| Página de loja | No servidor, não há | Loja | 404 | `EstadoDeErro` + "Tentar de novo", sem cabeçalho do e-commerce |
| Abertura | — | Banners + introdução clara | Sem banners: hero preto | — |
| Vitrine | — | Cards | Seção some | — |
| Serviços, condições | — | Lista | Seção some | — |
| Marcas | — | Guias | Grupo vazio some; sem grupo nenhum, a seção some | — |
| Mapa | Capa | Mapa depois do toque | — | Fica o link "Abrir no Google Maps" |
| Texto de apoio ou FAQ da loja | — | Texto, ou FAQ | Sem os dois, some | — |

## 6. Regras de marca, acessibilidade e SEO do módulo

- **H1 único**, no componente de abertura que aparecer. No H1 da loja, "TireShop Autocenter" é um prefixo menor e a cidade leva o destaque.
- Amarelo nunca como texto sobre branco: na introdução clara a cidade tem um traço amarelo embaixo; no hero preto a cidade é amarela (`/* sobre preto */`).
- O H1 do hub não tem marcação nem traço sob as letras.
- Verde de ação **não aparece** na página de loja: não há comprar. O WhatsApp usa a variante `whatsapp`.
- Hub: cidade em H2; "Três jeitos de comprar" e "Onde estamos" em H2, passos em H3. Loja: seções em H2, serviços em H3, produtos da vitrine em H2 (regra do card).
- O link da foto no cartão do hub é decorativo (`tabindex="-1"`, `aria-hidden`); o link de verdade é o do título.
- Cabeçalho da loja: os contatos são uma lista com `aria-label="Contatos da loja de <cidade>"`; as ações, um `nav` com `aria-label="Ações da loja"`.
- Carrossel de banners: região com `aria-roledescription="carrossel"` e `aria-label="Promoções da loja"`; cada slide é um grupo "N de total"; o texto do banner está no `alt`; o primeiro banner carrega com prioridade, os outros com `lazy`; sem rotação automática.
- Guias de marcas: `tablist` com `aria-label="Tipos de marca"`; cada guia mostra a contagem do grupo.
- Mapas: capa clicável; nenhum `iframe` antes do toque; `title` "Mapa da TireShop <cidade> no Google Maps" (loja) e "Mapa das lojas TireShop no Google Maps" (hub).
- Botão flutuante da loja: `aria-label` "Falar no WhatsApp da loja: <número>".
- `AutomotiveBusiness` com `name`, `address` (`PostalAddress`), `telephone`, `image`, `url`, `hasMap` e `sameAs`. O horário não entra como `openingHoursSpecification`: é texto livre do cliente (ver Pendências).
- "Único link para o e-commerce" quer dizer: um só link para a Home (o logo do cabeçalho) e nenhum link de navegação, produto ou categoria do site. Duas exceções herdadas do protótipo, registradas nas Pendências: o link "Política de Privacidade" do rodapé e os links que vierem dentro do texto de apoio da liveSEO.
- Telefones e links de WhatsApp saem de `shared/formatacao`; URLs internas, de `rotas.loja`, `rotas.lojas` e `rotas.home`.

Invariantes herdados do `tools/hifi/verify.py` (regras `_lojas` e `_loja`), que viram e2e:

- Hub: sem filtro; 5 lojas; mapa presente; texto da liveSEO com H2; sem FAQ próprio além do texto; H1 com "lojas físicas"; nenhuma anotação de revisão (`<comment`) no texto.
- Loja: sem filtro; H1 com a cidade e a palavra "pneus"; abertura sem dados, orçamento ou mapa; cards de endereço, horário, telefone e orçamento depois da abertura; H1 até 460 px do topo; abertura de até 640 px (420 na introdução clara); nenhum botão passando do card; texto da liveSEO só onde existe e FAQ só onde ele não existe; Agendar só com URL; 10 serviços ou mais; marcas em logos carregados, com `alt`, em guias com Pneus primeiro e um painel aberto; independência do e-commerce (CA-12-10); com banners, dois ou mais slides, introdução logo depois, de fundo branco, e banner a até 160 px do topo; sem banners, só o hero; vitrine sem Comprar.

Diferença para o protótipo, de propósito: lá o mapa é um `iframe` com `loading="lazy"`; aqui é capa
clicável (ADR 0012, antipadrão A15).

## 7. Fora do escopo

- A seção de lojas da Home (`LojasDaHome`, módulo 09) e o componente `MegaMenuLojas` (módulo 02): aqui ficam `listarLojas`, o `CartaoLoja` que a Home usa e a ligação do mega menu.
- Carrinho, checkout e compra pelo site na página de loja: **não existem**.
- Formulários de orçamento e de agendamento: são páginas do site atual; aqui, só o link.
- Origem real dos produtos e dos preços da vitrine (dúvida D6 do PRD): hoje é exemplo, marcado `ilustrativo.vitrine`.
- Artes de banner para celular (pendentes com o cliente): o componente já aceita.
- Busca de loja por CEP ou por proximidade.
- "Outras lojas" e CTA de compra online na página de loja (saíram em 23/11).
