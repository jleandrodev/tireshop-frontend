# Tasks 05 — Busca de pneu

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. Uma task por vez.

As tasks marcadas com **(contrato em proposta)** usam `GET /busca/veiculos`, que ainda depende da
validação do TI. Se o contrato mudar, elas são revistas com a seção 5 do `AGENTS.md` (mudança de contrato); as
outras não são afetadas.

---

### [ ] T-0501 · `OpcoesDeMedida` responde a cascata largura → altura → aro

- **Requisito:** REQ-05-02, REQ-05-04
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/opcoes-de-medida.spec.ts` (com os dados de `busca-medidas.json`)
  - `larguras()` devolve as 10 larguras em ordem crescente, de 175 a 265
  - `alturasDe(225)` devolve 45, 50, 55, 65 e 75
  - `arosDe(225, 45)` devolve `17` e `18`
  - `alturasDe(999)` e `arosDe(225, 99)` devolvem lista vazia, sem erro
  - `aros()` devolve os 7 aros da aba "Por aro", de `14` a `20`
  - `medidasDoAro('17')` devolve as 10 combinações de largura e altura que têm aro 17, começando em `205/50`
  - `existe(medida)` é verdadeiro para 225/45 R17 e falso para 225/45 R99
- **Pronto quando:** value object imutável, criado a partir de larguras, alturas por largura, aros por medida e aros; aro sempre como texto (`17,5`, `16C`); fábrica de teste `umasOpcoesDeMedida()`.
- **Arquivos:** `layers/catalogo/domain/opcoes-de-medida.ts`, `opcoes-de-medida.spec.ts`, `layers/catalogo/domain/__fabricas__/opcoes-de-medida.ts`
- **Fora do escopo:** chamada HTTP; opções de veículo.
- **Depende de:** T-0301

### [ ] T-0502 · `interpretarMedida` lê a medida digitada no cabeçalho

- **Requisito:** REQ-05-11
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/interpretar-medida.spec.ts`
  - "225/45R17" vira a `Medida` 225/45 R17
  - "225/45 r17", "225 45 17", "225-45-17" e "2254517" viram a mesma medida
  - " 225/45ZR17 " (com espaços e "ZR") vira a mesma medida
  - "235/75R17,5" e "235/75 R17.5" viram a medida com aro `17,5`
  - "pneu barato", "225/45" e texto vazio devolvem `MedidaInvalida`
  - a falha leva a mensagem "Digite a medida como está no pneu, por exemplo 225/45R17."
- **Pronto quando:** função pura que devolve `Result<Medida, MedidaInvalida>`, reutilizando `Medida.criar`.
- **Arquivos:** `layers/catalogo/domain/interpretar-medida.ts`, `interpretar-medida.spec.ts`
- **Fora do escopo:** conferir se a medida tem produto (T-0504); sugestões.
- **Depende de:** T-0301

### [ ] T-0503 · A porta `BuscaPneuGateway` e os casos de uso `listarOpcoesDeMedida` e `listarVeiculos`

- **Requisito:** REQ-05-05, REQ-05-13
- **Camada:** aplicação
- **Teste primeiro:** `layers/catalogo/application/listar-opcoes-de-busca.spec.ts` (com `BuscaPneuGatewayFalso`)
  - `listarOpcoesDeMedida` devolve as `OpcoesDeMedida` da porta
  - `listarVeiculos()` sem filtro devolve só os fabricantes
  - `listarVeiculos({ fabricante: 'Hyundai' })` repassa o fabricante e devolve também os modelos
  - `listarVeiculos({ fabricante: 'Hyundai', modelo: 'i30' })` devolve as versões, cada uma com ano e medidas
  - `listarVeiculos({ modelo: 'i30' })`, sem fabricante, é recusado sem chamar a porta
  - erro da porta sai como `Result` de falha, sem lançar
- **Pronto quando:** `BuscaPneuGateway` e os tipos `OpcoesDeVeiculo` e `FiltroDeVeiculo` declarados em `domain/portas.ts`; falso em memória em `application/__falsos__/`. **(contrato em proposta, na parte de veículos)**
- **Arquivos:** `layers/catalogo/domain/portas.ts`, `domain/opcoes-de-veiculo.ts`, `application/listar-opcoes-de-medida.ts`, `application/listar-veiculos.ts`, `application/listar-opcoes-de-busca.spec.ts`, `application/__falsos__/busca-pneu-gateway-falso.ts`
- **Fora do escopo:** cache (é da composição, T-0507).
- **Depende de:** T-0501

