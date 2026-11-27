# Tasks 02 — Conteúdo: navegação, layout padrão e newsletter

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. São duas fatias, cada uma de dentro para fora: a **navegação** (T-0201 a
T-0214, contexto Conteúdo) e a **newsletter** (T-0215 a T-0218, contexto Relacionamento). O e2e
(T-0219) fecha as duas. O id T-0205 é citado por outros módulos: não renumere.

---

### [x] T-0201 · `Navegacao` e o caso de uso `obterNavegacao` — 2026-11-27

- **Requisito:** REQ-02-01, REQ-02-05, REQ-02-18
- **Camada:** aplicação
- **Teste primeiro:** `layers/conteudo/application/obter-navegacao.spec.ts` (com `NavegacaoRepositoryFalso`) e `layers/conteudo/domain/navegacao.spec.ts`
  - `obterNavegacao` devolve a `Navegacao` da porta; erro da porta sai como `Result` de falha, sem lançar
  - `temAros(departamento)` é falso para a lista vazia (a tela mostra só o título e o `resumoAros`)
  - `totalDeLinksDeAro(navegacao)` soma os aros de todos os departamentos (59 com os dados do exemplo)
  - `linksVisiveis(links)` tira os itens com `href` nulo ("Meus Pedidos", "Rastrear pedido", "Aros")
  - `tipoDoItemDeMenu(item)` devolve `lojas` para o item que aponta para o hub de lojas, `marcas` para o que aponta para `#marcas`, e `link` para os outros
  - `linkDoWhatsapp(contato)` devolve `https://wa.me/554133172251`
  - a fábrica `umaNavegacao()` cria uma navegação válida e aceita sobrescritas
- **Pronto quando:** tipo `Navegacao` (contato, redes, menu, departamentos com aros, ajuda, extras, marcas, rodapé com colunas e texto fiscal) e porta `NavegacaoRepository` em `domain/`; falso em `application/__falsos__/`; modelo raso, sem classe.
- **Arquivos:** `layers/conteudo/domain/navegacao.ts`, `navegacao.spec.ts`, `domain/portas.ts`, `domain/__fabricas__/navegacao.ts`, `application/obter-navegacao.ts`, `obter-navegacao.spec.ts`, `application/__falsos__/navegacao-repository-falso.ts`
- **Fora do escopo:** `ConteudoRepository` (Home, políticas, Sobre nós: módulos 09 a 11).
- **Depende de:** T-0101, T-0105, T-0107, T-0108
- **Decisões:** primeiro import cruzado de contexto de verdade no projeto (`conteudo` → `shared`,
  pela API pública). Dois achados por causa disso, nenhum visível só lendo a task:
  (1) `#layers/shared` é o alias que o próprio Nuxt gera, um por layer (`.nuxt/tsconfig.*.json`,
  docs/architecture.md A5) — só o TypeScript sabe dele; o projeto "unidade" do Vitest roda sem o
  Nuxt, então precisa do mesmo alias de novo (`resolve.alias`, em `vitest.config.ts` e
  `vitest.mutacao.config.ts` — cresce um item por contexto que vier a importar o shared, hoje só
  este); (2) importar `#layers/shared` (a API pública inteira) carrega `use-cliente-http.ts`, que
  importa `h3` — pacote que só existia como dependência transitiva do Nuxt, nunca declarada; fora
  do contexto do Nuxt (este projeto, "unidade") o Node não acha. `h3` entrou em `dependencies`,
  fixado na mesma versão que o Nuxt já usa por dentro (`1.15.11` — não a última, pra não ter duas
  versões de h3 coexistindo com tipos possivelmente incompatíveis). `ErroDeConteudo` começa só com
  `ErroDeRede | ErroDeContrato`: `PaginaNaoEncontrada` entra quando a task que precisar dele
  (`obterPolitica`, módulo 11) chegar. A fábrica `umaNavegacao()` espelha os 8 departamentos e a
  contagem de aros de `docs/api/examples/navegacao.json` (59), sem copiar cada `href` real.


### [x] T-0202 · `HttpNavegacaoRepository` entende `GET /navegacao` — 2026-11-27

- **Requisito:** REQ-02-01, REQ-02-18
- **Camada:** adaptador
- **Teste primeiro:** `layers/conteudo/adapters/http/http-navegacao-repository.spec.ts` (com `ClienteHttpFalso`)
  - `mocks/fixtures/navegacao.json` valida no schema e vira `Navegacao`, com 8 departamentos, 17 marcas e 4 colunas de rodapé
  - o logotipo de cada marca vira `Imagem` (`alliance.webp`, 152×25)
  - `href: null` (marca sem página, "Meus Pedidos") é aceito e vira ausência de link
  - departamento com `aros: []` é aceito
  - falta de `contato.whatsapp` vira `ErroDeContrato` com o caminho do campo
  - falha de rede vira `ErroDeRede`; campo desconhecido é ignorado
- **Pronto quando:** `NavegacaoSchema` (Zod), `paraNavegacao(dto)` e o repositório chamam `GET /navegacao` pelo `ClienteHttp`; o DTO não sai de `adapters/`.
- **Arquivos:** `layers/conteudo/adapters/http/navegacao.schema.ts`, `navegacao.mapper.ts`, `http-navegacao-repository.ts`, `http-navegacao-repository.spec.ts`
- **Fora do escopo:** os outros endpoints de conteúdo.
- **Depende de:** T-0201, T-0103
- **Decisões:** primeiro uso real de Zod no projeto — `zod` entrou em `dependencies`. Isso expôs
  um tipo estreito demais no kernel (T-0103, `cliente-http.ts`): `SchemaComSafeParse<T>` dizia
  `path: ReadonlyArray<string | number>`, mas o Zod de verdade devolve `PropertyKey[]` (inclui
  `symbol`) em `issue.path`; corrigido para `PropertyKey` — nenhum schema aqui usa chave
  `symbol` (dado vem de JSON), então `.join('.')` continua seguro em tempo de execução, só o
  tipo estava errado. `ErroDeConteudo` (T-0201) é mais estreito que `ErroDoKernel` (não tem
  `NaoEncontrado`/`ErroDeValidacao`, que não fazem sentido para um recurso global sem parâmetro);
  o repositório converte qualquer um dos dois em `ErroDeContrato` na borda
  (`paraErroDeConteudo`), em vez de alargar o tipo da porta. `NavegacaoSchema` não usa `.strict()`
  de propósito: campo novo da API não quebra o adaptador.

### [x] T-0203 · O mock de `/navegacao` responde no contrato do adaptador — 2026-11-27

