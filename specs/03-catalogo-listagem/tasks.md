# Tasks 03 — Catálogo: listagem

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

---

### [x] T-0301 · `Medida` valida e formata a medida do pneu — 2026-11-27

- **Requisito:** REQ-03-03
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/medida.spec.ts`
  - cria `225/45 R17` e devolve o rótulo
  - aceita aro como texto (`17,5`, `16C`)
  - recusa largura ou altura zero, negativa ou não inteira (`MedidaInvalida`)
  - recusa aro vazio
  - duas medidas com os mesmos três valores são iguais
- **Pronto quando:** `Medida.criar` devolve `Result<Medida, MedidaInvalida>`; classe imutável.
- **Arquivos:** `layers/catalogo/domain/medida.ts`, `medida.spec.ts`
- **Fora do escopo:** resolver a busca em rota (módulo 05).
- **Depende de:** T-0101 (`Result`)
- **Decisões:** o fator estático se chama `de` (`Medida.de`), não `criar` — mesma convenção de
  todo VO do kernel (`Slug.de`, `Email.de`, `Dinheiro.deCentavos`); "criar" no "Pronto quando" é
  o nome do padrão, não o método literal (mesma nota da T-0214). Igualdade por `igual(outra)`
  (método próprio, não `toEqual` no teste) — mesmo padrão de `Dinheiro.igual`. Primeira task do
  módulo Catálogo: `layers/catalogo/index.ts` (antes só `export {}`) passa a reexportar `Medida`.
  Verificação local: `medida.spec.ts` (12/12), `typecheck`, `lint` e `format:check` (0 erros);
  suíte inteira/e2e/build no CI do PR.

### [x] T-0302 · `Preco` expõe parcelado, à vista e preço anterior sem recalcular — 2026-11-27

- **Requisito:** REQ-03-03
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/preco.spec.ts`
  - guarda total parcelado, parcelas, valor da parcela, à vista e desconto como recebidos
  - `emPromocao()` é verdadeiro só quando há preço anterior maior que o parcelado
  - recusa parcelas fora de 1 a 12 e à vista maior que o parcelado
  - não tem método que some, multiplique ou aplique desconto
- **Pronto quando:** `Preco.criar` devolve `Result`; usa `Dinheiro`.
- **Arquivos:** `layers/catalogo/domain/preco.ts`, `preco.spec.ts`
- **Fora do escopo:** formatação (é do `Dinheiro`).
- **Depende de:** T-0102 (`Dinheiro`)
- **Decisões:** `Preco.de` (não `criar`, mesma nota da T-0214/T-0301). A invariante de `de` (preço
  anterior > parcelado) já é conferida na criação — `emPromocao()` confere de novo, de propósito
  (é exatamente o que a CA descreve, e um `Preco` nunca existe com `de` inválido mesmo assim).
  `Parcelado`/`AVista` exportados como tipos próprios (usados pelo adaptador e pelo card mais
  adiante no módulo). Verificação local: `preco.spec.ts` (7/7), `typecheck`, `lint` e
  `format:check` (0 erros); suíte inteira/e2e/build no CI do PR.

### [x] T-0303 · `ProdutoResumo` sabe se pode ser comprado e o que mostrar — 2026-11-27

