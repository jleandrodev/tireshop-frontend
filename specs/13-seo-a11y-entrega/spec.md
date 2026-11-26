# Spec 13 — SEO, acessibilidade e entrega

| | |
|---|---|
| Marco | M10 |
| Contexto do domínio | todos (fechamento); ver o [mapa de contextos](../../docs/domain/context-map.md) |
| Telas do protótipo | todas as páginas-modelo: `home.html`, `categoria-pneus-para-carros.html`, `categoria-225-45-r17.html`, `produto-3084.html`, `produto-3016.html`, `produto-4360-sem-estoque.html`, `comparar.html`, `politica-trocas-e-devolucoes.html`, `politica-perguntas-frequentes.html`, `sobre-nos.html`, `lojas.html`, `loja-curitiba.html`, `loja-curitiba-sem-banners.html` |
| ADRs que se aplicam | 0003, 0004, 0005, 0006, 0010, 0011, 0012, 0014 |
| Depende de | 00 a 12 |

## 1. Objetivo

Fechar a entrega. Cada módulo já provou a própria tela; este módulo prova o **conjunto**: SEO e
acessibilidade em todas as páginas, desempenho dentro do orçamento, layout fiel ao protótipo, contrato
sem divergência e, principalmente, que **trocar de backend é trocar uma variável**. No fim, a
documentação diz como rodar, implantar e ligar a API real, e o checklist da seção 8 do
[PRD](../../docs/prd.md) está conferido item a item.

Este módulo não cria tela nova: a página de não encontrado e a de erro nascem no módulo 02 e aqui são conferidas para todos os tipos de rota.

## 2. Requisitos

| Id | Requisito | Origem |
|---|---|---|
| REQ-13-01 | Toda página-modelo, no HTML do servidor (sem JavaScript), tem um H1, títulos sem pulo de nível, `title`, descrição e canônica absoluta. | RNF-01, ADR 0011 |
| REQ-13-02 | `robots` segue o ambiente: fora de produção, toda página leva `noindex, nofollow` e o `robots.txt` bloqueia tudo; em produção, as páginas são indexáveis, salvo as que a spec do módulo marca como `noindex`. | RNF-01, ADR 0011 |
| REQ-13-03 | Cada tipo de página emite o JSON-LD esperado, válido: `Product`, `BreadcrumbList`, `FAQPage` e `AutomotiveBusiness`, conforme a tabela da seção 4. | RNF-01 |
| REQ-13-04 | Existe `sitemap.xml` com as páginas indexáveis conhecidas pelos contratos, gerado com `rotas.*`, e o `robots.txt` aponta para ele. | RNF-01 |
| REQ-13-05 | Nenhuma página-modelo tem violação de WCAG 2.2 AA detectável pelo axe, em 1440 px e em 390 px. | RNF-02 |
| REQ-13-06 | Todo componente interativo funciona só com o teclado, com foco visível e ordem lógica: link de pular, mega menu, menu do celular, busca, minicart, filtro de pneus, facetas e painel de filtros, galeria e giro 360°, guias, carrossel, acordeão, capa de vídeo e de mapa. | RNF-02 |
| REQ-13-07 | O Lighthouse roda no CI em **modo aviso** para a Home, a listagem e o produto, com o orçamento de LCP até 2,5 s e CLS até 0,1. | RNF-03 |
| REQ-13-08 | Em toda página-modelo: toda imagem tem `width`, `height` e `alt`; fora da primeira dobra, `loading="lazy"`; e não existe `iframe` antes de uma ação do usuário. | RNF-03, ADR 0012 |
| REQ-13-09 | As páginas-modelo ficam dentro da tolerância na comparação visual com as capturas do protótipo, em 1440 px e em 390 px. | RNF-04, ADR 0006 |
| REQ-13-10 | Endereço que não existe responde 404 com a página de não encontrado; erro inesperado responde 500 com a página de erro e "Tentar de novo". As duas têm um H1 e caminhos de saída. | RNF-06, ADR 0010 |
| REQ-13-11 | Com um segundo servidor falso em outra porta e `NUXT_PUBLIC_API_BASE` apontando para ele, a **mesma** suíte e2e passa, sem alterar código, e o mock interno fica desligado. | RNF-05, ADR 0003, critério 5 do PRD |
| REQ-13-12 | O teste de contrato cobre todos os adaptadores: cada fixture valida no schema Zod do adaptador e no `openapi.yaml`, e toda operação do OpenAPI tem fixture, schema Zod e rota de mock. | RNF-05, ADR 0004, critério 4 do PRD |
| REQ-13-13 | A cobertura é de 90% ou mais em `domain/` e em `application/` de cada contexto, e o CI falha abaixo disso. | RNF-07 |
| REQ-13-14 | O lint de marca passa no projeto inteiro, e nenhum dado pessoal fica em `localStorage`, `sessionStorage` ou cookie criado pelo frontend depois de um fluxo completo de compra. | RNF-04, RNF-08 |
| REQ-13-15 | A documentação final existe e confere com o código: como rodar, como implantar, variáveis de ambiente, como ligar o backend real e o checklist de entrega do PRD. | critério 6 do PRD |
| REQ-13-16 | Toda task de `specs/` está concluída e toda pendência dos `tasks.md` tem destino: task nova, dúvida para o cliente ou encerrada com justificativa. | critérios 1 a 3 do PRD |
| REQ-13-17 | A imagem de produção constrói em estágios, roda sem root, não leva testes nem documentos, responde com o mock interno desligado quando a API é externa e encerra limpo ao receber SIGTERM. | ADR 0001, ADR 0014, premissa P6 do PRD |
| REQ-13-18 | A imagem que o CI aprovou na `main` é publicada no registro com a tag do commit; nada é publicado se o CI falhou. | ADR 0014, premissa P6 do PRD |