- **Requisito:** REQ-02-01, REQ-02-05
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/navegacao.get.spec.ts` (acrescenta casos ao teste da T-0008)
  - a resposta de `GET /api/mock/navegacao` valida no `NavegacaoSchema`
  - há 8 departamentos e pelo menos 50 links de aro no total
  - todo `href` interno é reconhecido por `resolverRota` (nenhum `desconhecida`)
  - todo `href` de categoria aponta para um slug que existe em `mocks/fixtures/_base/categorias.json`
  - `?_falha=500` continua devolvendo `problem+json`
- **Pronto quando:** o teste passa; o link do aro 17 de Carros, hoje `/c/carros-aro?pagina=17`, está corrigido para `/c/carros-aro-17` em `docs/api/examples/navegacao.json` e em `mocks/fixtures/navegacao.json` (`pnpm mocks:sincronizar`).
- **Arquivos:** `server/api/mock/navegacao.get.spec.ts`, `docs/api/examples/navegacao.json`, `mocks/fixtures/navegacao.json`
- **Fora do escopo:** mudar o formato do contrato (se for preciso, é a seção 5 do `AGENTS.md`).
- **Depende de:** T-0008, T-0202
- **Decisões:** a "Pendência" abaixo (e o "Pronto quando" desta task) descrevia um erro no aro 17
  de Carros (`/c/carros-aro?pagina=17`) que **não existe nos dois arquivos** — confirmado por
  `diff` e pelo histórico do git: os dois já trazem `/c/carros-aro-17` desde o commit inicial do
  projeto (`1f26d26`, antes de qualquer task deste repositório). Decisão (detalhe, não requisito):
  nenhuma edição de fixture era necessária; a task virou só o teste de contrato, travando o que já
  é verdade (nenhum arquivo de produção mudou, só o `.spec.ts` — sem commit `build`). Os 5 casos
  novos leem a fixture de verdade (`lerFixtureJson('navegacao')`, não a fixture reduzida dos
  testes da T-0008) e passaram de primeira: `NavegacaoSchema` (importado direto de
  `adapters/http/`, como `tests/contract/ativos.spec.ts` já faz com `shared/ui/sprite.ts` — fora de
  `layers/`, a regra do ESLint de "só pela API pública" não se aplica, e o schema é intencionalmente
  interno ao adaptador, não exportado pelo `index.ts`), 8 departamentos e 59 aros (≥ 50), todo href
  interno reconhecido por `resolverRota` e todo `/c/<slug>` existente em
  `mocks/fixtures/_base/categorias.json`. Removida a Pendência da fixture (resolvida: nunca existiu
  no código versionado).

### [x] T-0204 · O contexto Conteúdo é ligado em um lugar só, com uma busca por requisição — 2026-11-27

- **Requisito:** REQ-02-01
- **Camada:** infra
- **Teste primeiro:** `layers/conteudo/ui/composables/use-navegacao.spec.ts` (ambiente Nuxt)
  - `useNavegacao()` devolve `navegacao` e `estado` (`sucesso` ou `erro`)
  - dois componentes que chamam `useNavegacao()` na mesma página provocam uma única chamada à porta
  - com o provedor trocado no teste, usa o repositório falso
  - falha da porta deixa `estado` em `erro` e `navegacao` nula, sem lançar
  - no servidor, cada requisição recebe a própria instância
- **Pronto quando:** `app/plugins/12.conteudo.ts` é o único lugar que instancia `HttpNavegacaoRepository`; `useNavegacao` usa `useAsyncData` com a chave fixa `navegacao`; `layers/conteudo/index.ts` publica o composable e os tipos; a navegação não é copiada para store (ADR 0007).
- **Arquivos:** `app/plugins/12.conteudo.ts`, `layers/conteudo/ui/composables/use-navegacao.ts`, `use-navegacao.spec.ts`, `layers/conteudo/index.ts`
- **Fora do escopo:** componentes.
- **Depende de:** T-0202, T-0118
- **Decisões:** `useAsyncData('navegacao', ..., { dedupe: 'defer' })` — o padrão do Nuxt para
  `dedupe` é `'cancel'` (uma segunda chamada com a mesma chave *cancela* a primeira e recomeça), o
  oposto de "uma única chamada à porta" quando dois componentes pedem a navegação na mesma
  renderização; só com `'defer'` a segunda chamada reaproveita a promessa da primeira. Descoberto
  escrevendo o teste do dedupe (dois `useNavegacao()` no mesmo `setup()`): sem a opção, a porta era
  chamada duas vezes, a primeira abortada.
  O ambiente "nuxt" do Vitest (como a T-0118 já notou) guarda UM app por arquivo de teste, não um
  por `test()` — e `useAsyncData` liga a busca à chave no payload desse app, não ao componente. Os
  três testes deste arquivo passaram a usar o **mesmo** `NavegacaoRepositoryFalso` (reprogramado por
  teste com `programarSucesso`/`programarFalha`) com `clearNuxtData('navegacao')` no `afterEach`:
  trocar de repositório falso a cada teste não bastava, porque a primeira chamada a
  `useAsyncData('navegacao', …)` no arquivo fixa esse *handler* (e o que ele capturou) para as
  chamadas seguintes com a mesma chave — só o objeto falso mutável, não a função, muda de teste
  para teste.
  "No servidor, cada requisição recebe a própria instância" não ganhou teste automatizado próprio
  (mesma saída da T-0118 para o `ClienteHttp`): o ambiente "nuxt" é client-only, sem SSR de
  verdade para simular duas requisições. A garantia aqui é estrutural, não de comportamento do
  composable: `app/plugins/12.conteudo.ts` cria o repositório *dentro* do `defineNuxtPlugin`,
  nunca no escopo do módulo, a partir de `useClienteHttp()` — que a T-0118 já garante ser um por
  requisição. Como `01.http.ts`, o plugin em si não tem `.spec.ts` (é fiação fina); confirmado à
  mão com `bin/pnpm dev` (servidor real, SSR de verdade) que `12.conteudo.ts` roda no boot sem
  erro e a home provisória (`/`) continua respondendo 200 — ainda não há página consumindo
  `useNavegacao()` (a T-0205 monta o layout; "Fora do escopo: componentes" nesta task).

### [x] T-0205 · O layout padrão monta cabeçalho, conteúdo e rodapé — 2026-11-27

- **Requisito:** REQ-02-02, REQ-02-16
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/layout.spec.ts` (computador), contra o mock
  - o HTML do servidor de `/` tem, nesta ordem: o link "Pular para o conteúdo", um `header`, `main#conteudo` e um `footer`
  - o cabeçalho traz o telefone "(41) 3317-2251" vindo de `/navegacao`; o rodapé, o texto fiscal
  - o primeiro Tab da página foca "Pular para o conteúdo", e ativá-lo leva o foco ao `main`
  - a página fez uma única chamada a `/navegacao`
  - CA-02-09: com `?_falha=500` em `/navegacao`, o status é 200, o conteúdo da página aparece e o cabeçalho mostra só o logo
  - o layout expõe os lugares `faixa` e `minicart`, vazios por enquanto
