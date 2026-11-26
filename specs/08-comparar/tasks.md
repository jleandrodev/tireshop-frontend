# Tasks 08 — Comparar pneus

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. Uma task por vez. Os valores dos casos vêm de `produtos-comparar.json`:
3084 Hankook (R$ 502,55 à vista, 91V, treadwear 320, nota 4,9), 3026 Bridgestone (R$ 498,75, 91W,
treadwear 380, nota 4,6) e 4223 Firestone (R$ 445,55, 91W, treadwear 200, nota 4,8), os três 225/45 R17.

---

### [ ] T-0801 · `Comparacao` guarda de 2 a 4 pneus, sem repetir

- **Requisito:** REQ-08-01, REQ-08-02
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/comparacao.spec.ts`
  - começa vazia; `podeComparar()` é falso com 0 e com 1, e verdadeiro com 2
  - `adicionar('3084')` duas vezes mantém um só
  - com 4 pneus, `estaCheia()` é verdadeiro e `adicionar` devolve `ComparacaoCheia`
  - `remover('3026')` mantém a ordem dos outros; `limpar()` esvazia
  - `contem('3084')` diz se o pneu está escolhido
  - `deTexto('3084,3026,3084, ,4223,1,2')` vira 3084, 3026, 4223 e 1: sem repetidos, sem vazios, só os 4 primeiros
  - `paraTexto()` devolve "3084,3026,4223"; vazia devolve texto vazio
  - cada operação devolve uma nova `Comparacao` (imutável)
- **Pronto quando:** `Comparacao` e `ComparacaoCheia` publicados em `layers/catalogo/index.ts`; o máximo (4) e o mínimo (2) são constantes com nome.
- **Arquivos:** `layers/catalogo/domain/comparacao.ts`, `comparacao.spec.ts`, `index.ts`
- **Fora do escopo:** ler a URL ou a sessão (T-0808, T-0810).
- **Depende de:** T-0101

### [ ] T-0802 · As linhas da tabela são montadas a partir dos produtos

- **Requisito:** REQ-08-07, REQ-08-12
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/linhas-da-comparacao.spec.ts`
  - gera as 15 linhas de valor, na ordem: preço à vista, parcelado, frete, medida, índice de carga, índice de velocidade, treadwear, tração, temperatura, construção, desenho, run flat, garantia, nota dos clientes e fotos em 360°
  - a célula do 3084 em "Preço à vista" traz "R$ 502,55"; em "Parcelado", "12x de R$ 44,08 sem juros" e "Total R$ 529,00"
  - "Índice de carga" traz "91: até 615 kg por pneu"; "Índice de velocidade", "V: até 240 km/h"
  - treadwear, tração, temperatura e construção saem de `ficha` pelo rótulo ("320", "A", "A", "Radial")
  - valor ausente (o desenho do 3026, um índice nulo) vira "—"
  - produto sem estoque tem "—" em preço à vista e em parcelado
  - cada célula traz, quando a linha é comparável, o valor numérico para a comparação (50255 centavos, 615 kg, 240 km/h, 320, 4,9)
- **Pronto quando:** `linhasDaComparacao(produtos)` é função pura e devolve rótulo, critério (`menor`, `maior` ou nenhum) e células na ordem dos produtos.
- **Arquivos:** `layers/catalogo/domain/linhas-da-comparacao.ts`, `linhas-da-comparacao.spec.ts`
- **Fora do escopo:** etiqueta do INMETRO e ações (são linhas fixas da tela, T-0812).
- **Depende de:** T-0401

### [ ] T-0803 · A comparação aponta o melhor valor, as linhas iguais e as medidas diferentes

