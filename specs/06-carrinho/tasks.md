# Tasks 06 — Carrinho e minicart

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. Uma task por vez.

---

### [ ] T-0601 · `Carrinho` guarda um item por produto, com quantidade de 1 a 8

- **Requisito:** REQ-06-01, REQ-06-02, REQ-06-03
- **Camada:** domínio
- **Teste primeiro:** `layers/carrinho/domain/carrinho.spec.ts`
  - carrinho sem itens: `estaVazio()` verdadeiro e `quantidadeTotal()` igual a 0
  - `adicionar(produto)` em carrinho vazio cria um item com quantidade 1
  - `adicionar` do mesmo produto soma na mesma linha (2 + 1 = 3), sem criar segundo item
  - com 7 unidades, `adicionar(produto, 2)` fica com 8; com 8, devolve `QuantidadeInvalida` com o motivo `maximo`
  - `alterarQuantidade(id, 5)` define 5; com 0, 9 ou 2,5 devolve `QuantidadeInvalida`
  - `alterarQuantidade` e `remover` de produto que não está no carrinho devolvem falha, sem lançar
  - `remover(id)` tira o item; removido o último, o carrinho fica vazio
  - `quantidadeTotal()` soma as quantidades dos itens (2 + 4 = 6); não existe método que some preço
- **Pronto quando:** agregado imutável (cada intenção devolve `Result` com um novo `Carrinho`); `ItemCarrinho` usa o tipo `ProdutoResumo` pela API pública do Catálogo; `Totais` é só dado recebido (`aVista`, `parcelado`, `quantidade`); fábrica `umCarrinho()` em `__fabricas__/`.
- **Arquivos:** `layers/carrinho/domain/carrinho.ts`, `carrinho.spec.ts`, `layers/carrinho/domain/erros.ts`, `layers/carrinho/domain/__fabricas__/carrinho.ts`
- **Fora do escopo:** calcular totais (vêm da API); frete e cupom.
- **Depende de:** T-0101, T-0102, T-0303 (`ProdutoResumo`)

### [ ] T-0602 · A porta do carrinho e os casos de uso `obterCarrinho` e `adicionarAoCarrinho`

- **Requisito:** REQ-06-02, REQ-06-05
- **Camada:** aplicação
- **Teste primeiro:** `layers/carrinho/application/adicionar-ao-carrinho.spec.ts` (com `CarrinhoRepositoryFalso`)
  - `obterCarrinho` devolve o carrinho da porta; sessão nova devolve carrinho vazio, como sucesso
  - `adicionarAoCarrinho` com o produto 3084 e quantidade 1 chama `adicionar('3084', 1)` e devolve o carrinho recebido
  - sem informar a quantidade, adiciona 1
  - produto sem estoque devolve `ProdutoIndisponivel` e **não** chama a porta
  - com 8 unidades do produto no carrinho atual, devolve `QuantidadeInvalida` e não chama a porta
  - com 7 no carrinho e pedido de 2, chama a porta com 1 (só o que cabe)
  - erro da porta (`ErroDeRede`) sai como `Result` de falha, sem lançar
- **Pronto quando:** `CarrinhoRepository` declarada em `domain/portas.ts` com `obter`, `adicionar`, `alterar` e `remover`; falso em memória em `application/__falsos__/`, com preparo de sucesso e de falha.
- **Arquivos:** `layers/carrinho/domain/portas.ts`, `application/obter-carrinho.ts`, `application/adicionar-ao-carrinho.ts`, `adicionar-ao-carrinho.spec.ts`, `obter-carrinho.spec.ts`, `application/__falsos__/carrinho-repository-falso.ts`
- **Fora do escopo:** abrir o minicart e o aviso "Adicionado" (são da tela, T-0608).
- **Depende de:** T-0601

### [ ] T-0603 · Casos de uso `alterarQuantidade` e `removerDoCarrinho`