- **Pronto quando:** `app/layouts/default.vue` usa `useNavegacao` e monta `SiteCabecalho` e `SiteRodape` em versão mínima (logo, telefone, texto fiscal), que as próximas tasks completam; a página inicial provisória (T-0001) usa o layout e tem um H1.
- **Arquivos:** `app/layouts/default.vue`, `app/app.vue`, `app/pages/index.vue`, `layers/conteudo/ui/components/SiteCabecalho.vue`, `SiteRodape.vue`, `tests/e2e/layout.spec.ts`
- **Fora do escopo:** menus, rodapé completo, cookies e WhatsApp (tasks seguintes); layout `loja` (módulo 12).
- **Depende de:** T-0204, T-0010
- **Decisões:** primeira página de verdade a atravessar o `useAsyncData` + `ClienteHttp` com dado
  real — achou três bugs latentes no kernel, nenhum visível só lendo as tasks anteriores:
  (1) `fetch` do servidor (Node) não resolve URL relativa (`/api/mock`): o navegador resolve
  contra a própria origem, o `fetch` do SSR não tem essa noção e falhava como `ErroDeRede` em
  silêncio (a tela não quebrava, só a navegação vinha vazia). Corrigido em
  `use-cliente-http.ts` (`montarConfiguracaoDoClienteHttp`): com `evento` (SSR) e uma `apiBase`
  que começa com `/`, prefixa com `getRequestURL(evento).origin`; uma `apiBase` já absoluta (API
  de produção) nunca é tocada. Dois casos novos em `use-cliente-http.spec.ts`.
  (2) `Imagem` (T-0107) é uma `class` — o serializador do payload do SSR (`devalue`) só serializa
  POJO, e `Navegacao.marcas[].logo` é uma `Imagem`; sem tratamento, a resposta vira 500
  ("Cannot stringify arbitrary non-POJOs"). Corrigido com um `definePayloadReducer`/
  `definePayloadReviver('Imagem', …)` novo, em `app/plugins/00.payload.ts` (prefixo "00." para
  registrar antes de qualquer plugin que produza dado pro payload).
  (3) Alvo de toque: o link "Pular para o conteúdo" (`.ts-skip`, CSS da T-0005, nunca usado de
  verdade até aqui) tinha `position: absolute` sem `display` explícito — blockifica o `<a>`
  (perde a isenção de link de texto do WCAG 2.5.8) com altura menor que 44px; e o telefone do
  cabeçalho, inicialmente com a classe `.ts-topbar__numero` (que pressupõe estar dentro de
  `.ts-topbar`, não de `.ts-header__row`, um grid), blockificava do mesmo jeito dentro do grid.
  Corrigido: `.ts-skip` ganhou `display: inline-flex; align-items: center; min-height:
  var(--ts-tap)` (`base.css`); o telefone passou a usar `.ts-header__acao` (já tem
  `min-height: var(--ts-tap)`, é a classe certa para um link de ação do cabeçalho); e
  `.ts-header__logo` ganhou `display: flex; align-items: center; min-height: var(--ts-tap)`
  (a imagem por si só tem 32px de altura). Achado rodando `kernel.spec.ts` depois da mudança —
  o layout padrão agora envolve toda página, inclusive a de prova do kernel.
  Para os dois testes que o Playwright não alcança (a busca a `/navegacao` roda dentro do
  processo do servidor, nunca passa pela rede do navegador): `app/plugins/12.conteudo.ts` ganhou
  uma instrumentação só em desenvolvimento (`import.meta.dev`, cai por tree-shaking em produção)
  — conta as chamadas e devolve no cabeçalho de resposta `x-dev-chamadas-navegacao`; e aceita
  `?_falha_navegacao=500` na própria página para simular a falha sem precisar interceptar a rede.
  Não reutiliza `?_falha=500` do mock (T-0008): esse parâmetro vale para a URL do recurso
  chamado, e não há como uma página apontar "falhe só esta busca" por fora, já que o fetch nunca
  passa pelo browser. É um padrão novo — mais módulos vão precisar do mesmo truque para CA de
  "página responde 200 com a busca principal falhando" (ver `grep -rn '_falha=500' specs/`).
  Confirmado à mão (`bin/pnpm dev`, `bin/pnpm build` + `bin/pnpm preview`) que a home renderiza
  com telefone e texto fiscal de verdade, e que a suíte e2e completa (60 testes, os dois
  tamanhos) passa. **Não verificado:** `bin/pnpm preview` com o mock ligado (config padrão) dá
  500 em `/api/mock/navegacao` — `.output/` não leva `mocks/fixtures/` (Nitro só empacota o que
  seu rastreador de dependências enxerga; a leitura é um `readFile` dinâmico). Isso é
  pré-existente (nada desta task toca `server/utils/mock.ts` nem o build) e não é um caminho real:
  produção de verdade aponta `NUXT_PUBLIC_API_BASE` para a API externa (mock fica "desligado"),
  cenário que a T-1317 testa explicitamente. Registrado aqui, não como Pendência nova.

### [x] T-0206 · O cabeçalho mostra barra de topo, logo, busca por medida, Entrar e carrinho — 2026-11-27

- **Requisito:** REQ-02-03, REQ-02-04
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/SiteCabecalho.spec.ts`
  - a barra de topo é um link só para `https://wa.me/554133172251`, com o número "(41) 3317-2251" e o rótulo "Telefone e WhatsApp"
  - a `nav` "Atalhos" tem "Ajuda", com link para `rotas.politica('perguntas-frequentes')`
  - o logo é um link para `rotas.home()` com o nome "TireShop, página inicial"
  - a busca é um `form` com `role="search"`, rótulo "Busca por Medida" e o texto de exemplo "Encontre o pneu ex: 225/45R17"
  - enviar a busca com "225/45R17" emite `buscar` com o texto; com o campo vazio, não emite
  - com `quantidadeNoCarrinho: 2`, o botão tem `aria-label` "Carrinho, 2 pneus" e mostra o número 2; com 1, "Carrinho, 1 pneu"
  - com `quantidadeNoCarrinho: 0`, o `aria-label` é "Carrinho, vazio" e o número não aparece
  - clicar no carrinho emite `abrir-carrinho`; clicar no botão de menu emite `abrir-menu`
- **Pronto quando:** `BarraDeTopo` e `BuscaPorMedida` são componentes próprios, usados pelo `SiteCabecalho`; classes `ts-topbar*`, `ts-header*` e `ts-busca*` do protótipo; o cabeçalho não importa Catálogo nem Carrinho.
- **Arquivos:** `layers/conteudo/ui/components/SiteCabecalho.vue`, `BarraDeTopo.vue`, `BuscaPorMedida.vue`, `SiteCabecalho.spec.ts`
- **Fora do escopo:** interpretar a medida e navegar (módulo 05); contagem real e minicart (módulo 06); destino de "Entrar" e de "Meus Pedidos" (ver Pendências).
- **Depende de:** T-0205, T-0119
- **Decisões:** "Meus Pedidos" (REQ-02-03 pede os dois atalhos, "Ajuda" e "Meus Pedidos") é mostrado
  como texto simples, sem link — mesma falta de destino já registrada na Pendência (login fora do
  escopo). "Entrar" idem: `<button>` (classe `.ts-header__acao`, que o CSS já previa também para
  botão, não só link) sem ação. `app/layouts/default.vue` passou a dar `:quantidade-no-carrinho="0"`
  ao `SiteCabecalho` (prop obrigatória, sem valor real até o módulo 06).
  Blockificação de CSS de novo (T-0205 já achou duas): o link do WhatsApp (`.ts-topbar__contato`)
  e o link "Ajuda" são filhos diretos de containers flex (`.ts-topbar__row`, `.ts-topbar__links`)
  — todo filho direto de flex/grid vira `display: block` computado, perdendo a isenção de "link
  de texto" do WCAG 2.5.8, não só com `position: absolute` (o caso da T-0205). Com `min-height`
  mas sem largura mínima, "Ajuda" ainda ficava abaixo de 44px (o texto é curto). Corrigido com
  `min-height`/`min-width: var(--ts-tap)` + `padding-inline` em `.ts-topbar__contato` e
  `.ts-topbar__links a`; e, no celular, `.ts-header__acao` (Entrar, Carrinho, só ícone lá) ganhou
  `min-width: var(--ts-tap)` — o padding menor do breakpoint (`--ts-s-2` em vez de `--ts-s-3`)
  deixava o botão com 40px de largura. Achado rodando `kernel.spec.ts` e `layout.spec.ts` nos
  dois tamanhos depois de montar o cabeçalho de verdade — padrão a vigiar em toda task que puser
  link/botão dentro de uma barra `flex`/`grid` (`docs/architecture.md` não tem nada sobre isto
  ainda; vale uma nota lá se aparecer uma quarta vez).
  Confirmado: `bin/pnpm test` (951/951), `typecheck`, `lint` (0 erros) e `format:check` limpos;
  `bin/pnpm test:e2e` completo (60/60) sem regressão; `bin/pnpm build` limpo.

### [x] T-0207 · O mega menu Departamentos mostra os aros de cada departamento — 2026-11-27

