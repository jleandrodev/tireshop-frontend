# Tasks 13 — SEO, acessibilidade e entrega

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo, **na ordem do arquivo** (a T-1317 e a T-1318 vêm antes da T-1315). Uma
task por vez. Este módulo só começa com os módulos 00 a 12 fechados. Todo comando roda no contêiner:
`pnpm x` aqui quer dizer `bin/pnpm x` (ADR 0014).
A maior parte das tasks é auditoria: o "teste primeiro" percorre todas as páginas-modelo e **deve
falhar onde houver defeito**. Defeito em tela de outro módulo vira task no módulo dono (anote em
Pendências); a auditoria só fecha com a suíte verde.

---

### [ ] T-1301 · As páginas de não encontrado e de erro valem para todo tipo de rota

- **Requisito:** REQ-13-10
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/erros.spec.ts` (projetos `computador` 1440 px e `celular` 390 px)
  - CA-13-09: `/isto-nao-existe` responde 404, com o H1 "Página não encontrada" e links para a Home e para o WhatsApp
  - `/c/categoria-inexistente`, `/p/999999/pneu-inexistente`, `/ajuda/politica-inexistente` e `/lojas/florianopolis` respondem 404 com a mesma página
  - com `?_falha=500` no recurso principal de uma página de prova, a resposta é 500, com o H1 "Algo deu errado", o botão "Tentar de novo" e o link para a Home
  - a página de erro não mostra pilha de execução, nome de arquivo nem o caminho do campo de um `ErroDeContrato`
  - as duas páginas levam `noindex` e não têm canônica
  - se a navegação também falhar, a página de erro ainda abre, em versão mínima: logo e link da Home
  - o 404 de `/lojas/florianopolis` usa a página do site (não há loja para montar o layout `loja`)
  - `conferirInvariantes(page)` passa nas duas, nos dois tamanhos
- **Pronto quando:** `app/error.vue` (criado no módulo 02) cobre os casos acima sem mudar o que o `tests/e2e/nao-encontrado.spec.ts` já prova; "Tentar de novo" usa a variante de contorno.
- **Arquivos:** `app/error.vue`, `tests/e2e/erros.spec.ts`
- **Fora do escopo:** estado de erro de bloco (é do `EstadoDeErro`, T-0113); redirecionar URL antiga; sugestão de produtos na página de erro.
- **Depende de:** T-0113, T-0205, T-0010, T-1228

### [ ] T-1302 · `robots` segue o ambiente, na página e no `robots.txt`

- **Requisito:** REQ-13-02
- **Camada:** infra
- **Teste primeiro:** `layers/shared/seo/robots.spec.ts`
  - com `indexavel: false`, `robotsDaPagina('index, follow')` devolve `noindex, nofollow`
  - com `indexavel: true`, devolve o que a página pediu (`index, follow`, ou `noindex, follow` da listagem filtrada)
  - `textoDoRobotsTxt({ indexavel: false })` devolve `User-agent: *` e `Disallow: /`
  - com `indexavel: true`, libera tudo, bloqueia `/api/` e aponta `Sitemap: https://www.tireshop.com.br/sitemap.xml`
  - CA-13-02: com `NUXT_PUBLIC_INDEXAVEL=false`, `/` e `/lojas/curitiba` têm `noindex, nofollow`, e `/robots.txt` responde `Disallow: /` (e2e em `tests/e2e/robots.spec.ts`)
  - sem a variável definida, o padrão é não indexar
- **Pronto quando:** as funções são puras; `server/routes/robots.txt.ts` e um único ponto de aplicação do `robots` (plugin ou composable de SEO) leem `runtimeConfig.public.indexavel`; nenhuma página escreve `robots` direto.
- **Arquivos:** `layers/shared/seo/robots.ts`, `robots.spec.ts`, `server/routes/robots.txt.ts`, `nuxt.config.ts` (runtimeConfig), `tests/e2e/robots.spec.ts`
- **Fora do escopo:** sitemap (T-1303).
- **Depende de:** T-0106