Os requisitos funcionais RF-01 a RF-18 são dos módulos 02 a 12. Aqui eles são conferidos em conjunto:
a suíte e2e inteira roda duas vezes (REQ-13-11) e a rastreabilidade RF → requisito → task é fechada
no checklist (REQ-13-15 e REQ-13-16).

## 3. Critérios de aceite

**CA-13-01 · SEO no HTML do servidor**
- **Dado** a lista de páginas-modelo
- **Quando** peço cada uma sem executar JavaScript
- **Então** cada HTML tem exatamente um H1, nenhum pulo de nível de título, `title` e descrição não vazios e canônica absoluta sem parâmetros de ordenação

**CA-13-02 · Homologação não é indexada**
- **Dado** a aplicação com `NUXT_PUBLIC_INDEXAVEL=false`
- **Quando** peço `/`, `/lojas/curitiba` e `/robots.txt`
- **Então** as páginas têm `noindex, nofollow` e o `robots.txt` responde `Disallow: /`

**CA-13-03 · Dados estruturados por tipo**
- **Dado** a página de produto `3084`, a de produto sem estoque `4360`, a de loja `curitiba` e a política `perguntas-frequentes`
- **Quando** leio os blocos `application/ld+json` do HTML do servidor
- **Então** encontro `Product` com oferta em estoque, `Product` com oferta fora de estoque, `AutomotiveBusiness` com endereço, e `FAQPage` com 17 perguntas; todos são JSON válido com `@context` e `@type`

**CA-13-04 · Sitemap**
- **Dado** a aplicação em modo de produção
- **Quando** peço `/sitemap.xml`
- **Então** recebo XML válido com a Home, `/lojas`, as 5 lojas, as 8 políticas, `/sobre-nos` e as categorias do menu, com URLs absolutas; não há URL com filtro, de comparação com produtos nem `curitiba-sem-banners`