- **Requisito:** REQ-08-08, REQ-08-09, REQ-08-10
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/analise-da-comparacao.spec.ts`
  - em "Preço à vista", o melhor é o 4223 (R$ 445,55, o menor)
  - em "Índice de velocidade", os melhores são 3026 e 4223 (empate em 270 km/h)
  - em "Treadwear", o melhor é o 3026 (380); em "Nota dos clientes", o 3084 (4,9)
  - em "Índice de carga" (615 kg nos três), ninguém é o melhor
  - célula sem valor ("—") nunca é a melhor e não derruba a conta
  - `linhasIguais` marca frete, medida, índice de carga, construção, run flat, garantia e fotos em 360°, e não marca o preço
  - `medidasDiferentes` é falso para os três de 225/45 R17 e verdadeiro ao trocar um por um 205/55 R17
- **Pronto quando:** `melhorPorLinha`, `linhasIguais` e `medidasDiferentes` são funções puras sobre o resultado da T-0802; o texto do aviso de medidas é uma constante do domínio.
- **Arquivos:** `layers/catalogo/domain/analise-da-comparacao.ts`, `analise-da-comparacao.spec.ts`
- **Fora do escopo:** esconder linha na tela (T-0812).
- **Depende de:** T-0802

### [ ] T-0804 · O resumo "Qual escolher?" indica três destaques

- **Requisito:** REQ-08-13
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/resumo-da-comparacao.spec.ts`
  - "Menor preço" aponta o 4223, com "R$ 445,55 à vista"
  - "Melhor avaliado" aponta o 3084, com "4,9 de 5"
  - "Maior índice de carga" com empate aponta o primeiro da ordem escolhida (3084), com "até 615 kg"
  - produto sem estoque não concorre ao menor preço; produto sem avaliação não concorre ao melhor avaliado
  - com menos de 2 produtos, o resumo é vazio
  - o resumo vem marcado como `ilustrativo`
- **Pronto quando:** `resumoDaComparacao(produtos)` é função pura; a regra é a do protótipo, registrada como premissa (dúvida D5).
- **Arquivos:** `layers/catalogo/domain/resumo-da-comparacao.ts`, `resumo-da-comparacao.spec.ts`
- **Fora do escopo:** regra editorial do cliente.
- **Depende de:** T-0401

### [ ] T-0805 · Caso de uso `compararProdutos`

- **Requisito:** REQ-08-01, REQ-08-17
- **Camada:** aplicação
- **Teste primeiro:** `layers/catalogo/application/comparar-produtos.spec.ts` (com `ProdutoRepositoryFalso`)
  - com 3084, 3026 e 4223, devolve os três `Produto` na ordem pedida, mesmo que a porta devolva em outra
  - com 1 código, devolve `ComparacaoInsuficiente` e **não** chama a porta
  - nunca pede mais de 4 códigos à porta
  - código que a porta não devolve (9999) entra em `naoEncontrados`, e os outros vêm normalmente
  - se sobrar só 1 produto, devolve sucesso com 1 (a tela mostra o estado de menos de 2)
  - erro de rede sai como `Result` de falha, sem lançar
- **Pronto quando:** `criarCompararProdutos(produtos)` devolve `{ produtos, naoEncontrados }`; o falso ganha `porIds`.
- **Arquivos:** `layers/catalogo/application/comparar-produtos.ts`, `comparar-produtos.spec.ts`, `application/__falsos__/produto-repository-falso.ts`
- **Fora do escopo:** linhas e realces (já são do domínio).
- **Depende de:** T-0801, T-0401, T-0306

### [ ] T-0806 · Caso de uso `listarCandidatos`, a lista do seletor

- **Requisito:** REQ-08-03
- **Camada:** aplicação
- **Teste primeiro:** `layers/catalogo/application/listar-candidatos.spec.ts` (com `ProdutoRepositoryFalso`)
  - com a medida "225/45 R17", pede à porta essa medida, sem categoria, com 48 por página
  - repassa marca e faixa de preço quando escolhidas; filtro vazio não é enviado
  - devolve os itens (`ProdutoResumo`) e as opções dos três filtros, tiradas das facetas `medida`, `marca` e `preco`
  - opção de faceta com total 0 não vira opção de filtro
  - lista vazia é sucesso, com as opções
  - erro da porta sai como `Result` de falha
- **Pronto quando:** `criarListarCandidatos(produtos)`; o tamanho 48 é uma constante com nome; `listarProdutos` (12 por página) não é alterado.
- **Arquivos:** `layers/catalogo/application/listar-candidatos.ts`, `listar-candidatos.spec.ts`, `layers/catalogo/domain/criterio-de-listagem.ts` (critério de seletor), `criterio-de-listagem.spec.ts`
- **Fora do escopo:** paginar a lista do seletor (acima de 48, fica a pendência).
- **Depende de:** T-0306, T-0303

