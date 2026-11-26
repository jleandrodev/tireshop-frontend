# Tasks 07 — Avaliações

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. Uma task por vez. Os valores dos casos vêm de `avaliacoes-resumo.json`
(loja: nota 4,8, 12.400 avaliações, 4 destaques), `produto-3084-avaliacoes-resumo.json` (nota 4,9,
31 avaliações, 6 destaques) e `produto-3084-avaliacoes.json` (5 itens a partir da 7ª).

---

### [ ] T-0701 · `Nota` vai de 1 a 5 e sabe virar estrelas

- **Requisito:** REQ-07-01
- **Camada:** domínio
- **Teste primeiro:** `layers/avaliacoes/domain/nota.spec.ts`
  - cria 4,9 e 5; recusa 0, 5,1 e valor que não é número (`NotaInvalida`)
  - guarda uma casa decimal: 4,86 vira 4,9
  - `formatada` devolve "4,9" (vírgula) e "5,0" para 5
  - `estrelasCheias()` arredonda: 4,9 dá 5; 4,4 dá 4; 4,5 dá 5
  - duas notas com o mesmo valor são iguais
- **Pronto quando:** `Nota.criar` devolve `Result<Nota, NotaInvalida>`; classe imutável, publicada em `layers/avaliacoes/index.ts`.
- **Arquivos:** `layers/avaliacoes/domain/nota.ts`, `nota.spec.ts`, `layers/avaliacoes/index.ts`
- **Fora do escopo:** desenhar estrelas (T-0708).
- **Depende de:** T-0101

### [ ] T-0702 · `Avaliacao` e `ResumoAvaliacoes` guardam o que a tela mostra

- **Requisito:** REQ-07-03, REQ-07-04, REQ-07-06
- **Camada:** domínio
- **Teste primeiro:** `layers/avaliacoes/domain/avaliacao.spec.ts`
  - cria a avaliação de "Rafael J.", iniciais "RJ", "Sorocaba, SP", 03/08/2026, nota 5
  - recusa iniciais vazias ou com 3 letras; aceita 1 letra ("C")
  - cidade nula é aceita, e `local()` devolve nada
  - a nota de uma avaliação é inteira; 4,5 é recusada
  - `ResumoAvaliacoes` recusa `total` negativo
  - `temAvaliacoes()` é falso com `total` 0
  - `temListaCompleta()` é verdadeiro com 31 avaliações e 6 destaques, e falso quando o total não passa dos destaques
  - as fábricas `umaAvaliacao()` e `umResumo()` criam válidos e aceitam sobrescritas
- **Pronto quando:** tipos imutáveis; `ilustrativo` é guardado no resumo, só como informação.
- **Arquivos:** `layers/avaliacoes/domain/avaliacao.ts`, `avaliacao.spec.ts`, `resumo-avaliacoes.ts`, `__fabricas__/avaliacao.ts`
- **Fora do escopo:** formatação da data (é de `shared/formatacao`).
- **Depende de:** T-0701

### [ ] T-0703 · Casos de uso `obterResumoDaLoja` e `obterResumoDoProduto`

- **Requisito:** REQ-07-02, REQ-07-03, REQ-07-07
- **Camada:** aplicação
- **Teste primeiro:** `layers/avaliacoes/application/obter-resumo.spec.ts` (com `AvaliacoesGatewayFalso`)
  - `obterResumoDaLoja()` devolve a nota 4,8, o total 12.400 e os 4 destaques
  - `obterResumoDoProduto('3084')` devolve a nota 4,9, o total 31 e 6 destaques
  - se a porta mandar 8 destaques para o produto, o caso de uso entrega só os 6 primeiros
  - produto sem avaliações devolve sucesso com `total` 0 e nenhum destaque
  - código de produto vazio é recusado sem chamar a porta
  - erro de rede sai como `Result` de falha, sem lançar
