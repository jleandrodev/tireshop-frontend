# Tasks 09 — Home

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. Uma task por vez. Os valores dos casos vêm de `home.json` (3 banners,
4 benefícios, 2 cartões de entrega, 4 itens de segurança, 3 artigos, 6 perguntas),
`produtos-vitrine-ofertas.json` (8 produtos), `lojas.json` (5 lojas) e `navegacao.json` (17 marcas).

---

### [ ] T-0901 · Caso de uso `obterPaginaInicial`

- **Requisito:** REQ-09-01, REQ-09-05, REQ-09-08, REQ-09-11, REQ-09-12, REQ-09-13, REQ-09-14
- **Camada:** aplicação
- **Teste primeiro:** `layers/conteudo/application/obter-pagina-inicial.spec.ts` (com `ConteudoRepositoryFalso`)
  - devolve a `PaginaInicial` com banners, benefícios, entrega, segurança, blog, texto de apoio, perguntas e `seo`
  - nunca entrega mais de 3 banners, mesmo que a porta mande 5
  - nunca entrega mais de 3 artigos do blog
  - listas vazias (sem banners, sem perguntas) são sucesso
  - erro de rede da porta sai como `Result` de falha, sem lançar
- **Pronto quando:** tipos `PaginaInicial`, `Banner`, `Destaque`, `OpcaoDeEntrega` e `ArtigoDoBlog` em `domain/` (modelo raso, sem classes); `ConteudoRepository.paginaInicial` declarado em `domain/portas.ts`; falso em memória; fábrica `umaPaginaInicial()`.
- **Arquivos:** `layers/conteudo/domain/pagina-inicial.ts`, `portas.ts`, `__fabricas__/pagina-inicial.ts`, `application/obter-pagina-inicial.ts`, `obter-pagina-inicial.spec.ts`, `application/__falsos__/conteudo-repository-falso.ts`, `layers/conteudo/index.ts`
- **Fora do escopo:** produtos, lojas e avaliações (não são deste contexto).
- **Depende de:** T-0101, T-0104

### [ ] T-0902 · Caso de uso `listarOfertas`, a vitrine da semana

- **Requisito:** REQ-09-04
- **Camada:** aplicação
- **Teste primeiro:** `layers/catalogo/application/listar-ofertas.spec.ts` (com `ProdutoRepositoryFalso`)
  - pede à porta a vitrine `ofertas`, com 8 por página, sem categoria e sem facetas
  - devolve os 8 `ProdutoResumo` na ordem recebida (o primeiro é o 3084)
  - nunca devolve mais de 8, mesmo que a porta mande 12
  - lista vazia é sucesso
  - erro da porta sai como `Result` de falha
- **Pronto quando:** `criarListarOfertas(produtos)`; o critério de vitrine é um caso nomeado do `CriterioDeListagem`, e não um parâmetro solto.
- **Arquivos:** `layers/catalogo/application/listar-ofertas.ts`, `listar-ofertas.spec.ts`, `layers/catalogo/domain/criterio-de-listagem.ts`, `criterio-de-listagem.spec.ts`
- **Fora do escopo:** escolher os produtos da vitrine (é do comercial, vem da API).
- **Depende de:** T-0306, T-0303

### [ ] T-0903 · `HttpConteudoRepository.paginaInicial` entende `GET /home`

- **Requisito:** REQ-09-01, REQ-09-12, REQ-09-13, REQ-09-17
- **Camada:** adaptador
- **Teste primeiro:** `layers/conteudo/adapters/http/pagina-inicial.mapper.spec.ts` e `http-conteudo-repository.spec.ts` (com `ClienteHttp` falso)
  - `home.json` valida e vira `PaginaInicial` com 3 banners, 4 benefícios, 2 opções de entrega, 4 itens de segurança, 3 artigos e 6 perguntas
  - cada banner traz as duas artes: computador de 1440×320 e celular de 390×290
  - banner com `href: null` vira banner sem link
  - `textoApoio.html` e `faq[].respostaHtml` viram `HtmlSeguro`; `<script>` é recusado
  - a data do artigo ("2026-09-08") vira data; o `href` do artigo precisa ser URL absoluta
  - mais de 3 banners ou falta de `textoApoio` são recusados pelo schema, com o caminho do campo
  - `GET /home` com falha de rede vira `ErroDeRede`; fora do contrato, `ErroDeContrato`