**CA-13-05 · Acessibilidade em todas as páginas**
- **Dado** a lista de páginas-modelo
- **Quando** rodo o axe em 1440 px e em 390 px
- **Então** não há violação de nível A ou AA

**CA-13-06 · Só com o teclado**
- **Dado** a Home em 1440 px, sem usar o mouse
- **Quando** aperto Tab pela primeira vez, sigo o link "Pular para o conteúdo", abro o mega menu, escolho um aro e, na listagem, abro um produto e aperto Comprar
- **Então** cada passo acontece só com Tab, Enter, Espaço, setas e Esc, o foco está sempre visível, e ao fechar o minicart o foco volta ao botão Comprar

**CA-13-07 · Nada de terceiros antes do toque**
- **Dado** qualquer página-modelo recém-aberta
- **Quando** conto os `iframe` e os pedidos de rede para `youtube` e `google.com/maps`
- **Então** os dois são zero

**CA-13-08 · Fiel ao protótipo**
- **Dado** a captura `loja-curitiba-computador.png` do protótipo
- **Quando** comparo com a captura de `/lojas/curitiba` em 1440 px
- **Então** a diferença fica dentro da tolerância definida, fora das regiões mascaradas (mapa e conteúdo dinâmico)

**CA-13-09 · Página que não existe**
- **Dado** o endereço `/isto-nao-existe`
- **Quando** peço a página
- **Então** recebo status 404, um H1 "Página não encontrada" e links para a Home e para o WhatsApp

**CA-13-10 · Trocar de backend é trocar a URL**
- **Dado** um servidor falso em `http://localhost:4010` servindo o contrato, e a aplicação iniciada com `NUXT_PUBLIC_API_BASE=http://localhost:4010/api/mock`
- **Quando** rodo `pnpm test:e2e:backend-externo`
- **Então** a mesma suíte e2e passa, nenhum pedido chega a `/api/mock` da aplicação testada (que responde 404), e nenhum arquivo de código foi alterado

**CA-13-11 · O contrato não tem buraco**
- **Dado** o `openapi.yaml` com 24 operações
- **Quando** rodo `pnpm test` em `tests/contract/`
- **Então** cada operação tem fixture, schema Zod e rota de mock, cada fixture valida no Zod e no OpenAPI, e um schema Zod mais frouxo que o OpenAPI (campo obrigatório virando opcional) é acusado

**CA-13-12 · Entrega conferida**
- **Dado** o repositório no fim do módulo
- **Quando** rodo `pnpm entrega:conferir`
- **Então** os seis critérios da seção 8 do PRD aparecem como atendidos, cada um com o comando ou o arquivo que o prova

**CA-13-13 · A imagem de produção sobe sozinha**
- **Dado** a imagem construída pelo alvo `runtime`, iniciada com `NUXT_PUBLIC_API_BASE` apontando para outra origem
- **Quando** peço `/` e depois `/api/mock/navegacao`
- **Então** a primeira responde 200 e a segunda 404; o processo não é root e, ao receber SIGTERM, encerra com código 0

**CA-13-14 · Só se publica o que o CI aprovou**
- **Dado** um commit na `main`
- **Quando** o CI desse commit termina com sucesso
- **Então** a imagem dele aparece no registro com a tag do SHA e com `latest`; com o CI reprovado, nada é publicado

## 4. Contratos

| Endpoint | Usado para |
|---|---|
| todos (24 operações) | Teste de contrato (REQ-13-12) e prova da troca de backend (REQ-13-11) |
| `GET /navegacao`, `GET /politicas`, `GET /lojas` | Montar o `sitemap.xml` |

JSON-LD esperado por tipo de página (quem define o conteúdo é a spec de cada módulo; aqui se confere a presença e a validade):