### [ ] T-0807 · `HttpProdutoRepository.porIds` busca os produtos da comparação

- **Requisito:** REQ-08-17
- **Camada:** adaptador
- **Teste primeiro:** `layers/catalogo/adapters/http/http-produto-repository.spec.ts` (com `ClienteHttp` falso)
  - `porIds(['3084','3026','4223'])` faz `GET /produtos/comparar?ids=3084,3026,4223`, com vírgula e sem repetir o parâmetro
  - `produtos-comparar.json` vira 3 `Produto`, na ordem recebida
  - resposta com 2 itens para 3 códigos pedidos é aceita (código inexistente é omitido)
  - 422 vira `ErroDeValidacao`
  - resposta fora do contrato vira `ErroDeContrato`; falha de rede, `ErroDeRede`
- **Pronto quando:** `ProdutosParaCompararSchema` reaproveita o `ProdutoSchema`; a porta está completa.
- **Arquivos:** `layers/catalogo/adapters/http/produtos-para-comparar.schema.ts`, `http-produto-repository.ts`, `http-produto-repository.spec.ts`
- **Fora do escopo:** o seletor (usa `listar`, que já existe).
- **Depende de:** T-0805, T-0409

### [ ] T-0808 · A escolha é guardada na sessão do navegador

- **Requisito:** REQ-08-02
- **Camada:** adaptador
- **Teste primeiro:** `layers/catalogo/adapters/sessao/comparacao-session-store.spec.ts`
  - `gravar(['3084','4223'])` e `ler()` devolvem os mesmos códigos, na ordem
  - `ler()` sem nada gravado devolve lista vazia
  - conteúdo corrompido (texto que não é lista) devolve lista vazia, sem lançar
  - no servidor (sem `sessionStorage`), `ler()` devolve lista vazia e `gravar` não faz nada
  - `sessionStorage` bloqueado (lança ao acessar) não derruba: devolve lista vazia
  - só códigos de produto são gravados, sob a chave `ts-comparar`; nada vai para `localStorage`
- **Pronto quando:** implementa a porta `ComparacaoStore` do domínio (`ler`, `gravar`).
- **Arquivos:** `layers/catalogo/domain/portas.ts`, `layers/catalogo/adapters/sessao/comparacao-session-store.ts`, `comparacao-session-store.spec.ts`
- **Fora do escopo:** sincronia com a URL (T-0810).
- **Depende de:** T-0801

### [ ] T-0809 · O mock de `/produtos/comparar` devolve os produtos na ordem pedida

- **Requisito:** REQ-08-17
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/produtos/comparar.get.spec.ts`
  - `?ids=3084,3026,4223` devolve os 3 produtos completos, nessa ordem
  - `?ids=4223,3084` devolve na ordem 4223, 3084
  - `?ids=3084,9999,4223` omite o 9999 e devolve 2
  - `?ids=3084` e 5 códigos devolvem 422 em `problem+json`
  - `/produtos/comparar` não é confundido com `/produtos/{id}`
  - a resposta valida no `ProdutosParaCompararSchema`
- **Pronto quando:** a rota lê `mocks/fixtures/_base/produtos.json`; `?_falha` e `?_atraso` funcionam.
- **Arquivos:** `server/api/mock/produtos/comparar.get.ts`, `comparar.get.spec.ts`, `server/utils/mock-catalogo.ts`
- **Fora do escopo:** `/produtos` com `medida`, `marca`, `preco` e `porPagina=48` (já é da T-0311; ver Pendências).
- **Depende de:** T-0008, T-0413, T-0807

### [ ] T-0810 · `useComparacao` mantém escolha, URL, sessão e tabela em sincronia

- **Requisito:** REQ-08-02, REQ-08-04, REQ-08-05, REQ-08-14, REQ-08-17
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/composables/use-comparacao.spec.ts` (ambiente Nuxt, casos de uso e `ComparacaoStore` falsos)
  - com `?p=3084,3026` na URL, a escolha é essa, e ela é gravada na sessão
  - sem `?p` e com 3084 e 4223 na sessão, a escolha vem da sessão e a URL ganha `?p=3084,4223` com `router.replace`
  - `alternar('4223')` marca; de novo, desmarca; com 4 escolhidos, marcar um quinto não muda nada e `estaCheia` é verdadeiro
  - `limpar()` esvazia a escolha, a sessão e o `?p`
  - com 2 ou mais, chama `compararProdutos` e expõe `produtos`, `linhas`, `melhores`, `iguais`, `avisoDeMedidas` e `resumo`; com menos de 2, não chama
  - com 1 escolhido, busca esse produto (`obterProduto`) para o nome da etiqueta e a medida inicial do seletor
  - código que volta em `naoEncontrados` sai da escolha e da URL
  - expõe `estado` da tabela (`carregando`, `sucesso`, `vazio`, `erro`), mantém a tabela anterior enquanto atualiza e tem `tentarDeNovo()`