- **Requisito:** REQ-03-03, REQ-03-04
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/produto-resumo.spec.ts`
  - em estoque: `podeComprar()` e `mostraPreco()` verdadeiros
  - sem estoque: os dois falsos, mesmo que venha preço
  - `seloFrete()` devolve o texto "Frete grátis Sul e Sudeste acima de R$ 1.000,00" ou nada
  - `estrelasCheias()` arredonda a nota
  - a fábrica `umProdutoResumo()` cria um válido e aceita sobrescritas
- **Pronto quando:** tipo e fábrica de teste publicados em `layers/catalogo/index.ts`.
- **Arquivos:** `layers/catalogo/domain/produto-resumo.ts`, `produto-resumo.spec.ts`, `__fabricas__/produto.ts`, `index.ts`
- **Fora do escopo:** o `Produto` completo (módulo 04).
- **Depende de:** T-0301, T-0302
- **Decisões:** `ProdutoResumo` é um tipo passivo (não classe): `podeComprar`/`mostraPreco`/
  `seloFrete`/`estrelasCheias` são funções livres sobre ele, mesmo padrão de `Navegacao`
  (T-0201) — é um read-model montado de partes já válidas (`Preco`), sem invariante própria (ao
  contrário de `Medida`/`Preco`, que validam na criação). Campo do selo chamado `frete` (não
  `seloFrete`): evita um campo e uma função com o mesmo nome no mesmo arquivo — `SeloFrete`
  (tipo) e `seloFrete` (função) já coexistem sem problema (namespaces diferentes em TS), não
  valia a pena arriscar a leitura com um terceiro `seloFrete` como chave de objeto.
  Campos de exibição que o card vai precisar (nome, imagem, marca) ficam para quando a própria
  task que os testar precisar — nenhum campo sem teste que o exija (mesma disciplina das tasks
  anteriores). Achado escrevendo o teste: `Dinheiro.formatar()` usa espaço inseparável (` `)
  antes do valor, não espaço comum — o texto esperado do selo precisa do mesmo caractere.
  Fábrica exportada no `index.ts` (pedido explícito do "Pronto quando" desta task; diferente da
  prática de `conteudo`, que não publica a própria `__fabricas__`).
  Verificação local: `produto-resumo.spec.ts` (8/8), `typecheck`, `lint` e `format:check`
  (0 erros); suíte inteira/e2e/build no CI do PR.

### [x] T-0304 · `CriterioDeListagem` combina facetas, ordem e página — 2026-11-27

- **Requisito:** REQ-03-06, REQ-03-09
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/criterio-de-listagem.spec.ts`
  - começa na página 1, ordem `mais_vendidos`, 12 por página
  - `alternar('aro', '17')` marca; alternar de novo desmarca
  - alternar faceta ou mudar a ordem **volta para a página 1**
  - `irParaPagina(0)` é recusado
  - `limpar()` tira as facetas e mantém a categoria e a ordem
  - `temFiltro()` é falso quando só há categoria
  - `paraQuery()` gera `aro=17&aro=18&marca=hankook`, omitindo os padrões; `deQuery()` faz o caminho de volta
  - valores desconhecidos na query são ignorados; ordem inválida vira a padrão
- **Pronto quando:** value object imutável (cada operação devolve um novo).
- **Arquivos:** `layers/catalogo/domain/criterio-de-listagem.ts`, `criterio-de-listagem.spec.ts`
- **Fora do escopo:** chamada HTTP.
- **Depende de:** T-0101
- **Decisões:** `facetas` é um `Map<chave, Set<valor>>` interno — qualquer chave é aceita como
  faceta (o domínio não fixa uma lista; quem vem da categoria/API decide quais existem). Por
  isso "valores desconhecidos" não é sobre a chave, e sim sobre o **valor** dos dois parâmetros
  reservados: `pagina` não numérica/menor que 1 (ex.: `pagina=abc`) é ignorada, mantendo a
  página padrão — igual a "ordem inválida vira a padrão", só que no outro campo reservado.
  `irParaPagina(0)` "recusado" = devolve o PRÓPRIO critério sem mudar (não lança, não é `Result`)
  — mesma postura defensiva de `deQuery`: entrada ruim nunca quebra a tela, só não muda nada.
  `paraQuery()`/`deQuery()` usam `URLSearchParams` (API padrão da Web, não é uma chamada HTTP:
  só serializa/interpreta texto) — a ordem dos parâmetros na query confere com a dos testes
  porque `Map`/`Set` preservam a ordem de inserção em JS.
  Verificação local: `criterio-de-listagem.spec.ts` (13/13), `typecheck`, `lint` e
  `format:check` (0 erros); suíte inteira/e2e/build no CI do PR.

### [x] T-0305 · `Faceta` esconde o que não ajuda — 2026-11-27