- **Requisito:** REQ-06-03
- **Camada:** aplicação
- **Teste primeiro:** `layers/carrinho/application/alterar-e-remover.spec.ts` (com `CarrinhoRepositoryFalso`)
  - `alterarQuantidade('3084', 3)` chama `alterar('3084', 3)` e devolve o carrinho recebido
  - quantidade 0 ou 9 devolve `QuantidadeInvalida` e não chama a porta
  - `removerDoCarrinho('3084')` chama `remover('3084')` e devolve o carrinho recebido
  - remover o último item devolve o carrinho vazio, como sucesso
  - `ErroDeValidacao` da porta (422) é repassado com a mensagem do servidor
  - `NaoEncontrado` da porta (produto que não está no carrinho) sai como falha, sem lançar
- **Pronto quando:** os quatro casos de uso recebem a porta por parâmetro (padrão P3) e são exportados por `layers/carrinho/index.ts`.
- **Arquivos:** `layers/carrinho/application/alterar-quantidade.ts`, `remover-do-carrinho.ts`, `alterar-e-remover.spec.ts`, `layers/carrinho/index.ts`
- **Fora do escopo:** esvaziar o carrinho de uma vez (não existe no protótipo).
- **Depende de:** T-0602

### [ ] T-0604 · O schema e o mapper de `Carrinho` entendem a API

- **Requisito:** REQ-06-04, REQ-06-05
- **Camada:** adaptador
- **Teste primeiro:** `layers/carrinho/adapters/http/carrinho.mapper.spec.ts`
  - `mocks/fixtures/carrinho.json` valida no schema e vira um `Carrinho` com um item do produto 3084 e quantidade 2
  - os totais viram `Dinheiro`: à vista de 100510 centavos, parcelado de 105800 em 12 parcelas de 8817
  - `mocks/fixtures/carrinho-vazio.json` vira um carrinho vazio, com totais zerados
  - o produto do item é lido com o leitor publicado pelo Catálogo e chega como `ProdutoResumo`
  - `quantidade` 0, 9 ou fracionada é recusada pelo schema, com o caminho `itens.0.quantidade`
  - total com `centavos` não inteiro é recusado; campo desconhecido é ignorado
- **Pronto quando:** `CarrinhoSchema` (Zod) e `paraCarrinho(dto)`; o Catálogo publica em `layers/catalogo/index.ts` a função `lerProdutoResumo(dado)`, que valida e mapeia sem expor o DTO; o mapper do carrinho não recalcula nenhum total.
- **Arquivos:** `layers/carrinho/adapters/http/carrinho.schema.ts`, `carrinho.mapper.ts`, `carrinho.mapper.spec.ts`, `layers/catalogo/index.ts`, `layers/catalogo/adapters/http/ler-produto-resumo.ts`
- **Fora do escopo:** chamadas HTTP (T-0605).
- **Depende de:** T-0601, T-0308 (schema de `ProdutoResumo`)

### [ ] T-0605 · `HttpCarrinhoRepository` faz as quatro operações e trata as recusas

- **Requisito:** REQ-06-05
- **Camada:** adaptador
- **Teste primeiro:** `layers/carrinho/adapters/http/http-carrinho-repository.spec.ts` (com `ClienteHttpFalso`)
  - `obter()` chama `GET /carrinho` e devolve o `Carrinho`
  - `adicionar('3084', 2)` envia `POST /carrinho/itens` com o corpo de `carrinho-item.requisicao.json`
  - `alterar('3084', 3)` envia `PATCH /carrinho/itens/3084` com `{ "quantidade": 3 }`
  - `remover('3084')` envia `DELETE /carrinho/itens/3084` e devolve o carrinho da resposta
  - 422 no campo `quantidade` vira `QuantidadeInvalida`; 422 no campo `produtoId` vira `ProdutoIndisponivel`; os dois levam a `title` da API
  - 404 vira `NaoEncontrado`; resposta fora do contrato vira `ErroDeContrato`; falha de rede vira `ErroDeRede`
- **Pronto quando:** o repositório usa só o `ClienteHttp` (que já envia o cookie de sessão); não guarda estado.
- **Arquivos:** `layers/carrinho/adapters/http/http-carrinho-repository.ts`, `http-carrinho-repository.spec.ts`
- **Fora do escopo:** autenticação (dúvida D1 do PRD).
- **Depende de:** T-0603, T-0604, T-0103 (`ClienteHttp`)