- **Pronto quando:** `AvaliacoesGateway` (com os três métodos) declarado em `domain/portas.ts`; `ErroDeAvaliacoes` tipado; falso em `application/__falsos__/`.
- **Arquivos:** `layers/avaliacoes/domain/portas.ts`, `application/obter-resumo-da-loja.ts`, `obter-resumo-do-produto.ts`, `obter-resumo.spec.ts`, `application/__falsos__/avaliacoes-gateway-falso.ts`
- **Fora do escopo:** a lista paginada (T-0704).
- **Depende de:** T-0702

### [ ] T-0704 · Caso de uso `listarAvaliacoesDoProduto`, de 5 em 5 a partir da 7ª

- **Requisito:** REQ-07-04, REQ-07-05
- **Camada:** aplicação
- **Teste primeiro:** `layers/avaliacoes/application/listar-avaliacoes-do-produto.spec.ts`
  - a página 1 do produto "3084" devolve 5 avaliações e o total 31
  - `restantes(31, 5)` é 20; `restantes(31, 25)` é 0 (o carrossel fica com 6)
  - `temMais` é verdadeiro com 20 restantes e falso com 0
  - página 0 ou negativa é recusada sem chamar a porta
  - página além da última devolve lista vazia, com sucesso
  - erro da porta sai como `Result` de falha
- **Pronto quando:** as constantes "6 no carrossel" e "5 por vez" têm nome e ficam no domínio (`fatia-de-avaliacoes.ts`); a conta de restantes é função pura.
- **Arquivos:** `layers/avaliacoes/domain/fatia-de-avaliacoes.ts`, `fatia-de-avaliacoes.spec.ts`, `application/listar-avaliacoes-do-produto.ts`, `listar-avaliacoes-do-produto.spec.ts`
- **Fora do escopo:** `deslocamento` e `limite` (são do adaptador, T-0706).
- **Depende de:** T-0703

### [ ] T-0705 · Os schemas e os mappers de avaliações entendem a API

- **Requisito:** REQ-07-02, REQ-07-03, REQ-07-04
- **Camada:** adaptador
- **Teste primeiro:** `layers/avaliacoes/adapters/http/avaliacoes.mapper.spec.ts`
  - `avaliacoes-resumo.json` valida e vira `ResumoAvaliacoes` com 4 destaques
  - `produto-3084-avaliacoes-resumo.json` vira resumo com nota 4,9 e 6 destaques
  - `produto-3084-avaliacoes.json` vira 5 avaliações, com total 31
  - `cidade: null` vira avaliação sem cidade; `data` em ISO vira data
  - nota 6 ou iniciais com 3 letras são recusadas pelo schema, com o caminho do campo
  - `{ nota, total: 0, destaques: [] }` é aceito
  - campo desconhecido é ignorado
- **Pronto quando:** `ResumoDeAvaliacoesSchema`, `FatiaDeAvaliacoesSchema` e os mappers são funções puras; o DTO não sai de `adapters/`.
- **Arquivos:** `layers/avaliacoes/adapters/http/avaliacoes.schema.ts`, `avaliacoes.mapper.ts`, `avaliacoes.mapper.spec.ts`
- **Fora do escopo:** chamada HTTP (T-0706).
- **Depende de:** T-0702, T-0103

### [ ] T-0706 · `HttpAvaliacoesGateway` chama os três endpoints

- **Requisito:** REQ-07-07, REQ-07-09
- **Camada:** adaptador
- **Teste primeiro:** `layers/avaliacoes/adapters/http/http-avaliacoes-gateway.spec.ts` (com `ClienteHttp` falso)
  - `resumoDaLoja()` faz `GET /avaliacoes/resumo`
  - `resumoDoProduto('3084')` faz `GET /produtos/3084/avaliacoes/resumo`
  - `doProduto('3084', 1)` pede `deslocamento=6&limite=5`; a página 3 pede `deslocamento=16&limite=5`
  - a resposta da página vira `Pagina<Avaliacao>` com `total` 31
  - 404 do produto vira lista vazia com `total` 0 (a seção some, não é erro de tela)
  - resposta fora do contrato vira `ErroDeContrato`; falha de rede e 5xx, `ErroDeRede`
  - toda chamada usa o `apiBase` do `ClienteHttp`; nenhum outro domínio é chamado