- **Pronto quando:** a store Pinia `useSelecaoComparacao` guarda **só os códigos** (ADR 0007); a sessão é lida depois de montar no cliente (sem divergência de hidratação); `app/plugins/10.catalogo.ts` liga `compararProdutos`, `listarCandidatos` e o `ComparacaoSessionStore`.
- **Arquivos:** `layers/catalogo/ui/stores/selecao-comparacao.ts`, `layers/catalogo/ui/composables/use-comparacao.ts`, `use-comparacao.spec.ts`, `use-catalogo.ts`, `app/plugins/10.catalogo.ts`, `layers/catalogo/index.ts`
- **Fora do escopo:** componentes.
- **Depende de:** T-0803, T-0804, T-0806, T-0807, T-0808, T-0312, T-0416

### [ ] T-0811 · `SeletorDeComparacao` filtra, marca e mostra os escolhidos

- **Requisito:** REQ-08-03, REQ-08-04, REQ-08-05
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/SeletorDeComparacao.spec.ts`
  - há o H2 "1. Escolha os pneus" e três `select` com `label`: Medida, Marca e Preço à vista, com "Todas as medidas", "Todas as marcas" e "Qualquer preço"
  - mudar um filtro emite `filtrar` com os três valores
  - cada item mostra a foto (64×57, `alt` vazio), "Hankook · 225/45 R17", o nome sem "Pneu " e "R$ 502,55 à vista · nota 4,9"
  - o item escolhido vem marcado; marcar ou desmarcar emite `alternar` com o código
  - com 4 escolhidos, as caixas dos outros ficam com `disabled`, e as dos escolhidos, não
  - mostra "3 de 4 escolhidos" em `role="status"` e uma etiqueta por escolhido, com o botão "×" e `aria-label` "Remover {nome} da comparação"
  - "Limpar a escolha" emite `limpar`
  - sem itens, mostra "Nenhum pneu com esses filtros. Mude a medida, a marca ou o preço."; em erro, a mensagem com "Tentar de novo"
- **Pronto quando:** componente sem busca própria; usa as classes `ts-seletor*`; cada `label` de item tem pelo menos 44 px.
- **Arquivos:** `layers/catalogo/ui/components/SeletorDeComparacao.vue`, `SeletorDeComparacao.spec.ts`
- **Fora do escopo:** busca por texto no seletor.
- **Depende de:** T-0801, T-0303

### [ ] T-0812 · `TabelaComparativa` mostra os pneus lado a lado, com realce e "Só as diferenças"

- **Requisito:** REQ-08-06, REQ-08-07, REQ-08-08, REQ-08-09, REQ-08-11, REQ-08-12
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/TabelaComparativa.spec.ts`
  - a tabela tem `caption`, um `th scope="col"` por pneu (foto, marca, nome com link para `rotas.produto` e "Remover") e um `th scope="row"` por linha
  - "Remover" emite `remover` com o código e tem `aria-label` com o nome do pneu
  - a célula de melhor valor leva a classe de realce e o texto "melhor valor" para leitor de tela; a legenda "Melhor valor da linha" aparece
  - com a chave "Só as diferenças" ligada, as linhas iguais não são renderizadas; a etiqueta do INMETRO e as ações continuam
  - a etiqueta do INMETRO é uma imagem com `alt` "Etiqueta do INMETRO do {nome}", `width`, `height` e `loading="lazy"`, dentro de um link para `#inmetro` do produto; sem etiqueta, "—"
  - cada coluna termina com "Ver produto" (link) e "Comprar" (emite `comprar` com o código, `aria-label` com o nome)
  - pneu sem estoque: sem Comprar, com "Avise-me" levando ao produto
  - o bloco que rola é focável e tem rótulo
