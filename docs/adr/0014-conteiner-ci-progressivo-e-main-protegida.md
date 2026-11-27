# ADR 0014 — Desenvolvimento em contêiner, CI que cresce com as tasks e `main` protegida

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

O projeto começa sem código, com 238 tasks em TDD. Três fatos pedem decisão antes da T-0001:

- O time não quer instalar Node, pnpm, navegadores de teste nem Python na máquina de cada dev, e a regressão visual (T-1310) só é comparável se o navegador e as fontes forem os mesmos na máquina e no CI.
- O plano original criava o CI em uma task só, no fim do módulo 00, e não dizia como a `main` é protegida. Um CI que nasce pronto não é exercitado enquanto o projeto cresce, e um que nasce tarde deixa dez tasks sem verificação.
- No repositório que serviu de referência (`api-loja-agil`), o ruleset existia como arquivo e nunca foi aplicado, e um job criado depois (E2E) ficou fora dos checks obrigatórios. Proteção que depende de lembrar de editar uma lista falha em silêncio.

## Decisão

**Contêiner.** Todo comando roda em contêiner. O `Dockerfile` tem o alvo `dev` (Node 22 em Debian, pnpm pelo corepack e o Chromium do Playwright, com as versões fixadas; a do Node vem do `.nvmrc`, que o compose e o CI passam como argumento de build) e o `compose.yaml` monta a pasta do projeto com o uid de quem chama. `bin/pnpm x` é o `pnpm x` dos documentos. As origens do protótipo, que ficam no repositório de discovery, entram somente para leitura pelo `compose.discovery.yaml`. Os alvos de produção (`build` e `runtime`) nascem na T-1317.

**CI progressivo.** O CI é GitHub Actions e nasce na T-0000 com o que já dá para verificar sem código (specs, contrato, workflows, imagem). Daí em diante, **a task que cria uma verificação a acrescenta ao `ci.yml` e ao `tests/infra/ci.spec.ts`**, no mesmo PR. O e2e e a regressão visual rodam dentro da imagem `dev`. O que demora e muda devagar (mutação) fica fora do PR, semanal e sob demanda.

**`main` protegida.** Uma task é uma branch, um pull request e um commit na `main` (squash). O ruleset versionado em `.github/ruleset-main.json` proíbe push direto, force-push e exclusão, e exige dois checks: `Título do PR` e `CI ok`. O `CI ok` é um job agregador com `if: always()` que depende de todos os outros; job novo entra no `needs` dele, e a lista de checks obrigatórios não muda. O ruleset é aplicado e conferido por `scripts/aplicar-ruleset.sh`.

**Commits.** A IA não commita, não dá push e não abre PR: no fechamento da task, sugere a branch, a sequência de commits e o título do PR. Commits e títulos de PR seguem **Conventional Commits, em inglês**, com o id da task no escopo (`feat(T-0304): filter the listing by rim size`); o título vira a mensagem do squash e é conferido pelo check `Título do PR`. É a única exceção ao português do ADR 0013, que continua valendo para código, domínio, testes e documentos.

**Actions fixadas por SHA**, atualizadas pelo Dependabot. Permissão padrão dos workflows: `contents: read`.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Node e pnpm na máquina, com `.nvmrc` | É o que o time quer evitar, e o Chromium da máquina não é o do CI. |
| Imagem oficial do Playwright como base | A versão do Node dela não é a nossa decisão (ADR 0001); preferimos fixar Node 22 e instalar o Chromium. |
| Alpine | O Chromium do Playwright não roda em musl. |
| CI inteiro em uma task (plano original) | Deixa as primeiras tasks sem verificação e não exercita o CI enquanto o projeto cresce. |
| Listar cada job como check obrigatório | Foi o que falhou na referência: job novo fica de fora sem ninguém perceber. |
| Hooks locais (husky, lint-staged) no lugar da proteção | Hook se pula; e rodaria fora do contêiner. A barreira é o CI. |
| A IA commitar e abrir o PR | O dev quer rever e assinar cada commit. |
| Commits em português (`T-0304: filtra a listagem por aro`) | Era o plano inicial; o time preferiu o padrão de mercado, que as ferramentas (Dependabot, geradores de changelog) já entendem. |

## Consequências

- Uma máquina só com Docker roda tudo; o primeiro build da imagem leva alguns minutos e ela ocupa perto de 2 GB.
- O que é copiado do repositório de discovery tem de ficar versionado aqui: o CI não o enxerga.
- Todo PR carrega, quando for o caso, a mudança de CI da task. O `ci.spec.ts` é a memória do que o CI promete.
- Trocar a versão do pnpm ou do Playwright é mexer no `Dockerfile` e no `package.json` juntos (a T-0012 confere).
- Rulesets em repositório privado exigem plano pago do GitHub; este repositório é público.
- Um job que falha por instabilidade trava a `main`. Teste instável se corrige; não se usa `retry` para esconder.

## Como verificar

- `sh scripts/conferir-ambiente.sh` (ambiente) e `sh scripts/aplicar-ruleset.sh --conferir` (proteção ativa, com os dois checks).
- `tests/infra/ci.spec.ts`, a partir da T-0012: gatilhos, permissões, actions por SHA, scripts existentes, todo job no `needs` do `CI ok`, ruleset coerente, versões do `Dockerfile` iguais às do `package.json`.
- A tabela "O CI cresce com o projeto" em [specs/roadmap.md](../../specs/roadmap.md).
