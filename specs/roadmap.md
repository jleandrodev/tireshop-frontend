# Roadmap

Os marcos, a ordem de execução e o que cada um entrega de visível. Cada módulo tem a sua `spec.md` e
a sua `tasks.md`. O ciclo de cada task está em [README.md](README.md).

<!-- ordem-de-execucao: 00, 01, 02, 03, 05, 06, 04, 07, 08, 12:T-1201..T-1213, 09, 10, 11, 12:T-1214..T-1228, 13 -->

## Números

| Módulo | Requisitos | Critérios de aceite | Tasks |
|---|---|---|---|
| [00-fundacao](00-fundacao/spec.md) | 12 | 7 | [13](00-fundacao/tasks.md) |
| [01-shared-kernel](01-shared-kernel/spec.md) | 21 | 10 | [21](01-shared-kernel/tasks.md) |
| [02-conteudo-navegacao](02-conteudo-navegacao/spec.md) | 18 | 10 | [19](02-conteudo-navegacao/tasks.md) |
| [03-catalogo-listagem](03-catalogo-listagem/spec.md) | 16 | 8 | [18](03-catalogo-listagem/tasks.md) |
| [04-catalogo-produto](04-catalogo-produto/spec.md) | 24 | 13 | [31](04-catalogo-produto/tasks.md) |
| [05-busca-pneu](05-busca-pneu/spec.md) | 13 | 10 | [13](05-busca-pneu/tasks.md) |
| [06-carrinho](06-carrinho/spec.md) | 15 | 9 | [13](06-carrinho/tasks.md) |
| [07-avaliacoes](07-avaliacoes/spec.md) | 10 | 7 | [12](07-avaliacoes/tasks.md) |
| [08-comparar](08-comparar/spec.md) | 17 | 12 | [15](08-comparar/tasks.md) |
| [09-home](09-home/spec.md) | 18 | 10 | [15](09-home/tasks.md) |
| [10-politicas](10-politicas/spec.md) | 13 | 10 | [13](10-politicas/tasks.md) |
| [11-institucional](11-institucional/spec.md) | 13 | 9 | [9](11-institucional/tasks.md) |
| [12-lojas](12-lojas/spec.md) | 28 | 16 | [28](12-lojas/tasks.md) |
| [13-seo-a11y-entrega](13-seo-a11y-entrega/spec.md) | 18 | 14 | [18](13-seo-a11y-entrega/tasks.md) |
| **Total** | **236** | **145** | **238** |

## Ordem de execução

A ordem **não** é a numérica. Três módulos trocam de lugar, por dependência:

| Passo | Módulo (trecho) | Por que aqui | O que passa a existir de visível |
|---|---|---|---|
| 1 | **00 Fundação** | Tudo depende | Projeto que sobe em contêiner, testa, valida contrato e serve o mock; `main` protegida |
| 2 | **01 Shared kernel** | `Result`, `Dinheiro`, HTTP, rotas e componentes-base | Página de prova com acordeão, guias, carrossel, diálogo |
| 3 | **02 Conteúdo e navegação** | Moldura de todas as páginas do e-commerce | Cabeçalho, mega menu, rodapé, newsletter, cookies |
| 4 | **03 Listagem** | Primeira tela de negócio; cria `ProdutoResumo` e o card | `/c/pneus-para-carros` com filtros, ordem e paginação |
| 5 | **05 Busca de pneu** | Antes do produto: as páginas reservam o lugar do filtro | Filtro por medida, aro e veículo; busca do cabeçalho |
| 6 | **06 Carrinho** | Antes do produto: o botão Comprar precisa de `useCarrinho` | Minicart funcionando a partir do card |
| 7 | **04 Produto** | Usa o filtro compacto (05) e o carrinho (06) | `/p/3084` completa, com CEP, 360° e sem estoque |
| 8 | **07 Avaliações** | Completa o produto | Faixa de avaliações e lista "Ver mais" |
| 9 | **08 Comparar** | Usa o produto completo e o carrinho | `/comparar` com seletor e tabela |
| 10 | **12 Lojas, primeiro trecho** (T-1201 a T-1213) | A Home e o Sobre nós mostram as lojas | Domínio, adaptador, mock e cartões de loja |
| 11 | **09 Home** | Junta blocos de quatro contextos | `/` completa |
| 12 | **10 Políticas** | Independente | As 8 páginas de `/ajuda/…` |
| 13 | **11 Sobre nós** | Usa os cartões de loja | `/sobre-nos` |
| 14 | **12 Lojas, segundo trecho** (T-1214 a T-1228) | Hub, layout independente e página de loja | `/lojas` e `/lojas/curitiba` |
| 15 | **13 SEO, acessibilidade e entrega** | Fecha | Auditorias, prova da troca de backend, imagem de produção publicada, documentação final |

O comentário `ordem-de-execucao` no alto deste arquivo é lido pelo verificador das specs: ele reprova
qualquer task que dependa de outra que venha depois nesta ordem. Dentro de um módulo, a ordem é a do
arquivo `tasks.md`, não a do número: a T-0012 vem depois da T-0002, e a T-1317 e a T-1318, antes da T-1315.

## O CI cresce com o projeto

A `main` exige dois checks: `CI ok`, que agrega todos os jobs do `ci.yml`, e `Título do PR`. Cada
verificação entra no CI na task que a cria:

| Quando | O que entra | Onde |
|---|---|---|
| T-0000 | Specs e contrato (verificadores), actionlint, imagem de desenvolvimento, título do PR, ruleset | `ci.yml`, `pr.yml` |
| T-0012 | Qualidade (formatação, lint, tipos), Testes, E2E na imagem do projeto, Build; o próprio CI passa a ser testado | `ci.yml`, `tests/infra/ci.spec.ts` |
| T-0003 | Cobertura com limite de 90% em domínio e aplicação, relatório como artefato | job Testes |
| T-0004 | Regras de arquitetura | jobs Qualidade e Testes |
| T-0006 | Lint de marca | job Qualidade |
| T-0008 | Fixtures do mock iguais aos exemplos da API | job Qualidade |
| T-0009 | Contrato em TypeScript, no lugar do verificador em Python | job Testes |
| T-0010 | E2E em 1440 px e 390 px, com relatório e traces na falha | job E2E |
| T-0011 | Segredos, auditoria e revisão de dependências, CodeQL | job Segurança, `codeql.yml` |
| T-0121 | Teste de mutação, semanal e sob demanda | `mutacao.yml` |
| Módulos 02 a 12 | Sem job novo: os testes de cada task entram nos jobs que já existem | — |
| T-1309 | Lighthouse em modo aviso | job Lighthouse |
| T-1310 | Regressão visual contra o protótipo | job Visual |
| T-1312 | A suíte e2e de novo, com a API em outra porta | job E2E backend externo |
| T-1313 | Cobertura de 90% por contexto | job Testes |
| T-1317 | Imagem de produção com teste de fumaça | job Imagem |
| T-1318 | Publicação da imagem aprovada | `cd.yml` |
| T-1316 | Specs conferidas em TypeScript; sai o verificador em Python | job Testes |

## Marcos

| Marco | Passos | Entrega que dá para mostrar ao cliente |
|---|---|---|
| **M0** | 1 | Esqueleto técnico: ambiente em contêiner, CI verde, `main` protegida, mock no ar |
| **M1** | 2, 3 | Moldura do site navegável (cabeçalho, menus, rodapé) |
| **M2** | 4, 5, 6 | Buscar um pneu, filtrar a listagem e pôr no carrinho |
| **M3** | 7, 8, 9 | Página de produto completa, avaliações e comparador |
| **M4** | 10 a 13 | Home, políticas e Sobre nós |
| **M5** | 14 | Lojas físicas independentes |
| **M6** | 15 | Entrega: auditorias, backend trocável, documentação |

## Dependências entre módulos

```
00 ─► 01 ─► 02 ─► 03 ─┬─► 05 ─┐
                      ├─► 06 ─┼─► 04 ─► 07 ─► 08
                      │       │
                      └───────┴─► 12a ─► 09
                                    │
                         02 ─► 10   ├─► 11
                                    └─► 12b ─► 13 (depois de todos)
```

## Rastreabilidade: PRD → módulo

| RF | O quê | Módulos |
|---|---|---|
| RF-01 | Mega menu de departamentos e aros | 02 |
| RF-02 | Busca por medida, aro e veículo | 05 (lugar reservado em 02, 03, 04, 09, 10, 11) |
| RF-03 | Listagem, 12 por página | 03 |
| RF-04 | Facetas com contagem | 03 |
| RF-05 | Ordenação e paginação | 03 |
| RF-06 | Página de produto | 04 |
| RF-07 | Prazo e frete por CEP | 04 |
| RF-08 | Produto sem estoque e Avise-me | 04 (card em 03) |
| RF-09 | Carrinho e minicart | 06 |
| RF-10 | Avaliações | 07 |
| RF-11 | Comparar pneus | 08 |
| RF-12 | Políticas | 10 |
| RF-13 | Sobre nós | 11 |
| RF-14 | Hub de lojas | 12 |
| RF-15 | Página de loja independente | 12 |
| RF-16 | Newsletter | 02 |
| RF-17 | Home | 09 |
| RF-18 | Aviso de cookies | 02 |

Os requisitos não funcionais (RNF-01 a RNF-08) são cobrados em cada módulo e auditados em conjunto
no módulo 13. A lista por requisito (`REQ-NN-xx` → task) está na `spec.md` e na `tasks.md` de cada módulo.

## Dúvidas do cliente que travam tasks

Do [PRD](../docs/prd.md), seção 10. Sem resposta, a task segue com a premissa registrada na spec.

| Dúvida | Trava ou muda | Premissa adotada |
|---|---|---|
| D1 Autenticação e sessão da API | 06 (carrinho), 13 (troca de backend) | Leitura pública; carrinho por cookie de sessão |
| D2 Forma final das URLs | 01 (rotas), 05 (destino da busca) | Rotas propostas (`/c/…`, `/p/…`, `/lojas/…`) |
| D3 Regra de frete grátis | 03 e 04 (selo) | Vem pronta por produto |
| D4 Avaliações: API ou widget | 07 | API da TireShop |
| D5 Comparar: linhas, INMETRO, "Qual escolher" | 08 | As linhas do protótipo; INMETRO como imagem |
| D6 Vitrine da loja física | 12 | Preço de loja vem pronto da API |
| D7 UTV no menu | 02 | Aro 15, como no site |

## Como conferir as specs

No contêiner de ferramentas (é o que o job Specs do CI roda):

```
docker compose --profile ferramentas run --rm handoff                                                    # specs e contrato
docker compose --profile ferramentas run --rm handoff python3 scripts/handoff/conferir_specs.py --tabela  # a tabela de números acima
```