| Página | JSON-LD |
|---|---|
| Home | `FAQPage` |
| Listagem | `BreadcrumbList` e, quando há FAQ, `FAQPage` |
| Produto | `Product` (com `Offer` e disponibilidade) e `BreadcrumbList` |
| Comparar | O que a spec do módulo 08 definir (no mínimo, todo bloco presente é válido) |
| Política | `BreadcrumbList` e, quando há bloco `faq`, `FAQPage` |
| Sobre nós | `BreadcrumbList` |
| Hub de lojas | `BreadcrumbList` e `FAQPage` |
| Página de loja | `AutomotiveBusiness` e, quando há perguntas, `FAQPage` |

Variáveis de ambiente documentadas neste módulo:

| Variável | Padrão | Para quê |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | `/api/mock` | Base da API. Externa = mock interno desligado |
| `NUXT_PUBLIC_API_TEMPO_LIMITE_MS` | `8000` | Tempo limite do cliente HTTP |
| `NUXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Origem usada na canônica, no JSON-LD e no sitemap |
| `NUXT_PUBLIC_INDEXAVEL` | `false` | `true` só em produção: libera a indexação |

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Página de não encontrado | — | H1, texto e links de saída, com status 404 | — | — |
| Página de erro | — | — | — | H1, texto, "Tentar de novo" e link para a Home, com status 500 |
| `sitemap.xml` | — | XML com as URLs | Só a Home e as páginas fixas | Responde 503 se a API falhar (não devolve sitemap pela metade) |

Os estados dos blocos de cada tela são dos módulos de origem. Aqui se confere, por amostragem na
suíte e2e, que cada página-modelo tem os quatro estados cobertos por teste (critério de pronto de
módulo em [docs/testing.md](../../docs/testing.md)).

## 6. Regras de marca, acessibilidade e SEO do módulo

- As auditorias leem uma lista única de páginas-modelo (`tests/e2e/_paginas-modelo.ts`): acrescentar uma página à lista a põe em todas as auditorias.
- SEO se confere no **HTML do servidor**, com JavaScript desligado. O que só aparece depois da hidratação não conta.
- A canônica nunca leva `ordem`, `_falha`, `_atraso` nem parâmetro de campanha.
- O axe roda com as regras `wcag2a`, `wcag2aa`, `wcag21aa` e `wcag22aa`. Exceção só com regra, seletor e motivo escritos no arquivo do teste.
- Alvos de toque de 44 px (24 px nos pontos de carrossel e nos links do mega menu no computador), como no `tools/hifi/verify.py`.
- Lighthouse em modo aviso: o resultado aparece no CI e não bloqueia o merge. Bloquear é decisão do cliente, depois de medir contra o backend real.
- Regressão visual compara com as capturas do protótipo (`entregaveis/alta-fidelidade/` do repositório de discovery), copiadas para `tests/visual/referencia/`. Diferenças de propósito ficam mascaradas e listadas: mapa (capa em vez de `iframe`), linha da data nas políticas, aviso de cookies.
- As páginas de não encontrado e de erro usam o layout do e-commerce. Quando o erro acontece em `/lojas/<slug>` com a loja carregada, vale o estado de erro do layout `loja`, sem cabeçalho do site.
- Nenhuma página emite cor literal, e o verde de ação continua só em seguir, comprar e confirmar (lint de marca no projeto inteiro).

## 7. Fora do escopo

- Implantação em produção, CDN, monitoramento e alertas (o README de implantação descreve o que o TI precisa fazer). A T-1318 publica a imagem no registro; pôr essa imagem no ar é do TI (premissa P6).
- Teste de carga e teste com o backend real da TireShop (não existe ainda).
- Teste manual com leitor de tela: recomendado no README, fora da automação.
- Tornar o Lighthouse bloqueante.
- Sitemap de produtos: não há endpoint que liste todos os produtos de forma barata (ver Pendências).
- Redirecionamento das URLs antigas do site (decisão D2 do PRD).
- Corrigir defeito encontrado pelas auditorias em tela de outro módulo: vira task no módulo dono, e a auditoria só fecha depois.