- **Requisito:** REQ-02-05, REQ-02-06
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/MegaMenuDepartamentos.spec.ts`
  - lista os 8 departamentos, cada um com ícone e link para a categoria
  - Carros mostra 14 links, de "Aro 10" a "Aro 24"; Vans mostra "Aro 14", "Aro 15" e "Aro 16"
  - a lista de aros tem `aria-label` "Aros de Carros"
  - departamento sem aros mostra o `resumoAros` como texto, sem lista
  - o pé do painel tem os grupos "Ajuda para escolher" e "Também vendemos", só com os links que têm `href`
  - link interno usa a navegação do Nuxt; link externo sai com a URL completa
  - escolher um link emite `fechar`
- **Pronto quando:** o painel fica dentro de um `details` com `summary` "Departamentos"; o componente `MegaMenu` (invólucro) fecha com Esc devolvendo o foco ao `summary`, fecha com clique fora e avisa o cabeçalho ao abrir, para os outros fecharem.
- **Arquivos:** `layers/conteudo/ui/components/MegaMenu.vue`, `MegaMenuDepartamentos.vue`, `MegaMenuDepartamentos.spec.ts`, `MegaMenu.spec.ts`, `SiteCabecalho.vue`
- **Fora do escopo:** menus de Lojas e de Marcas (T-0208).
- **Depende de:** T-0206
- **Decisões:** "avisa o cabeçalho ao abrir, para os outros fecharem" virou um coordenador
  pequeno (`use-coordenador-mega-menu.ts`, não citado nas tasks por nome): `SiteCabecalho`
  fornece um `Ref<symbol | null>` uma vez (`fornecerCoordenadorMegaMenu`); cada `MegaMenu` lê o
  mesmo ref e se fecha quando outro grava o próprio id — zero mudança nele quando a T-0208
  acrescentar Lojas e Marcas, só mais uma instância lendo o mesmo coordenador. Sem provedor
  acima (`MegaMenu.spec.ts` montando um só), a fábrica do `inject` cria um coordenador isolado,
  sem aviso no console — a instância só não tem ninguém para fechar.
  `departamento.icone` ("carro", "suv"…) não bate com os nomes do sprite (MDI, "mdi-car-side"…);
  `icone-do-departamento.ts` traduz os 8 valores fixos do contrato — mapa, não lógica, então
  também serve de pronto para o menu do celular (T-0209).
  Todo link do painel (título do departamento, aro, "Ajuda para escolher", "Também vendemos")
  decide `NuxtLink` ou `<a target="_blank" rel="noopener noreferrer">` por `classificarHref`
  (T-0105) — nenhum grupo assume de antemão se é interno ou externo; na fábrica (e no contrato
  real, T-0203), os aros são externos (site legado) e os departamentos, internos.
  Confirmado: `bin/pnpm test` (962/962), `typecheck`, `lint` (0 erros) e `format:check` limpos;
  `bin/pnpm test:e2e` completo (60/60) sem regressão; `bin/pnpm build` limpo.

### [x] T-0208 · Os mega menus de Lojas Físicas e de Marcas — 2026-11-27

- **Requisito:** REQ-02-06, REQ-02-07, REQ-02-08
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/MegaMenusDeLista.spec.ts`
  - com 5 lojas recebidas por prop, mostra a foto, a cidade, a UF e o endereço de cada uma, com link para `rotas.loja(slug)`
  - o pé do menu de lojas tem "Ver todas as lojas" (`rotas.lojas()`) e o WhatsApp com o telefone
  - sem lojas, "Lojas Físicas" é um link simples para `rotas.lojas()`, sem painel
  - o menu de marcas mostra os 17 logotipos, cada um com `alt` igual ao nome, `width` e `height`
  - Hankook tem link para `/c/hankook` com o nome "Pneus Hankook"; marca com `href` nulo é só o logotipo
  - os itens do menu que não são mega menu ("Promoções", "Blog", "Sobre Nós") saem como links simples, na ordem recebida
  - abrir "Marcas" com "Departamentos" aberto fecha "Departamentos"
- **Pronto quando:** `MegaMenuLojas` recebe `lojas` por prop com um tipo próprio do Conteúdo (`LojaDoMenu`: slug, cidade, UF, endereço, foto), sem importar o contexto Lojas; o cabeçalho decide o tipo de cada item com `tipoDoItemDeMenu`.
- **Arquivos:** `layers/conteudo/ui/components/MegaMenuLojas.vue`, `MegaMenuMarcas.vue`, `MegaMenusDeLista.spec.ts`, `SiteCabecalho.vue`, `layers/conteudo/domain/navegacao.ts`
- **Fora do escopo:** buscar as lojas (`GET /lojas`, módulo 12); página de marca.
- **Depende de:** T-0207
- **Decisões:** `app/layouts/default.vue` passa `:lojas="[]"` ao `SiteCabecalho` (prop obrigatória,
  sem dado real até o módulo 12 — mesmo padrão de `quantidade-no-carrinho` na T-0206); "Lojas
  Físicas" aparece como link simples em toda página até lá (a Pendência "Mega menu de Lojas" já
  registrava isso).
  Reaproveitado de propósito: o coordenador de mega menu e o `classificarHref`/`NuxtLink` vs
  `<a target="_blank">` da T-0207, agora também em "Ajuda"/"Blog"/"Sobre Nós" do próprio
  `navegacao.menu` e nos cartões de loja/logotipo de marca — mesmo padrão em todo link do
  cabeçalho, sem reinventar por mega menu.
  `MegaMenu` ganhou a prop opcional `variante` (sufixo de classe `ts-mega--<variante>`, o estilo
  de summary que o protótipo já reservava para Lojas/Marcas) — a única mudança no componente
  genérico da T-0207, do jeito que a Decisão de lá previa.
  Achado de teste (mesma classe da T-0204/T-0205): `MegaMenusDeLista.spec.ts` varia `marcas`/
  `menu` a cada teste — com um `NavegacaoRepositoryFalso` novo por `montar()` (como a primeira
  versão deste arquivo fazia), só o PRIMEIRO teste do arquivo era respeitado (o handler do
  `useAsyncData('navegacao', …)` fica fixo nele); corrigido com um único falso por `describe`,
  reprogramado por teste. `SiteCabecalho.spec.ts` (T-0206) também precisou de `lojas: []` no
  `montar()`, por causa da prop nova.
  Confirmado: `bin/pnpm test` (969/969), `typecheck`, `lint` (0 erros) e `format:check` limpos;
  `bin/pnpm test:e2e` completo (60/60) sem regressão; `bin/pnpm build` limpo.

### [x] T-0209 · O menu do celular abre em gaveta, com departamentos e aros em acordeão — 2026-11-27