### [ ] T-0504 · `resolverBusca` transforma a escolha na rota de destino

- **Requisito:** REQ-05-08, REQ-05-11
- **Camada:** aplicação
- **Teste primeiro:** `layers/catalogo/application/resolver-busca.spec.ts`
  - a medida 225/45 R17 resolve para `rotas.categoria('225-45-r17')`, isto é, `/c/225-45-r17`
  - só o aro `17` resolve para a categoria do aro, `/c/carros-aro-17`
  - a medida escolhida a partir de um veículo resolve para a mesma rota da medida
  - largura sem altura, ou altura sem aro, devolve `MedidaInvalida` dizendo o campo que falta
  - com as opções informadas, uma medida que não existe nelas (225/45 R99) devolve `MedidaInvalida` com o motivo `sem_produto`
  - sem as opções (falha de `/busca/medidas`), a medida válida resolve assim mesmo
  - o destino nunca é montado com texto solto: sai de `rotas.categoria`
- **Pronto quando:** `slugDaMedida(medida)` (`225-45-r17`) e `slugDoAro(aro)` são funções puras do domínio; o caso de uso devolve `Result<string, MedidaInvalida>`.
- **Arquivos:** `layers/catalogo/domain/slug-de-busca.ts`, `slug-de-busca.spec.ts`, `application/resolver-busca.ts`, `resolver-busca.spec.ts`
- **Fora do escopo:** navegar (é da tela); categoria de aro de outros departamentos (ver Pendências).
- **Depende de:** T-0501, T-0502, T-0105 (`rotas`)

### [ ] T-0505 · `HttpBuscaPneuGateway` entende `/busca/medidas` e `/busca/veiculos`

- **Requisito:** REQ-05-13
- **Camada:** adaptador
- **Teste primeiro:** `layers/catalogo/adapters/http/http-busca-pneu-gateway.spec.ts` (com `ClienteHttpFalso`)
  - `mocks/fixtures/busca-medidas.json` valida no schema e vira `OpcoesDeMedida`, com as chaves de `alturasPorLargura` lidas como número
  - `opcoesDeMedida()` chama `GET /busca/medidas`
  - `veiculos({ fabricante: 'Hyundai', modelo: 'i30' })` chama `GET /busca/veiculos?fabricante=Hyundai&modelo=i30`
  - `mocks/fixtures/busca-veiculos.json` vira `OpcoesDeVeiculo`, com 28 fabricantes, 7 modelos e a versão "1.8" de "2014 a 2017" com a medida 225/45 R17
  - `ilustrativo` e `aviso` chegam ao domínio
  - resposta sem `arosPorMedida` vira `ErroDeContrato` com o caminho; falha de rede vira `ErroDeRede`
- **Pronto quando:** `OpcoesDeMedidaSchema` e `OpcoesDeVeiculoSchema` (Zod) com os mappers; os DTOs não saem de `adapters/`. **(contrato em proposta, na parte de veículos)**
- **Arquivos:** `layers/catalogo/adapters/http/busca.schema.ts`, `busca.mapper.ts`, `http-busca-pneu-gateway.ts`, `http-busca-pneu-gateway.spec.ts`
- **Fora do escopo:** —
- **Depende de:** T-0503, T-0103 (`ClienteHttp`)

### [ ] T-0506 · O mock de `/busca/medidas` e de `/busca/veiculos` responde em cascata