### [ ] T-1303 · O `sitemap.xml` lista as páginas indexáveis conhecidas pelos contratos

- **Requisito:** REQ-13-04
- **Camada:** infra
- **Teste primeiro:** `server/routes/sitemap.xml.spec.ts`
  - CA-13-04: a resposta é XML válido (`urlset`), com `content-type` de XML
  - contém a Home, `/lojas`, `/sobre-nos`, `/comparar`, as 5 lojas e as 8 políticas
  - contém os links internos de categoria de `GET /navegacao` (departamentos, aros e marcas), sem repetição
  - toda URL é absoluta, a partir de `NUXT_PUBLIC_SITE_URL`, e foi gerada por `rotas.*`
  - não contém URL com parâmetro, link externo (`https://www.tireshop.com.br/Blog`), item sem `href` nem `curitiba-sem-banners`
  - com `indexavel: false`, responde 404
  - se a API falhar, responde 503, e não um sitemap pela metade
- **Pronto quando:** a rota usa os casos de uso (`obterNavegacao`, `listarPoliticas`, `listarLojas`), não as fixtures; tem cache de 1 hora.
- **Arquivos:** `server/routes/sitemap.xml.ts`, `sitemap.xml.spec.ts`, `layers/shared/seo/sitemap.ts`
- **Fora do escopo:** URLs de produto (ver Pendências); `lastmod` e imagens.
- **Depende de:** T-1302, T-1008, T-1212, T-0105

### [ ] T-1304 · Toda página-modelo tem SEO correto no HTML do servidor

- **Requisito:** REQ-13-01
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/auditoria-seo.spec.ts` (requisição direta, sem navegador e sem JavaScript)
  - existe `tests/e2e/_paginas-modelo.ts` com a Home, 2 listagens, 3 produtos (comum, com 360° e sem estoque), Comparar, 2 políticas, Sobre nós, hub, 3 lojas (Curitiba, Novo Hamburgo e a sem banners) e a página 404
  - CA-13-01: cada HTML tem exatamente um `h1`
  - nenhum pulo de nível entre títulos consecutivos
  - `title` e descrição não vazios, e diferentes entre páginas de tipos diferentes
  - canônica absoluta, no domínio de `NUXT_PUBLIC_SITE_URL`, sem `ordem`, `_falha` nem `_atraso`
  - o texto principal de cada página (nome do produto, texto da política, texto de apoio) já está no HTML
  - `html` tem `lang="pt-BR"`
- **Pronto quando:** as próximas auditorias (T-1305 a T-1308 e T-1310) leem a mesma lista de páginas.
- **Arquivos:** `tests/e2e/_paginas-modelo.ts`, `tests/e2e/auditoria-seo.spec.ts`
- **Fora do escopo:** conteúdo dos textos de SEO (vêm da API).
- **Depende de:** T-1301, T-1302, T-1013, T-1109, T-1228

### [ ] T-1305 · Cada tipo de página emite o JSON-LD esperado, e ele é válido

- **Requisito:** REQ-13-03
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/auditoria-json-ld.spec.ts`
  - todo bloco `application/ld+json` do HTML do servidor é JSON válido, com `@context` de schema.org e `@type`
  - CA-13-03: produto `3084` tem `Product` com `name`, `image`, `brand` e `Offer` com preço, `BRL` e `InStock`
  - produto `4360` tem `Product` com disponibilidade `OutOfStock`
  - `/lojas/curitiba` tem `AutomotiveBusiness` com `PostalAddress` e `telephone`
  - `/ajuda/perguntas-frequentes` tem `FAQPage` com 17 perguntas; `/lojas`, com 8
  - toda página com migalhas tem `BreadcrumbList` com as mesmas migalhas da tela, na mesma ordem
  - nenhuma página repete o mesmo `@type` de página (dois `FAQPage`, dois `Product`)
  - a página de loja não tem `BreadcrumbList`
