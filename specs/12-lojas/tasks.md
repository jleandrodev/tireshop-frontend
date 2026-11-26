# Tasks 12 — Lojas físicas

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. Uma task por vez. Primeiro o domínio e os casos de uso (T-1201 a T-1207),
depois adaptador, mock e ligação (T-1208 a T-1212), os cartões, o hub, o mega menu e o Sobre nós (T-1213 a T-1215), os blocos
da página de loja (T-1216 a T-1225), a página (T-1226) e os e2e de fechamento (T-1227 e T-1228).

---

### [ ] T-1201 · Endereço, horário e contato da loja validam os próprios dados

- **Requisito:** REQ-12-13, REQ-12-20
- **Camada:** domínio
- **Teste primeiro:** `layers/lojas/domain/valores-da-loja.spec.ts`
  - `Endereco` recusa UF que não tem 2 letras; `linhas()` devolve "Rua Westphalen, 2880" e "Curitiba/PR"
  - `Horario` recusa lista vazia e guarda as linhas como vieram ("Segunda a Sexta das 08:00 às 18:00")
  - `Contato` recusa lista de WhatsApp vazia e número que não seja só dígitos começando por 55
  - `whatsappPrincipal()` é o primeiro da lista (`5541984816579` em Curitiba)
  - `whatsappsAlemDoTelefone()` é vazio em Novo Hamburgo (telefone "(51) 3593-8888", WhatsApp `555135938888`)
  - em Curitiba (telefone "(41) 3333-1777") devolve os dois WhatsApps
  - em São Paulo (telefone "(11) 2619.0748", escrito com ponto) devolve só `5511947209397`: a comparação é pelos dígitos
  - `linkWhatsapp()` devolve `https://wa.me/5541984816579`; com mensagem, acrescenta `?text=` codificado
- **Pronto quando:** os três são imutáveis e devolvem `Result` na criação.
- **Arquivos:** `layers/lojas/domain/endereco.ts`, `horario.ts`, `contato.ts`, `valores-da-loja.spec.ts`
- **Fora do escopo:** formatar telefone para exibição (é de `shared/formatacao`, usado na tela).
- **Depende de:** T-0101

### [ ] T-1202 · Os grupos de marcas saem na ordem certa, sem grupo vazio

- **Requisito:** REQ-12-16
- **Camada:** domínio
- **Teste primeiro:** `layers/lojas/domain/grupo-de-marcas.spec.ts`
  - ordena pneus, freios, suspensão, filtros, óleo e outras, mesmo que a entrada venha em outra ordem
  - grupo sem marcas não é devolvido
  - com os dados de Joinville, devolve 3 grupos: Pneus (8), Freios (5) e Suspensão (6)
  - `grupoInicial()` é `pneus`; sem o grupo de pneus, é o primeiro da ordem
  - marca sem logo é recusada na criação
  - o rótulo sai como veio ("Óleo de motor", "Outras marcas")
- **Pronto quando:** `ordenarGruposDeMarcas(grupos)` é função pura; `GrupoDeMarcas` e `Marca` (`nome`, `logo`) existem.
- **Arquivos:** `layers/lojas/domain/grupo-de-marcas.ts`, `grupo-de-marcas.spec.ts`
- **Fora do escopo:** as guias (T-1223).
- **Depende de:** T-0101, T-0107

### [ ] T-1203 · `Loja` decide a abertura, o agendamento, a vitrine e o fechamento

- **Requisito:** REQ-12-10, REQ-12-11, REQ-12-14, REQ-12-19
- **Camada:** domínio
- **Teste primeiro:** `layers/lojas/domain/loja.spec.ts`
  - `abertura()` é `banners_e_introducao` com 3 banners e `hero` com a lista vazia
  - `temAgendamento()` é verdadeiro com `https://www.tireshop.com.br/Lojas/NovoHamburgo/Agendamento` e falso com nulo
  - `temVitrine()` é verdadeiro com 4 produtos e falso com a lista vazia
  - `destinoDoBanner(banner)`: `mapa` leva a `https://goo.gl/maps/JVwDw5Xw4fx`, `whatsapp` ao WhatsApp principal, `orcamento` à URL de orçamento e `url` à URL do banner
  - banner com `alt` vazio é recusado na criação
  - `gruposDeMarcas()` usa a regra da T-1202
  - `fechamento()` é `texto` quando há texto de apoio, `faq` quando só há perguntas e `nada` sem os dois
  - duas lojas com o mesmo slug são a mesma loja; a fábrica `umaLoja()` cria uma válida e aceita sobrescritas
- **Pronto quando:** agregado imutável com `Loja.criar` devolvendo `Result`; o tipo `ProdutoResumo` da vitrine vem de `layers/catalogo/index.ts`; publicado em `layers/lojas/index.ts`.
- **Arquivos:** `layers/lojas/domain/loja.ts`, `banner-loja.ts`, `loja.spec.ts`, `__fabricas__/loja.ts`, `layers/lojas/index.ts`
- **Fora do escopo:** metadados (T-1206).
- **Depende de:** T-1201, T-1202, T-0303

### [ ] T-1204 · `LojaResumo` e `HubDeLojas` servem ao hub e aos cartões

- **Requisito:** REQ-12-02, REQ-12-03, REQ-12-05
- **Camada:** domínio
- **Teste primeiro:** `layers/lojas/domain/hub-de-lojas.spec.ts`
  - `LojaResumo` guarda slug, cidade, UF, nome, endereço, horário, contato, foto, serviços, agendamento e link do mapa
  - `servicosEmDestaque()` devolve os 6 primeiros ("Pneus", "Freios", "Suspensão", "Amortecedores", "Molas", "Troca de Óleo e Filtros" em Novo Hamburgo)
  - `totalDeServicos()` é 11 em Novo Hamburgo e 9 em Curitiba
  - `HubDeLojas` mantém as lojas na ordem recebida (Novo Hamburgo primeiro, Ribeirão Preto por último)
  - `cidadesComAgendamento()` devolve "Novo Hamburgo" e "Ribeirão Preto"
  - `fechamento()` do hub é `texto` quando há texto de apoio, mesmo havendo perguntas
  - a fábrica `umaLojaResumo()` cria uma válida
