# Tasks 11 — Institucional: Sobre nós

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. Uma task por vez. A ligação dos cartões das lojas com `GET /lojas` é a
T-1215, no módulo 12 (ver a seção 4 da spec).

---

### [ ] T-1101 · `Institucional` organiza a página em abertura, linhas de duas colunas e estoque

- **Requisito:** REQ-11-01, REQ-11-03, REQ-11-07
- **Camada:** domínio
- **Teste primeiro:** `layers/conteudo/domain/institucional.spec.ts`
  - `BlocoDeTexto` ganha o tipo `video`, com `id`, `provedor`, `titulo`, `canal` (ou nada) e `capa`
  - `abertura()` devolve o título "Olá, somos a TireShop!", os parágrafos da primeira seção e o vídeo `NUM0AGJL3dU`
  - `linhas()` devolve duas linhas: ("Missão da TireShop", "Nossa visão") e (vídeo `gn6iypnkRhA`, "Conheça nossas lojas físicas")
  - a regra das linhas: cada seção com título vira uma coluna de texto e, se tiver vídeo, mais uma coluna de vídeo logo depois; as colunas são agrupadas duas a duas
  - com número ímpar de colunas, a última linha tem uma coluna só
  - `estoqueEmColunas()` corta os blocos no primeiro `titulo`: dois parágrafos de um lado; "Produto indisponível ou Sob Consulta" e os dois parágrafos seguintes do outro
  - estoque sem bloco `titulo` devolve uma coluna só
  - `videos()` devolve os dois vídeos, na ordem da página
- **Pronto quando:** tipo imutável, com a fábrica `umInstitucional()`; nenhuma seção é procurada por posição fixa ou pelo texto do título.
- **Arquivos:** `layers/conteudo/domain/institucional.ts`, `institucional.spec.ts`, `bloco-de-texto.ts`, `__fabricas__/institucional.ts`, `layers/conteudo/index.ts`
- **Fora do escopo:** dados das lojas (contexto Lojas).
- **Depende de:** T-1001, T-0107

### [ ] T-1102 · Caso de uso `obterInstitucional`

- **Requisito:** REQ-11-12
- **Camada:** aplicação
- **Teste primeiro:** `layers/conteudo/application/obter-institucional.spec.ts` (com `ConteudoRepositoryFalso`)
  - devolve o `Institucional` da porta
  - erro de rede da porta sai como `Result` de falha, sem lançar
  - erro de contrato da porta sai como `ErroDeContrato`, com o caminho do campo
- **Pronto quando:** `ConteudoRepository` tem `institucional()`; o falso em memória prepara sucesso e falha.
- **Arquivos:** `layers/conteudo/domain/portas.ts`, `application/obter-institucional.ts`, `obter-institucional.spec.ts`, `application/__falsos__/conteudo-repository-falso.ts`
- **Fora do escopo:** buscar as lojas (a página chama o contexto Lojas).
- **Depende de:** T-1101, T-1003

### [ ] T-1103 · Metadados do Sobre nós

- **Requisito:** REQ-11-11
- **Camada:** aplicação
- **Teste primeiro:** `layers/conteudo/application/metadados-do-institucional.spec.ts`
  - o título é "Sobre nós | TireShop" e a descrição começa por "A TireShop.com.br é uma das pioneiras no e-commerce de pneus no Brasil" (vêm de `seo`)
  - a canônica é a URL absoluta de `rotas.sobreNos()`
  - as migalhas são Home e "Sobre nós"
  - gera `BreadcrumbList` com as duas migalhas e nenhum outro JSON-LD
- **Pronto quando:** `metadadosDoInstitucional(institucional, origem)` é função pura.
- **Arquivos:** `layers/conteudo/application/metadados-do-institucional.ts`, `metadados-do-institucional.spec.ts`
- **Fora do escopo:** `VideoObject` (ver Pendências).
- **Depende de:** T-1101, T-0105, T-0106

### [ ] T-1104 · O adaptador entende `GET /institucional`, com o bloco de vídeo

- **Requisito:** REQ-11-13
- **Camada:** adaptador
- **Teste primeiro:** `layers/conteudo/adapters/http/institucional.mapper.spec.ts` (com `ClienteHttpFalso`)
  - `institucional.json` valida e vira um `Institucional` com 4 seções, 4 fatos e 3 fotos de estoque
  - o bloco `video` vira o tipo do domínio, com a capa `/img/institucional/video-NUM0AGJL3dU.webp` de 960×540
  - `secoes[0].titulo: null` e `video.canal: null` são aceitos
  - `provedor` diferente de `youtube` é recusado pelo schema
  - os links do texto ("pneus agrícolas") passam pelo `HtmlSeguro`; um `<iframe>` no texto é recusado
  - `institucional()` chama `GET /institucional`; 500 vira `ErroDeRede`; resposta sem `fatos` vira `ErroDeContrato` com o caminho `fatos`
  - as políticas continuam validando depois de o `BlocoDeTextoSchema` ganhar o tipo `video`