- **Requisito:** REQ-05-12, REQ-05-13
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/busca.get.spec.ts`
  - `GET /api/mock/busca/medidas` devolve a fixture e valida no `OpcoesDeMedidaSchema`
  - toda medida de `arosPorMedida` tem a largura em `larguras` e a altura em `alturasPorLargura`
  - `GET /api/mock/busca/veiculos` sem parâmetros devolve os fabricantes, com `modelos: []` e `versoes: []`
  - com `?fabricante=Hyundai`, devolve também os 7 modelos
  - com `?fabricante=Hyundai&modelo=i30`, devolve a versão com a medida 225/45 R17
  - fabricante sem dados no mock devolve `modelos: []`, com o `aviso`
  - `?_falha=500` e `?_atraso=300` funcionam nas duas rotas
- **Pronto quando:** as duas rotas existem; a de veículos mantém `ilustrativo: true`. **(contrato em proposta, na parte de veículos)**
- **Arquivos:** `server/api/mock/busca/medidas.get.ts`, `server/api/mock/busca/veiculos.get.ts`, `server/api/mock/busca.get.spec.ts`
- **Fora do escopo:** base real de veículos.
- **Depende de:** T-0008, T-0505

### [ ] T-0507 · `useBuscaPneu` entrega as opções e executa a busca

- **Requisito:** REQ-05-08, REQ-05-12, REQ-05-13
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/composables/use-busca-pneu.spec.ts` (ambiente Nuxt, casos de uso falsos)
  - expõe `opcoes` e `estado` (`carregando`, `sucesso` ou `erro`) das opções de medida
  - duas chamadas na mesma página (filtro completo e compacto) provocam uma busca só
  - `buscar({ largura: 225, altura: 45, aro: '17' })` navega para `/c/225-45-r17`
  - `buscarPorTexto('225/45R17')` navega para a mesma rota; com "pneu barato", não navega e devolve a mensagem de erro
  - `tentarDeNovo()` refaz a busca das opções
  - `carregarVeiculos({ fabricante })` chama `listarVeiculos` e expõe o próprio estado, separado do das medidas
- **Pronto quando:** `app/plugins/10.catalogo.ts` instancia `HttpBuscaPneuGateway`; `useCatalogo()` passa a entregar `listarOpcoesDeMedida`, `listarVeiculos` e `resolverBusca`; as opções usam `useAsyncData` com a chave fixa `busca-medidas`; nada vai para store.
- **Arquivos:** `layers/catalogo/ui/composables/use-busca-pneu.ts`, `use-busca-pneu.spec.ts`, `use-catalogo.ts`, `app/plugins/10.catalogo.ts`, `layers/catalogo/index.ts`
- **Fora do escopo:** componentes.
- **Depende de:** T-0504, T-0505, T-0312 (`useCatalogo`)

### [ ] T-0508 · `FiltroPneus` busca por medida e por aro, em abas

- **Requisito:** REQ-05-01, REQ-05-02, REQ-05-03, REQ-05-04, REQ-05-07, REQ-05-09, REQ-05-12
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/FiltroPneus.spec.ts`
  - mostra as abas "Por medida", "Por aro" e "Por veículo", nessa ordem, com "Por medida" ativa por padrão
  - sem escolha, os campos mostram 225, 45 e 17 como exemplo, e Altura e Aro estão travados
  - escolher a largura 225 libera a Altura com 45, 50, 55, 65 e 75; trocar a largura limpa a Altura e trava o Aro
  - enviar com os três campos emite a busca com 225, 45 e `17`; o botão "Buscar pneus" nunca tem `disabled`, e os três campos têm `required`
  - na aba "Por aro", escolher "Aro 17" libera "Largura / altura" com 10 medidas; um aro sem medida mostra "Sem medidas neste aro"
  - com `inicial` de medida (225, 45, `17`), os três campos vêm selecionados; com `inicial` de aro (`17`), a aba "Por aro" vem ativa com "Aro 17"
  - com o estado `erro`, mostra "Não foi possível carregar as medidas." e "Tentar de novo"; com `carregando`, os campos ficam travados
  - cada aba tem o link "Onde encontro a medida?" para `rotas.home({ ancora: 'faq-medida' })`
- **Pronto quando:** usa `Guias`, `Campo` e `Botao` do kernel e as classes `ts-filtro*`, `ts-medida*` e `ts-campo*` do protótipo; o título do filtro é um parágrafo; o prefixo dos ids vem por prop.
- **Arquivos:** `layers/catalogo/ui/components/FiltroPneus.vue`, `PainelPorMedida.vue`, `PainelPorAro.vue`, `FiltroPneus.spec.ts`
- **Fora do escopo:** painel de veículo (T-0509); colocar o filtro nas páginas (T-0512).
- **Depende de:** T-0507, T-0110 (`Guias`), T-0119

### [ ] T-0509 · A aba "Por veículo" encadeia marca, modelo, versão e medida **(contrato em proposta)**

- **Requisito:** REQ-05-05, REQ-05-12
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/PainelPorVeiculo.spec.ts`
  - mostra quatro campos: Marca, Modelo, "Versão e ano" e Medida; só Marca começa liberado, com os fabricantes recebidos
  - escolher "Hyundai" pede os modelos e libera o campo Modelo com os 7 recebidos
  - escolher "i30" pede as versões e libera "Versão e ano" com "1.8 · 2014 a 2017"
  - escolher a versão libera Medida; havendo uma medida só (225/45 R17), ela já vem escolhida
  - enviar emite a busca com a medida escolhida
  - trocar a marca limpa e trava os campos seguintes
  - o aviso recebido da API aparece abaixo dos campos
  - falha ao carregar mostra a mensagem com "Tentar de novo" só neste painel