- **Pronto quando:** tipos imutáveis, publicados em `layers/lojas/index.ts` (são usados pela Home, pelo mega menu e pelo Sobre nós).
- **Arquivos:** `layers/lojas/domain/loja-resumo.ts`, `hub-de-lojas.ts`, `hub-de-lojas.spec.ts`, `__fabricas__/loja.ts`, `layers/lojas/index.ts`
- **Fora do escopo:** distância e ordenação por proximidade.
- **Depende de:** T-1201

### [ ] T-1205 · A porta `LojaRepository` e os casos de uso `listarLojas` e `obterLoja`

- **Requisito:** REQ-12-01, REQ-12-23
- **Camada:** aplicação
- **Teste primeiro:** `layers/lojas/application/lojas.spec.ts` (com `LojaRepositoryFalso`)
  - `listarLojas()` devolve o hub com título, introdução, 5 lojas, texto de apoio e perguntas
  - `obterLoja('curitiba')` devolve a loja de Curitiba
  - slug inexistente (`florianopolis`) devolve `LojaNaoEncontrada`, sem lançar
  - slug com formato inválido devolve `LojaNaoEncontrada`, sem chamar a porta
  - erro de rede da porta sai como `Result` de falha nos dois casos de uso
  - hub sem lojas é sucesso, com a lista vazia
- **Pronto quando:** `LojaRepository` (`listar`, `obter`) em `domain/portas.ts`; `ErroDeLojas` é uma união fechada; falso em memória em `application/__falsos__/`.
- **Arquivos:** `layers/lojas/domain/portas.ts`, `erros.ts`, `application/listar-lojas.ts`, `obter-loja.ts`, `lojas.spec.ts`, `application/__falsos__/loja-repository-falso.ts`
- **Fora do escopo:** cache (é da página, com `routeRules`).
- **Depende de:** T-1203, T-1204

### [ ] T-1206 · Metadados e `AutomotiveBusiness` da loja

- **Requisito:** REQ-12-22
- **Camada:** aplicação
- **Teste primeiro:** `layers/lojas/application/metadados-da-loja.spec.ts`
  - o título é "TireShop Auto Center: a sua loja de pneus em Curitiba" e a descrição vem de `seo`
  - a canônica é a URL absoluta de `rotas.loja('curitiba')`
  - gera `AutomotiveBusiness` com `name` "TireShop Autocenter Curitiba", `telephone` "+554133331777" e `address` com "Rua Westphalen, 2880", "Curitiba", "PR" e "BR"
  - `image` é a URL absoluta da fachada; `hasMap` é o link do mapa; `sameAs` traz o Instagram e o Facebook da loja
  - rede social nula não entra em `sameAs`
  - com 4 perguntas, gera também `FAQPage` com 4 itens; sem perguntas, só o `AutomotiveBusiness`
  - não gera `BreadcrumbList` (a página de loja não tem migalhas)
- **Pronto quando:** `metadadosDaLoja(loja, origem)` é função pura e devolve `Metadados` de `shared/seo`.
- **Arquivos:** `layers/lojas/application/metadados-da-loja.ts`, `metadados-da-loja.spec.ts`
- **Fora do escopo:** horário estruturado (ver Pendências); `robots` por ambiente (módulo 13).
- **Depende de:** T-1203, T-0105, T-0106

### [ ] T-1207 · Metadados do hub de lojas

- **Requisito:** REQ-12-07
- **Camada:** aplicação
- **Teste primeiro:** `layers/lojas/application/metadados-do-hub.spec.ts`
  - o título é "Lojas Físicas TireShop: Pneus e Serviços Automotivos" e a descrição vem de `seo`
  - a canônica é a URL absoluta de `rotas.lojas()`
  - as migalhas são Home e "Lojas físicas"; gera `BreadcrumbList` com as duas
  - gera `FAQPage` com as 8 perguntas, começando por "Onde estão localizadas as lojas físicas TireShop?"
  - sem perguntas, não gera `FAQPage`
- **Pronto quando:** `metadadosDoHub(hub, origem)` é função pura.
- **Arquivos:** `layers/lojas/application/metadados-do-hub.ts`, `metadados-do-hub.spec.ts`
- **Fora do escopo:** `ItemList` das lojas (não foi pedido).
- **Depende de:** T-1204, T-0105, T-0106

### [ ] T-1208 · O schema e o mapper de `HubDeLojas` entendem a API

- **Requisito:** REQ-12-25
- **Camada:** adaptador
- **Teste primeiro:** `layers/lojas/adapters/http/hub-de-lojas.mapper.spec.ts`
  - `lojas.json` valida e vira um hub com 5 lojas, 8 perguntas e texto de apoio
  - `textoApoio.titulo: null` é aceito; o HTML do texto (que começa por um `h2`) vira `HtmlSeguro`
  - `agendamentoUrl: null` vira loja sem agendamento
  - `uf` com 3 letras e `whatsapp: []` são recusados pelo schema, com o caminho (`lojas.2.whatsapp`)
  - `textoApoio: null` e `faq: []` são aceitos
  - campo a mais é ignorado
- **Pronto quando:** `LojaResumoSchema` e `HubDeLojasSchema` (Zod), `paraLojaResumo(dto)` e `paraHubDeLojas(dto)`; o DTO não sai de `adapters/`.
- **Arquivos:** `layers/lojas/adapters/http/loja-resumo.schema.ts`, `hub-de-lojas.schema.ts`, `hub-de-lojas.mapper.ts`, `hub-de-lojas.mapper.spec.ts`
- **Fora do escopo:** a loja completa (T-1209).
- **Depende de:** T-1204, T-0103, T-0104, T-0107

### [ ] T-1209 · O schema e o mapper de `Loja` entendem a API, com a vitrine do Catálogo