- **Pronto quando:** `InstitucionalSchema` (Zod), `paraInstitucional(dto)` e o método `institucional()` do `HttpConteudoRepository`.
- **Arquivos:** `layers/conteudo/adapters/http/institucional.schema.ts`, `institucional.mapper.ts`, `institucional.mapper.spec.ts`, `bloco-de-texto.schema.ts`, `http-conteudo-repository.ts`
- **Fora do escopo:** `GET /lojas`.
- **Depende de:** T-1102, T-1005, T-1006, T-0103, T-0104

### [ ] T-1105 · O mock serve `GET /institucional`

- **Requisito:** REQ-11-13
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/institucional.get.spec.ts`
  - `GET /api/mock/institucional` devolve o título "Olá, somos a TireShop!"
  - a resposta valida no `InstitucionalSchema`
  - `?_falha=500` devolve `application/problem+json` com `status: 500`
- **Pronto quando:** a rota usa `responderFixture(evento, 'institucional')`.
- **Arquivos:** `server/api/mock/institucional.get.ts`, `institucional.get.spec.ts`
- **Fora do escopo:** —
- **Depende de:** T-0008, T-1104

### [ ] T-1106 · O bloco de vídeo vira capa com legenda e só carrega o player ao tocar

- **Requisito:** REQ-11-04
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/VideoInstitucional.spec.ts`
  - antes do toque, mostra a capa do vídeo `NUM0AGJL3dU` e nenhum `iframe`
  - a capa é um link para `https://www.youtube.com/watch?v=NUM0AGJL3dU`, com nome acessível que contém "TireShop - A evolução nos conecta com você!"
  - a legenda mostra "TireShop - A evolução nos conecta com você! · Canal da TireShop"; sem canal, só o título
  - ao tocar, aparece o `iframe` de `https://www.youtube-nocookie.com/embed/NUM0AGJL3dU`, com `title` igual ao título, e o foco vai para ele
  - a imagem da capa tem `width="960"`, `height="540"` e `alt=""`
  - `BlocosDeTexto` renderiza o bloco `video` com este componente
- **Pronto quando:** o componente é um `figure` em volta da `CapaDeVideo` do kernel, com as classes `ts-video*`; nenhum pedido ao YouTube antes do toque.
- **Arquivos:** `layers/conteudo/ui/components/VideoInstitucional.vue`, `VideoInstitucional.spec.ts`, `BlocosDeTexto.vue`, `BlocosDeTexto.spec.ts`
- **Fora do escopo:** outros provedores de vídeo.
- **Depende de:** T-1101, T-1009, T-0117

### [ ] T-1107 · `SobreCartaoLoja` mostra a loja e leva à página dela

- **Requisito:** REQ-11-05
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/SobreCartaoLoja.spec.ts`
  - mostra a foto com o texto alternativo "Fachada da TireShop Novo Hamburgo", `width`, `height` e `loading="lazy"`
  - o nome "TireShop Autocenter Novo Hamburgo" está em um `h3`
  - o telefone "(51) 3593-8888" é um link para `tel:+555135938888`
  - o endereço "Rua Coronel Frederico Linck, 88" e "Novo Hamburgo/RS" está em `address`; os dois horários aparecem em linhas separadas
  - com 11 serviços, mostra os 6 primeiros e um `details` "Ver todos os 11 serviços" com os outros 5
  - com 6 serviços ou menos, não há "Ver todos"
  - o botão "Conheça a loja" aponta para `rotas.loja('novo-hamburgo')`
  - o telefone "(11) 2619.0748" (São Paulo, com ponto) gera `tel:+551126190748`
- **Pronto quando:** recebe um objeto simples por `props` (`slug`, `nome`, `telefone`, `endereco`, `horario`, `servicos`, `foto`), declarado no próprio componente; não importa nada do contexto Lojas; usa as classes `ts-sobre-loja*` e `ts-sobre-servicos`.
- **Arquivos:** `layers/conteudo/ui/components/SobreCartaoLoja.vue`, `SobreCartaoLoja.spec.ts`
- **Fora do escopo:** buscar as lojas; converter `LojaResumo` (T-1215).
- **Depende de:** T-0105, T-0107

### [ ] T-1108 · A página Sobre nós monta hero, fatos, linhas, lojas e estoque

- **Requisito:** REQ-11-01, REQ-11-02, REQ-11-03, REQ-11-06, REQ-11-07, REQ-11-09, REQ-11-11, REQ-11-12
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/sobre-nos.spec.ts` (computador), contra o mock
  - CA-11-01: H1, hero de fundo preto com o texto à esquerda e o vídeo à direita (topos a menos de 140 px um do outro) e os quatro fatos
  - CA-11-02: duas linhas duplas, cada uma com duas colunas lado a lado
  - CA-11-03: zero `iframe` ao abrir; depois do toque, o player com título
  - CA-11-06: Estoque em duas colunas e 3 fotos carregadas
  - CA-11-09: sem lojas, a seção mostra o texto de apoio ("Contamos ainda com cinco lojas físicas…") e "Ver todas as lojas", apontando para `/lojas`
  - com `?_falha=500` em `/institucional`, o conteúdo dá lugar ao estado de erro com "Tentar de novo"
  - migalhas "Home › Sobre nós"; lugar do filtro compacto no topo; faixa de avaliações antes do rodapé
  - o HTML do servidor tem um H1, a canônica e o `BreadcrumbList`