- **Requisito:** REQ-03-05
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/faceta.spec.ts`
  - opção com total 0 não é exibível
  - faceta com uma opção exibível só não é exibível
  - mantém a ordem recebida das facetas e das opções
  - `marcada(criterio)` diz quais opções estão ativas
- **Pronto quando:** `facetasExibiveis(facetas, criterio)` é função pura.
- **Arquivos:** `layers/catalogo/domain/faceta.ts`, `faceta.spec.ts`
- **Fora do escopo:** contagem (vem da API).
- **Depende de:** T-0304
- **Decisões:** `Faceta`/`OpcaoDeFaceta` são tipos passivos (mesma linha de `ProdutoResumo`,
  T-0303) — `facetasExibiveis` e `marcada` são funções livres, puras (sem builder/classe: a
  task já pede exatamente "função pura"). `marcada(criterio, chave, valor)` é a função testada
  direto no bullet; `facetasExibiveis` a usa por dentro para marcar cada opção que devolve
  (`OpcaoExibivel = OpcaoDeFaceta & { marcada: boolean }`) — não há dois jeitos de saber se uma
  opção está marcada. A ordem sai de graça: `Array.filter`/`.map` preservam a ordem de entrada,
  sem precisar de nenhum cuidado extra.
  Verificação local: `faceta.spec.ts` (6/6), `typecheck`, `lint` e `format:check` (0 erros);
  suíte inteira/e2e/build no CI do PR.

### [x] T-0306 · As portas do catálogo e o caso de uso `listarProdutos` — 2026-11-27

- **Requisito:** REQ-03-02, REQ-03-06
- **Camada:** aplicação
- **Teste primeiro:** `layers/catalogo/application/listar-produtos.spec.ts` (com `ProdutoRepositoryFalso`)
  - repassa o critério à porta e devolve itens, paginação, facetas e ordenações
  - nunca pede mais de 12 por página, mesmo que a entrada peça
  - erro da porta sai como `Result` de falha, sem lançar
  - lista vazia é sucesso, com `total` 0
- **Pronto quando:** `ProdutoRepository` e `CategoriaRepository` declarados em `domain/portas.ts`; falso em memória em `application/__falsos__/`.
- **Arquivos:** `layers/catalogo/domain/portas.ts`, `application/listar-produtos.ts`, `listar-produtos.spec.ts`, `application/__falsos__/produto-repository-falso.ts`
- **Fora do escopo:** `obter`, `relacionados` e `porIds` (declarados na porta, implementados no módulo 04 e 08).
- **Depende de:** T-0303, T-0304, T-0305
- **Decisões:** `ProdutoRepository` declara só `listar` por agora — mesmo padrão de
  `NavegacaoRepository`/`ErroDeConteudo` (T-0201): a porta cresce quando a task que precisar do
  método chegar (módulo 04: `obter`/`relacionados`; módulo 08: `porIds`), não antes, porque
  nenhum teste desta task os exercita e os tipos de retorno (`Produto`, `ProdutoId`) nem
  existem ainda. `CategoriaRepository` também fica para a T-0307 (a próxima), que é quem de
  fato testa `obterCategoria` — nada nesta task bate nele; o "Pronto quando" nomeia as duas
  portas, mas só uma tem teste aqui.
  **Achado escrevendo o teste:** "nunca pede mais de 12 por página, mesmo que a entrada peça"
  só faz sentido se `CriterioDeListagem` puder PEDIR mais de 12 — mas a T-0304 fixou
  `porPagina` como constante (`POR_PAGINA`), sem campo nenhum. Precisava de um campo de
  verdade: `CriterioDeListagem` ganhou `porPagina` (T-0304, estendido aqui) — quem escolhe é o
  caso de uso que monta o critério (`listarProdutos` sempre com 12; o comparador, quando
  chegar, com 48 pela mesma porta, docs/domain/catalogo.md), nunca a URL (`paraQuery`/`deQuery`
  continuam sem esse parâmetro — a tela não deixa o usuário escolher o tamanho da página).
  `comPorPagina(n)` (novo método imutável, mesmo padrão de `comOrdem`) é o que `listarProdutos`
  usa para forçar o limite antes de chamar a porta — testado em `criterio-de-listagem.spec.ts`
  (15/15 agora, 2 casos novos), já que é uma extensão do VO da T-0304, não desta task.
  Verificação local: `listar-produtos.spec.ts` (4/4) + todo o módulo Catálogo (52/52 ao todo),
  `typecheck`, `lint` e `format:check` (0 erros); suíte inteira/e2e/build no CI do PR.

### [x] T-0307 · Caso de uso `obterCategoria` — 2026-11-27

- **Requisito:** REQ-03-01, REQ-03-16
- **Camada:** aplicação
- **Teste primeiro:** `layers/catalogo/application/obter-categoria.spec.ts`
  - devolve a categoria pelo slug
  - slug inexistente devolve `CategoriaNaoEncontrada`
  - `abaInicialDaBusca()` é `medida` na categoria de medida e `aro` na de aro
- **Pronto quando:** agregado `Categoria` com os comportamentos do domínio.
- **Arquivos:** `layers/catalogo/domain/categoria.ts`, `categoria.spec.ts`, `application/obter-categoria.ts`, `obter-categoria.spec.ts`
- **Fora do escopo:** metadados de SEO (T-0318).
- **Depende de:** T-0306
- **Decisões:** `Categoria` é um tipo passivo (mesma linha de `ProdutoResumo`/`Faceta`) com
  `abaInicialDaBusca` como função livre — o `slug` já chega validado (`Slug` do kernel), sem
  invariante nova para checar na criação. Só `slug` e `tipo` por agora: H1, ícone, arte,
  migalhas etc. (docs/domain/catalogo.md) entram quando a task que os mostrar precisar — nenhum
  teste aqui os exige. `abaInicialDaBusca` devolve `'medida'` para `departamento`/`marca`
  (padrão não testado explicitamente na spec, mas citado como "Pronto quando": a busca sempre
  abre em algum lugar, e `medida` é a aba padrão do widget de busca).
  `CategoriaRepository` (nova em `domain/portas.ts`, ao lado de `ProdutoRepository` da T-0306)
  usa `Slug` (não `string`) no parâmetro de `obter`, igual ao `docs/domain/catalogo.md`. Sem
  falso em `__falsos__/` (não listado nos Arquivos desta task): o teste do caso de uso usa um
  objeto `CategoriaRepository` construído ali mesmo, só para este teste.
  Verificação local: `categoria.spec.ts` (3/3) + `obter-categoria.spec.ts` (2/2) + todo o
  módulo Catálogo (57/57 ao todo), `typecheck`, `lint` e `format:check` (0 erros); suíte
  inteira/e2e/build no CI do PR.

### [x] T-0308 · O schema e o mapper de `ProdutoResumo` entendem a API — 2026-11-27

- **Requisito:** REQ-03-03, REQ-03-04
- **Camada:** adaptador
- **Teste primeiro:** `layers/catalogo/adapters/http/produto-resumo.mapper.spec.ts`
  - todo item de `mocks/fixtures/produtos-lista.json` valida no schema e vira `ProdutoResumo`
  - `preco: null` (sem estoque) vira produto sem preço exibível
  - `preco.de: null` vira preço sem valor anterior
  - `freteGratis: null` e `avaliacao: null` viram ausência, sem erro
  - falta de campo obrigatório é recusada pelo schema, com o caminho do campo
  - campo desconhecido é ignorado
- **Pronto quando:** `ProdutoResumoSchema` (Zod) e `paraProdutoResumo(dto)`; o DTO não é exportado para fora de `adapters/`.
- **Arquivos:** `layers/catalogo/adapters/http/produto-resumo.schema.ts`, `produto-resumo.mapper.ts`, `produto-resumo.mapper.spec.ts`
- **Fora do escopo:** o schema do produto completo.
- **Depende de:** T-0303, T-0103 (`ClienteHttp`)
- **Decisões:** o schema confere o contrato inteiro (os 16 campos de `ProdutoResumo` no
  `docs/api/openapi.yaml`, igual ao DTO de verdade), mas o mapper só traduz para o domínio o que
  esta task testa — preço, selo de frete, nota e disponibilidade. Nome, imagem, marca, medida,
  departamento, `promocao` (redundante com `preco.de`), `tem360`, `runFlat`, terreno e desenho
  ficam fora do `ProdutoResumo` por agora: nenhum teste os exige, e entram quando a task que os
  mostrar (o card) precisar — mesma disciplina de toda task deste módulo até aqui.
  **Achado escrevendo o teste:** `preco:null` e `avaliacao:null` só fazem sentido mapear para
  "ausência" se `ProdutoResumo.preco`/`.nota` puderem ser `undefined` — mas a T-0303 os deixou
  obrigatórios. Os dois campos passaram a opcionais (mudança aditiva: a fábrica `umProdutoResumo`
  continua preenchendo os dois por padrão, nenhum teste antigo quebra) e `estrelasCheias` passou
  a devolver `number | undefined`.
  `Preco.de`/`Dinheiro.deCentavos` (já existentes) fazem a validação de verdade; o mapper só
  traduz `Dinheiro{centavos,moeda}` do DTO e repassa erro como `ErroDeContrato` com o caminho do
  campo (mesmo padrão de `navegacao.mapper.ts`) se algo escapar do schema mas ainda assim for
  inválido para o domínio (não deveria acontecer, mas o mapper não confia cegamente).
  Verificação local: `produto-resumo.mapper.spec.ts` (7/7) + `produto-resumo.spec.ts` (9/9) +
  todo o módulo Catálogo (65/65), `typecheck`, `lint` e `format:check` (0 erros); por tocar o
  contrato da API, também `bin/pnpm test` completo (1108/1108); e2e/build no CI do PR.

### [ ] T-0309 · `HttpProdutoRepository.listar` chama a API e trata falhas

- **Requisito:** REQ-03-06, REQ-03-07
- **Camada:** adaptador
- **Teste primeiro:** `layers/catalogo/adapters/http/http-produto-repository.spec.ts` (com `ClienteHttp` falso)
  - monta `GET /produtos` com `categoria`, facetas repetidas, `ordem`, `pagina` e `porPagina=12`
  - resposta válida vira `ListaDeProdutos` com facetas e paginação
  - resposta fora do contrato vira `ErroDeContrato` com o caminho
  - falha de rede e 5xx viram `ErroDeRede`
  - a fixture `produtos-lista-vazia.json` vira lista vazia, sem erro
- **Pronto quando:** `ListaDeProdutosSchema` cobre as cinco fixtures de listagem.
- **Arquivos:** `layers/catalogo/adapters/http/lista-de-produtos.schema.ts`, `lista-de-produtos.mapper.ts`, `http-produto-repository.ts`, `http-produto-repository.spec.ts`
- **Fora do escopo:** os outros métodos da porta.
- **Depende de:** T-0306, T-0308

### [ ] T-0310 · `HttpCategoriaRepository` busca a categoria e trata o 404

- **Requisito:** REQ-03-01, REQ-03-16
- **Camada:** adaptador
- **Teste primeiro:** `layers/catalogo/adapters/http/http-categoria-repository.spec.ts`
  - as quatro fixtures de categoria validam e viram `Categoria`
  - `departamento: null` e `textoApoio: null` são aceitos
  - o HTML do texto de apoio vira `HtmlSeguro`; tag fora da lista branca é recusada
  - 404 vira `CategoriaNaoEncontrada`
- **Pronto quando:** `CategoriaSchema` e mapper prontos.
- **Arquivos:** `layers/catalogo/adapters/http/categoria.schema.ts`, `categoria.mapper.ts`, `http-categoria-repository.ts`, `http-categoria-repository.spec.ts`
- **Fora do escopo:** —
- **Depende de:** T-0307, T-0104 (`HtmlSeguro`)

### [ ] T-0311 · O mock de `/produtos` filtra, ordena, pagina e conta facetas

- **Requisito:** REQ-03-05, REQ-03-06, REQ-03-09
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/produtos.get.spec.ts`
  - `?categoria=pneus-para-carros` devolve 12 itens, total 26 e 3 páginas
  - `?categoria=pneus-para-carros&aro=17` só devolve aro 17
  - `&marca=hankook&marca=fortune` combina com OU dentro da faceta e E entre facetas
  - a contagem de cada faceta considera os outros filtros, não o da própria
  - `ordem=menor_preco` ordena pelo preço à vista; `melhor_avaliados`, pela nota
  - página além da última devolve `itens: []` com os totais
  - `vitrine=ofertas` devolve os 8 da vitrine, sem facetas
  - a resposta valida no `ListaDeProdutosSchema`