- **Requisito:** REQ-12-14, REQ-12-25
- **Camada:** adaptador
- **Teste primeiro:** `layers/lojas/adapters/http/loja.mapper.spec.ts`
  - `loja-curitiba.json` vira uma loja com 3 banners, 4 produtos na vitrine, 11 serviços, 6 grupos de marcas e 3 condições
  - `loja-novo-hamburgo.json` vira uma loja com agendamento, 5 banners e sem texto de apoio
  - `loja-curitiba-sem-banners.json` vira uma loja com `abertura()` igual a `hero` e sem vitrine
  - `imagemCelular: null`, `cnpj: null`, `servicos[].foto: null` e `instagram: null` são aceitos
  - `destino.tipo` fora de `mapa`, `whatsapp`, `orcamento` e `url` é recusado; `tipo: 'url'` com `url: null` é recusado
  - cada produto da vitrine vira `ProdutoResumo` pelo leitor publicado pelo Catálogo, com o preço de loja como veio (10 parcelas, 6% à vista)
  - as 5 lojas de `_base/lojas.json` passam pelo schema e pelo mapper
  - falta de `orcamentoUrl` é recusada, com o caminho do campo
- **Pronto quando:** `LojaSchema` (Zod) e `paraLoja(dto)`; `layers/catalogo/index.ts` passa a exportar `lerProdutoResumo(dado)` (schema e mapper da T-0308 atrás de uma função), e o adaptador de Lojas não importa caminho interno do Catálogo; o [context-map](../../docs/domain/context-map.md) registra esse uso.
- **Arquivos:** `layers/lojas/adapters/http/loja.schema.ts`, `loja.mapper.ts`, `loja.mapper.spec.ts`, `layers/catalogo/index.ts`, `docs/domain/context-map.md`
- **Fora do escopo:** buscar produtos no Catálogo (a vitrine vem pronta em `GET /lojas/{slug}`).
- **Depende de:** T-1203, T-1208, T-0308, T-0104

### [ ] T-1210 · `HttpLojaRepository` busca o hub e a loja, e trata o 404

- **Requisito:** REQ-12-23, REQ-12-25
- **Camada:** adaptador
- **Teste primeiro:** `layers/lojas/adapters/http/http-loja-repository.spec.ts` (com `ClienteHttpFalso`)
  - `listar()` chama `GET /lojas` e devolve o `HubDeLojas`
  - `obter('curitiba')` chama `GET /lojas/curitiba` e devolve a `Loja`
  - 404 vira `LojaNaoEncontrada`
  - resposta sem `mapa.embed` vira `ErroDeContrato` com o endpoint `GET /lojas/curitiba` e o caminho `mapa.embed`
  - 500 e falha de rede viram `ErroDeRede`
- **Pronto quando:** implementa a porta da T-1205, sem `try/catch` de fluxo.
- **Arquivos:** `layers/lojas/adapters/http/http-loja-repository.ts`, `http-loja-repository.spec.ts`
- **Fora do escopo:** —
- **Depende de:** T-1205, T-1208, T-1209

### [ ] T-1211 · O mock serve o hub, as 5 lojas e a loja sem banners

- **Requisito:** REQ-12-23, REQ-12-25
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/lojas.get.spec.ts`
  - `GET /api/mock/lojas` devolve 5 lojas, com `novo-hamburgo` primeiro, e valida no `HubDeLojasSchema`
  - cada um dos 5 slugs responde 200 em `/api/mock/lojas/<slug>` e valida no `LojaSchema`
  - `/api/mock/lojas/curitiba` tem 3 banners; `/api/mock/lojas/curitiba-sem-banners` tem `banners: []` e `vitrine: []`
  - `/api/mock/lojas/florianopolis` responde 404 em `application/problem+json`
  - `curitiba-sem-banners` não aparece na lista do hub
  - `?_falha=500` e `?_atraso=300` funcionam nas duas rotas
- **Pronto quando:** as rotas leem `mocks/fixtures/lojas.json`, `_base/lojas.json` e `loja-curitiba-sem-banners.json`.
- **Arquivos:** `server/api/mock/lojas.get.ts`, `server/api/mock/lojas/[slug].get.ts`, `server/api/mock/lojas.get.spec.ts`
- **Fora do escopo:** editar banners ou vitrine pelo mock.
- **Depende de:** T-0008, T-1208, T-1209

### [ ] T-1212 · O contexto Lojas é ligado em um lugar só e não enxerga o e-commerce

- **Requisito:** REQ-12-24
- **Camada:** infra
- **Teste primeiro:** `layers/lojas/ui/composables/use-lojas.spec.ts` (ambiente Nuxt; a regra de import fica em `tests/infra/arquitetura.spec.ts`)
  - `useLojas()` devolve `listarLojas` e `obterLoja` prontos
  - com o provedor trocado no teste, os casos de uso usam o `LojaRepositoryFalso`
  - em SSR, cada requisição recebe a própria instância
  - o lint reprova um arquivo de `layers/lojas/` que importe de `layers/carrinho`, `layers/entrega` ou `layers/conteudo`, mesmo pela API pública
  - o lint aprova `layers/lojas/` importando `layers/catalogo/index.ts`
- **Pronto quando:** `app/plugins/11.lojas.ts` é o único lugar que instancia `HttpLojaRepository`.
- **Arquivos:** `app/plugins/11.lojas.ts`, `layers/lojas/ui/composables/use-lojas.ts`, `use-lojas.spec.ts`, `eslint.config.mjs`, `tests/infra/arquitetura.spec.ts`
- **Fora do escopo:** telas.
- **Depende de:** T-1210

### [ ] T-1213 · Os cartões de loja: `CartaoLojaHub` (com os três caminhos) e `CartaoLoja` (compacto)

- **Requisito:** REQ-12-02, REQ-12-28
- **Camada:** ui
- **Teste primeiro:** `layers/lojas/ui/components/CartoesDeLoja.spec.ts`
  - `CartaoLojaHub`: "Curitiba" e "PR" estão em um `h2`, com link para `rotas.loja('curitiba')`; o link em volta da fachada é decorativo (`tabindex="-1"`, `aria-hidden`, imagem com `alt` vazio)
  - `CartaoLojaHub`: o endereço "Rua Westphalen, 2880" e "Curitiba/PR" está em `address`, e o horário sai em uma linha: "Segunda a Sexta das 08:00 às 18:00 · Sábado das 08:00 às 12:00"
  - `CartaoLojaHub`: mostra 6 serviços, mesmo quando a loja tem 19 (São Paulo)
  - `CartaoLojaHub`: o botão do WhatsApp mostra "(41) 98481-6579" e aponta para `https://wa.me/5541984816579`; "Ver a loja" aponta para a página da loja; "Como chegar", para `https://goo.gl/maps/JVwDw5Xw4fx`, com `rel="noopener"`
  - `CartaoLoja`: a foto tem o `alt` "Fachada da TireShop Curitiba", `width`, `height` e `loading="lazy"`
  - `CartaoLoja`: a cidade e a UF estão em um `h3`; o endereço, em `address`; os dois horários, em duas linhas
  - `CartaoLoja`: o telefone "(41) 3333-1777" é link para `tel:+554133331777`, e o botão "Ver a loja" aponta para `rotas.loja('curitiba')`
  - os dois recebem um `LojaResumo` por `props` e não buscam nada