### [ ] T-0606 · O mock guarda um carrinho em memória por sessão

- **Requisito:** REQ-06-06
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/carrinho.spec.ts`
  - `GET /api/mock/carrinho` sem cookie devolve 200 com o carrinho vazio e define o cookie de sessão `HttpOnly`
  - `POST /carrinho/itens` com `{ "produtoId": "3084", "quantidade": 2 }` devolve um item e os totais de `carrinho.json` (à vista 100510, parcelado 105800, parcela 8817)
  - um segundo `POST` do mesmo produto soma na mesma linha; se a soma passa de 8, devolve 422 com o campo `quantidade`
  - `PATCH /carrinho/itens/3084` com 3 define 3; com 0 ou 9 devolve 422
  - `DELETE /carrinho/itens/3084` remove e devolve o carrinho; `PATCH` ou `DELETE` de item que não está no carrinho devolve 404
  - produto inexistente (`9999`) devolve 404; produto sem estoque (`4360-sem-estoque`) devolve 422 com o campo `produtoId`
  - duas sessões (dois cookies) não enxergam o carrinho uma da outra
  - toda resposta 2xx valida no `CarrinhoSchema`; `?_falha=500` funciona nas quatro rotas
- **Pronto quando:** os preços vêm de `mocks/fixtures/_base/produtos.json`; os totais são calculados no servidor de mocks (é ele que faz o papel do backend); reiniciar o servidor zera os carrinhos.
- **Arquivos:** `server/api/mock/carrinho.get.ts`, `server/api/mock/carrinho/itens.post.ts`, `server/api/mock/carrinho/itens/[id].patch.ts`, `server/api/mock/carrinho/itens/[id].delete.ts`, `server/utils/mock-carrinho.ts`, `server/api/mock/carrinho.spec.ts`
- **Fora do escopo:** persistência em disco; expiração de sessão.
- **Depende de:** T-0008, T-0605

### [ ] T-0607 · A store do carrinho é um espelho otimista que reconcilia e reverte

- **Requisito:** REQ-06-07, REQ-06-13, REQ-06-14
- **Camada:** ui
- **Teste primeiro:** `layers/carrinho/ui/stores/carrinho.spec.ts` (Pinia de teste, casos de uso falsos)
  - `carregar()` passa por `carregando` e termina com o carrinho da API; falha deixa `estado` em `erro`
  - `adicionar(produto)` mostra o item e a nova quantidade total **antes** de a porta responder, com `atualizando` verdadeiro
  - quando a resposta chega, o carrinho passa a ser o da API (itens e totais), e `atualizando` volta a falso
  - se a porta falha, o carrinho volta exatamente ao que era antes, e `erro` recebe a mensagem
  - enquanto `atualizando`, os totais em dinheiro são os últimos confirmados, marcados como desatualizados (a store não soma preço)
  - duas alterações seguidas são enviadas em ordem, e a resposta da primeira não apaga o efeito otimista da segunda
  - uma operação recusada pelo domínio (quantidade 9) não muda o estado nem chama a porta
  - a store não lê nem escreve `localStorage` e `sessionStorage`
- **Pronto quando:** `useCarrinhoStore` guarda só estado de cliente (carrinho espelhado, `estado`, `atualizando`, `erro`); usa as intenções do agregado para o passo otimista. Dependências que esta task instala: `pinia` e `@pinia/nuxt`.
- **Arquivos:** `layers/carrinho/ui/stores/carrinho.ts`, `carrinho.spec.ts`, `layers/carrinho/nuxt.config.ts`, `package.json`
- **Fora do escopo:** abrir e fechar o minicart (T-0608); componentes.
- **Depende de:** T-0603

### [ ] T-0608 · `useCarrinho` liga o contexto e dá o `comprar` que todas as telas usam

- **Requisito:** REQ-06-08, REQ-06-12
- **Camada:** ui
- **Teste primeiro:** `layers/carrinho/ui/composables/use-carrinho.spec.ts` (ambiente Nuxt, repositório falso pelo provedor)
  - `comprar(produto)` adiciona uma unidade, abre o minicart e define o aviso "Adicionado: {nome do produto}"
  - `comprar(produto, 4)` adiciona 4 (uso da página de produto)
  - `comprar` de produto sem estoque não abre o minicart com "Adicionado": mostra o erro
  - `abrir()` pelo cabeçalho abre o minicart com o aviso vazio
  - `remover(id)` define o aviso "Pneu removido do carrinho."
  - `quantidade` é a soma das quantidades, reativa; `rotuloDoBotao` é "Carrinho, vazio", "Carrinho, 1 pneu" ou "Carrinho, 2 pneus"
  - com o provedor trocado no teste, os casos de uso usam o repositório falso
- **Pronto quando:** `app/plugins/13.carrinho.ts` é o único lugar que instancia `HttpCarrinhoRepository`; `layers/carrinho/index.ts` publica `useCarrinho`; a primeira leitura (`carregar`) acontece só no navegador.
- **Arquivos:** `app/plugins/13.carrinho.ts`, `layers/carrinho/ui/composables/use-carrinho.ts`, `use-carrinho.spec.ts`, `layers/carrinho/index.ts`
- **Fora do escopo:** componentes; devolver o foco (é do `Dialogo`).
- **Depende de:** T-0605, T-0607, T-0118

### [ ] T-0609 · `Minicart` mostra os itens, a quantidade e os totais

- **Requisito:** REQ-06-04, REQ-06-09, REQ-06-10
- **Camada:** ui
- **Teste primeiro:** `layers/carrinho/ui/components/Minicart.spec.ts`
  - é um diálogo modal com o título "Seu carrinho" em `h2` e o botão "Fechar o carrinho"
  - com o carrinho de `carrinho.json`, mostra um item com o nome do pneu, "R$ 502,55 à vista, cada" e a quantidade 2
  - mostra "Total à vista" R$ 1.005,10 e "R$ 1.058,00 em até 12x sem juros", como vieram da API
  - "Pôr mais um" emite `alterar` com o id e 3; "Tirar um" emite com 1
  - com quantidade 1, "Tirar um" está travado; com 8, "Pôr mais um" está travado
  - o seletor é um grupo com `aria-label` "Quantidade de {nome}", e a quantidade está em um `output` com `aria-live="polite"`
  - "Remover" tem `aria-label` "Remover {nome}" e emite `remover` com o id
  - o aviso recebido ("Adicionado: …") aparece em um elemento com `role="status"`; "Continuar comprando" emite `fechar`
- **Pronto quando:** usa o `Dialogo` (variante `direita`) e as classes `ts-minicart*` e `ts-qtd` do protótipo; `SeletorDeQuantidade` é um componente próprio (a página de produto reutiliza); o texto do frete ("O frete e o prazo de entrega são calculados pelo CEP, no carrinho.") aparece; "Ir para o carrinho" aponta para a URL de `runtimeConfig.public.urlDoCarrinho`.
- **Arquivos:** `layers/carrinho/ui/components/Minicart.vue`, `ItemDoMinicart.vue`, `SeletorDeQuantidade.vue`, `Minicart.spec.ts`, `nuxt.config.ts` (runtimeConfig)
- **Fora do escopo:** estados de vazio, carregando e erro (T-0610); subtotal por linha.
- **Depende de:** T-0601, T-0112 (`Dialogo`), T-0119

### [ ] T-0610 · `Minicart` vazio, carregando e com erro

- **Requisito:** REQ-06-11, REQ-06-13
- **Camada:** ui
- **Teste primeiro:** `layers/carrinho/ui/components/MinicartEstados.spec.ts`
  - vazio: mostra "Seu carrinho está vazio.", o texto de apoio e o botão "Buscar pela medida"; não mostra totais nem "Ir para o carrinho"
  - "Buscar pela medida" emite `buscar-pela-medida`
  - carregando: mostra o esqueleto de itens, sem a mensagem de vazio
  - erro ao carregar: mostra "Não foi possível carregar o carrinho." e "Tentar de novo", que emite `tentar`
  - erro em uma alteração: os itens continuam visíveis, e a mensagem aparece com `role="alert"`
  - com `atualizando`, os totais ficam marcados como esmaecidos e com `aria-busy="true"`
- **Pronto quando:** os quatro estados do bloco estão cobertos (padrão P7); usa `EstadoDeErro` e `Esqueleto` do kernel.
- **Arquivos:** `layers/carrinho/ui/components/Minicart.vue`, `MinicartEstados.spec.ts`
- **Fora do escopo:** levar o foco ao filtro (quem faz é o layout, T-0611).
- **Depende de:** T-0609, T-0113

### [ ] T-0611 · O layout padrão mostra a contagem e monta o minicart

- **Requisito:** REQ-06-11, REQ-06-12, REQ-06-14, REQ-06-15
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/minicart-layout.spec.ts` (computador), contra o mock
  - o HTML do servidor não traz número no carrinho nem chamou `/carrinho`; depois de carregar, o botão diz "Carrinho, vazio"
  - com dois itens já na sessão (preparados pela API do mock), o botão mostra 2 e diz "Carrinho, 2 pneus"
  - tocar no botão do carrinho abre o minicart, sem aviso; Esc fecha e devolve o foco ao botão
  - CA-06-06: "Buscar pela medida", em uma página com filtro, fecha o minicart e foca o campo Largura; em uma página sem filtro, foca "Busca por Medida" do cabeçalho
  - com `?_falha=500` em `/carrinho`, a página funciona, e o minicart aberto mostra "Tentar de novo"
  - `conferirInvariantes(page)` passa com o minicart fechado e aberto