- **Pronto quando:** usa as classes `ts-comp*` e `ts-comparar__rolagem`; recebe linhas, melhores e iguais por `props` (não calcula nada).
- **Arquivos:** `layers/catalogo/ui/components/TabelaComparativa.vue`, `TabelaComparativa.spec.ts`
- **Fora do escopo:** adicionar ao carrinho (a página liga, T-0814).
- **Depende de:** T-0803, T-0105

### [ ] T-0813 · `ResumoComparacao` é o acordeão "Para decidir"

- **Requisito:** REQ-08-13
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/ResumoComparacao.spec.ts`
  - há o H2 "Para decidir" e duas perguntas em H3, cada uma com um botão: "Qual escolher?" e "Como ler esta tabela"
  - "Qual escolher?" lista "Menor preço:", "Melhor avaliado:" e "Maior índice de carga:", com o nome do pneu e o valor
  - mostra a nota "Resumo ilustrativo, calculado só sobre os pneus escolhidos."
  - "Como ler esta tabela" explica o realce, o treadwear, a tração, a temperatura e os índices mínimos do manual
  - os dois itens abrem e fecham pelo teclado, com `aria-expanded`
  - com o resumo vazio, o componente não é renderizado
- **Pronto quando:** usa o `Acordeao` de `shared/ui`; o texto de "Como ler esta tabela" é fixo do componente.
- **Arquivos:** `layers/catalogo/ui/components/ResumoComparacao.vue`, `ResumoComparacao.spec.ts`
- **Fora do escopo:** regra editorial (dúvida D5).
- **Depende de:** T-0804, T-0109

### [ ] T-0814 · A página Comparar monta seletor, tabela e "Para decidir"

- **Requisito:** REQ-08-02, REQ-08-10, REQ-08-12, REQ-08-14, REQ-08-16, REQ-08-17
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/comparar.spec.ts` (computador), contra o mock
  - CA-08-01 (HTML do servidor, JavaScript desligado), CA-08-02 e CA-08-03
  - CA-08-04, CA-08-05, CA-08-06 e CA-08-07
  - CA-08-08 (aviso de medidas diferentes) e CA-08-09 (a escolha volta da sessão)
  - CA-08-11: "Qual escolher?" com os três destaques e o acordeão centralizado
  - `?p=3084,9999,4223` mostra 2 colunas e corrige a URL para `?p=3084,4223`
  - com `?_falha=500` em `/produtos/comparar`, o seletor continua usável e a tabela mostra "Tentar de novo"
  - Comprar em uma coluna adiciona 1 unidade daquele pneu e abre o minicart
  - a página tem migalhas, o lugar do filtro compacto, `<title>` "Comparar pneus | TireShop", canônica `/comparar` e `noindex` quando há `?p`; não tem banner nem faixa de avaliações
- **Pronto quando:** `app/pages/comparar.vue` usa `useComparacao`; carrega `comparar.css` só nesta página; os metadados vêm de uma função pura em `application/metadados-do-comparar.ts`, com teste ao lado.
- **Arquivos:** `app/pages/comparar.vue`, `layers/catalogo/application/metadados-do-comparar.ts`, `metadados-do-comparar.spec.ts`, `tests/e2e/comparar.spec.ts`
- **Fora do escopo:** celular e entradas (T-0815).
- **Depende de:** T-0809, T-0810, T-0811, T-0812, T-0813, T-0113, T-0116, T-0106, T-0205, módulo 05 (FiltroPneus, variante compacta), módulo 06 (useCarrinho)