- **Pronto quando:** `CartaoLojaHub` usa as classes `ts-loja-hub*` e `CartaoLoja`, as classes `ts-loja*` do protótipo, sem CSS novo; os dois estão em `layers/lojas/index.ts` (o `CartaoLoja` é usado pela seção de lojas da Home, módulo 09).
- **Arquivos:** `layers/lojas/ui/components/CartaoLojaHub.vue`, `CartaoLoja.vue`, `CartoesDeLoja.spec.ts`, `layers/lojas/index.ts`
- **Fora do escopo:** o carrossel de lojas da Home (`LojasDaHome`, módulo 09) e o cartão do Sobre nós (T-1107).
- **Depende de:** T-1204, T-0105

### [ ] T-1214 · O hub mostra as 5 lojas, os três jeitos de comprar, o mapa e o texto de apoio

- **Requisito:** REQ-12-01, REQ-12-02, REQ-12-03, REQ-12-04, REQ-12-05, REQ-12-06, REQ-12-07
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/lojas-hub.spec.ts` (projetos `computador` 1440 px e `celular` 390 px), contra o mock
  - CA-12-01: H1 do hub sem elemento de destaque dentro dele e sem traço sob as letras; 5 cartões; nenhum filtro de pneus na página
  - "Três jeitos de comprar" tem 3 passos; o segundo diz que a oficina não é ponto de retirada e tem o link "Regulamento"; o terceiro cita "Novo Hamburgo e Ribeirão Preto"
  - "Onde estamos" lista os 5 endereços com "Abrir no Google Maps"; zero `iframe` ao abrir; depois de tocar na capa, um `iframe` com `title` "Mapa das lojas TireShop no Google Maps"
  - CA-12-02: texto da liveSEO com H2 e "Ler mais", sem acordeão de FAQ e sem `<comment` no HTML; `FAQPage` com 8 perguntas
  - CA-12-03: "Ver a loja" de Curitiba leva a `/lojas/curitiba`
  - com `?_falha=500` em `/lojas`, os cartões dão lugar ao estado de erro com "Tentar de novo" e o status é 200
  - no celular, cada cartão empilha foto e texto, e os botões ocupam a largura; a faixa de avaliações vem antes do rodapé
  - `conferirInvariantes(page)` passa nos dois tamanhos
- **Pronto quando:** `app/pages/lojas/index.vue` usa `listarLojas` em `useAsyncData`, aplica `metadadosDoHub`, importa `institucional.css` e tem `routeRules` com revalidação de 1 hora; o mapa usa a `CapaDeMapa` do kernel; a faixa de avaliações é o componente do módulo 07.
- **Arquivos:** `app/pages/lojas/index.vue`, `layers/lojas/ui/components/{HubTresJeitos,HubOndeEstamos}.vue`, `nuxt.config.ts` (routeRules), `tests/e2e/lojas-hub.spec.ts`
- **Fora do escopo:** busca de loja por CEP.
- **Depende de:** T-1207, T-1211, T-1212, T-1213, T-0109, T-0113, T-0115, T-0116, T-0117, T-0205, T-0010, módulo 07 (FaixaAvaliacoes)

### [ ] T-1215 · O mega menu e o Sobre nós mostram as cinco lojas com os dados de `GET /lojas`

- **Requisito:** REQ-12-26, REQ-12-27
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/lojas-no-site.spec.ts` (projetos `computador` e `celular`)
  - CA-12-15: no Sobre nós, 5 cartões, em 3 colunas no computador e 1 no celular
  - os botões "Conheça a loja" apontam para as páginas de `novo-hamburgo`, `joinville`, `curitiba`, `sao-paulo` e `ribeirao-preto`
  - o cartão de Novo Hamburgo mostra "(51) 3593-8888", 6 serviços e "Ver todos os 11 serviços"; nenhuma foto de loja está quebrada
  - CA-12-16: na Home, o mega menu "Lojas Físicas" mostra as 5 lojas com foto, cidade, UF e endereço, cada uma levando à própria página, e "Ver todas as lojas"
  - com `?_falha=500` em `/lojas`, "Lojas Físicas" vira um link simples para `/lojas`, e a seção do Sobre nós mostra só o texto de apoio e "Ver todas as lojas" (CA-11-09); nos dois casos a página responde 200
  - as lojas são pedidas uma vez por página, mesmo com o mega menu e a seção na mesma tela
  - a página de loja (`/lojas/curitiba`) não faz esse pedido
  - `conferirInvariantes(page)` passa nos dois tamanhos
- **Pronto quando:** `useLojasDoSite()` chama `listarLojas` em `useAsyncData` com a chave fixa `lojas`; `app/layouts/default.vue` converte cada `LojaResumo` para o tipo `LojaDoMenu` e passa a lista ao `SiteCabecalho`; `app/pages/sobre-nos.vue` converte para as `props` do `SobreCartaoLoja`; o contexto Conteúdo continua sem importar o contexto Lojas (a conversão fica em `app/`).
- **Arquivos:** `app/layouts/default.vue`, `app/pages/sobre-nos.vue`, `layers/lojas/ui/composables/use-lojas-do-site.ts`, `tests/e2e/lojas-no-site.spec.ts`
- **Fora do escopo:** mudar o `MegaMenuLojas` (módulo 02) e o `SobreCartaoLoja` (T-1107); a seção de lojas da Home (módulo 09, que usa o mesmo `listarLojas`).
- **Depende de:** T-1107, T-1108, T-1211, T-1212, T-0205, T-0010