- **Pronto quando:** a rota lê `mocks/fixtures/_base/produtos.json` e `categorias.json`; também existe `categorias/[slug].get.ts` (404 para slug desconhecido).
- **Arquivos:** `server/api/mock/produtos.get.ts`, `server/api/mock/categorias/[slug].get.ts`, `server/utils/mock-catalogo.ts`, os `.spec.ts`
- **Fora do escopo:** `/produtos/{id}` (módulo 04).
- **Depende de:** T-0008, T-0309

### [ ] T-0312 · O contexto Catálogo é ligado aos adaptadores em um lugar só

- **Requisito:** REQ-03-07
- **Camada:** infra
- **Teste primeiro:** `layers/catalogo/ui/composables/use-catalogo.spec.ts` (ambiente Nuxt)
  - `useCatalogo()` devolve `listarProdutos` e `obterCategoria` prontos
  - com o provedor trocado no teste, os casos de uso usam os falsos
  - em SSR, cada requisição recebe a própria instância (sem estado compartilhado)
- **Pronto quando:** `app/plugins/10.catalogo.ts` é o único lugar que instancia `HttpProdutoRepository` e `HttpCategoriaRepository`.
- **Arquivos:** `app/plugins/10.catalogo.ts`, `layers/catalogo/ui/composables/use-catalogo.ts`, `use-catalogo.spec.ts`, `layers/catalogo/index.ts`
- **Fora do escopo:** telas.
- **Depende de:** T-0309, T-0310