- **Pronto quando:** `PaginaInicialSchema`, `paraPaginaInicial(dto)` e o método `paginaInicial()` prontos; o DTO não sai de `adapters/`.
- **Arquivos:** `layers/conteudo/adapters/http/pagina-inicial.schema.ts`, `pagina-inicial.mapper.ts`, `pagina-inicial.mapper.spec.ts`, `http-conteudo-repository.ts`, `http-conteudo-repository.spec.ts`
- **Fora do escopo:** políticas e institucional (módulos 10 e 11).
- **Depende de:** T-0901, T-0103, T-0104

### [ ] T-0904 · `HttpProdutoRepository.listar` pede a vitrine de ofertas

- **Requisito:** REQ-09-04
- **Camada:** adaptador
- **Teste primeiro:** `layers/catalogo/adapters/http/http-produto-repository.spec.ts` (com `ClienteHttp` falso)
  - o critério de vitrine monta `GET /produtos?vitrine=ofertas&porPagina=8`, sem `categoria` e sem facetas
  - `produtos-vitrine-ofertas.json` (8 itens, `facetas: []`) vira lista de 8 `ProdutoResumo`
  - o critério comum da listagem continua montando a URL de antes (sem `vitrine`)
  - resposta fora do contrato vira `ErroDeContrato`
- **Pronto quando:** o `ListaDeProdutosSchema` aceita a fixture da vitrine sem mudança de contrato.
- **Arquivos:** `layers/catalogo/adapters/http/http-produto-repository.ts`, `http-produto-repository.spec.ts`
- **Fora do escopo:** o mock (a T-0311 já responde `vitrine=ofertas`).
- **Depende de:** T-0902, T-0309

### [ ] T-0905 · O mock serve `GET /home`

- **Requisito:** REQ-09-16, REQ-09-17
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/home.get.spec.ts`
  - `GET /api/mock/home` devolve o conteúdo de `mocks/fixtures/home.json`
  - a resposta valida no `PaginaInicialSchema`
  - toda imagem citada (banners e blog) existe em `public/img`
  - `?_falha=500` devolve `problem+json`; `?_atraso=300` demora pelo menos 300 ms
  - `GET /api/mock/produtos?vitrine=ofertas&porPagina=8` devolve os 8 da vitrine, o primeiro o 3084
- **Pronto quando:** a rota usa `responderFixture`; nenhum dado de produto, loja ou avaliação é embutido na resposta de `/home`.
- **Arquivos:** `server/api/mock/home.get.ts`, `home.get.spec.ts`
- **Fora do escopo:** `/lojas` (contexto Lojas) e `/avaliacoes/resumo` (T-0707).
- **Depende de:** T-0008, T-0311, T-0903

### [ ] T-0906 · Os casos de uso da Home são ligados aos adaptadores

- **Requisito:** REQ-09-16
- **Camada:** infra
- **Teste primeiro:** `layers/conteudo/ui/composables/use-pagina-inicial.spec.ts` (ambiente Nuxt)
  - `useConteudo()` passa a devolver `obterPaginaInicial`; `useCatalogo()`, `listarOfertas`
  - `usePaginaInicial()` busca com `useAsyncData` e expõe `pagina` e `estado`
  - `useOfertas()` busca em chamada própria e expõe `itens`, `estado` e `tentarDeNovo()`
  - com os provedores trocados no teste, os dois usam os falsos
  - erro em `useOfertas()` não muda o `estado` de `usePaginaInicial()`
- **Pronto quando:** o plugin do contexto Conteúdo é o único lugar que instancia `HttpConteudoRepository`; nada da Home vai para store (ADR 0007).
- **Arquivos:** `app/plugins/` (plugin do Conteúdo e `10.catalogo.ts`), `layers/conteudo/ui/composables/use-conteudo.ts`, `use-pagina-inicial.ts`, `use-pagina-inicial.spec.ts`, `layers/catalogo/ui/composables/use-ofertas.ts`, `use-ofertas.spec.ts`, os `index.ts` das duas layers
- **Fora do escopo:** telas.
- **Depende de:** T-0903, T-0904, T-0312

### [ ] T-0907 · `CarrosselBanners` mostra as campanhas e só troca quando o usuário pede

- **Requisito:** REQ-09-01, REQ-09-02, REQ-09-18
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/CarrosselBanners.spec.ts`
  - renderiza 3 slides, cada um com `role="group"`, `aria-roledescription="slide"` e o rótulo "1 de 3"
  - cada slide é um `picture` com a arte de celular (390×290) até 899 px e a de computador (1440×320) acima
  - o `alt` é o da API ("Ofertas em pneus aro 17 a 22. Pneus para carros, SUVs e pick-ups com preço de promoção.")
  - o primeiro banner tem `fetchpriority="high"` e não é preguiçoso; os outros têm `loading="lazy"`
  - "Próxima campanha" mostra o segundo e marca o segundo ponto com `aria-current`; "Ver campanha 3" vai direto ao terceiro
  - com temporizadores falsos avançados em 30 segundos, o banner não muda
  - com um banner só, não há setas nem pontos; banner sem `href` não é link
  - a seção tem `aria-roledescription="carrossel"` e o rótulo "Campanhas"