### [ ] T-0815 · O Comparar passa nos invariantes, no celular e nas entradas

- **Requisito:** REQ-08-06, REQ-08-13, REQ-08-15
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/comparar-invariantes.spec.ts` (projetos `computador` 1440 e `celular` 390)
  - `conferirInvariantes(page)` passa com 3 pneus, com 1 pneu (estado de menos de 2) e sem nenhum
  - regras de `_comparar` do `verify.py`: de 2 a 4 colunas; primeira coluna com `position: sticky`; ao menos um melhor valor realçado; etiqueta do INMETRO presente; 3 filtros; a lista abre com 2 pneus ou mais; etiquetas batem com as colunas
  - em 390: CA-08-10 (só a tabela rola, a primeira coluna fica parada, botões com 44 px, sem rolagem horizontal da página)
  - em 1440: acordeão "Para decidir" com desvio de centro de até 2 px
  - CA-08-12: nenhum card da listagem `/c/pneus-para-carros` tem caixa "Comparar", e não existe bandeja
  - na página do 3084, "Comparar com outros pneus" abre `/comparar?p=3084` com o pneu marcado; no rodapé, "Comparar pneus" abre `/comparar`
  - fluxo completo no celular: produto 3084 → Comparar → marcar o Firestone → ligar "Só as diferenças" → Comprar o Firestone
- **Pronto quando:** o arquivo roda nos dois projetos do Playwright; regressão visual de `/comparar?p=3084,3026,4223` dentro da tolerância.
- **Arquivos:** `tests/e2e/comparar-invariantes.spec.ts`
- **Fora do escopo:** —
- **Depende de:** T-0814, T-0425, T-0316, T-0010

---

## Pendências

- **D5 do PRD.** Linhas finais da tabela, INMETRO em notas de A a G e a regra do "Qual escolher". Hoje as linhas seguem a ficha do site e o resumo é ilustrativo.
- **Máximo de 4 e medidas diferentes.** O protótipo aceita medidas diferentes, com aviso. Pergunta 4 da seção 8 do `09-paginas-internas.md`, ainda sem resposta do cliente.
- **12 × 48 por página.** `catalogo.md` diz que `listarProdutos` nunca pede mais de 12, e `endpoints/catalogo.md` manda o seletor pedir `porPagina=48`. Resolvemos com um caso de uso próprio (`listarCandidatos`, T-0806). Com mais de 48 pneus numa medida, o seletor precisa de "ver mais" ou de busca.
- **Mock de `/produtos` com `porPagina=48`.** A T-0311 não lista esse caso. Se o mock limitar a 12, a T-0814 falha: acrescentar o caso lá (`?medida=225/45 R17&porPagina=48` devolve 6).
- **Linha "Frete e prazo".** O protótipo mostrava "Chega em 3 a 5 dias úteis (simulação por CEP)" em todas as colunas. Aqui a linha é só "Frete" (regra de frete grátis do produto): o prazo depende de CEP e é do contexto Entrega.
- **Comparação padrão.** O protótipo abria com 3084, 3026 e 4223 quando não havia escolha. Na aplicação, sem `?p` e sem sessão, a página abre vazia, com o seletor em "Todas as medidas".
- **Texto do estado vazio.** O protótipo dizia 'ou use "Comparar" nos pneus da listagem', o que contradiz o pedido de 23/11 (não há caixa nos cards). O texto ficou só "Marque os pneus na lista acima."; confirmar com o cliente.
- **Texto do cabeçalho.** "Compare de 2 a 4 pneus da mesma medida" convive com o aviso de medidas diferentes. Rever junto com a pergunta 4.
- **`noindex` com `?p`.** Premissa nossa; validar com a liveSEO.
- **Sem estoque no Comparar.** O protótipo não previa. Premissa: preço "—", fora do melhor preço e "Avise-me" no lugar do Comprar.
- **Campos próprios para treadwear, tração, temperatura e construção.** Hoje lidos de `ficha` pelo rótulo, o que quebra se o rótulo mudar. `endpoints/catalogo.md` já oferece campos próprios: vale aceitar.