### [ ] T-1216 · `LojaCabecalho` mostra só o que é da loja, e um link para o site

- **Requisito:** REQ-12-09
- **Camada:** ui
- **Teste primeiro:** `layers/lojas/ui/components/LojaCabecalho.spec.ts`
  - mostra o logo com o texto alternativo "TireShop Autocenter" e "Autocenter Curitiba"
  - o telefone "(41) 3333-1777" é link para `tel:+554133331777`; o WhatsApp mostra "WhatsApp (41) 98481-6579"
  - a lista de contatos tem `aria-label="Contatos da loja de Curitiba"`
  - com a loja de Novo Hamburgo, há "Agendar serviço" apontando para a URL de agendamento; com a de Curitiba, não há
  - "Solicite orçamento" aponta para `https://www.tireshop.com.br/Lojas/Curitiba/Orcamento`
  - o logo é um link para `rotas.home()`, com `aria-label` "TireShop, ir para a loja online", e é o único link interno do cabeçalho; não existe botão "Loja online"
  - Instagram com o nome acessível "Instagram da TireShop Curitiba"; rede nula não aparece
- **Pronto quando:** recebe a `Loja` por `props`; usa as classes `ts-lojahead*`; nenhum botão usa o verde de ação.
- **Arquivos:** `layers/lojas/ui/components/LojaCabecalho.vue`, `LojaCabecalho.spec.ts`
- **Fora do escopo:** busca, menu e carrinho (não existem na loja).
- **Depende de:** T-1203, T-0105

### [ ] T-1217 · `LojaRodape` e o botão flutuante usam os contatos da loja

- **Requisito:** REQ-12-20
- **Camada:** ui
- **Teste primeiro:** `layers/lojas/ui/components/LojaRodape.spec.ts`
  - mostra "TireShop Autocenter Curitiba", o endereço em `address` e os dois horários
  - com a loja de Ribeirão Preto, mostra "CNPJ 10.728.680/0001-18"; com `cnpj` nulo, a linha não existe
  - em Novo Hamburgo o número aparece uma vez; em Curitiba aparecem o telefone e os dois WhatsApps
  - o único link interno é "Política de Privacidade", para `rotas.politica('privacidade')`
  - `LojaBotaoWhatsapp` aponta para `https://wa.me/5541984816579`, com o `aria-label` "Falar no WhatsApp da loja: (41) 98481-6579"
  - nenhum dos dois mostra "(41) 3317-2251"
- **Pronto quando:** os dois componentes recebem a `Loja` por `props`; usam as classes `ts-rodapeloja*` e `ts-fab`.
- **Arquivos:** `layers/lojas/ui/components/LojaRodape.vue`, `LojaBotaoWhatsapp.vue`, `LojaRodape.spec.ts`
- **Fora do escopo:** newsletter e texto fiscal do site (não entram na loja).
- **Depende de:** T-1203, T-0105

### [ ] T-1218 · `LojaBanners` mostra as promoções da loja em carrossel

- **Requisito:** REQ-12-11
- **Camada:** ui
- **Teste primeiro:** `layers/lojas/ui/components/LojaBanners.spec.ts`
  - com os 3 banners de Curitiba, renderiza 3 slides, cada um um grupo "1 de 3", "2 de 3", "3 de 3"
  - a região tem `aria-roledescription="carrossel"` e `aria-label="Promoções da loja"`
  - o primeiro banner tem `width="1600"`, `height="250"`, o `alt` "Seja bem-vindo à TireShop Curitiba. Fone (41) 3333-1777. Rua Westphalen, 2880" e `fetchpriority="high"`; os outros, `loading="lazy"`
  - o primeiro banner leva ao mapa (`https://goo.gl/maps/JVwDw5Xw4fx`); o segundo, ao WhatsApp da loja
  - com `imagemCelular`, o slide usa `picture` com a arte de 800×400 abaixo de 900 px; com nulo, usa a arte de computador
  - com um banner só, não há setas nem pontos
  - com temporizadores falsos, 10 segundos se passam e o slide não muda
  - sem banners, o componente não renderiza nada
- **Pronto quando:** usa o `Carrossel` do kernel com as classes `ts-banner ts-banner--faixa`; setas "Promoção anterior" e "Próxima promoção"; pontos "Ver promoção N".
- **Arquivos:** `layers/lojas/ui/components/LojaBanners.vue`, `LojaBanners.spec.ts`
- **Fora do escopo:** banners da Home (módulo 09).
- **Depende de:** T-1203, T-0111

### [ ] T-1219 · A abertura escolhe entre introdução clara e hero preto, com o mesmo conteúdo

- **Requisito:** REQ-12-10, REQ-12-12
- **Camada:** ui
- **Teste primeiro:** `layers/lojas/ui/components/LojaAbertura.spec.ts`
  - com banners, renderiza `LojaBanners` e, logo depois, `LojaIntroducao`; `LojaHero` não existe
  - sem banners, renderiza só `LojaHero`
  - nos dois casos há um único `h1`, com "TireShop Autocenter" como prefixo e "Loja de pneus em Curitiba"
  - a frase de apresentação é a recebida ("O autocenter TireShop de Curitiba está pronta para atendê-lo!…"), sem correção
  - o botão "WhatsApp (41) 98481-6579" aponta para o WhatsApp da loja
  - "Agendar serviços" só aparece com URL de agendamento (Novo Hamburgo)
  - a fachada tem `alt` "Fachada da TireShop Curitiba", `width`, `height` e a legenda "Rua Westphalen, 2880"
  - nenhum dos dois tem endereço em lista, link de orçamento ou link de mapa