- **Pronto quando:** a tabela de JSON-LD por tipo, da seção 4 da spec, está escrita como dado em `_paginas-modelo.ts`, e o teste a percorre.
- **Arquivos:** `tests/e2e/auditoria-json-ld.spec.ts`, `tests/e2e/_paginas-modelo.ts`, `tests/e2e/_json-ld.ts`
- **Fora do escopo:** validação no teste de resultados ricos do Google (manual, descrita no README).
- **Depende de:** T-1304

### [ ] T-1306 · Nenhuma página-modelo tem violação de acessibilidade no axe

- **Requisito:** REQ-13-05
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/auditoria-axe.spec.ts` (projetos `computador` e `celular`)
  - CA-13-05: zero violação das regras `wcag2a`, `wcag2aa`, `wcag21aa` e `wcag22aa` em cada página-modelo
  - de novo com os estados abertos: mega menu, menu do celular, minicart com um item, painel de filtros, uma pergunta do FAQ e uma guia de marcas
  - de novo depois de carregar um vídeo e um mapa (os `iframe` têm `title`)
  - contraste AA em todo texto, inclusive sobre o preto do hero da loja e do Sobre nós
  - alvos de toque de 44 px (24 px nos pontos de carrossel e nos links do mega menu no computador)
  - nenhuma exceção sem regra, seletor e motivo no arquivo `_axe-excecoes.ts`
- **Pronto quando:** o relatório do axe de cada página fica anexado ao resultado do Playwright; a lista de exceções está vazia ou justificada.
- **Arquivos:** `tests/e2e/auditoria-axe.spec.ts`, `tests/e2e/_axe-excecoes.ts`
- **Fora do escopo:** teste manual com leitor de tela (roteiro no README, T-1315).
- **Depende de:** T-1304, T-0010

### [ ] T-1307 · Os fluxos principais funcionam só com o teclado

- **Requisito:** REQ-13-06
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/auditoria-teclado.spec.ts` (computador; o menu do celular e o painel de filtros, em 390 px)
  - o primeiro Tab de cada página-modelo do e-commerce leva ao link "Pular para o conteúdo", que move o foco para o conteúdo principal
  - CA-13-06: da Home até o minicart só com o teclado, e ao fechar o minicart com Esc o foco volta ao botão Comprar
  - mega menu: abre com Enter, fecha com Esc e devolve o foco ao botão; abrir outro menu fecha o anterior
  - guias (filtro de pneus e marcas da loja): setas, Home e End; o Tab sai das guias para o painel
  - carrosséis (banners da Home e da loja): setas e pontos alcançáveis por Tab, e o trilho rola com as setas do teclado
  - galeria do produto e giro 360°: troca de foto e gira com as setas
  - menu do celular e painel de filtros (390 px): prendem o foco, fecham com Esc e devolvem o foco
  - em todos os passos, o elemento com foco tem contorno visível (`outline` ou sombra diferente do estado sem foco) e não fica escondido atrás de barra fixa
- **Pronto quando:** existe o ajudante `focoVisivel(page)` em `tests/e2e/_teclado.ts`; o teste não usa `click()` em nenhum passo dos fluxos.
- **Arquivos:** `tests/e2e/auditoria-teclado.spec.ts`, `tests/e2e/_teclado.ts`
- **Fora do escopo:** atalhos de teclado próprios (não existem).
- **Depende de:** T-1304

### [ ] T-1308 · Imagens com dimensões em toda página, e nenhum `iframe` antes do toque