- **Requisito:** REQ-02-09
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/MenuCelular.spec.ts`
  - com `aberto`, é um diálogo modal com `aria-label="Menu"`, na variante que entra pela esquerda
  - "Departamentos" abre a lista dos 8 departamentos, cada um com o ícone, o nome ao lado e a seta à direita
  - abrir "Carros" mostra "Todos os pneus de carros" e os 14 aros
  - os itens do menu principal aparecem na ordem recebida, cada um com a seta à direita
  - "Ajuda para escolher" abre os links de ajuda que têm `href`
  - a lista de conta mostra "Entrar ou criar conta" com o ícone e o nome
  - o pé tem o botão "WhatsApp (41) 3317-2251" e o horário de atendimento
  - escolher qualquer link emite `fechar`; o X tem `aria-label` "Fechar o menu"
- **Pronto quando:** usa o `Dialogo` (variante `esquerda`, `fecharAcimaDe: 900`); classes `ts-menu*` do protótipo (os aros em grade vêm do CSS); o `SiteCabecalho` abre a gaveta no `abrir-menu`.
- **Arquivos:** `layers/conteudo/ui/components/MenuCelular.vue`, `MenuCelular.spec.ts`, `SiteCabecalho.vue`
- **Fora do escopo:** lojas e marcas dentro da gaveta (no celular são links simples, como no protótipo).
- **Depende de:** T-0206, T-0112
- **Decisões:** não usa `Acordeao.vue` (T-0109) — ele é específico de FAQ (`pergunta`/`resposta`
  em `HtmlSeguro`), com as classes `ts-faq*`. A gaveta usa `<details>` nativo direto, do mesmo
  jeito que o `MegaMenu` do computador (T-0207), só que aninhado: "Departamentos"
  (`.ts-menu__grupo`) contém um `<details class="ts-menu__sub">` por departamento, cada um com
  os aros em `.ts-menu__aros` (grade do CSS) — "Todos os pneus de {nome}" é o primeiro item dessa
  mesma lista (link para `departamento.href`), não um aro de verdade.
  `SiteCabecalho` guarda o estado da gaveta (`gavetaAberta`, local) em vez de só repassar
  `abrir-menu` para o layout — ele já tinha o emit da T-0206 (mantido, para quem ainda escuta) e
  agora também abre a gaveta direto, fechando-a quando `MenuCelular` emite `fechar` (escolher
  qualquer link, Esc, clique fora ou X — tudo por dentro do `Dialogo`, T-0112).
  `.ts-dialogo__cabeca` (X de fechar) do `Dialogo` substitui o `.ts-menu__cabeca`/`.ts-menu__logo`
  do protótipo original: a task não pede logo na gaveta, e duplicar cabeçalhos (um do Dialogo,
  um do protótipo) seria inventar UI sem teste cobrindo.
  Achado de teste (repete T-0208): `SiteCabecalho.spec.ts` (T-0206) buscava
  `a[href="https://wa.me/554133172251"]` na página inteira esperando um só resultado; a gaveta
  também tem um link de WhatsApp no pé (REQ-02-09), então agora há dois — o teste passou a
  buscar dentro de `.ts-topbar` (o que ele sempre quis dizer com "a barra de topo").
  Confirmado: `bin/pnpm test` (977/977), `typecheck`, `lint` (0 erros) e `format:check` limpos;
  `bin/pnpm test:e2e` completo (60/60) sem regressão; `bin/pnpm build` limpo.

### [x] T-0210 · O rodapé mostra colunas, redes, selos, pagamentos e os dados fiscais — 2026-11-27

- **Requisito:** REQ-02-10, REQ-02-11
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/SiteRodape.spec.ts`
  - mostra as 4 colunas recebidas ("Comprar", "Ajuda para escolher", "Entrega e pagamento", "Atendimento e empresa"), cada uma em um `details`
  - a coluna "Ajuda para escolher" tem o link "Comparar pneus" para `rotas.comparar()`
  - links com `href` nulo ("Rastrear pedido", "Meus Pedidos") não são renderizados
  - as 4 redes têm `aria-label` "TireShop no Instagram", "…no Facebook", "…no YouTube" e "…no TikTok"
  - não existe `h2` nem `h3` dentro do rodapé
  - o texto fiscal recebido aparece inteiro
  - a linha da empresa traz a razão social, "CNPJ: 80.171.671/0001-54", o telefone com `tel:+554133172251` e o e-mail com `mailto:`
  - os selos ("Loja confiável", "Site Seguro Google", "Certificado SSL") e as 7 formas de pagamento aparecem, com `alt` nas imagens