- **Pronto quando:** usa o `Carrossel` de `shared/ui` e as classes `ts-banner*`; não existe `setInterval` nem `autoplay` no componente.
- **Arquivos:** `layers/conteudo/ui/components/CarrosselBanners.vue`, `CarrosselBanners.spec.ts`
- **Fora do escopo:** o filtro sobreposto (a página posiciona, T-0913).
- **Depende de:** T-0901, T-0111

### [ ] T-0908 · `VitrineOfertas` mostra as ofertas da semana

- **Requisito:** REQ-09-04
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/VitrineOfertas.spec.ts`
  - há uma `section` com o H2 "Ofertas da semana" e a introdução
  - com 8 produtos, renderiza 8 `CardProduto` na ordem recebida
  - o `comprar` de um card é repassado com o código do produto
  - carregando, mostra 8 esqueletos de card
  - em erro, mostra a mensagem com "Tentar de novo" e emite `tentar-de-novo`
  - sem produtos, a seção não é renderizada
  - o link "Ver todas as promoções" recebe o destino por `props`
- **Pronto quando:** usa a grade `ts-grade-produtos`; esconder o 7º e o 8º card no celular é regra do CSS da Home (`home.css`), conferida no e2e.
- **Arquivos:** `layers/catalogo/ui/components/VitrineOfertas.vue`, `VitrineOfertas.spec.ts`
- **Fora do escopo:** carrossel de ofertas; o minicart (módulo 06).
- **Depende de:** T-0313, T-0113

### [ ] T-0909 · Os blocos editoriais: benefícios, entrega e segurança

- **Requisito:** REQ-09-05, REQ-09-08, REQ-09-11
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/BlocosDaHome.spec.ts`
  - `BlocoBeneficios` mostra 4 itens com ícone decorativo, título em H3 ("5% de desconto à vista") e texto; a seção tem o rótulo "Condições de compra"
  - `BlocoEntrega` mostra o H2 "Entrega em todo o Brasil" e 2 cartões, "No seu endereço" e "Em uma oficina conveniada", com títulos em H3
  - `BlocoSeguranca` mostra o H2 "Compre com segurança", 4 itens (o primeiro "Nota fiscal e termo de garantia") e o botão "Falar no WhatsApp", com o link recebido por `props`
  - ícone desconhecido cai em um ícone padrão, sem erro
  - com a lista vazia, o bloco não é renderizado
  - nenhum dos três blocos tem H1
