# Specs

O que será construído, em que ordem e como se sabe que está pronto. Cada módulo é uma pasta com dois
arquivos: `spec.md` (o quê e por quê) e `tasks.md` (os passos, um teste de cada vez).

A ordem dos módulos está no [roadmap.md](roadmap.md). As regras para a IA estão no
[AGENTS.md](../AGENTS.md). Os modelos estão em [_templates/](_templates/).

## Como o trabalho anda

```
dev: "Vamos para a próxima task."
 IA: acha a próxima pela ordem do roadmap e a apresenta (id, requisito, teste, dependências)
dev: "Pode ir."
 IA: escreve só o teste, roda, mostra a falha      ── portão 1 · VERMELHO
dev: lê o teste, ajusta, "teste aprovado"          ── portão 2 · REVISÃO
 IA: código mínimo, suíte verde                    ── portão 3 · VERDE
 IA: refatora com a suíte verde                    ── portão 4 · REFATORAÇÃO
dev: "ok, feche a task"                            ── portão 5 · FECHAMENTO
 IA: marca a task, atualiza docs, sugere a branch, o commit e o título do PR
dev: commita, abre o PR, espera o CI verde e faz o squash na main
```

Uma task por vez. A IA não começa a próxima sem o portão 5.

## Estados de uma task

| Marca | Estado |
|---|---|
| `[ ]` | A fazer |
| `[~]` | Em andamento (no máximo uma por pessoa) |
| `[x]` | Concluída, com a data no fim do título: `### [x] T-0304 · Filtra por aro · 2026-12-02` |
| `[!]` | Bloqueada: a linha seguinte diz por quê e por quem |

## O que tem numa spec

1. **Objetivo**: o que o módulo entrega de visível.
2. **Contexto**: contexto do domínio, telas do protótipo, ADRs que se aplicam.
3. **Requisitos**: numerados `REQ-NN-xx`, cada um ligado a um `RF` do [PRD](../docs/prd.md).
4. **Critérios de aceite**: em Dado / Quando / Então. É o que o teste e2e do módulo prova.
5. **Contratos**: endpoints e schemas que o módulo consome.
6. **Estados de tela**: carregando, sucesso, vazio e erro de cada bloco.
7. **Fora do escopo**.

## O que tem numa task

| Campo | Para quê |
|---|---|
| **Id e título** | `T-NNxx`, onde `NN` é o módulo. O título diz o comportamento, não o arquivo. |
| **Requisito** | O `REQ` que ela atende. Task sem requisito não existe. |
| **Camada** | `domínio`, `aplicação`, `adaptador`, `ui`, `mock`, `e2e` ou `infra`. Uma só. |
| **Teste primeiro** | O arquivo do teste e os casos, em frases. É o que a IA escreve no portão 1. |
| **Pronto quando** | O critério objetivo de fechamento. |
| **Arquivos** | O que a task pode criar ou alterar. Fora disso, a IA pergunta. |
| **Fora do escopo** | O que parece caber e não cabe. |
| **Depende de** | Tasks que precisam estar fechadas. Nunca uma task posterior. |

## Regras de corte das tasks

- **Uma razão para existir.** Uma regra de domínio, um caso de uso, um adaptador, um componente.
- **Cabe em uma sessão curta.** Se o teste não cabe em uma tela, a task está grande: divida.
- **De dentro para fora.** Em cada módulo: domínio → aplicação → adaptador → mock → UI → e2e.
- **Fatia vertical cedo.** A primeira task de UI de um módulo já liga com o caso de uso de verdade.
- **Toda task termina com a suíte verde** e pode virar um commit sozinha: uma task, um PR, um commit na `main`.

## Tasks de infraestrutura

Configuração (projeto, lint, CI) não tem "teste primeiro" no sentido clássico. Nelas, o portão 1 é um
**teste de fumaça que falha** (ex.: `pnpm typecheck` acusa erro num arquivo de prova; um teste trivial
não roda porque o runner não existe) e o portão 3 é fazê-lo passar. O ciclo de revisão é o mesmo.

## Onde os comandos rodam

No contêiner do projeto, nunca na máquina (ADR 0014). Onde uma task diz `pnpm x`, leia `bin/pnpm x`.
As tasks que copiam arquivos do repositório de discovery usam o `compose.discovery.yaml`, que monta
as origens em `/discovery`, somente para leitura.

## O CI cresce com o projeto

- **A task que cria uma verificação a põe no CI.** Script novo de lint, teste ou auditoria entra no
  `.github/workflows/ci.yml` e ganha um caso em `tests/infra/ci.spec.ts`, na mesma task. O
  "Pronto quando" da task diz o job e o passo.
- **Todo job entra no `needs` do `CI ok`.** A `main` exige só `CI ok` e `Título do PR`; assim, job
  novo nunca fica de fora da proteção. O `ci.spec.ts` reprova job fora do `needs`.
- **Task sem verificação nova não mexe no CI.** Os testes dela já rodam nos jobs que existem.
- **O que demora e muda devagar fica fora do PR** (mutação: semanal e sob demanda).

O calendário do que entra em cada task está no [roadmap.md](roadmap.md).

## Pendências

No fim de cada `tasks.md` há uma seção **Pendências**: o que apareceu durante o trabalho e está fora
do escopo. Vira task nova (no próprio módulo ou em outro) ou dúvida para o cliente.