- **Pronto quando:** `app/layouts/default.vue` põe o `Minicart` no lugar reservado pela T-0205 e liga `quantidadeNoCarrinho` e `abrir-carrinho` do `SiteCabecalho` ao `useCarrinho`; só o layout padrão monta o minicart (o layout `loja` não importa o contexto Carrinho).
- **Arquivos:** `app/layouts/default.vue`, `tests/e2e/minicart-layout.spec.ts`
- **Fora do escopo:** botão Comprar (T-0612).
- **Depende de:** T-0606, T-0608, T-0610, T-0205 (layout padrão), T-0512 (filtro na página da categoria)

### [ ] T-0612 · O botão Comprar do card põe o pneu no carrinho

- **Requisito:** REQ-06-08
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/comprar-card.spec.ts` (computador), contra o mock
  - CA-06-01: Comprar no card do produto 3084 abre o minicart com "Adicionado: …", um item, R$ 502,55 e "Carrinho, 1 pneu"
  - CA-06-04: Comprar de novo no mesmo card mantém um item só e soma na quantidade (de 1 para 2)
  - Comprar em outro card acrescenta um segundo item
  - CA-06-09: "Continuar comprando" fecha o minicart e devolve o foco ao botão Comprar que foi usado
  - card de produto sem estoque não tem botão Comprar
  - o botão Comprar tem o fundo do token `--ts-acao`
- **Pronto quando:** `app/pages/c/[slug].vue` liga o evento `comprar` do `CardProduto` a `useCarrinho().comprar(produto)`; o `CardProduto` continua sem importar o contexto Carrinho.
- **Arquivos:** `app/pages/c/[slug].vue`, `layers/catalogo/ui/components/VitrineProdutos.vue`, `tests/e2e/comprar-card.spec.ts`
- **Fora do escopo:** Comprar da página de produto (módulo 04) e do Comparar (módulo 08); vitrine da Home (módulo 09).
- **Depende de:** T-0611, T-0313 (`CardProduto`), T-0316 (página da categoria)

### [ ] T-0613 · O carrinho funciona de ponta a ponta, no computador e no celular

- **Requisito:** REQ-06-03, REQ-06-07, REQ-06-09, REQ-06-10, REQ-06-13, REQ-06-14
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/carrinho.spec.ts` (projetos `computador` 1440 px e `celular` 390 px), contra o mock
  - CA-06-02: "Pôr mais um" leva a 2, com R$ 1.005,10 à vista e R$ 1.058,00 em 12x
  - CA-06-03: "Tirar um" travado em 1; "Pôr mais um" travado em 8, com o foco ainda no seletor
  - CA-06-05: "Remover" mostra "Pneu removido do carrinho." e o estado vazio; o cabeçalho diz "Carrinho, vazio"
  - CA-06-07: com a chamada de alteração interceptada para responder 500, a quantidade volta ao valor anterior e o erro aparece
  - CA-06-08: depois de recarregar e de trocar de página, a contagem volta; não há chave do carrinho em `localStorage` nem em `sessionStorage`
  - o foco fica preso no minicart; clique fora fecha
  - em 390 px, o minicart cabe na tela sem rolagem horizontal, e todos os botões têm pelo menos 44 px
  - `conferirInvariantes(page)` passa nos dois tamanhos, com o minicart aberto e com itens