### [ ] T-0313 · `CardProduto` mostra o produto como no protótipo

- **Requisito:** REQ-03-03, REQ-03-04
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/CardProduto.spec.ts`
  - nome dentro de um `h2`, com link para a rota do produto (via `rotas.produto`)
  - selo "Promoção" só em promoção; "360°" só com giro; selo de frete com o texto alternativo da regra
  - "R$ 529,00", "em até 12x de R$ 44,08 sem juros" e "R$ 502,55 à vista"
  - preço anterior riscado, com texto para leitor de tela, só quando há
  - estrelas com `aria-label` "Nota 4,9 de 5, em 31 avaliações"; sem avaliação, sem estrelas
  - botão "Comprar" emite `comprar` com o id; tem `aria-label` com o nome
  - sem estoque: sem preço e sem Comprar; mostra "Avise-me" com link para o produto
  - imagem com `width`, `height`, `alt` e `loading="lazy"`
- **Pronto quando:** usa as classes `ts-card*` do protótipo, sem CSS novo.
- **Arquivos:** `layers/catalogo/ui/components/CardProduto.vue`, `CardProduto.spec.ts`
- **Fora do escopo:** variante de loja (módulo 12); abrir o minicart (módulo 06).
- **Depende de:** T-0303, T-0105 (`rotas`)

### [ ] T-0314 · `FacetasListagem` marca, conta e limpa

- **Requisito:** REQ-03-05, REQ-03-06, REQ-03-08
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/FacetasListagem.spec.ts`
  - um `fieldset` com `legend` por faceta exibível, na ordem recebida
  - cada opção mostra rótulo e contagem; a marcada vem com `checked`
  - marcar emite `alternar` com chave e valor
  - "Limpar" aparece só com filtro ativo e emite `limpar`
  - faceta com uma opção só não é renderizada
  - cada `label` tem pelo menos 44 px de altura