- **Pronto quando:** os fabricantes só são pedidos quando a aba é aberta pela primeira vez; o painel entra no `FiltroPneus`.
- **Arquivos:** `layers/catalogo/ui/components/PainelPorVeiculo.vue`, `PainelPorVeiculo.spec.ts`, `FiltroPneus.vue`
- **Fora do escopo:** busca de modelo por digitação.
- **Depende de:** T-0508

### [ ] T-0510 · `FiltroPneusCompacto` cabe em uma linha

- **Requisito:** REQ-05-10, REQ-05-12
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/FiltroPneusCompacto.spec.ts`
  - é um `form` com `aria-label="Busca de pneus pela medida"` e o rótulo "Encontre o pneu pela medida"
  - tem os campos Largura, Altura e Aro, com rótulo só para leitor de tela
  - a cascata é a mesma do filtro completo (largura 225 libera as alturas; altura 45 libera os aros 17 e 18)
  - enviar com os três campos emite a busca
  - tem o link "Buscar por aro ou veículo" para `rotas.home({ ancora: 'conteudo' })`
  - com o estado `erro`, esconde os campos e o botão e deixa só o link
  - os ids usam o prefixo recebido, diferente do filtro completo
- **Pronto quando:** reutiliza o `PainelPorMedida` (ou a mesma lógica de cascata), sem duplicar regra; classes `ts-filtro-compacto*` do protótipo.
- **Arquivos:** `layers/catalogo/ui/components/FiltroPneusCompacto.vue`, `FiltroPneusCompacto.spec.ts`
- **Fora do escopo:** colocar nas páginas de produto, políticas e Sobre nós (módulos 04, 10 e 11).
- **Depende de:** T-0508

### [ ] T-0511 · A busca por medida do cabeçalho leva à categoria

- **Requisito:** REQ-05-11
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/busca-cabecalho.spec.ts` (computador e celular), contra o mock
  - CA-05-08: "225/45R17" e Enter levam a `/c/225-45-r17`
  - "225 45 17" e o clique no botão "Buscar" levam à mesma página
  - "pneu barato" não muda de página e mostra "Digite a medida como está no pneu, por exemplo 225/45R17."
  - a mensagem está ligada ao campo por `aria-describedby`, e o campo fica com `aria-invalid`
  - corrigir o texto e buscar de novo limpa a mensagem
  - com `?_falha=500` em `/busca/medidas`, "225/45R17" ainda leva à categoria
- **Pronto quando:** o layout padrão liga o `buscar` do `SiteCabecalho` a `useBuscaPneu().buscarPorTexto`; `BuscaPorMedida` ganha a prop `mensagemDeErro`; o Conteúdo continua sem importar o Catálogo.
- **Arquivos:** `app/layouts/default.vue`, `layers/conteudo/ui/components/BuscaPorMedida.vue`, `BuscaPorMedida.spec.ts`, `SiteCabecalho.vue`, `tests/e2e/busca-cabecalho.spec.ts`
- **Fora do escopo:** sugestões enquanto digita.
- **Depende de:** T-0507, T-0206, T-0316 (página da categoria)

### [ ] T-0512 · A página da categoria abre com o filtro de pneus preenchido

