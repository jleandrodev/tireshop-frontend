# AGENTS.md — regras permanentes para a IA neste repositório

Este arquivo vale para qualquer assistente de IA que trabalhe aqui (Claude Code, Cursor, Copilot…).
Leia antes de qualquer ação. Em conflito, este arquivo vence o hábito do modelo; o dev vence este
arquivo quando disser isso com todas as letras.

## 1. Como a sessão começa

O dev não cola instruções de TDD nem diz onde estão as tasks. **Você já sabe.** Ele diz algo como
"vamos para a próxima task", "bora continuar" ou "inicia a T-0304", e você conduz.

**Quando ele pedir a próxima task, sem dizer qual:**

1. Leia o comentário `ordem-de-execucao` no alto de [specs/roadmap.md](specs/roadmap.md). A ordem
   **não é a numérica** (ex.: `00, 01, 02, 03, 05, 06, 04, …, 12:T-1201..T-1213, 09, …`).
2. Percorra os `tasks.md` nessa ordem e ache o estado:
   - Existe task `[~]` (em andamento)? É ela. Diga em que portão parou e retome dali.
   - Senão, a próxima é a **primeira `[ ]`**, na ordem do arquivo (não a do número), cuja linha
     "Depende de" só cita tasks `[x]`.
   - Task `[!]` (bloqueada) é pulada; diga o motivo que está escrito abaixo dela.
3. **Antes de escrever qualquer coisa, apresente a task** neste formato e espere o "pode ir":

```
PRÓXIMA TASK: T-xxxx · <título>
Módulo: <NN-nome> (task <n> de <total> do módulo · <feitas>/<238> no projeto)
Requisito: <REQ-NN-xx: frase>
Camada: <camada>
Teste que vou escrever: <arquivo> — <casos, em uma linha cada>
Depende de: <ids> (todas concluídas)
CI: <o que esta task acrescenta ao ci.yml, ou "sem mudança">
Vou ler antes: <spec do módulo, arquivo do contexto, endpoint>
Posso começar pelo teste?
```

4. Com o "pode ir", marque a task como `[~]` em `tasks.md`, leia
   [docs/architecture.md](docs/architecture.md), o arquivo do contexto em
   [docs/domain/](docs/domain/context-map.md) e a `spec.md` do módulo, e vá para o portão 1.

**Quando ele citar um id:** confira as dependências. Se alguma não estiver `[x]`, não comece: diga
quais faltam e qual seria a próxima pela ordem.

**Quando não houver próxima** (tudo `[x]` ou só bloqueadas): diga isso, liste as bloqueadas com o
motivo e as Pendências abertas dos `tasks.md`.

Outros pedidos que você reconhece sem prompt pronto: "aprovado" / "teste aprovado" (portão 2 → 3),
"ok, fecha" (portão 5), "o teste está errado porque…" (volta ao portão 2), "onde estamos?" (resumo:
módulo atual, feitas e a fazer, bloqueadas), "preciso mudar o contrato X" (seção 5).

Trabalhe em **uma task por vez**. Se a task não existe em `tasks.md`, não a invente: proponha o texto
dela e pare.

## 2. O ciclo (inegociável)

| Portão | O que você faz | Onde você PARA |
|---|---|---|
| 1 Vermelho | Escreve **só o teste** descrito na task. Roda. Mostra o comando e a falha. | Para e pede a revisão do teste. |
| 2 Revisão | Nada. O dev lê e aprova, ou pede ajuste. | Espera "aprovado" ou equivalente. |
| 3 Verde | Escreve o **mínimo** de código de produção para o teste passar. Roda a suíte do módulo. | Segue para o 4 sem parar, se tudo passou. |
| 4 Refatoração | Remove duplicação e melhora nomes, com a suíte verde a cada passo. | Para e mostra o resultado. |
| 5 Fechamento | Depois do "ok" do dev: marca a task como `[x]` com a data em `tasks.md`, atualiza docs tocadas, anota Pendências e **entrega as sugestões de commit** (seção 8). Depois diz qual é a próxima task, em uma linha. | Fim da task. Não começa a próxima sem o dev pedir. |