- **Pronto quando:** `LojaAbertura` decide por `loja.abertura()` (sem `if` nos outros componentes); `LojaIntroducao` usa as classes `ts-loja-intro*` e `LojaHero`, `ts-loja-hero*`; a cidade amarela só existe no hero.
- **Arquivos:** `layers/lojas/ui/components/LojaAbertura.vue`, `LojaIntroducao.vue`, `LojaHero.vue`, `LojaAbertura.spec.ts`
- **Fora do escopo:** alturas máximas e cor de fundo (conferidas no e2e da T-1226).
- **Depende de:** T-1218

### [ ] T-1220 · `LojaCardsDeContato` mostra endereço, horário, telefone e orçamento

- **Requisito:** REQ-12-13, REQ-12-21
- **Camada:** ui
- **Teste primeiro:** `layers/lojas/ui/components/LojaCardsDeContato.spec.ts`
  - renderiza 4 cards, com os rótulos "Endereço", "Horário", "Telefone e WhatsApp" e "Orçamento"
  - o card de endereço tem o botão "Como chegar", para o link do mapa
  - o card de horário mostra as duas linhas, uma por linha
  - em Novo Hamburgo o card de telefone mostra só "(51) 3593-8888"
  - em Curitiba mostra "(41) 3333-1777", "WhatsApp (41) 98481-6579" e "WhatsApp (41) 99155-8619"
  - o card de orçamento diz "Peça um orçamento sem compromisso." e tem o botão "Solicite um orçamento"
  - o texto dos cards não contém "cobrimos qualquer oferta" nem "loja online"
  - a seção tem `aria-label="Endereço, horário, telefone e orçamento"`
- **Pronto quando:** usa `whatsappsAlemDoTelefone()` do domínio (a regra não está no componente); classes `ts-loja-info*`.
- **Arquivos:** `layers/lojas/ui/components/LojaCardsDeContato.vue`, `LojaCardsDeContato.spec.ts`
- **Fora do escopo:** colunas por tamanho de tela (e2e da T-1226 e da T-1228).
- **Depende de:** T-1201, T-1203

### [ ] T-1221 · A vitrine da loja usa a variante de loja do `CardProduto`

- **Requisito:** REQ-12-14
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/CardProduto.loja.spec.ts`
  - com `variante="loja"`, mostra "R$ 529,00", "em até 10x de R$ 52,90 sem juros" e "R$ 497,26 à vista", como vieram da API
  - o rótulo do à vista é "6% de desconto em compras na loja"
  - o botão é "Pedir no WhatsApp", com o link recebido (`https://wa.me/5541984816579`) e o `aria-label` "Pedir Pneu Hankook Ventus Prime 2 K115 225/45 R17 91V (Pneu Original Hyundai i30 e VW Golf) pelo WhatsApp da loja"
  - não há botão Comprar, selo de frete nem evento `comprar`
  - o nome continua em `h2`
  - sem a prop `variante`, o card do e-commerce não muda (os testes da T-0313 continuam passando)
  - `LojaVitrine` mostra o título "Ofertas da loja" e a frase "Produtos em destaque na loja de Curitiba. Fale com a equipe para confirmar preço e estoque."
  - `LojaVitrine` com a lista vazia não renderiza nada
- **Pronto quando:** `CardProduto` ganha `variante` e `linkWhatsapp`; `LojaVitrine` (contexto Lojas) recebe os cards por slot, e quem coloca o `CardProduto` é a página; grade `ts-grade-produtos--loja`.
- **Arquivos:** `layers/catalogo/ui/components/CardProduto.vue`, `CardProduto.loja.spec.ts`, `layers/lojas/ui/components/LojaVitrine.vue`, `LojaVitrine.spec.ts`
- **Fora do escopo:** link do card para a página do produto no e-commerce (na loja o nome não é link; ver Pendências); carrinho.
- **Depende de:** T-0313, T-1203

### [ ] T-1222 · Serviços com foto e condições da loja

- **Requisito:** REQ-12-15, REQ-12-18
- **Camada:** ui
- **Teste primeiro:** `layers/lojas/ui/components/LojaServicos.spec.ts`
  - mostra o título "Serviços da loja de Curitiba" em `h2` e 11 serviços
  - cada serviço tem o nome em `h3` ("Check-up", "Montagem de pneus") e o texto
  - a foto é decorativa (`alt=""`), com `width`, `height` e `loading="lazy"`; serviço sem foto ou sem texto não quebra
  - `LojaCondicoes` mostra 3 cartões: "10x sem juros no cartão", "6% de desconto à vista" e "Instalação na hora", cada um com o texto
  - a chave de ícone (`cartao`, `desconto`, `instalacao`) vira um ícone do sprite; chave desconhecida usa o ícone padrão
  - o texto das condições não contém "cobrimos qualquer oferta"
  - com a lista vazia, cada componente não renderiza nada
- **Pronto quando:** classes `ts-servicos`, `ts-servico*` e `ts-vantagens ts-vantagens--3`; a seção de condições tem `aria-label="Condições da loja"`.
- **Arquivos:** `layers/lojas/ui/components/LojaServicos.vue`, `LojaCondicoes.vue`, `LojaServicos.spec.ts`
- **Fora do escopo:** agendar um serviço específico.
- **Depende de:** T-1203

### [ ] T-1223 · `LojaMarcas` mostra os logos em guias, com Pneus aberto

- **Requisito:** REQ-12-16
- **Camada:** ui
- **Teste primeiro:** `layers/lojas/ui/components/LojaMarcas.spec.ts`
  - com Curitiba, há 6 guias, na ordem Pneus, Freios, Suspensão, Filtros, Óleo de motor e Outras marcas
  - cada guia mostra a contagem: "Pneus 5", "Freios 14", "Suspensão 7"
  - "Pneus" começa com `aria-selected="true"`, e só o painel dela está visível
  - seta para a direita seleciona "Freios" e move o foco; End vai para "Outras marcas"; Home volta para "Pneus"
  - cada item do painel é uma `img` com `alt` igual ao nome da marca ("Yokohama"), `width` e `height`; não há ladrilho de texto
  - com Joinville, há 3 guias
  - sem grupo nenhum, a seção não é renderizada