- **Pronto quando:** o mesmo componente serve à lateral e ao painel do celular (prop `prefixo` para os ids).
- **Arquivos:** `layers/catalogo/ui/components/FacetasListagem.vue`, `FacetasListagem.spec.ts`
- **Fora do escopo:** o painel em si (T-0317).
- **Depende de:** T-0305

### [ ] T-0315 · `useListagem` mantém critério, URL e resultado em sincronia

- **Requisito:** REQ-03-06, REQ-03-07, REQ-03-09, REQ-03-12
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/composables/use-listagem.spec.ts` (ambiente Nuxt, casos de uso falsos)
  - lê o critério da query ao abrir (`?aro=17&ordem=menor_preco`)
  - `alternar`, `ordenar`, `irParaPagina` e `limpar` atualizam a query com `router.replace` e refazem a busca
  - expõe `estado`: `carregando`, `sucesso`, `vazio` ou `erro`
  - durante a nova busca mantém a lista anterior e marca `atualizando`
  - `tentarDeNovo()` refaz a última busca
  - a chave do `useAsyncData` muda com o critério (sem resposta trocada entre categorias)
- **Pronto quando:** nenhum dado da listagem vai para store (ADR 0007).
- **Arquivos:** `layers/catalogo/ui/composables/use-listagem.ts`, `use-listagem.spec.ts`
- **Fora do escopo:** componentes.
- **Depende de:** T-0312

### [ ] T-0316 · A página da categoria monta topo, facetas, vitrine e paginação

- **Requisito:** REQ-03-01, REQ-03-02, REQ-03-10, REQ-03-12, REQ-03-13, REQ-03-14, REQ-03-16
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/listagem.spec.ts` (computador), contra o mock
  - CA-03-01, CA-03-02, CA-03-03 e CA-03-04
  - CA-03-07 (vazio) e CA-03-08 (erro com `?_falha=500`)
  - slug inexistente responde 404 e mostra a página de não encontrado
  - números e "Próxima página" na mesma linha; página atual com `aria-current`
  - não existe faixa de avaliações, "Veja também" nem caixa "Comparar"
  - `conferirInvariantes(page)` passa