Regras do ciclo:

- **Nenhuma linha de código de produção antes de um teste aprovado que falhe por causa dela.**
- O teste do portão 1 tem de falhar **pelo motivo esperado** (asserção, não erro de import ou de sintaxe).
  Se falhar por outro motivo, corrija o teste antes de pedir revisão.
- Não altere um teste aprovado para fazê-lo passar. Se o teste está errado, diga o porquê e volte ao portão 2.
- Não comece a próxima task sem o portão 5 da atual.
- **O CI cresce com a task.** Se a task cria uma verificação (script de lint, de teste, de auditoria),
  o teste do portão 1 inclui o caso em `tests/infra/ci.spec.ts` e o portão 3 inclui o job ou o passo
  no `.github/workflows/ci.yml`. Todo job entra no `needs` do `CI ok`. O que cada task acrescenta
  está no "Pronto quando" dela e na tabela "O CI cresce com o projeto" do roadmap.

## 3. Formato da sua resposta em cada portão

**Portão 1:**
```
TASK T-xxxx · VERMELHO
Requisito: <id e frase>
Arquivos de teste criados: <caminhos>
Casos: <lista curta>
Comando: <comando>
Resultado: <N falhando, com a mensagem da primeira falha>
Fora do teste (de propósito): <o que não cobri e por quê>
Aguardando revisão do teste.
```

**Portões 3 e 4:**
```
TASK T-xxxx · VERDE + REFATORAÇÃO
Arquivos de produção: <caminhos>
Comando: <comando>   Resultado: <N passando, 0 falhando>
Refatorações: <lista>
CI: <job ou passo acrescentado, e o caso no ci.spec.ts; ou "sem mudança">
Não verificado: <o que não rodei ou não conferi>
Aguardando fechamento.
```

**Portão 5:**
```
TASK T-xxxx · FECHADA
Marcada [x] em: <caminho do tasks.md>
Docs atualizadas: <caminhos, ou "nenhuma">
Pendências anotadas: <lista, ou "nenhuma">

Sugestão de commits
Branch: <tipo>/t-xxxx-<summary-in-kebab-case>
1. <mensagem>   <arquivos>
2. <mensagem>   <arquivos>
Título do PR: <tipo>(T-xxxx): <the behavior, in English, imperative>
No CI deste PR: <jobs que devem aparecer, e o que há de novo>
Próxima task: T-yyyy · <título>
```

## 4. Arquitetura: o que nunca fazer

As regras completas estão em [docs/architecture.md](docs/architecture.md). As que mais se quebram:

- **Nunca** importe de `adapters/` ou de `ui/` dentro de `domain/` ou de `application/`.
- **Nunca** chame `$fetch`, `useFetch` ou `fetch` fora de um adaptador HTTP.
- **Nunca** use um DTO (o JSON da API) em componente, composable de tela ou domínio. O adaptador mapeia.
- **Nunca** importe um contexto de dentro de outro por caminho interno. Só pela API pública (`index.ts`) do contexto.
- **Nunca** escreva `if (mock)` ou leia fixture em componente. O mock é um servidor (ADR 0003).
- **Nunca** copie dado do servidor para uma store. Store é só para estado de cliente (ADR 0007).
- **Nunca** ponha cor literal fora dos arquivos de tokens, nem use o verde de ação em algo que não seja
  seguir, comprar ou confirmar (ADR 0006).

## 5. Contratos da API

O contrato vive em três lugares que precisam concordar: o schema Zod do adaptador, o
`docs/api/openapi.yaml` e a fixture em `docs/api/examples/` (espelhada em `mocks/fixtures/`).
**Mudou um, mude os três na mesma task.** Quando o dev pedir uma mudança de contrato:

1. Antes de escrever, responda: quais telas e casos de uso consomem o endpoint; se a mudança quebra
   quem já consome (campo removido, tipo trocado, obrigatório novo) ou só acrescenta; e o que muda em
   schema, OpenAPI, fixture, mapper, entidade e `spec.md`. Pare e espere a confirmação.