- **Pronto quando:** a porta está implementada inteira; não há referência à Trustvox no código.
- **Arquivos:** `layers/avaliacoes/adapters/http/http-avaliacoes-gateway.ts`, `http-avaliacoes-gateway.spec.ts`
- **Fora do escopo:** adaptador para o widget da Trustvox (dúvida D4).
- **Depende de:** T-0704, T-0705

### [ ] T-0707 · O mock serve o resumo da loja, o resumo do produto e a lista em fatias

- **Requisito:** REQ-07-04, REQ-07-05, REQ-07-06
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/avaliacoes/resumo.get.spec.ts` e `server/api/mock/produtos/[id]/avaliacoes.get.spec.ts`
  - `GET /api/mock/avaliacoes/resumo` devolve `avaliacoes-resumo.json`
  - `/produtos/3084/avaliacoes/resumo` devolve nota 4,9, total 31 e 6 destaques
  - `/produtos/3084/avaliacoes?deslocamento=6&limite=5` devolve os 5 itens da fixture, o primeiro com id `3084-7`
  - `deslocamento=26&limite=5` devolve os 5 últimos; `deslocamento=31` devolve `itens: []` com `total` 31
  - `limite=60` devolve 422
  - produto inexistente (`9999`) devolve 404 nos dois endpoints de produto
  - as respostas validam nos schemas e trazem `ilustrativo: true`
- **Pronto quando:** para o 3084, as fixtures são servidas como estão; para os outros produtos, o total é o `avaliacao.total` do produto e os depoimentos repetem os das fixtures em ordem fixa (sem aleatoriedade); `?_falha` e `?_atraso` funcionam nas três rotas.
- **Arquivos:** `server/api/mock/avaliacoes/resumo.get.ts`, `server/api/mock/produtos/[id]/avaliacoes/resumo.get.ts`, `server/api/mock/produtos/[id]/avaliacoes/index.get.ts`, `server/utils/mock-avaliacoes.ts`, os `.spec.ts`
- **Fora do escopo:** integração com a Trustvox.
- **Depende de:** T-0008, T-0706

### [ ] T-0708 · `FaixaAvaliacoes` mostra a nota e os depoimentos, inteira ou embutida

- **Requisito:** REQ-07-02, REQ-07-03
- **Camada:** ui
- **Teste primeiro:** `layers/avaliacoes/ui/components/FaixaAvaliacoes.spec.ts`
  - na variante padrão há uma `section` com o H2 "O que dizem os clientes", "4,8" e "de 5"
  - a legenda padrão é "Média de 12.400 avaliações de compras verificadas, pela Trustvox."
  - na variante embutida não há `section` nem H2 próprios, e a legenda é a recebida ("31 avaliações de compras verificadas, pela Trustvox.")
  - cada depoimento é um `figure` com as estrelas ("5 de 5 estrelas"), o texto em `blockquote` e o autor em `figcaption`
  - com 6 destaques, o trilho tem 6 itens e o rótulo "Depoimentos"; as setas têm rótulo
  - as estrelas da nota geral seguem `estrelasCheias()` e são decorativas
  - sem destaques, o carrossel não é renderizado
- **Pronto quando:** usa o `Carrossel` de `shared/ui` e as classes `ts-reputacao`, `ts-nota` e `ts-depoimento`; recebe o `ResumoAvaliacoes` por `props` e não busca nada.
- **Arquivos:** `layers/avaliacoes/ui/components/FaixaAvaliacoes.vue`, `FaixaAvaliacoes.spec.ts`
- **Fora do escopo:** colocar a faixa nas páginas (módulos 09, 10 e 12).
- **Depende de:** T-0702, T-0111

### [ ] T-0709 · `ListaAvaliacoes` mostra 5 por vez e conta quantas restam

- **Requisito:** REQ-07-04, REQ-07-05
- **Camada:** ui
- **Teste primeiro:** `layers/avaliacoes/ui/components/ListaAvaliacoes.spec.ts`
  - há o H3 "Todas as avaliações" e uma `ol` com 5 itens
  - cada item tem o avatar "RJ" com `aria-hidden`, o nome, "Sorocaba, SP · 03/08/2026" com `time datetime="2026-08-03"`, as estrelas e o comentário
  - avaliação sem cidade mostra só a data
  - com 20 restantes, o botão diz "Ver mais avaliações (restam 20)" e emite `mais`
  - com 0 restantes, o botão não existe
  - enquanto carrega, o botão fica desativado; com erro no "Ver mais", a lista continua e a mensagem aparece ao lado do botão
  - quando chegam novas avaliações, o foco vai à primeira nova
- **Pronto quando:** componente sem busca própria (recebe itens, restantes e estado); o texto da avaliação nunca usa `v-html`; usa as classes `ts-avaliacoes*` e `ts-avaliacao*`.
- **Arquivos:** `layers/avaliacoes/ui/components/ListaAvaliacoes.vue`, `ListaAvaliacoes.spec.ts`
- **Fora do escopo:** filtro por nota e ordenação.
- **Depende de:** T-0704

### [ ] T-0710 · O contexto Avaliações é ligado, e `useAvaliacoesDoProduto` acumula as fatias

- **Requisito:** REQ-07-05, REQ-07-07, REQ-07-10
- **Camada:** ui
- **Teste primeiro:** `layers/avaliacoes/ui/composables/use-avaliacoes-do-produto.spec.ts` (ambiente Nuxt, gateway falso)
  - `useAvaliacoes()` devolve os três casos de uso prontos; com o provedor trocado, usa o falso
  - ao abrir, busca o resumo e a página 1 e expõe `resumo`, `itens` (5), `restantes` (20) e `estado`
  - `verMais()` busca a página 2 e **acrescenta**: 10 itens, 15 restantes
  - `verMais()` não dispara outra chamada enquanto a anterior não volta
  - erro no resumo põe `estado` em `erro`; erro no `verMais()` mantém os itens e expõe `erroAoCarregarMais`
  - `tentarDeNovo()` refaz a última chamada que falhou
  - a chave do `useAsyncData` leva o código do produto (sem avaliações trocadas entre produtos)
  - `useResumoDaLoja()` expõe o resumo da loja e `estado`, para as páginas que usam a faixa
- **Pronto quando:** `app/plugins/14.avaliacoes.ts` é o único lugar que instancia `HttpAvaliacoesGateway`; nada de avaliações vai para store (ADR 0007); as buscas não bloqueiam a renderização da página.
- **Arquivos:** `app/plugins/14.avaliacoes.ts`, `layers/avaliacoes/ui/composables/use-avaliacoes.ts`, `use-avaliacoes-do-produto.ts`, `use-resumo-da-loja.ts`, os `.spec.ts`, `layers/avaliacoes/index.ts`
- **Fora do escopo:** componentes.
- **Depende de:** T-0706

### [ ] T-0711 · A página de produto ganha a seção de avaliações

- **Requisito:** REQ-07-03, REQ-07-04, REQ-07-05, REQ-07-06, REQ-07-07, REQ-07-08, REQ-07-10
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/avaliacoes-produto.spec.ts` (computador), contra o mock
  - CA-07-01, CA-07-02 e CA-07-03
  - CA-07-04: as estrelas do título rolam até `#avaliacoes-produto`
  - CA-07-05: com `?_falha=500` no resumo, a página responde 200 e a seção mostra "Tentar de novo"; com a falha só na lista, o "Ver mais" mantém as 5 avaliações
  - CA-07-07: produto com `total` 0 não tem a seção, a âncora nem as estrelas
  - com `?_atraso=1500` nas avaliações, o H1 e o preço já estão no HTML do servidor
  - nenhum pedido de rede sai para domínio de terceiro e não há `iframe` na página