- **Pronto quando:** `app/pages/c/[slug].vue` usa `useListagem`; `Paginacao` e `EstadoVazio`/`EstadoDeErro` vêm de `shared/ui`; o lugar do filtro de pneus aceita o componente do módulo 05.
- **Arquivos:** `app/pages/c/[slug].vue`, `layers/catalogo/ui/components/{TopoCategoria,VitrineProdutos,OrdenacaoListagem}.vue`, `tests/e2e/listagem.spec.ts`
- **Fora do escopo:** painel do celular (T-0317), metadados (T-0318).
- **Depende de:** T-0311, T-0313, T-0314, T-0315, T-0205 (layout padrão)

### [ ] T-0317 · No celular, a barra fixa abre o painel de filtros

- **Requisito:** REQ-03-11
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/listagem-celular.spec.ts` (390 px)
  - CA-03-06
  - o painel prende o foco, fecha com Esc e devolve o foco ao botão "Filtrar"
  - o botão "Filtrar" mostra o número de filtros ativos
  - "Ordenar" abre o painel com o foco na ordenação
  - a lateral de facetas não existe no celular; a vitrine tem 2 colunas
  - o botão do WhatsApp não cobre a barra fixa
- **Pronto quando:** `PainelFiltrosCelular` reutiliza `FacetasListagem`; fecha ao passar de 900 px.
- **Arquivos:** `layers/catalogo/ui/components/{BarraFiltrosCelular,PainelFiltrosCelular}.vue`, `tests/e2e/listagem-celular.spec.ts`
- **Fora do escopo:** —
- **Depende de:** T-0316

### [ ] T-0318 · Metadados e dados estruturados da categoria

- **Requisito:** REQ-03-15
- **Camada:** aplicação
- **Teste primeiro:** `layers/catalogo/application/metadados-da-categoria.spec.ts`
  - título e descrição vêm de `seo` da categoria
  - página 2 acrescenta "página 2" ao título e mantém a canônica sem `ordem`
  - com faceta marcada, `robots` é `noindex, follow`
  - gera `BreadcrumbList` com Home, departamento e a categoria
  - gera `FAQPage` só quando há FAQ
- **Pronto quando:** função pura; a página aplica com `useSeoMeta` e `useHead`; o e2e confere H1 único, texto de apoio em H2 e JSON-LD válido no HTML do servidor.
- **Arquivos:** `layers/catalogo/application/metadados-da-categoria.ts`, `metadados-da-categoria.spec.ts`, `app/pages/c/[slug].vue`, `tests/e2e/listagem.spec.ts`
- **Fora do escopo:** sitemap.
- **Depende de:** T-0316, T-0106 (`shared/seo`)

---

## Pendências

- Regra de `noindex` para páginas filtradas: validar com a liveSEO (U3 da arquitetura da informação).
- Faixas de preço da faceta: hoje fixas (até R$ 450, R$ 450 a R$ 550, acima de R$ 550). O backend decide as faixas.