- **Pronto quando:** três componentes burros, com as classes `ts-beneficios`, `ts-entrega` e `ts-seguranca`; o mapa de nome de ícone para o sprite fica em um arquivo só.
- **Arquivos:** `layers/conteudo/ui/components/{BlocoBeneficios,BlocoEntrega,BlocoSeguranca}.vue`, `icones-da-home.ts`, `BlocosDaHome.spec.ts`
- **Fora do escopo:** link "Ver oficinas conveniadas" (sem destino no contrato; ver Pendências).
- **Depende de:** T-0901

### [ ] T-0910 · Departamentos em grade e marcas em carrossel, a partir da navegação

- **Requisito:** REQ-09-07, REQ-09-09
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/GradeDepartamentos.spec.ts` e `CarrosselMarcas.spec.ts`
  - `GradeDepartamentos` mostra o H2 "Pneus para cada tipo de veículo" e um link por departamento, com ícone decorativo, nome e o `resumoAros`
  - cada link usa o `href` do departamento que veio da navegação
  - `CarrosselMarcas` mostra o H2 "As 17 marcas que vendemos" (o número é a contagem recebida) e 17 logos com `alt` igual ao nome, `width`, `height` e `loading="lazy"`
  - marca com `href` é link; com `href: null`, é só a imagem
  - as setas "Marcas anteriores" e "Próximas marcas" movem o trilho; com temporizadores falsos avançados em 30 segundos, o trilho não se move
  - sem departamentos ou sem marcas, o bloco correspondente não é renderizado
- **Pronto quando:** os dois recebem os dados por `props` (a página passa o que o layout já buscou com `obterNavegacao`); `CarrosselMarcas` usa o `Carrossel` de `shared/ui`, sem botão de pausa.
- **Arquivos:** `layers/conteudo/ui/components/GradeDepartamentos.vue`, `CarrosselMarcas.vue`, os dois `.spec.ts`
- **Fora do escopo:** o mega menu (módulo 02).
- **Depende de:** T-0111

### [ ] T-0911 · `LojasDaHome` mostra as lojas em cartões e, no celular, em carrossel manual

- **Requisito:** REQ-09-06
- **Camada:** ui
- **Teste primeiro:** `layers/lojas/ui/components/LojasDaHome.spec.ts`
  - há o H2 da seção, a introdução e o link "Ver todas as lojas"
  - com as 5 lojas de `lojas.json`, renderiza 5 cartões em uma `ol` com o rótulo "Lojas físicas", na ordem recebida (Novo Hamburgo primeiro)
  - cada cartão tem a cidade em H3, o endereço, o horário, o telefone como link `tel:` e o botão "Ver a loja" com link para `rotas.loja`
  - as setas "Loja anterior" e "Próxima loja" movem o trilho; a primeira começa desativada
  - com temporizadores falsos avançados em 30 segundos, o trilho não se move
  - sem lojas, ou em erro, a seção não é renderizada
- **Pronto quando:** reutiliza `CartaoLoja` e o `Carrossel` de `shared/ui`; recebe as lojas por `props`; `useLojasDaHome()` chama `listarLojas` em chamada própria.
- **Arquivos:** `layers/lojas/ui/components/LojasDaHome.vue`, `LojasDaHome.spec.ts`, `layers/lojas/ui/composables/use-lojas-da-home.ts`, `use-lojas-da-home.spec.ts`
- **Fora do escopo:** `CartaoLoja`, `listarLojas`, `HttpLojaRepository` e o mock de `/lojas` (contexto Lojas; ver Pendências).
- **Depende de:** T-0111, T-0105, T-1205 (`listarLojas`), T-1211 (mock de `/lojas`), T-1213 (`CartaoLoja`): o primeiro trecho do módulo 12 é executado antes deste módulo (ver roadmap)

### [ ] T-0912 · `BlogDaHome` lista os três artigos com link para o blog atual

- **Requisito:** REQ-09-12
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/BlogDaHome.spec.ts`
  - há o H2 "Guia do Pneu" e 3 artigos, cada um em um `article`
  - o título fica em H3, com link para a URL externa do artigo (`https://www.tireshop.com.br/Blog/pneu-ressecado`)
  - mostra "Pneus · 08/09/2026" e o resumo
  - a arte tem `alt` vazio, `width`, `height` e `loading="lazy"`
  - as setas "Artigo anterior" e "Próximo artigo" existem para o carrossel do celular
  - sem artigos, a seção não é renderizada