- **Requisito:** REQ-05-08, REQ-05-09
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/busca-categoria.spec.ts` (computador), contra o mock
  - CA-05-06: o HTML do servidor de `/c/225-45-r17` traz 225, 45 e 17 selecionados na aba "Por medida"
  - CA-05-07: `/c/carros-aro-17` abre na aba "Por aro", com "Aro 17" selecionado
  - `/c/pneus-para-carros` abre na aba "Por medida", com os campos vazios mostrando o exemplo
  - CA-05-01: de `/c/pneus-para-carros`, escolher 225, 45 e 17 e buscar leva a `/c/225-45-r17`
  - CA-05-04: pela aba "Por aro", "Aro 17" e "225/45" levam a `/c/225-45-r17`
  - o filtro fica na primeira dobra, ao lado da arte da categoria
- **Pronto quando:** `app/pages/c/[slug].vue` passa `categoria.filtroInicial()` e `abaInicialDaBusca()` ao `FiltroPneus`, no lugar reservado pela T-0316; as opções de medida são buscadas no servidor junto com a página.
- **Arquivos:** `app/pages/c/[slug].vue`, `tests/e2e/busca-categoria.spec.ts`
- **Fora do escopo:** Home (módulo 09).
- **Depende de:** T-0508, T-0506, T-0316 (página da categoria)

### [ ] T-0513 · A busca de pneu funciona com teclado, no computador e no celular

- **Requisito:** REQ-05-01, REQ-05-03, REQ-05-05, REQ-05-06, REQ-05-07, REQ-05-10, REQ-05-12
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/busca-pneu.spec.ts` (projetos `computador` 1440 px e `celular` 390 px), contra o mock
  - CA-05-02 e CA-05-03: a cascata só oferece o que existe, e buscar com campo faltando não navega e marca o campo como inválido
  - CA-05-05: Hyundai, i30, "1.8 · 2014 a 2017" e 225/45 R17 levam a `/c/225-45-r17` **(contrato em proposta)**
  - as setas trocam de aba, e só a aba ativa recebe o Tab
  - o campo Largura da aba "Por medida" tem a mesma altura e o mesmo tamanho de letra do campo Marca da aba "Por veículo"
  - "Onde encontro a medida?" aponta para `/#faq-medida`
  - CA-05-09: na página de prova, o filtro compacto tem no máximo 80 px de altura em 1440 px; em 390 px, o botão ocupa a largura toda
  - CA-05-10: com `?_falha=500` em `/busca/medidas`, a página responde 200 e o filtro mostra "Tentar de novo"
  - `conferirInvariantes(page)` passa nos dois tamanhos, na categoria e na página de prova do compacto
- **Pronto quando:** o teste passa nos dois projetos; todo campo e todo botão do filtro têm pelo menos 44 px; só "Buscar pneus" usa o verde de ação.
- **Arquivos:** `tests/e2e/busca-pneu.spec.ts`, `tests/e2e/_paginas-de-prova/filtro-compacto.vue`
- **Fora do escopo:** regressão visual da Home; o primeiro campo acima da dobra no celular (regra da Home, módulo 09).
- **Depende de:** T-0509, T-0510, T-0511, T-0512, T-0010

---

## Pendências

- **`GET /busca/veiculos` é proposta.** Validar com o TI o formato (fabricante → modelo → versões com ano e medidas) e de onde vem a base. Afeta T-0503, T-0505, T-0506, T-0509 e um caso da T-0513.
- **Campos da aba de veículo.** O protótipo mostra Marca, Modelo, Ano e Versão. O contrato proposto entrega versão e ano juntos e uma lista de medidas por versão; por isso a spec usa Marca, Modelo, "Versão e ano" e Medida. O `catalogo.md` do domínio fala em "fabricantes, modelos, anos". Alinhar os três quando o contrato for validado.
- **Destino da busca só por aro.** As categorias de aro são por departamento (`carros-aro-17`), e `/busca/medidas` não diz o departamento nem o slug de destino. Premissa da T-0504: a busca só por aro leva à categoria de aro de Carros. Proposta ao TI: `/busca/medidas` devolver o destino de cada medida e de cada aro, ou existir uma categoria de aro sem departamento.
- **Slug da medida.** `225/45 R17` → `225-45-r17` é o padrão do protótipo; a forma final é do cliente (D2). Aro com vírgula (`17,5`) e com letra (`16C`) ainda não têm slug definido.
- **O mock só tem quatro categorias.** Buscar uma medida diferente de 225/45 R17 leva a uma categoria que o mock não conhece (404). Abrir task no módulo 03 para o mock de `/categorias/{slug}` montar a categoria de qualquer medida que exista em `busca-medidas.json`.
- **Aba "Por aro" exige a medida.** No protótipo o campo "Largura / altura" é obrigatório; a busca só por aro acontece quando o aro não tem medida listada. Confirmar com o cliente se "só o aro" deve ser permitido sempre.
- **Lista de aros da aba "Por aro".** No protótipo é fixa (14 a 20); aqui vem de `aros` da API.
- **`#faq-medida` e `#conteudo` na Home.** Os links "Onde encontro a medida?" e "Buscar por aro ou veículo" dependem de âncoras que nascem no módulo 09.
- **Medida digitada que não tem produto.** A spec responde com a mensagem "sem produto" quando as opções estão carregadas. Confirmar o texto com o cliente.