- **Pronto quando:** as colunas abrem e fecham conforme a largura (abertas a partir de 900 px, fechadas abaixo), também quando a janela muda de tamanho; o rodapé expõe o lugar `newsletter`; o ano de "Todos os direitos reservados" vem do servidor.
- **Arquivos:** `layers/conteudo/ui/components/SiteRodape.vue`, `SiteRodape.spec.ts`
- **Fora do escopo:** formulário de newsletter (T-0218); a nota do selo "Loja confiável" (vem de Avaliações; ver Pendências).
- **Depende de:** T-0205
- **Decisões:** texto da marca ("Pneus novos com nota fiscal…"), os ícones dos 3 selos e as 7
  formas de pagamento (Pix e Boleto com ícone + texto, `.ts-pagamento--texto`; Visa, Mastercard,
  Amex, Elo e Diners com imagem) saíram do HTML real do protótipo (`portal/alta-fidelidade/
  lojas.html`, fora deste repositório) — não inventados; já registrado como fixo no frontend na
  Pendência "Textos fixos da moldura". "Loja confiável" aparece sem a nota (5 estrelas, "4,8 de 5
  na Trustvox" no protótipo): a nota de verdade é do contexto Avaliações, fora do escopo; mostrar
  estrelas cheias sem dado real seria inventar uma avaliação.
  Ano de "Todos os direitos reservados" por `useState('ano-do-rodape', () => new
  Date().getFullYear())`: calculado uma vez (no servidor, numa requisição de verdade) e
  reaproveitado tal qual na hidratação — um `new Date()` direto no `<script setup>` rodaria de
  novo no cliente, podendo divergir do servidor bem na virada do ano (achado, não comprovado em
  produção: o unit test só confere o valor, não a reutilização entre servidor e cliente).
  Achado de alvo de toque (mesma classe de T-0205/T-0206, desta vez sem blockificação): o
  `<summary>` de cada coluna do rodapé não tinha `min-height` nenhum na regra base — só a media
  query do celular dava 52px; no computador (onde a regra `@media (min-width: 900px)` só desliga
  o clique, `pointer-events: none`, já que lá as colunas ficam sempre abertas) sobrava o tamanho
  do texto, 24,8px. Corrigido com `min-height: var(--ts-tap)` na regra base de
  `.ts-rodape__coluna summary` — achado rodando `kernel.spec.ts` no tamanho computador (a página
  de prova do kernel também usa o layout padrão, com o rodapé de verdade agora).
  Confirmado: `bin/pnpm test` (988/988), `typecheck`, `lint` (0 erros) e `format:check` limpos;
  `bin/pnpm test:e2e` completo (60/60) sem regressão; `bin/pnpm build` limpo.

### [x] T-0211 · O botão flutuante do WhatsApp aparece sem cobrir barra fixa — 2026-11-27

- **Requisito:** REQ-02-15
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/BotaoWhatsapp.spec.ts`
  - é um link para `https://wa.me/554133172251`, a partir do número recebido
  - tem `aria-label` "Falar no WhatsApp: (41) 3317-2251"
  - o ícone é decorativo (`aria-hidden`)
  - com `acimaDaBarra`, recebe a classe que o sobe acima da barra fixa
  - sem número, não renderiza
- **Pronto quando:** componente em `shared/ui` (o layout da loja física usa o mesmo, com o número da loja); o layout padrão o monta com o contato da navegação; usa a classe `ts-fab` e o token `--ts-whatsapp`.
- **Arquivos:** `layers/shared/ui/BotaoWhatsapp.vue`, `BotaoWhatsapp.spec.ts`, `app/layouts/default.vue`
- **Fora do escopo:** as barras fixas em si (módulos 03 e 04); o e2e de sobreposição é da T-0219 e dos módulos que têm barra.
- **Depende de:** T-0205, T-0108
- **Decisões:** `formatarNumeroDeWhatsapp` (nova, `telefones.ts`) em vez de reusar
  `formatarTelefone`: `Contato.whatsapp` (e o número de uma loja) vem com o DDI ("554133172251"),
  formato diferente de `Contato.telefone` (já local). Tira o "55" só quando bate 12/13 dígitos
  com esse prefixo; fora disso, devolve o texto original — mesma postura de "não validar,
  só formatar" que `formatarTelefone` já tinha.
  O modificador de alvo não existia no CSS do protótipo (ele nunca teve uma barra fixa de
  verdade) — `.ts-fab--acima` é novo, reaproveitando `--ts-barra-h` (já usado pela barra fixa de
  compra do catálogo) e `--ts-s-2`, em vez de inventar um valor solto.
  **Achado que mudou o Arquivo:** montar em `app/layouts/default.vue` (como a task pedia) quebrou
  "uma única chamada à porta" (T-0204/T-0205) — rodando a home de verdade (`bin/pnpm dev`),
  `x-dev-chamadas-navegacao` virou "2". Causa: no SSR de verdade (não no ambiente "nuxt" do
  Vitest, que é client-only — T-0118/T-0204), o `onServerPrefetch` do `useAsyncData` do PAI
  (`default.vue`) é esperado por inteiro antes dos FILHOS (`SiteCabecalho`, `SiteRodape`)
  começarem o próprio `setup()`; quando o pai chega lá, a chave já está `"success"` e sem
  promessa em voo, e o branch de servidor do Nuxt chama o handler de novo sem checar o status
  (só o branch de cliente checa) — o `dedupe: 'defer'` só evita a segunda chamada entre
  `SiteCabecalho` e `SiteRodape` porque os dois são filhos DIRETOS do mesmo pai e começam o
  `setup()` antes de qualquer um terminar a própria busca (achado confirmado com `console.log`
  no handler, direto no `nuxt dev`, não só no teste). Resolvido montando `BotaoWhatsapp` dentro
  de `SiteRodape.vue` (que já busca `navegacao`), não em `default.vue` — um `useNavegacao()` a
  mais em outro nível da árvore volta a quebrar isto. `app/layouts/default.vue` segue listado
  nos Arquivos porque o comentário dele foi atualizado explicando a decisão, mesmo sem montar o
  componente diretamente.
  Confirmado: `bin/pnpm test` (997/997), `typecheck`, `lint` (0 erros) e `format:check` limpos;
  `bin/pnpm test:e2e` completo (60/60, inclui a chamada única voltando a "1") sem regressão;
  `bin/pnpm build` limpo; `bin/pnpm dev` com `x-dev-chamadas-navegacao: 1` confirmado à mão.

### [x] T-0212 · O aviso de cookies some no "Entendi" e fica lembrado — 2026-11-27

- **Requisito:** REQ-02-14
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/AvisoCookies.spec.ts`
  - no HTML do servidor o aviso não aparece
  - no navegador, sem aceite gravado, aparece com o texto e o link "Política de privacidade" (`rotas.politica('privacidade')`)
  - "Entendi" esconde o aviso e grava `ts-cookies = 1` em `localStorage`
  - com o aceite gravado, não aparece
  - com `localStorage` lançando erro, o aviso aparece, some no "Entendi" e nada quebra
  - é uma região com `aria-label="Aviso de cookies"`
- **Pronto quando:** componente em `shared/ui`, montado pelo layout padrão; a chave guarda só `1` (nenhum dado pessoal); "Entendi" é o botão de variante `acao`.
- **Arquivos:** `layers/shared/ui/AvisoCookies.vue`, `AvisoCookies.spec.ts`, `app/layouts/default.vue`
- **Fora do escopo:** gestão de consentimento por categoria; bloqueio de scripts de terceiros.
- **Depende de:** T-0205, T-0119
- **Decisões:** "no HTML do servidor o aviso não aparece" vem do `<ClientOnly>` (mecanismo do
  próprio Nuxt), não de um `v-if` escondendo depois de montar — garante a ausência sem depender
  de nenhuma corrida entre SSR e hidratação. Não dá para observar isso no `AvisoCookies.spec.ts`:
  o ambiente "nuxt" do Vitest é client-only (mesmo achado da T-0118/T-0204), então `mountSuspended`
  já entrega o componente com `onMounted` resolvido, nunca o estado "antes de montar". Confirmado
  à mão com `bin/pnpm dev`: `curl http://localhost:3000/` não traz nenhum texto do aviso.
  Achado de alvo de toque (mesma classe das tasks anteriores, mas sem blockificação desta vez):
  `.ts-cookies .ts-btn` tinha `min-height: 40px` fixo no CSS do protótipo — abaixo dos 44px que
  este projeto exige; o protótipo original nunca precisou disso. Trocado para
  `min-height: var(--ts-tap)` — achado rodando `kernel.spec.ts` (a página de prova do kernel usa
  o layout padrão, com o aviso de cookies de verdade agora).
  Confirmado: `bin/pnpm test` (1002/1002), `typecheck`, `lint` (0 erros) e `format:check` limpos;
  `bin/pnpm test:e2e` completo (60/60) sem regressão; `bin/pnpm build` limpo.

### [x] T-0213 · Rota inexistente mostra a página de não encontrado, com status 404 — 2026-11-27

- **Requisito:** REQ-02-17
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/nao-encontrado.spec.ts` (computador e celular)
  - CA-02-10: `/nao-existe` responde 404 e mostra "Página não encontrada" em um único H1
  - a página tem o cabeçalho e o rodapé do layout padrão
  - há um link para a Home e um para o WhatsApp
  - um erro 500 lançado por uma página de prova mostra "Algo deu errado" e responde 500
  - `conferirInvariantes(page)` passa
- **Pronto quando:** `app/error.vue` trata 404 e os demais status, dentro do layout padrão; as páginas dos contextos usam `createError({ statusCode: 404 })` quando o caso de uso devolve `NaoEncontrado`.
- **Arquivos:** `app/error.vue`, `tests/e2e/nao-encontrado.spec.ts`, `tests/e2e/_paginas-de-prova/erro.vue`
- **Fora do escopo:** sugestões de produto na página de erro; redirecionamento de URL legada (D2).
- **Depende de:** T-0205, T-0113
- **Decisões:** `app/error.vue` substitui `app.vue` por inteiro quando o Nuxt mostra um erro fatal
  (404 de rota, ou `createError` lançado por qualquer página) — por isso ele mesmo entra num
  `<NuxtLayout name="default">`: sem isso, não haveria cabeçalho nem rodapé. O rodapé (`SiteRodape`)
  já traz o link do WhatsApp para toda página que usa o layout padrão; `app/error.vue` não chama
  `useNavegacao()` de novo (evita repetir o bug da T-0211: um fetch a mais no nível do pai quebra
  a "única chamada" com os filhos). O link para a Home é o único conteúdo próprio da página
  ("Voltar para a Home", `Botao` variante `acao`, `rotas.home()`); o `.ts-btn` já tem
  `min-height: var(--ts-tap)` por padrão (T-0119), sem CSS novo.
  A página de prova `tests/e2e/_paginas-de-prova/erro.vue` (registrada em `nuxt.config.ts` do
  mesmo jeito que `/_prova/kernel`, só fora de produção) lança `createError({ statusCode: 500 })`
  no próprio `setup()` para o e2e provocar o status 500.
  Achado rodando contra `bin/pnpm dev`: em desenvolvimento, qualquer erro não tratado com
  status ≥ 500 também abre a sobreposição de depuração do Vite (pacote `my-bad`, que o Nuxt usa
  como página de erro de desenvolvimento) — ela mesma tem um `h1` dentro de um shadow root
  aberto, que o Playwright atravessa normalmente. Isso não existe em produção (a sobreposição só
  roda com `import.meta.hot`, achado lendo
  `node_modules/nuxt/dist/app/plugins/dev-error-overlay.client.js`); o teste do 500 conta `h1`
  dentro de `#__nuxt` (o container da nossa própria página), não da página inteira — mesma
  categoria de achado "dev-only" das tasks anteriores (`x-dev-chamadas-navegacao`,
  `_falha_navegacao`).
  "as páginas dos contextos usam `createError({ statusCode: 404 })` quando o caso de uso devolve
  `NaoEncontrado`" (o segundo "Pronto quando"): nenhuma página de contexto existe ainda (categoria,
  produto, loja — chegam nos módulos 03/08/12); fica registrado aqui como a regra que essas
  páginas futuras devem seguir, não algo que esta task implementa.
  Confirmado: `bin/pnpm test` (1002/1002), `typecheck`, `lint` (0 erros) e `format:check` limpos;
  `bin/pnpm test:e2e` completo (70/70) sem regressão; `bin/pnpm build` limpo.