- **Pronto quando:** usa as classes `ts-blog` e `ts-artigo`; a data usa `shared/formatacao`; o link "Ver todos os artigos" recebe o destino por `props`.
- **Arquivos:** `layers/conteudo/ui/components/BlogDaHome.vue`, `BlogDaHome.spec.ts`
- **Fora do escopo:** páginas do blog.
- **Depende de:** T-0901, T-0111

### [ ] T-0913 · A Home compõe os blocos de quatro contextos, na ordem do protótipo

- **Requisito:** REQ-09-03, REQ-09-10, REQ-09-13, REQ-09-14, REQ-09-15, REQ-09-16, REQ-09-18
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/home.spec.ts` (computador), contra o mock
  - CA-09-01 e CA-09-02 (o banner não muda em 8 segundos; a seta troca)
  - CA-09-04 em 1440 px (8 cards em 2 linhas de 4) e CA-09-05 (5 lojas, botão "Ver a loja" com o fundo do token da marca)
  - CA-09-06: H1 único dentro do texto de apoio, com a imagem ao lado e "Ler mais"
  - CA-09-07 e CA-09-08 (ordem das seções; a faixa de avaliações aparece uma vez)
  - as perguntas são um acordeão com 6 itens, ao lado do botão do WhatsApp com "(41) 3317-2251"
  - CA-09-09: falha em `/produtos`, em `/lojas` ou em `/avaliacoes/resumo` mantém o status 200 e os outros blocos
  - Comprar no primeiro card adiciona o 3084 e abre o minicart
  - toda imagem abaixo da primeira dobra tem `loading="lazy"`; nenhum `iframe` na página
- **Pronto quando:** `app/pages/index.vue` usa `usePaginaInicial`, `useOfertas`, `useLojasDaHome` e `useResumoDaLoja`, cada um pela API pública do seu contexto; carrega `home.css` só nesta página; o layout não repete a faixa de avaliações nesta rota.
- **Arquivos:** `app/pages/index.vue`, `tests/e2e/home.spec.ts`
- **Fora do escopo:** metadados (T-0914); celular (T-0915).
- **Depende de:** T-0905, T-0906, T-0907, T-0908, T-0909, T-0910, T-0911, T-0912, T-0708, T-0710, T-0109, T-0115, T-0205, módulo 05 (FiltroPneus), módulo 06 (useCarrinho)

### [ ] T-0914 · Metadados e dados estruturados da Home

- **Requisito:** REQ-09-17
- **Camada:** aplicação
- **Teste primeiro:** `layers/conteudo/application/metadados-da-home.spec.ts`
  - o título é "TireShop: pneus novos com nota fiscal e garantia, em até 12x sem juros" e a descrição vem de `seo`
  - a canônica é a raiz do site, sem parâmetros
  - gera `FAQPage` com as 6 perguntas, com a resposta em texto (sem tags)
  - sem perguntas, não gera `FAQPage`
  - não gera `BreadcrumbList` (a Home não tem migalhas)
- **Pronto quando:** função pura; a página aplica com `useSeoMeta` e `useHead`; o e2e prova o CA-09-10 no HTML do servidor (JavaScript desligado).
- **Arquivos:** `layers/conteudo/application/metadados-da-home.ts`, `metadados-da-home.spec.ts`, `app/pages/index.vue`, `tests/e2e/home.spec.ts`
- **Fora do escopo:** `Organization` e `WebSite` (ver Pendências); sitemap.
- **Depende de:** T-0913, T-0106

### [ ] T-0915 · A Home passa nos invariantes, no computador e no celular

- **Requisito:** REQ-09-02, REQ-09-03, REQ-09-04, REQ-09-06, REQ-09-12, REQ-09-18
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/home-invariantes.spec.ts` (projetos `computador` 1440 e `celular` 390)
  - `conferirInvariantes(page)` passa nos dois tamanhos
  - em 390×844: CA-09-03 (arte de 390×290; a base do campo de largura do filtro fica em até 844 px, regra `_home` do `verify.py`)
  - em 390: "Ofertas da semana" mostra 6 cards em 3 linhas de 2; lojas e blog são carrosséis que andam pelas setas e pelo arraste
  - nenhum carrossel (banners, lojas, marcas, depoimentos, blog) muda de posição em 8 segundos sem interação
  - o banner anda pelo teclado (trilho focado, setas) e os pontos têm alvo de pelo menos 24 px
  - o primeiro banner é a maior imagem da primeira dobra e tem `fetchpriority="high"`; não há salto de layout ao carregar os blocos (espaços reservados)
  - fluxo completo no celular: escolher 225/45 R17 no filtro e chegar à categoria da medida