- **Pronto quando:** usa `Guias` do kernel e `loja.gruposDeMarcas()`; o `tablist` tem `aria-label="Tipos de marca"`; título "Marcas que a loja trabalha" em `h2`.
- **Arquivos:** `layers/lojas/ui/components/LojaMarcas.vue`, `LojaMarcas.spec.ts`
- **Fora do escopo:** página de marca.
- **Depende de:** T-1202, T-1203, T-0110

### [ ] T-1224 · `LojaMapa` mostra como chegar, com o mapa só depois do toque

- **Requisito:** REQ-12-17
- **Camada:** ui
- **Teste primeiro:** `layers/lojas/ui/components/LojaMapa.spec.ts`
  - mostra o título "Como chegar" em `h2` e o endereço em `address`
  - com Ribeirão Preto, mostra "CNPJ 10.728.680/0001-18"; com `cnpj` nulo, não mostra a linha
  - "Abrir no Google Maps" aponta para o link do mapa, com `rel="noopener"`
  - "Instagram da loja" só aparece quando há Instagram
  - antes do toque não há `iframe`; depois, há um com o `src` do `embed` e o `title` "Mapa da TireShop Curitiba no Google Maps"
- **Pronto quando:** usa a `CapaDeMapa` do kernel; classes `ts-loja-mapa*`.
- **Arquivos:** `layers/lojas/ui/components/LojaMapa.vue`, `LojaMapa.spec.ts`
- **Fora do escopo:** rota a partir da localização do cliente.
- **Depende de:** T-1203, T-0117

### [ ] T-1225 · O fechamento mostra o texto da liveSEO ou o FAQ da loja

- **Requisito:** REQ-12-19
- **Camada:** ui
- **Teste primeiro:** `layers/lojas/ui/components/LojaFechamento.spec.ts`
  - com Curitiba, mostra o texto de apoio com o título "TireShop Auto Center: a sua loja de pneus em Curitiba" em `h2` e "Ler mais", e nenhum acordeão
  - com Novo Hamburgo, mostra "Perguntas sobre a loja" em `h2`, 4 perguntas em acordeão e a frase "Não achou a resposta? Fale com a equipe de Novo Hamburgo pelo WhatsApp."
  - no FAQ, o botão do WhatsApp mostra "(51) 3593-8888" e aponta para o WhatsApp da loja
  - sem texto e sem perguntas, não renderiza nada
  - nunca mostra os dois
- **Pronto quando:** decide por `loja.fechamento()`; usa `TextoDeApoio` e `Acordeao` do kernel.
- **Arquivos:** `layers/lojas/ui/components/LojaFechamento.vue`, `LojaFechamento.spec.ts`
- **Fora do escopo:** o `FAQPage` (T-1206, aplicado pela página).
- **Depende de:** T-1203, T-0109, T-0115

### [ ] T-1226 · A página de loja monta os blocos no layout `loja`

- **Requisito:** REQ-12-08, REQ-12-10, REQ-12-12, REQ-12-13, REQ-12-14, REQ-12-22, REQ-12-23
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/loja.spec.ts` (computador), contra o mock
  - CA-12-04: em `/lojas/curitiba`, o banner começa a até 160 px do topo, a introdução vem logo depois, com fundo `rgb(255, 255, 255)` e até 420 px de altura, e não há hero
  - CA-12-05: em `/lojas/curitiba-sem-banners`, só o hero preto, de até 640 px, sem carrossel, sem introdução e sem "Ofertas da loja"
  - os 4 cards de contato vêm depois da abertura, em 4 colunas, sem botão passando da borda
  - CA-12-06 (agendamento), CA-12-07 (telefone sem repetição) e CA-12-08 (vitrine em 4 colunas)
  - CA-12-09 (guias), CA-12-11 (texto ou FAQ) e CA-12-12 (mapa só ao tocar)
  - a ordem dos blocos é: abertura, cards, vitrine, serviços, marcas, mapa, condições, fechamento
  - o HTML do servidor tem um H1, a canônica, `AutomotiveBusiness` e `FAQPage`
  - CA-12-14: `/lojas/florianopolis` responde 404; com `?_falha=500`, a página mostra o estado de erro com "Tentar de novo"
- **Pronto quando:** existe `app/layouts/loja.vue` (cabeçalho, conteúdo, rodapé e botão flutuante da loja); `app/pages/lojas/[slug].vue` usa o layout `loja`; `useLojaDaRota()` chama `obterLoja` em `useAsyncData` com a chave `loja:<slug>`, e layout e página leem o mesmo dado (um pedido só); a página aplica `metadadosDaLoja`, coloca o `CardProduto` de variante `loja` na vitrine e tem `routeRules` com revalidação de 10 minutos.
- **Arquivos:** `app/layouts/loja.vue`, `app/pages/lojas/[slug].vue`, `layers/lojas/ui/composables/use-loja-da-rota.ts`, `nuxt.config.ts` (routeRules), `tests/e2e/loja.spec.ts`
- **Fora do escopo:** celular e as outras lojas (T-1228); prova de independência (T-1227).
- **Depende de:** T-1206, T-1211, T-1212, T-1216, T-1217, T-1219, T-1220, T-1221, T-1222, T-1223, T-1224, T-1225, T-0113

### [ ] T-1227 · A página de loja é independente do e-commerce

- **Requisito:** REQ-12-08, REQ-12-09, REQ-12-21, REQ-12-24
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/loja-independencia.spec.ts` (projetos `computador` e `celular`, nas 5 lojas e na loja sem banners)
  - CA-12-10: não existem `.ts-header`, `.ts-nav`, `.ts-topbar`, busca por medida, `.ts-minicart`, `.ts-rodape`, faixa de avaliações, migalhas nem filtro de pneus
  - o HTML não contém "3317-2251" nem "554133172251"
  - há exatamente um link para `rotas.home()`, que é o logo do cabeçalho
  - fora do texto de apoio da liveSEO e do link "Política de Privacidade", nenhum link aponta para rota do e-commerce (`/c/`, `/p/`, `/comparar`)
  - o texto visível e os textos alternativos não contêm "cobrimos qualquer oferta", "cobre qualquer oferta", "compre na loja online" nem "compre online e instale"
  - não existe "outras lojas" nem chamada de compra online
  - o botão flutuante aponta para `wa.me` com o número da loja, e o cabeçalho mostra o DDD da loja
  - nenhum pedido de rede vai para `/navegacao`, `/carrinho` ou `/avaliacoes`