2. Proponha o texto de uma task nova em `tasks.md` e siga o ciclo: no portão 1, o teste de contrato
   (a fixture nova valida no schema novo, a antiga falha) e o teste do mapper.
3. Registre: ADR novo se muda uma convenção; senão, uma linha em "Histórico" no `.md` do endpoint.

## 6. Escopo e honestidade

- Faça o que a task pede. Achou um problema fora dela? Anote em "Pendências" no fim de `tasks.md` e siga.
- Não instale dependência que a task não cite. Se precisar, pare e justifique.
- **Nada se instala na máquina do dev.** Node, pnpm, navegadores e Python rodam em contêiner
  (ADR 0014). Todo `pnpm x` das specs é `bin/pnpm x`; outro binário, `docker compose run --rm app <cmd>`.
  Se um comando só funciona fora do contêiner, pare e diga.
- Não apague arquivos nem reescreva histórico do git. Liste o que sobrou para o dev decidir.
- Diga o que **não** foi verificado. "Deve funcionar" não é resultado: rode e mostre.
- Dúvida de requisito que muda o teste: pare e pergunte. Dúvida de detalhe: decida, registre a premissa
  na resposta e siga.

## 7. Idioma e nomes

- Domínio e contratos em **português** (linguagem ubíqua: `Produto`, `Medida`, `Loja`, `precoAVista`).
- Termos técnicos de padrão em inglês (`Repository`, `Gateway`, `UseCase`, `Mapper`, `Schema`).
- Arquivos de teste ao lado do código: `x.ts` e `x.spec.ts`. Testes de ponta a ponta em `tests/e2e/`.
- **Commits e títulos de PR em inglês, em Conventional Commits**, com o id da task no escopo:
  `feat(T-0304): filter the listing by rim size`. É a única exceção ao português: o código, o
  domínio, os testes e os documentos continuam em português.
  - Tipos: `feat` (comportamento novo), `fix` (correção), `test` (só teste), `refactor` (sem mudar
    comportamento), `docs`, `ci` (workflows), `build` (dependências, Docker, ferramentas), `perf`,
    `chore` (o resto).
  - Assunto no imperativo, começando com minúscula, sem ponto final. Nomes do domínio ficam como
    estão no código, entre crases quando ajudar: ``feat(T-0301): validate `Medida` on creation``.
  - Fora de task, sem escopo ou com escopo livre: `ci: add the build job`, `build(deps): bump nuxt`.

## 8. Git, commits e pull request

A `main` é protegida: só recebe mudança por pull request, com squash, e com os checks `CI ok` e
`Título do PR` verdes (ADR 0014). **Quem commita, dá push, abre o PR e faz o merge é o dev.** Você
não roda `git commit`, `git push` nem `gh pr`: você **sugere**, no portão 5.

- **Uma task, uma branch, um PR.** Branch `feat/t-0304-filter-by-rim-size` (tipo, id e resumo em inglês), criada a partir da `main` atualizada.
- **Commits que contam o ciclo.** Sugira, na ordem, com a lista de arquivos de cada um:
  1. `test(T-0304): cover the listing filter by rim size` (só os arquivos de teste)
  2. `feat(T-0304): filter the listing by rim size` (o código de produção)
  3. `refactor(T-0304): extract <o que foi extraído>` (só se a refatoração foi relevante)
  4. `docs(T-0304): close the task` (`tasks.md`, docs e Pendências; pode entrar no commit 2 se for pequeno)

  Task pequena pode ser um commit só. Mudança de CI da task vai no commit do código que ela verifica
  (ou em um `ci(T-0304): ...` próprio, se for grande).
- **Título do PR = mensagem do squash**: `feat(T-0304): filter the listing by rim size`. O tipo é o
  do que a task entrega: `feat` para comportamento, `build` ou `ci` para task de infraestrutura,
  `test` para task que só audita. O check `Título do PR` reprova fora do formato.
- Diga o que o dev deve ver no CI daquele PR (os jobs, e o que a task acrescentou). Se o CI reprovar,
  o dev cola a falha e você corrige dentro do ciclo: teste aprovado não se altera para passar.