- **Pronto quando:** o arquivo roda nos dois projetos do Playwright; regressão visual da Home dentro da tolerância, comparada ao protótipo.
- **Arquivos:** `tests/e2e/home-invariantes.spec.ts`
- **Fora do escopo:** medir LCP e CLS com Lighthouse (roda no CI, em modo aviso).
- **Depende de:** T-0914, T-0010

---

## Pendências

- **Contexto Lojas antes da Home.** A seção de lojas precisa de `listarLojas`, `HttpLojaRepository.listar`, do mock de `GET /lojas` e de `CartaoLoja`. Se o módulo 02 (mega menu "Lojas Físicas") não os criar, a T-0911 fica bloqueada até o módulo 12: ajustar o roadmap ou adiantar essas tasks.
- **Departamentos e marcas.** `domain/conteudo.md` diz que `PaginaInicial` tem `departamentos` e `marcas`, mas `home.json` e o schema `PaginaInicial` do `openapi.yaml` não têm esses campos. Usamos os de `GET /navegacao` (T-0910). Corrigir o documento do domínio ou o contrato.
- **Marcas com rotação automática no protótipo.** `home.html.j2` usa `data-autoplay="5000"` com botão de pausa no carrossel de marcas; `docs/testing.md` diz "nenhum carrossel anda sozinho". Seguimos o `testing.md` (carrossel manual). Confirmar com o cliente se a rotação das marcas era desejada.
- **Ordem dos blocos.** O RF-17 do PRD lista "departamentos, lojas, marcas, entrega"; o protótipo validado tem "lojas, departamentos, entrega, marcas" (lojas logo depois dos benefícios, RT29). Seguimos o protótipo.
- **Títulos e links fixos.** Os títulos das seções ("Ofertas da semana", "Cinco lojas físicas, do Rio Grande do Sul a São Paulo", "Guia do Pneu"…), o destino de "Ver todas as promoções", de "Ver todos os artigos" e de "Ver oficinas conveniadas" não estão no contrato de `/home`. Hoje são texto do frontend; os dois últimos não têm destino no protótipo (`#`). Decidir se viram campos da API (premissa P5 do PRD: conteúdo editável).
- **Imagem do texto de apoio.** É um arquivo fixo (`/img/banners/seo-q@1x.webp`), não vem da API.
- **Vitrine × produto 4360.** Em `produtos-vitrine-ofertas.json` o 4360 vem `em_estoque`, com preço de R$ 309,00; em `produto-4360-sem-estoque.json` o mesmo código está sem estoque. O card da Home mostra Comprar e a página do produto, Avise-me. Alinhar as fixtures.
- **Tamanho das artes do blog.** A fixture manda 640×360; o protótipo usava 400×241 com `srcset`. O contrato só tem uma imagem por artigo.
- **`Organization` e `WebSite` no JSON-LD da Home.** Não estão no RNF-01 nem no ADR 0011. Perguntar à liveSEO.
- **Falha de `GET /home`.** Sem ela não há H1 nem metadados; a página mostra a tela de erro. Se o cliente preferir a Home parcial, é mudança de requisito.