- **Pronto quando:** `app/pages/sobre-nos.vue` usa `obterInstitucional` em `useAsyncData`, aplica `metadadosDoInstitucional`, importa `institucional.css`, tem `routeRules` com revalidação de 1 dia e recebe as lojas por uma lista que nasce vazia (preenchida na T-1215); `useConteudo()` expõe `obterInstitucional`; a seção das lojas tem 3 colunas e `aria-label="Lojas físicas"`.
- **Arquivos:** `app/pages/sobre-nos.vue`, `layers/conteudo/ui/components/{SobreHero,SobreFatos,SobreLinha,SobreLojas,SobreEstoque}.vue`, `layers/conteudo/ui/composables/use-conteudo.ts`, `app/plugins/12.conteudo.ts`, `nuxt.config.ts` (routeRules), `tests/e2e/sobre-nos.spec.ts`
- **Fora do escopo:** ligar `GET /lojas` (T-1215); celular e sem JavaScript (T-1109).
- **Depende de:** T-1103, T-1105, T-1106, T-1107, T-1008, T-0113, T-0116, T-0205, módulo 05 (FiltroPneusCompacto), módulo 07 (FaixaAvaliacoes)

### [ ] T-1109 · O Sobre nós passa no computador e no celular, com e sem JavaScript

- **Requisito:** REQ-11-04, REQ-11-08, REQ-11-10, REQ-11-11
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/sobre-nos-celular.spec.ts` (projetos `computador` 1440 px e `celular` 390 px)
  - CA-11-07: em 390 px, vídeo abaixo do texto no hero, missão antes de visão, fotos do estoque em uma coluna, fatos em duas, sem rolagem horizontal
  - CA-11-04: sem JavaScript, as duas capas são links para o YouTube e não há `iframe`
  - CA-11-08: o item "Sobre Nós" do menu e o link "Sobre nós" do rodapé levam a `/sobre-nos`
  - a capa abre o player com Enter, só com o teclado
  - nenhuma capa de vídeo e nenhuma foto do estoque está quebrada
  - os títulos seguem H1 → H2 → H3, sem pulo
  - `conferirInvariantes(page)` passa nos dois tamanhos, antes e depois de abrir o vídeo
- **Pronto quando:** o teste passa nos dois projetos.
- **Arquivos:** `tests/e2e/sobre-nos-celular.spec.ts`
- **Fora do escopo:** as cinco lojas com dados reais (T-1215); regressão visual (módulo 13).
- **Depende de:** T-1108, T-0010

---

## Pendências

- **Cartões das lojas dependem do módulo 12.** O Sobre nós (M8) consome `GET /lojas`, cujo adaptador, mock e caso de uso (`listarLojas`) só existem no módulo 12 (M9). Para nenhuma task depender de uma posterior, este módulo entrega o cartão por `props` e a seção no estado "sem dados", e a ligação é a T-1215. A Home (módulo 09) e o mega menu (módulo 02) têm a mesma dependência; ver a pendência de ordem dos módulos no [tasks.md do módulo 12](../12-lojas/tasks.md).
- **Layout guiado por regra, não por posição.** O protótipo monta as faixas pelo índice das seções (`secoes[0]` a `secoes[3]`). Aqui a regra é geral (texto da seção, depois o vídeo dela, duas colunas por linha). Se o cliente acrescentar ou tirar seções, a página se reorganiza; validar o resultado com ele.
- **Contato dentro do Estoque.** No protótipo, o último parágrafo do estoque ("Caso tenha alguma dúvida…") fica em uma caixa de destaque, escolhido por posição. O contrato não marca esse parágrafo. Hoje ele sai como parágrafo comum; para manter a caixa, o backend deve mandá-lo como bloco `aviso`. Propor a mudança de conteúdo.
- **Texto alternativo das fotos do estoque** vem da API ("Estoque da TireShop, foto 1"). Pedir ao cliente descrições melhores.
- **`VideoObject` no JSON-LD.** A liveSEO não pediu. Avaliar com ela; exigiria data de publicação e duração no contrato.
- **Fatos.** No protótipo os quatro cartões estavam escritos no template; aqui vêm de `fatos` da API. O cliente passa a poder editá-los.
- **Nome da loja de Ribeirão Preto.** O site escreve "RIBERÃO"; o protótipo corrigiu. O frontend não corrige texto: o dado da API precisa vir certo.