### [x] T-0214 · `Email`, `Telefone` e `InscricaoNewsletter` validam o contato — 2026-11-27

- **Requisito:** REQ-02-12
- **Camada:** domínio
- **Teste primeiro:** `layers/relacionamento/domain/inscricao-newsletter.spec.ts`
  - `Email` aceita "cliente@exemplo.com.br" e guarda em minúsculas ("Cliente@Exemplo.com.br" vira o mesmo valor)
  - `Email` recusa "cliente@", "cliente.exemplo.com" e texto vazio (`EmailInvalido`)
  - `Telefone` aceita "41999990000" e "(41) 3317-2251", guardando só os dígitos
  - `Telefone` recusa menos de 10 e mais de 11 dígitos (`TelefoneInvalido`)
  - `InscricaoNewsletter` com e-mail e sem WhatsApp é válida
  - WhatsApp em branco conta como ausente; WhatsApp preenchido e inválido recusa a inscrição
  - a falha diz o campo (`email` ou `whatsapp`) e a mensagem para a tela
- **Pronto quando:** value objects imutáveis, com `criar` devolvendo `Result`; mensagens: "Digite um e-mail válido, como nome@exemplo.com.br." e "Digite o WhatsApp com DDD: 10 ou 11 números."
- **Arquivos:** `layers/relacionamento/domain/email.ts`, `telefone.ts`, `inscricao-newsletter.ts`, `inscricao-newsletter.spec.ts`
- **Fora do escopo:** `PedidoAviso` (módulo 04).
- **Depende de:** T-0101
- **Decisões:** o fator estático se chama `de` (`Email.de`, `Telefone.de`), não `criar` — segue a
  convenção já usada por todo VO do kernel (`Slug.de`, `Imagem.de`, `Dinheiro.deCentavos`); "criar"
  no "Pronto quando" é a descrição do padrão (factory + `Result`), não o nome literal do método.
  A falha de `InscricaoNewsletter.de` reusa `CampoInvalido` do kernel (`#layers/shared`, mesmo
  formato `{ campo, mensagem }` que a task descreve) em vez de um tipo próprio — já é exatamente o
  que REQ-02-12 pede, sem duplicar a forma. `layers/relacionamento/index.ts` (API pública do
  contexto, antes só `export {}`) passa a reexportar os três tipos — primeira task do módulo
  Relacionamento, mesmo padrão de quando o Conteúdo abriu o próprio `index.ts` na T-0201.
  Verificação local (ritmo acordado com o dev na T-0213): só o arquivo de teste tocado (12/12) e
  `typecheck`/`lint` (0 erros) — a suíte inteira e o e2e ficam para o CI do PR.

### [x] T-0215 · Caso de uso `assinarNewsletter` — 2026-11-27

- **Requisito:** REQ-02-12, REQ-02-13
- **Camada:** aplicação
- **Teste primeiro:** `layers/relacionamento/application/assinar-newsletter.spec.ts` (com `LeadsGatewayFalso`)
  - com e-mail e WhatsApp válidos, chama a porta uma vez e devolve a mensagem de confirmação recebida
  - com e-mail inválido, devolve `ErroDeValidacao` com o campo `email` e **não** chama a porta
  - com WhatsApp inválido, devolve `ErroDeValidacao` com o campo `whatsapp` e não chama a porta
  - sem WhatsApp, a porta recebe a inscrição sem o campo
  - `ErroDeValidacao` vindo da porta (422) é repassado com os campos
  - `ErroDeRede` da porta sai como falha, sem lançar
- **Pronto quando:** porta `LeadsGateway` declarada em `domain/portas.ts`, com `assinar` devolvendo a confirmação; falso em memória em `application/__falsos__/`.
- **Arquivos:** `layers/relacionamento/domain/portas.ts`, `application/assinar-newsletter.ts`, `assinar-newsletter.spec.ts`, `application/__falsos__/leads-gateway-falso.ts`
- **Fora do escopo:** `pedirAviso` (declarado na porta, implementado no módulo 04).
- **Depende de:** T-0214, T-0103
- **Decisões:** `assinarNewsletter` valida com `InscricaoNewsletter.de` antes de chamar a porta; uma
  falha local vira `erroDeValidacao([campoInvalido])` (kernel) — mesmo tipo que a porta devolve
  num 422, então a tela trata os dois do mesmo jeito. `LeadsGateway` só declara `assinar`:
  `pedirAviso` fica inteiro para o módulo 04 (precisa de `PedidoAviso`, fora do escopo aqui) —
  não é um método a mais sem implementação na mesma porta. A pendência "Porta `LeadsGateway`"
  (fim deste arquivo) já estava resolvida: `docs/domain/relacionamento.md` já declara
  `Confirmacao`/`ErroDeRelacionamento` (não o `Result<void, …>` que a pendência descrevia) —
  removida da lista.
  Verificação local: `assinar-newsletter.spec.ts` (6/6) + `inscricao-newsletter.spec.ts` (12/12),
  `typecheck`, `lint` e `format:check` (0 erros); suíte inteira/e2e/build no CI do PR.

### [ ] T-0216 · `HttpLeadsGateway.assinar` envia a inscrição para `POST /newsletter`

- **Requisito:** REQ-02-12, REQ-02-13
- **Camada:** adaptador
- **Teste primeiro:** `layers/relacionamento/adapters/http/http-leads-gateway.spec.ts` (com `ClienteHttpFalso`)
  - envia `POST /newsletter` com o corpo igual a `newsletter.requisicao.json` (`email` e `whatsapp` só com dígitos)
  - sem WhatsApp, envia `whatsapp: null`
  - 201 com `{ "mensagem" }` vira a confirmação
  - 422 com `erros: [{ campo: 'email', … }]` vira `ErroDeValidacao` com o campo
  - 201 sem `mensagem` vira `ErroDeContrato`
  - falha de rede vira `ErroDeRede`
- **Pronto quando:** `InscricaoNewsletterSchema` e `ConfirmacaoSchema` (Zod) validam `newsletter.requisicao.json` e `confirmacao.json`.
- **Arquivos:** `layers/relacionamento/adapters/http/newsletter.schema.ts`, `http-leads-gateway.ts`, `http-leads-gateway.spec.ts`
- **Fora do escopo:** `POST /produtos/{id}/avise-me`.
- **Depende de:** T-0215

### [ ] T-0217 · O mock de `POST /newsletter` aceita, recusa e não revela quem já assinou