- **Pronto quando:** o teste passa nos dois projetos; a cobertura de `layers/carrinho/domain` e `application` é de 90% ou mais.
- **Arquivos:** `tests/e2e/carrinho.spec.ts`
- **Fora do escopo:** checkout; página de loja física (o e2e do módulo 12 confere que lá não há minicart).
- **Depende de:** T-0612, T-0010

---

## Pendências

- **Subtotal por linha.** O protótipo mostra, em cada item, o preço à vista vezes a quantidade. O contrato não traz esse valor, e o frontend não calcula preço (antipadrão A8). A spec mostra só "R$ … à vista, cada". Se o cliente quiser o subtotal, pedir `itens[].subtotal` ao backend (mudança de contrato).
- **"com 5% de desconto".** O texto do total à vista no protótipo cita o percentual, mas `totais.aVista` não traz `descontoPercentual`. A spec mostra o total sem o percentual. Pedir o campo ao backend ou confirmar o texto fixo.
- **"Ir para o carrinho".** A página do carrinho e o checkout estão fora da entrega. O link usa `runtimeConfig.public.urlDoCarrinho`; falta o cliente dizer a URL.
- **Como a API diferencia as recusas (422).** O contrato diz que quantidade inválida e produto sem estoque dão 422. A T-0605 assume `erros[].campo` igual a `quantidade` ou `produtoId`. Validar com o TI.
- **Comprar com 8 unidades já no carrinho.** O protótipo trava em 8 em silêncio e ainda diz "Adicionado". Aqui o minicart abre com o erro de quantidade máxima. Confirmar o texto com o cliente.
- **Sessão e autenticação (D1).** O frontend assume cookie `HttpOnly` definido pelo backend na primeira chamada. Se for token, mudam o `ClienteHttp` e a T-0605.
- **Estado inicial do protótipo.** O protótipo abre com 2 pneus no carrinho, só para demonstração; aqui a sessão nova começa vazia, como diz o contrato.
- **Dados de base do mock.** `_base/produtos.json` tem o produto `4360` em estoque e uma entrada separada `4360-sem-estoque`, enquanto `produto-4360-sem-estoque.json` usa o id `4360` como sem estoque. A T-0606 usa `4360-sem-estoque`; alinhar com o módulo 04.
- **Leitor de `ProdutoResumo` publicado pelo Catálogo.** A T-0604 acrescenta `lerProdutoResumo` à API pública do Catálogo, para o Carrinho (e depois Lojas) ler o tipo sem conhecer o DTO. Registrar no `context-map.md` no fechamento.
- **Numeração do plugin.** Usamos `13.carrinho.ts`; a arquitetura só fixa `01.http`, `10.catalogo` e `11.lojas`.
- O contrato ganhou `itens[].subtotalAVista` (26/11), calculado pelo backend: o minicart pode voltar a mostrar o valor por linha, como no protótipo, sem o frontend somar preço. Incluir no schema da T-0604 e na linha do item da T-0609.