- **Pronto quando:** `SecaoAvaliacoesProduto` usa `useAvaliacoesDoProduto`, `FaixaAvaliacoes` (embutida) e `ListaAvaliacoes`, e entra no encaixe que a página de produto reservou (T-0426), sem a página importar caminho interno do contexto.
- **Arquivos:** `layers/avaliacoes/ui/components/SecaoAvaliacoesProduto.vue`, `SecaoAvaliacoesProduto.spec.ts`, `app/pages/p/[id]/[[slug]].vue`, `tests/e2e/avaliacoes-produto.spec.ts`
- **Fora do escopo:** a faixa nas outras páginas.
- **Depende de:** T-0707, T-0708, T-0709, T-0710, T-0426, T-0113

### [ ] T-0712 · As avaliações passam nos invariantes, no computador e no celular

- **Requisito:** REQ-07-03, REQ-07-04, REQ-07-05, REQ-07-07
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/avaliacoes-invariantes.spec.ts` (projetos `computador` 1440 e `celular` 390), nos produtos 3084 e 3016
  - `conferirInvariantes(page)` passa com a seção carregada e de novo depois de dois "Ver mais"
  - regras de `_produto` do `verify.py`: o carrossel tem exatamente 6 depoimentos; a lista abre com no máximo 5; cada "Ver mais" mostra mais 5, até o total
  - em 390: CA-07-06 (botão em largura total, nota acima do carrossel, sem rolagem horizontal)
  - em 1440: a seção fica na coluna de 900 px, centralizada, com dois depoimentos visíveis
  - o carrossel não anda sozinho em 6 segundos; as setas e o teclado movem o trilho
  - o botão "Ver mais" e as setas têm pelo menos 44 px
- **Pronto quando:** o arquivo roda nos dois projetos do Playwright; o `produto-invariantes.spec.ts` do módulo 04 continua verde com a seção preenchida.
- **Arquivos:** `tests/e2e/avaliacoes-invariantes.spec.ts`
- **Fora do escopo:** a faixa na Home (o e2e dela é do módulo 09).
- **Depende de:** T-0711, T-0010

---

## Pendências

- **D4 do PRD.** A API entrega as avaliações ou o frontend embute o widget da Trustvox? Tudo aqui supõe a API; se mudar, troca-se só o adaptador (ADR 0012).
- **Página × deslocamento.** A porta do domínio usa `pagina`; o contrato usa `deslocamento` e `limite`. A conversão fica no adaptador (T-0706). Se o backend preferir paginar por página, muda só ele.
- **Falta um banco de depoimentos no mock.** `docs/api/examples/_base/` não tem avaliações; as fixtures do 3084 trazem só 11 das 31. O mock repete esses 11 para completar (T-0707). O protótipo gerava a partir de 24 textos: vale copiar esse banco para `_base/avaliacoes.json`.
- **`context-map.md` desatualizado.** A tabela de endpoints do contexto Avaliações não lista `GET /produtos/{id}/avaliacoes/resumo`, que existe no `openapi.yaml` e em `endpoints/avaliacoes.md`.
- **404 em avaliações.** Tratamos produto inexistente como "sem avaliações" (a seção some). A página de produto já responde 404 antes, por `obterProduto`.
- **Legenda "pela Trustvox".** O texto é fixo no componente, como no protótipo. Se a origem mudar, vira campo do contrato.
- **Faixa nas outras páginas.** Home (módulo 09), políticas (10) e hub de lojas (12) usam `FaixaAvaliacoes` com `useResumoDaLoja()`; a faixa some se a chamada falhar.