- **Pronto quando:** o teste passa nas 6 páginas, nos dois tamanhos.
- **Arquivos:** `tests/e2e/loja-independencia.spec.ts`
- **Fora do escopo:** o conteúdo do texto da liveSEO (ver Pendências).
- **Depende de:** T-1226, T-1212

### [ ] T-1228 · As 5 lojas passam no computador e no celular

- **Requisito:** REQ-12-10, REQ-12-11, REQ-12-13, REQ-12-14, REQ-12-15, REQ-12-16, REQ-12-23
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/lojas-todas.spec.ts` (projetos `computador` 1440 px e `celular` 390 px)
  - cada uma das 5 lojas abre com status 200, um H1 com a cidade e a palavra "pneus", e o H1 a até 460 px do topo
  - cada loja tem 2 ou mais banners, 10 ou mais serviços e ao menos um logo de marca carregado
  - "Agendar" existe só em Novo Hamburgo e em Ribeirão Preto; o texto da liveSEO, só em Curitiba e em São Paulo; o FAQ, só nas outras três
  - CA-12-13: em 390 px, cards de contato em 1 coluna, vitrine em 2, sem botão passando da borda e sem rolagem horizontal
  - no celular, o carrossel troca de banner com o gesto de arrastar e pelos pontos (de 24 px ou mais), e não anda sozinho em 6 segundos
  - a vitrine não tem botão Comprar em nenhuma loja
  - as guias de marcas funcionam com o teclado em todas as lojas
  - `conferirInvariantes(page)` passa nas 5 lojas e na loja sem banners, nos dois tamanhos
- **Pronto quando:** o teste percorre os slugs devolvidos por `GET /lojas`, mais `curitiba-sem-banners`.
- **Arquivos:** `tests/e2e/lojas-todas.spec.ts`
- **Fora do escopo:** regressão visual (módulo 13).
- **Depende de:** T-1226, T-1227, T-0010

---

## Pendências

- **Ordem dos módulos: a Home precisa do contexto Lojas antes do M9.** A seção de lojas da Home (T-0911, módulo 09) usa `listarLojas`, o mock de `GET /lojas` e o `CartaoLoja`, que nascem aqui (T-1204, T-1205, T-1208, T-1210 a T-1213). O mesmo vale para o Sobre nós (módulo 11). Sugestão para o roadmap: executar T-1201 a T-1213 logo antes do módulo 09 (elas não dependem de nada depois do módulo 03), ou aceitar que a Home e o Sobre nós fecham sem as lojas e as recebem no M9. Decisão do líder técnico.
- **Origem da vitrine (D6 do PRD).** Os 4 produtos e os preços de loja são exemplo (`ilustrativo.vitrine: true`). Falta o cliente dizer de onde vêm.
- **Preço de loja vem pronto.** No protótipo o preço da loja era calculado no template (10x e 6% à vista sobre o preço do site). Aqui o frontend não calcula: mostra `parcelas`, `valorParcela` e `aVista` de `vitrine[]`. O rótulo "N% de desconto em compras na loja" usa `descontoPercentual`.
- **Nome do produto na vitrine sem link.** Um link para a página do produto levaria ao e-commerce e quebraria a regra do link único. Decidir com o cliente se a vitrine pode ter página de detalhe.
- **`lerProdutoResumo` na API pública do Catálogo.** O mapa de contextos diz que Lojas usa "só o tipo" `ProdutoResumo`; para ler a vitrine também é preciso o leitor (schema e mapper) e, na página, o `CardProduto`. A T-1209 registra isso no `context-map.md`. Se o líder técnico preferir, o Catálogo expõe um adaptador próprio para a vitrine.
- **Links do texto da liveSEO.** Os textos de Curitiba, de São Paulo e do hub têm links para categorias do e-commerce e falam em comprar "no site". Foram mantidos por serem texto validado; o cliente decide se ficam. A T-1227 deixa esse bloco fora da regra do link único.
- **Política de Privacidade no rodapé da loja.** É um link para uma página com o layout do e-commerce. Mantido como no protótipo; avaliar uma versão da política no layout `loja`.
- **Horário estruturado.** `horario` é texto livre ("Segunda a Sexta das 08:00 às 18:00"). Para `openingHoursSpecification` no JSON-LD, o contrato precisa de dias e horas em campos; propor ao backend.
- **Mapa do hub.** `HubDeLojas` não tem campo de mapa: a URL de incorporação ("TireShop Autocenter" no Google Maps) fica fixa no frontend. Propor o campo `mapa` no contrato.
- **"Três jeitos de comprar".** Texto fixo no frontend, inclusive "frete grátis para o Sul e o Sudeste acima de R$ 1.000" e o link do regulamento. Deveria vir da API (premissa P5 do PRD); propor um campo no hub.
- **Artes de banner para celular (800×400).** Hoje `imagemCelular` é nulo em todas; a faixa de 1600×250 fica com 112 px de altura e pouco legível em 390 px. Pedido ao cliente em 12/11.
- **Textos da liveSEO para Joinville, Novo Hamburgo e Ribeirão Preto.** Enquanto não chegam, essas lojas mostram o FAQ.
- **Rota de demonstração `curitiba-sem-banners`.** Existe só no mock, para mostrar o hero preto. Com o backend real, o estado aparece quando uma loja ficar sem banners.
- **Fotos de fachada.** As atuais têm 525 px, e Ribeirão Preto repete a de São Paulo. Aguardando as fotos em alta.
- **`BannerLoja.alt`.** O documento de domínio lista `alt` como campo do banner; no contrato ele está dentro de `imagem.alt`. Vale o contrato.
- **Página de não encontrado da loja.** Sem loja, não há contatos de loja para montar o layout `loja`; o 404 usa a página de não encontrado do site. Confirmar com o cliente.