- **Requisito:** REQ-02-12, REQ-02-13
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/newsletter.post.spec.ts`
  - o corpo de `newsletter.requisicao.json` devolve 201 com `{ "mensagem" }`, que valida no `ConfirmacaoSchema`
  - sem `whatsapp` (ou com `null`), devolve 201
  - e-mail inválido devolve 422 em `problem+json`, com `erros[0].campo` igual a `email`
  - WhatsApp com 9 dígitos devolve 422 com o campo `whatsapp`
  - o mesmo e-mail enviado duas vezes devolve 201 nas duas
  - `?_falha=500` devolve `problem+json` com status 500
- **Pronto quando:** a rota usa o utilitário da T-0008 para falha e atraso; nada é gravado em disco.
- **Arquivos:** `server/api/mock/newsletter.post.ts`, `newsletter.post.spec.ts`
- **Fora do escopo:** envio de e-mail de verdade.
- **Depende de:** T-0008, T-0216

### [ ] T-0218 · `FormularioNewsletter` valida, envia e anuncia a confirmação

- **Requisito:** REQ-02-12, REQ-02-13
- **Camada:** ui
- **Teste primeiro:** `layers/relacionamento/ui/components/FormularioNewsletter.spec.ts` (caso de uso falso)
  - tem os campos "Seu e-mail" (`type="email"`, `autocomplete="email"`) e "Seu WhatsApp" (`type="tel"`, `autocomplete="tel"`) e o botão "Assinar"
  - com "cliente@", não chama o caso de uso, marca o e-mail com `aria-invalid` e a mensagem, e leva o foco a ele
  - com dados válidos, chama o caso de uso com o e-mail e o WhatsApp digitados
  - enquanto envia, o botão fica ocupado e não aceita segundo envio
  - no sucesso, mostra a mensagem recebida em um elemento com `role="status"` e limpa os campos
  - `ErroDeValidacao` do servidor marca o campo indicado
  - `ErroDeRede` mostra a mensagem com "Tentar de novo" e mantém o que foi digitado
  - nada é escrito em `localStorage` nem em `sessionStorage`
- **Pronto quando:** `app/plugins/16.relacionamento.ts` é o único lugar que instancia `HttpLeadsGateway`; `useRelacionamento()` entrega `assinarNewsletter`; o layout padrão põe o formulário no lugar `newsletter` do `SiteRodape`; "Assinar" é o botão de variante `acao`.
- **Arquivos:** `layers/relacionamento/ui/components/FormularioNewsletter.vue`, `FormularioNewsletter.spec.ts`, `layers/relacionamento/ui/composables/use-relacionamento.ts`, `layers/relacionamento/index.ts`, `app/plugins/16.relacionamento.ts`, `app/layouts/default.vue`
- **Fora do escopo:** máscara de telefone; "Avise-me".
- **Depende de:** T-0210, T-0215, T-0216, T-0217, T-0119

### [ ] T-0219 · A moldura do site funciona no computador e no celular

- **Requisito:** REQ-02-02, REQ-02-05, REQ-02-06, REQ-02-09, REQ-02-10, REQ-02-11, REQ-02-12, REQ-02-14, REQ-02-15, REQ-02-18
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/navegacao.spec.ts` (computador, 1440 px) e `tests/e2e/navegacao-celular.spec.ts` (celular, 390 px), contra o mock
  - CA-02-01 (HTML do servidor com pelo menos 50 links de aro) e CA-02-02 (Departamentos com os aros)
  - CA-02-03: um mega menu por vez; Esc fecha e devolve o foco; os links do painel têm pelo menos 24 px
  - CA-02-04: a gaveta do celular abre, mostra os aros em grade, prende o foco e fecha ao escolher um aro
  - CA-02-05: colunas do rodapé fechadas em 390 px e abertas em 1440 px; "Comparar pneus" presente
  - CA-02-06 e CA-02-07: newsletter com sucesso e com e-mail inválido
  - CA-02-08: "Entendi" esconde o aviso de cookies, e ele não volta ao recarregar
  - em 390 px, o botão do WhatsApp não cobre o aviso de cookies nem uma barra fixa de prova; a barra de topo não mostra os atalhos
  - `conferirInvariantes(page)` passa nos dois tamanhos, com o mega menu fechado e aberto
- **Pronto quando:** os dois arquivos passam; o texto visível da moldura não contém "numa"; o campo de WhatsApp da newsletter existe (regras herdadas de `tools/hifi/verify.py`).
- **Arquivos:** `tests/e2e/navegacao.spec.ts`, `tests/e2e/navegacao-celular.spec.ts`, `tests/e2e/_paginas-de-prova/barra-fixa.vue`
- **Fora do escopo:** busca por medida funcionando (módulo 05); minicart (módulo 06).
- **Depende de:** T-0207, T-0208, T-0209, T-0210, T-0211, T-0212, T-0213, T-0218

---

## Pendências

- **Mega menu de Lojas.** `/navegacao` não traz as lojas; o `docs/api/README.md` diz que o mega menu usa `GET /lojas`, que é do módulo 12. Até lá o item "Lojas Físicas" é um link simples. Abrir task no módulo 12: o layout padrão busca as lojas e passa a lista ao `MegaMenuLojas`.
- **Como saber qual item do menu é mega menu.** O protótipo decide pelo rótulo ("Lojas Físicas", "Marcas"). Aqui a decisão é pelo destino (`tipoDoItemDeMenu`). Proposta ao TI: um campo `tipo` (`link`, `lojas`, `marcas`) em `menu[]`; seria mudança de contrato (a seção 5 do `AGENTS.md`).
- **Itens com `href` nulo.** "Meus Pedidos", "Rastrear pedido", "Aros" e "Todos os aros" vêm sem destino. A spec não os renderiza. Confirmar com o cliente se devem apontar para as páginas do site atual; "Entrar" e "Meus Pedidos" do cabeçalho também não têm URL no contrato (login está fora do escopo).
- **Textos fixos da moldura que não estão no contrato.** O parágrafo da marca no rodapé ("Pneus novos com nota fiscal…"), o título e o apoio da newsletter, o texto do aviso de cookies e a lista de formas de pagamento estão escritos no protótipo. O `relacionamento.md` diz que o texto de consentimento ao lado do formulário "vem da navegação", mas `navegacao.json` não tem esse campo. Decidir: incluir em `/navegacao` (premissa P5) ou manter fixo no frontend.
- **Selo "Loja confiável".** O protótipo mostra a nota da Trustvox no rodapé; ela vem de `GET /avaliacoes/resumo`. Neste módulo o selo aparece sem a nota; o módulo de Avaliações passa a nota por prop.
- **Modelo de `Navegacao` no domínio.** O `docs/domain/conteudo.md` não lista `extras` nem `marcas`, e põe `textoFiscal` e `redes` na raiz; o contrato tem `extras`, `marcas`, `redes` na raiz e `rodape.textoFiscal`. A T-0201 segue o contrato; atualizar o `conteudo.md` no fechamento.
- **UTV no menu (D7).** O contrato traz UTV só com o aro 15; aguardando o cliente dizer qual aro está errado.
- **Âncoras da Home.** O menu e o rodapé apontam para `/#marcas`, `/#ofertas`, `/#entrega` e `/#departamentos`. Os destinos nascem no módulo 09; até lá o e2e não confere essas âncoras.
- **Marcas sem página.** No protótipo, marca sem página leva a `home.html#marcas`; no contrato vem `href: null`, e aqui fica só o logotipo. Confirmar.
- **Numeração dos plugins.** Usamos `00.payload.ts` (T-0205, reducers/revivers do payload — tem
  de registrar antes de qualquer outro produzir dado), `12.conteudo.ts` e `16.relacionamento.ts`;
  a arquitetura só fixa `01.http`, `10.catalogo` e `11.lojas`.