- **Requisito:** REQ-13-08
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/auditoria-carga.spec.ts` (projetos `computador` e `celular`)
  - toda `img` de cada página-modelo tem `width`, `height` e `alt`, e nenhuma está quebrada
  - toda imagem que começa abaixo da primeira dobra tem `loading="lazy"`
  - a imagem do LCP da Home, da listagem e do produto não é `lazy` e tem `fetchpriority="high"`
  - CA-13-07: zero `iframe` ao abrir cada página, e zero pedido de rede para `youtube`, `ytimg`, `google.com/maps` e `gstatic`
  - depois de rolar a página até o fim, sem tocar em nada, continua sem `iframe`
  - o deslocamento de layout acumulado (CLS medido por `PerformanceObserver`) fica em até 0,1 na carga de cada página
  - nenhum carrossel muda de posição sozinho em 6 segundos (fora o de Marcas, se a exceção do módulo 09 valer)
- **Pronto quando:** o teste passa em todas as páginas-modelo, nos dois tamanhos.
- **Arquivos:** `tests/e2e/auditoria-carga.spec.ts`
- **Fora do escopo:** tempo de LCP (T-1309); formatos e compressão de imagem (ver Pendências).
- **Depende de:** T-1304

### [ ] T-1309 · O Lighthouse roda no CI em modo aviso para Home, listagem e produto

- **Requisito:** REQ-13-07
- **Camada:** infra
- **Teste primeiro:** `tests/infra/lighthouse.spec.ts`
  - `lighthouserc.json` existe e lista `/`, `/c/pneus-para-carros` e a página do produto `3084`
  - o orçamento declara LCP até 2.500 ms e CLS até 0,1, com nível `warn` (nenhum `error`)
  - usa o perfil de celular com rede 4G simulada e 3 execuções por página
  - o workflow de CI tem o job **Lighthouse**, que roda `pnpm lighthouse` na imagem do projeto, depois do build de produção
  - o job está no `needs` do **CI ok** e só reprova se não conseguir rodar: nenhum orçamento é `error`
  - `pnpm lighthouse` roda localmente contra o build com o mock e grava o relatório em `.lighthouseci/`
- **Pronto quando:** o relatório das três páginas aparece como artefato do CI; a dependência nova é só `@lhci/cli`, em `devDependencies`.
- **Arquivos:** `lighthouserc.json`, `package.json`, `.github/workflows/ci.yml`, `tests/infra/lighthouse.spec.ts`, `tests/infra/ci.spec.ts`, `.gitignore`
- **Fora do escopo:** tornar o orçamento bloqueante; medir contra o backend real.
- **Depende de:** T-1308, T-0011

### [ ] T-1310 · As páginas-modelo ficam dentro da tolerância na comparação com o protótipo

- **Requisito:** REQ-13-09
- **Camada:** e2e
- **Teste primeiro:** `tests/visual/paginas-modelo.spec.ts` (projetos `computador` 1440×900 e `celular` 390×844, página inteira)
  - CA-13-08: `/lojas/curitiba` contra `loja-curitiba-computador.png` e `loja-curitiba-celular.png`
  - `/lojas/curitiba-sem-banners`, `/lojas`, `/sobre-nos`, `/ajuda/trocas-e-devolucoes` e `/ajuda/perguntas-frequentes` contra as capturas de mesmo nome
  - a Home, `/c/pneus-para-carros`, os produtos `3084` e `4360` (sem estoque) e Comparar contra as capturas deles
  - as imagens `lazy` são carregadas antes da captura, as animações ficam desligadas e o aviso de cookies fica escondido, como fazia o `verify.py`
  - as regiões de diferença conhecida ficam mascaradas e listadas em `_mascaras.ts`: mapas, linha da data das políticas, blocos com dado ilustrativo que mudou
  - uma página com a folha de estilo dela removida, de propósito, é reprovada (o teste enxerga diferença de verdade)
- **Pronto quando:** as referências estão em `tests/visual/referencia/`, versionadas, copiadas de `/discovery/entregaveis/alta-fidelidade/` por `pnpm visual:referencias` (com o `compose.discovery.yaml`); a tolerância (ponto de partida: 2% dos pixels por página) está em um lugar só e documentada; `pnpm test:visual` roda fora do `pnpm test:e2e`. **CI:** job **Visual**, dentro da imagem `dev` do projeto (o mesmo Chromium e as mesmas fontes da máquina), com as diferenças como artefato na falha; o caso entra no `ci.spec.ts`.
- **Arquivos:** `tests/visual/paginas-modelo.spec.ts`, `tests/visual/_mascaras.ts`, `tests/visual/referencia/**`, `scripts/copiar-referencias-visuais.ts`, `playwright.config.ts`, `package.json`, `.github/workflows/ci.yml`, `tests/infra/ci.spec.ts`
- **Fora do escopo:** comparar todas as 56 páginas do protótipo; outros navegadores além do Chromium.
- **Depende de:** T-1304, T-0011

### [ ] T-1311 · O teste de contrato cobre todos os adaptadores: Zod, fixtures e OpenAPI

- **Requisito:** REQ-13-12
- **Camada:** infra
- **Teste primeiro:** `tests/contract/adaptadores.spec.ts`
  - existe `tests/contract/_inventario.ts`, que liga cada uma das 24 operações do `openapi.yaml` ao schema Zod do adaptador, às fixtures e à rota de mock
  - CA-13-11: operação do OpenAPI fora do inventário reprova; schema `*.schema.ts` de um adaptador fora do inventário reprova
  - cada fixture de resposta valida no schema Zod **e** no schema do OpenAPI da operação
  - cada fixture de requisição (`*.requisicao.json`) valida no corpo esperado pelo OpenAPI
  - uma resposta sem um campo obrigatório do OpenAPI é recusada também pelo Zod (o Zod não é mais frouxo): conferido removendo, um a um, os campos obrigatórios do primeiro nível de cada fixture
  - cada rota de `server/api/mock/**` responde 200 com um corpo que valida no schema Zod da operação
  - as respostas de erro (`erro-404.json`, `erro-422.json`) validam como `problem+json` nos dois lados
  - `mocks/fixtures/` é igual a `docs/api/examples/` (nenhuma fixture mudou só de um lado)
- **Pronto quando:** `pnpm test` inclui o teste; um endpoint novo sem schema, fixture ou rota de mock quebra o CI.
- **Arquivos:** `tests/contract/adaptadores.spec.ts`, `tests/contract/_inventario.ts`
- **Fora do escopo:** gerar o cliente a partir do OpenAPI (ADR 0004 descartou).
- **Depende de:** T-0009, T-1007, T-1105, T-1211

### [ ] T-1312 · A mesma suíte e2e passa com a API em outra porta e o mock interno desligado

- **Requisito:** REQ-13-11
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/troca-de-backend.spec.ts` (projeto `backend-externo` do Playwright)
  - CA-13-10: com a aplicação iniciada com `NUXT_PUBLIC_API_BASE=http://localhost:4010/api/mock`, a suíte e2e inteira passa
  - na aplicação testada, `GET /api/mock/navegacao` responde 404 (mock interno desligado)
  - todo pedido de dados sai para `localhost:4010`, tanto no servidor (SSR) quanto no navegador
  - o carrinho funciona entre as duas origens: o cookie de sessão do backend falso é enviado nas chamadas do navegador (credenciais e CORS)
  - a simulação de falha continua valendo: com `?_falha=500` no backend falso, o bloco mostra o estado de erro
  - `git status` não mostra nenhum arquivo alterado depois da execução
  - com o backend falso derrubado, a Home responde com o estado de erro dos blocos, e não com tela em branco
- **Pronto quando:** `pnpm test:e2e:backend-externo` sobe dois processos pelo `webServer` do Playwright (o backend falso na porta 4010, que é o próprio build servindo só `/api/mock`, e a aplicação na 3000 apontando para ele) e roda os mesmos arquivos de `tests/e2e/`; o backend falso responde CORS com credenciais para a origem da aplicação. **CI:** job **E2E backend externo**, na imagem do projeto; o caso entra no `ci.spec.ts`.
- **Arquivos:** `playwright.config.ts`, `package.json`, `tests/e2e/troca-de-backend.spec.ts`, `server/utils/mock.ts` (CORS), `.github/workflows/ci.yml`, `tests/infra/ci.spec.ts`
- **Fora do escopo:** autenticação por token (dúvida D1 do PRD); backend real da TireShop.
- **Depende de:** T-1311, T-0008, T-1228

### [ ] T-1313 · A cobertura de 90% vale para o domínio e a aplicação de cada contexto

- **Requisito:** REQ-13-13
- **Camada:** infra
- **Teste primeiro:** `tests/infra/cobertura.spec.ts`
  - `pnpm test:cobertura` passa com o limite de 90% de linhas, funções e ramos em `**/domain/**` e `**/application/**`
  - o limite é aplicado **por contexto** (`shared`, `catalogo`, `carrinho`, `entrega`, `lojas`, `conteudo`, `avaliacoes`, `relacionamento`): um contexto abaixo reprova, mesmo com a média acima
  - só `__fabricas__/`, `__falsos__/` e arquivos de tipo ficam fora da conta; nenhum arquivo de regra está na lista de exclusão
  - nenhum arquivo de `domain/` ou de `application/` tem `istanbul ignore` ou equivalente
  - o CI roda `test:cobertura`, guarda o relatório como artefato e escreve o resumo por contexto no sumário do job
- **Pronto quando:** o comando passa do zero; contexto abaixo do limite ganhou os testes que faltavam, em task do módulo dono.
- **Arquivos:** `vitest.config.ts`, `tests/infra/cobertura.spec.ts`, `.github/workflows/ci.yml`
- **Fora do escopo:** meta de cobertura para `ui/` e `adapters/` (cobertos por teste de componente, de adaptador e e2e).
- **Depende de:** T-0003, T-0011, T-1311

### [ ] T-1314 · A marca vale no projeto inteiro, e nenhum dado pessoal fica no navegador

- **Requisito:** REQ-13-14
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/auditoria-privacidade.spec.ts`
  - depois de buscar por medida, simular o frete com o CEP `80010-000`, comprar, assinar a newsletter e pedir o Avise-me, o `localStorage` só tem o aceite de cookies
  - o `sessionStorage` e os cookies criados pelo frontend não têm CEP, e-mail, telefone nem nome
  - o CEP digitado não aparece na URL nem volta preenchido depois de recarregar a página
  - `pnpm lint:marca` passa em todo `.css` e em todo bloco `<style>` de `.vue`
  - em todas as páginas-modelo, só botões de seguir, comprar e confirmar têm o fundo do token `--ts-acao`
  - na página de loja, nenhum elemento usa `--ts-acao`
  - nenhum texto visível usa a cor da marca (amarelo) sobre fundo branco
- **Pronto quando:** o teste passa; nenhuma regra do lint de marca foi desligada desde a T-0006.
- **Arquivos:** `tests/e2e/auditoria-privacidade.spec.ts`
- **Fora do escopo:** política de cookies de terceiros e consentimento granular (ver Pendências).
- **Depende de:** T-1304, T-0006

### [ ] T-1317 · A imagem de produção sobe, responde e encerra limpo

- **Requisito:** REQ-13-17
- **Camada:** infra
- **Teste primeiro:** `tests/infra/imagem.spec.ts`
  - o `Dockerfile` tem os alvos `build` e `runtime`; o `runtime` parte de Node 22, copia só a saída do build (`.output`), define `NODE_ENV=production`, roda com o usuário `node` e inicia em forma exec (o Node é o PID 1)
  - o `runtime` não copia `tests/`, `docs/`, `specs/`, `node_modules` de desenvolvimento nem `.env`
  - o `compose.yaml` tem o serviço `app-prod` no perfil `prod`, na porta 3001, fora do `docker compose up` comum
  - o `ci.yml` tem o job **Imagem**, que constrói o `runtime` com cache e roda `scripts/fumaca-imagem.sh`
  - CA-13-13, no script: `/` responde 200; com `NUXT_PUBLIC_API_BASE` externo, `/api/mock/navegacao` responde 404; `id -u` dentro do contêiner não é 0; depois de `docker stop`, o código de saída é 0
  - o job Imagem está no `needs` do **CI ok**
- **Pronto quando:** `docker compose --profile prod up --build app-prod` sobe a aplicação em `http://localhost:3001`; `sh scripts/fumaca-imagem.sh` passa na máquina e no CI; a imagem tem `HEALTHCHECK`.
- **Arquivos:** `Dockerfile`, `compose.yaml`, `.dockerignore`, `scripts/fumaca-imagem.sh`, `.github/workflows/ci.yml`, `tests/infra/imagem.spec.ts`, `tests/infra/ci.spec.ts`
- **Fora do escopo:** publicar a imagem (T-1318); rota de saúde própria (a fumaça usa `/`); ajuste de memória e de réplicas.
- **Depende de:** T-1312, T-0011

### [ ] T-1318 · A imagem que o CI aprovou na `main` é publicada no registro

- **Requisito:** REQ-13-18
- **Camada:** infra
- **Teste primeiro:** `tests/infra/cd.spec.ts`
  - o `cd.yml` dispara por `workflow_run` do workflow **CI**, concluído, na `main`, e também sob demanda
  - o job só roda se o CI terminou com sucesso, e faz checkout do SHA que o CI aprovou
  - `concurrency` sem cancelamento: uma publicação de cada vez, na ordem dos commits
  - as permissões são `contents: read` e `packages: write`, e nada além
  - constrói o alvo `runtime`, roda `scripts/fumaca-imagem.sh` e só então publica, com as tags do SHA e `latest`
  - toda action está fixada por SHA
- **Pronto quando:** CA-13-14: depois do merge desta task, a imagem aparece em `ghcr.io/<dono>/<repositório>` com a tag do commit; uma execução do CI reprovada não gera publicação.
- **Arquivos:** `.github/workflows/cd.yml`, `tests/infra/cd.spec.ts`, `docs/implantacao.md` (como puxar a imagem e voltar a uma tag anterior)
- **Fora do escopo:** implantar a imagem em um servidor (premissa P6 do PRD: o TI decide onde); assinatura da imagem.
- **Depende de:** T-1317

### [ ] T-1315 · A documentação final diz como rodar, implantar e ligar o backend real

- **Requisito:** REQ-13-15
- **Camada:** infra
- **Teste primeiro:** `tests/infra/documentacao.spec.ts`
  - toda variável lida em `runtimeConfig` está em `.env.example` e na tabela de variáveis do README, com padrão e descrição
  - todo script citado no README existe em `package.json`
  - todo link relativo entre os arquivos de `docs/`, `specs/` e o README aponta para arquivo que existe
  - o README tem as seções "Como rodar", "Como testar", "Como implantar" e "Como ligar o backend real"
  - `docs/entrega.md` tem os seis critérios da seção 8 do PRD, cada um com o comando ou o arquivo que o prova
  - CA-13-12: `pnpm entrega:conferir` roda as provas (lint, tipos, testes, contrato, e2e nos dois modos, cobertura) e imprime o checklist com o resultado de cada critério
  - todo ADR tem a seção "Como verificar" apontando para um teste que existe
- **Pronto quando:** o README cobre o ambiente em contêiner (`bin/pnpm install`, `bin/pnpm dev`, `sh scripts/conferir-ambiente.sh`), build e início em modo de produção pela imagem (`docker compose --profile prod up`), as quatro variáveis da spec, cache e CORS esperados da API, o que **não** vai para produção (rotas de mock) e o roteiro de teste manual com leitor de tela; os documentos de domínio, a arquitetura e os contratos foram revistos contra o código.
- **Arquivos:** `README.md`, `.env.example`, `docs/entrega.md`, `docs/implantacao.md`, `scripts/conferir-entrega.ts`, `package.json`, `tests/infra/documentacao.spec.ts`
- **Fora do escopo:** configurar a hospedagem do cliente (premissa P6 do PRD).
- **Depende de:** T-1309, T-1310, T-1312, T-1313, T-1314, T-1318

### [ ] T-1316 · Todas as tasks estão fechadas e toda pendência tem destino

- **Requisito:** REQ-13-16
- **Camada:** infra
- **Teste primeiro:** `tests/infra/specs.spec.ts`
  - nenhum `tasks.md` tem task `[ ]`, `[~]` ou `[!]` (fora a própria T-1316, enquanto está aberta)
  - toda task `[x]` tem data
  - todo requisito `REQ-NN-xx` de cada spec é citado por ao menos uma task, e toda task cita requisito que existe
  - nenhuma task depende de task posterior nem de id inexistente
  - todo RF e todo RNF do PRD aparece em ao menos uma spec
  - cada item das seções "Pendências" começa com um destino: `[task T-xxxx]`, `[cliente Dn]` ou `[encerrada: motivo]`
  - toda dúvida marcada `[cliente Dn]` está na seção 10 do PRD
- **Pronto quando:** existe `docs/pendencias.md` com a lista consolidada, por destino; as dúvidas novas foram acrescentadas à seção 10 do PRD; o roadmap traz a tabela de rastreabilidade RF → requisito → task; `pnpm entrega:conferir` inclui este teste; ele acusa tudo o que o `scripts/handoff/conferir_specs.py` acusava (ids, campos, ordem de execução, requisito sem task). **CI:** as specs passam a ser conferidas no job Testes, e o job **Specs** sai do `ci.yml` junto com o alvo `handoff` do `Dockerfile` e do `compose.yaml`.
- **Arquivos:** `tests/infra/specs.spec.ts`, `tests/infra/ci.spec.ts`, `docs/pendencias.md`, `docs/prd.md`, `specs/roadmap.md`, `specs/**/tasks.md`, `.github/workflows/ci.yml`, `Dockerfile`, `compose.yaml`
- **Fora do escopo:** resolver as dúvidas do cliente; executar as tasks novas que nascerem (ficam para depois da entrega, se o líder técnico concordar); apagar `scripts/handoff/` (listar para o dev decidir).
- **Depende de:** T-1315

---

## Pendências

- **Sitemap de produtos.** Não há endpoint que liste todos os produtos de forma barata (`GET /produtos` pagina de 12 em 12). O sitemap sai sem as páginas de produto. Propor ao backend um endpoint de sitemap, ou o próprio backend gerar esse arquivo.
- **Nomes das variáveis `NUXT_PUBLIC_SITE_URL` e `NUXT_PUBLIC_INDEXAVEL`.** São propostos aqui. Se os módulos 01 ou 02 já criaram variáveis com a mesma função, usar as deles e ajustar a T-1302 e a T-1315.
- **Página de não encontrado.** A página (`app/error.vue`) nasce no módulo 02. A T-1301 não a recria: confere os 404 de todos os tipos de rota, a página 500 sem vazamento de detalhe e a versão mínima quando a navegação falha.
- **Tolerância da regressão visual.** Os 2% são ponto de partida. Calibrar na T-1310, por página, e registrar o valor final. As capturas do protótipo foram feitas sem rede (mapa e YouTube em branco) e com dados de 29/10/2026.
- **Carrossel de Marcas com rotação automática.** O protótipo abre essa exceção, e os documentos de teste dizem "nenhum carrossel anda sozinho". A T-1308 segue o que o módulo 09 decidir com o cliente.
- **Lighthouse contra o mock.** Mede o frontend, não a API. O alvo de 300 ms no percentil 95 da API é do backend; repetir a medição quando a API real existir e, então, decidir se o orçamento vira bloqueante.
- **Formato e peso das imagens.** As imagens vêm do protótipo, em WebP e tamanho fixo. `srcset` e CDN de imagem ficam para o TI decidir.
- **Consentimento de cookies de terceiros.** Vídeo e mapa só carregam depois do toque, o que já evita o envio de dados antes da ação. Um consentimento por categoria (LGPD) não está no escopo; confirmar com o jurídico do cliente.
- **Autenticação da API (D1).** A prova da troca de backend usa cookie de sessão. Se a API real usar token, refazer a T-1312 depois de ajustar o cliente HTTP.
- **Hospedagem (P6).** O CI é GitHub Actions e a entrega é uma imagem no GHCR (ADR 0014). Onde essa imagem roda continua a confirmar com o TI; se a hospedagem não aceitar contêiner, a T-1318 muda de destino e a T-1317 continua valendo como prova do build.
- **Teste manual com leitor de tela.** Fica como roteiro no README (NVDA e VoiceOver, nos fluxos da T-1307). Recomendado antes da publicação.
