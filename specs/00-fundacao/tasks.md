# Tasks 00 — Fundação

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Tasks de infraestrutura: o "teste primeiro" é um teste de fumaça que falha (ver specs/README).

Ordem: de cima para baixo, **na ordem do arquivo** (a T-0012 vem logo depois da T-0002, de propósito:
o CI passa a ser testado assim que existe um executor de testes). Todo comando roda no contêiner:
`pnpm x` aqui quer dizer `bin/pnpm x` (ADR 0014).

**O CI cresce junto.** Cada task abaixo que cria uma verificação diz, em "Pronto quando", o que ela
acrescenta ao `ci.yml` e ao `tests/infra/ci.spec.ts`. A regra está em [../README.md](../README.md).

---

### [x] T-0000 · O ambiente roda em contêiner e o CI nasce com o que já dá para verificar · 2026-11-26

- **Requisito:** REQ-00-11, REQ-00-12
- **Camada:** infra
- **Teste primeiro:** `scripts/conferir-ambiente.sh` (roda na máquina, só com Docker)
  - a imagem de desenvolvimento constrói
  - o `.nvmrc` diz 22, e o `Dockerfile` e o `compose.yaml` usam a mesma versão
  - dentro da imagem, o Node é o do `.nvmrc` e o pnpm é o da versão fixada no `Dockerfile`
  - o Chromium do Playwright abre dentro do contêiner e tira uma captura
  - o contêiner escreve na pasta do projeto com o uid de quem chama
  - os verificadores das specs e do contrato passam no contêiner `handoff`
- **Pronto quando:** `sh scripts/conferir-ambiente.sh` termina com "ambiente ok"; `bin/pnpm` repassa qualquer comando ao contêiner; o `ci.yml` tem os jobs **Specs**, **Workflows** (actionlint), **Imagem dev** e o agregador **CI ok**; o `pr.yml` valida o título do PR; o `ruleset-main.json` exige `CI ok` e `Título do PR`.
- **Arquivos:** `.nvmrc`, `Dockerfile`, `compose.yaml`, `compose.discovery.yaml`, `bin/pnpm`, `.dockerignore`, `.gitignore`, `.editorconfig`, `.gitattributes`, `.devcontainer/devcontainer.json`, `scripts/conferir-ambiente.sh`, `scripts/aplicar-ruleset.sh`, `scripts/handoff/**`, `.github/workflows/ci.yml`, `.github/workflows/pr.yml`, `.github/ruleset-main.json`, `.github/dependabot.yml`, `.github/pull_request_template.md`
- **Fora do escopo:** qualquer coisa de Nuxt (T-0001); imagem de produção (T-1317); jobs de lint, teste, e2e e build (T-0012).
- **Depende de:** nada

### [x] T-0001 · O projeto Nuxt sobe e renderiza no servidor · 2026-11-27

- **Requisito:** REQ-00-01
- **Camada:** infra
- **Teste primeiro:** `tests/e2e/fumaca.spec.ts` (Playwright, com JavaScript desligado)
  - `GET /` responde 200
  - o HTML bruto contém "TireShop"
- **Pronto quando:** `bin/pnpm dev` sobe e responde em `http://localhost:3000`; o teste passa no contêiner; `package.json` fixa o Node do `.nvmrc` (`engines`) e o pnpm (`packageManager`) na versão do `Dockerfile`; `@playwright/test` está na versão exata do `ARG PLAYWRIGHT_VERSION`; o `pnpm-lock.yaml` está versionado; o Dependabot passa a cobrir o ecossistema `npm`.
- **Arquivos:** `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `nuxt.config.ts`, `tsconfig.json`, `app/app.vue`, `app/pages/index.vue`, `playwright.config.ts`, `.gitignore`, `.github/dependabot.yml`
- **Fora do escopo:** layout, CSS, layers; jobs de CI (T-0012).
- **Depende de:** T-0000

### [x] T-0002 · TypeScript estrito, ESLint e typecheck reprovam o que devem · 2026-11-27

- **Requisito:** REQ-00-02
- **Camada:** infra
- **Teste primeiro:** `tests/infra/qualidade.spec.ts` (Vitest chamando os binários)
  - `pnpm typecheck` falha com um arquivo de prova que usa `any` implícito
  - `pnpm lint` falha com um arquivo de prova que tem variável não usada
  - `pnpm format:check` falha com um arquivo de prova mal formatado
  - os três passam sem os arquivos de prova
- **Pronto quando:** scripts `lint`, `typecheck`, `format`, `format:check` e `test` existem; `strict` e `noUncheckedIndexedAccess` ligados; o Prettier segue o `.editorconfig`. Dependências novas: as do ESLint do Nuxt, `vitest` e `prettier`, em `devDependencies`.
- **Arquivos:** `eslint.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.prettierrc`, `.prettierignore`, `package.json`, `tests/infra/`, `.gitignore`
- **Fora do escopo:** regras de arquitetura (T-0004).
- **Depende de:** T-0001

### [ ] T-0012 · O CI roda qualidade, testes, e2e e build, e é conferido por teste

- **Requisito:** REQ-00-10
- **Camada:** infra
- **Teste primeiro:** `tests/infra/ci.spec.ts` (Vitest lendo os arquivos de `.github/`)
  - o `ci.yml` é YAML válido, roda em `pull_request` e em `push` na `main`, tem `concurrency` com cancelamento e `permissions: contents: read`
  - toda action (`uses:`) está fixada por SHA de 40 caracteres
  - os jobs que usam Node leem a versão do `.nvmrc`, usam o cache do pnpm e instalam com `--frozen-lockfile`
  - todo `pnpm <script>` chamado no workflow existe no `package.json`
  - existem os jobs **Qualidade** (`format:check`, `lint`, `typecheck`), **Testes** (`test`), **E2E** (`test:e2e`, dentro da imagem `dev` do projeto) e **Build** (`build`)
  - todo job está no `needs` do **CI ok**, e o **CI ok** tem `if: always()`
  - o `ruleset-main.json` exige `CI ok` e `Título do PR`, e só cita check que existe
  - `NODE_VERSION` do `Dockerfile` bate com o `.nvmrc` e com `engines.node`; `PNPM_VERSION` e `PLAYWRIGHT_VERSION` batem com `packageManager` e `@playwright/test` do `package.json`
- **Pronto quando:** o teste passa; o PR desta task mostra os quatro jobs novos verdes; o job E2E guarda o relatório do Playwright como artefato quando falha. Dependência nova: `yaml` (leitura do workflow no teste), em `devDependencies`.
- **Arquivos:** `.github/workflows/ci.yml`, `tests/infra/ci.spec.ts`, `package.json`
- **Fora do escopo:** cobertura (T-0003), lint de marca (T-0006), contrato (T-0009), segurança (T-0011).
- **Depende de:** T-0002

### [ ] T-0003 · Vitest roda testes de unidade sem carregar o Nuxt

- **Requisito:** REQ-00-02
- **Camada:** infra
- **Teste primeiro:** `layers/shared/domain/prova.spec.ts`
  - um teste trivial roda em ambiente `node` em menos de 1 s
  - `pnpm test:cobertura` gera relatório e aplica o limite de 90% em `**/domain/**` e `**/application/**`
- **Pronto quando:** dois projetos no Vitest (`unidade` em `node`, `nuxt` para componentes); scripts `test`, `test:watch`, `test:cobertura`. **CI:** o job Testes passa a rodar `test:cobertura` e a guardar `coverage/` como artefato; o caso entra no `ci.spec.ts`.
- **Arquivos:** `vitest.config.ts`, `package.json`, `layers/shared/domain/prova.spec.ts`, `.github/workflows/ci.yml`, `tests/infra/ci.spec.ts`
- **Fora do escopo:** testes de componente reais.
- **Depende de:** T-0012

### [ ] T-0004 · As layers existem e a regra de dependência é verificada

- **Requisito:** REQ-00-03
- **Camada:** infra
- **Teste primeiro:** `tests/infra/arquitetura.spec.ts`
  - reprova `domain/` importando `vue`, `#imports`, `zod` ou qualquer `adapters/`
  - reprova `application/` importando `adapters/` ou `ui/`
  - reprova `ui/` importando `adapters/`
  - reprova um contexto importando caminho interno de outro (só `layers/<ctx>/index.ts` é permitido)
  - reprova `$fetch`, `useFetch` e `fetch` fora de `adapters/http` e de `server/`
  - aprova a estrutura vazia criada nesta task
- **Pronto quando:** existem `layers/shared` e as sete layers de contexto com `nuxt.config.ts`, `index.ts` e as quatro pastas; `nuxt.config.ts` raiz estende todas; o teste passa. **CI:** sem job novo; a regra roda no `lint` (job Qualidade) e no `test` (job Testes).
- **Arquivos:** `layers/**`, `nuxt.config.ts`, `eslint.config.mjs`, `tests/infra/arquitetura.spec.ts`
- **Fora do escopo:** qualquer código dentro das layers.
- **Depende de:** T-0003

### [ ] T-0005 · O CSS e as fontes do protótipo carregam

- **Requisito:** REQ-00-04
- **Camada:** infra
- **Teste primeiro:** `tests/e2e/estilo.spec.ts`
  - o `body` usa a família de fonte do token e a fonte está carregada (`document.fonts`)
  - `--ts-brand` e `--ts-acao` existem em `:root`
  - um botão de prova com `ts-btn ts-btn--acao` tem a cor de fundo do token
- **Pronto quando:** as folhas globais entram pelo `nuxt.config.ts`; as de página ficam disponíveis para import por página; nenhuma classe foi renomeada. A cópia é feita de `/discovery`, com o `compose.discovery.yaml`, e os arquivos copiados ficam versionados (o CI não enxerga o repositório de discovery).
- **Arquivos:** `app/assets/css/**`, `public/fonts/**`, `nuxt.config.ts`, `tests/e2e/estilo.spec.ts`
- **Fora do escopo:** componentes.
- **Depende de:** T-0001

### [ ] T-0006 · O lint de marca reprova cor literal e verde fora de ação

- **Requisito:** REQ-00-05
- **Camada:** infra
- **Teste primeiro:** `scripts/lint-marca.spec.ts`
  - reprova `#ff0000`, `rgb(...)` e nome de cor fora de `tokens*.css`
  - reprova `var(--ts-acao)` em seletor que não é botão de ação
  - reprova amarelo como `color` sem o comentário `/* sobre preto */`
  - aprova o CSS vindo do protótipo, sem alteração
- **Pronto quando:** `pnpm lint:marca` existe e passa no CSS atual; cobre `.css` e blocos `<style>` de `.vue`. **CI:** `lint:marca` entra no job Qualidade; o caso entra no `ci.spec.ts`.
- **Arquivos:** `scripts/lint-marca.ts`, `scripts/lint-marca.spec.ts`, `package.json`, `.github/workflows/ci.yml`, `tests/infra/ci.spec.ts`
- **Fora do escopo:** corrigir CSS (não deve ser preciso).
- **Depende de:** T-0005, T-0012

### [ ] T-0007 · As imagens e os ícones do protótipo estão no projeto

- **Requisito:** REQ-00-06
- **Camada:** infra
- **Teste primeiro:** `tests/contract/ativos.spec.ts`
  - todo `src` de imagem citado em `docs/api/examples/**/*.json` existe em `public/`
  - o sprite de ícones contém os ícones usados (`i-whatsapp`, `i-shopping-cart`, `i-chevron-down`…)
- **Pronto quando:** `public/img` espelha `img/` do protótipo; componente `<Icone nome>` de `shared/ui` renderiza do sprite. A cópia é feita de `/discovery`, com o `compose.discovery.yaml`, e fica versionada.
- **Arquivos:** `public/img/**`, `app/assets/icons/**`, `layers/shared/ui/Icone.vue`, `tests/contract/ativos.spec.ts`
- **Fora do escopo:** otimização de imagem.
- **Depende de:** T-0004

### [ ] T-0008 · O servidor de mocks serve fixtures, com atraso e falha simuláveis

- **Requisito:** REQ-00-07
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/navegacao.get.spec.ts`
  - `GET /api/mock/navegacao` devolve o conteúdo de `mocks/fixtures/navegacao.json`
  - `?_falha=500` devolve `application/problem+json` com `status: 500`
  - `?_atraso=300` demora pelo menos 300 ms
  - com `NUXT_PUBLIC_API_BASE` externo, a rota responde 404 (mock desligado)
- **Pronto quando:** `mocks/fixtures` é cópia de `docs/api/examples` (script `pnpm mocks:sincronizar`); utilitário `responderFixture(evento, nome)` em `server/utils/`. **CI:** o job Qualidade roda `pnpm mocks:sincronizar --conferir`, que reprova se as duas pastas divergem; o caso entra no `ci.spec.ts`.
- **Arquivos:** `server/api/mock/navegacao.get.ts`, `server/utils/mock.ts`, `mocks/fixtures/**`, `scripts/sincronizar-mocks.ts`, `nuxt.config.ts` (runtimeConfig), `.github/workflows/ci.yml`, `tests/infra/ci.spec.ts`
- **Fora do escopo:** as outras rotas (cada módulo cria as suas).
- **Depende de:** T-0004

### [ ] T-0009 · O teste de contrato valida toda fixture contra o OpenAPI

- **Requisito:** REQ-00-08
- **Camada:** infra
- **Teste primeiro:** `tests/contract/openapi.spec.ts`
  - cada `externalValue` citado no `openapi.yaml` existe e valida no schema da operação, em modo estrito
  - falha se uma operação com resposta 2xx em JSON não tem exemplo
  - falha se um arquivo de `mocks/fixtures` (fora de `_base`) não é citado
  - uma fixture adulterada no teste (campo obrigatório removido) é reprovada com o caminho do campo
- **Pronto quando:** o teste passa com as fixtures atuais; `pnpm test` o inclui; ele acusa tudo o que o `scripts/handoff/validar_contratos.py` acusava. **CI:** o contrato passa a rodar no job Testes, e o job Specs deixa de chamar o `validar_contratos.py` (o `conferir.sh` fica só com as specs).
- **Arquivos:** `tests/contract/openapi.spec.ts`, `tests/contract/_validador.ts`, `scripts/handoff/conferir.sh`, `scripts/handoff/requirements.txt`
- **Fora do escopo:** schemas Zod (cada adaptador traz o seu, e o teste de contrato do adaptador é da task dele); apagar o `validar_contratos.py` (listar para o dev decidir).
- **Depende de:** T-0008

### [ ] T-0010 · O Playwright aplica os invariantes comuns de página

- **Requisito:** REQ-00-09
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/_invariantes.spec.ts` (contra uma página de prova com defeitos plantados)
  - acusa dois H1, pulo de nível de título, imagem sem `alt` ou sem dimensões, rolagem horizontal, alvo menor que 44 px, âncora sem destino e `iframe` sem `title`
  - aprova a página sem defeitos
  - roda nos projetos `computador` (1440×900) e `celular` (390×844)
- **Pronto quando:** existe `conferirInvariantes(page)` em `tests/e2e/_invariantes.ts`, com axe para contraste; a lista é a de [docs/testing.md](../../docs/testing.md). **CI:** o job E2E roda os dois projetos e guarda relatório e traces como artefato na falha; o caso entra no `ci.spec.ts`.
- **Arquivos:** `tests/e2e/_invariantes.ts`, `tests/e2e/_invariantes.spec.ts`, `tests/e2e/_paginas-de-prova/`, `playwright.config.ts`, `.github/workflows/ci.yml`, `tests/infra/ci.spec.ts`
- **Fora do escopo:** invariantes por tipo de página (cada módulo).
- **Depende de:** T-0005, T-0012

### [ ] T-0011 · A `main` só aceita o que passou em tudo, inclusive nas verificações de segurança

- **Requisito:** REQ-00-10, REQ-00-12
- **Camada:** infra
- **Teste primeiro:** `tests/infra/ci.spec.ts` (casos novos no mesmo arquivo)
  - o `ci.yml` roda `format:check`, `lint`, `lint:marca`, `typecheck`, `test:cobertura`, `test:e2e` e `build`
  - existe o job **Segurança**, com varredura de segredos (gitleaks) e `pnpm audit --prod --audit-level=high`
  - em `pull_request`, a revisão de dependências reprova dependência nova com vulnerabilidade alta
  - existe o `codeql.yml`, para `javascript-typescript`, em PR, em push na `main` e uma vez por semana
  - o Dependabot cobre `npm`, `github-actions` e `docker`
  - nenhum workflow pede permissão de escrita além de `security-events: write` no CodeQL
  - o job Segurança está no `needs` do **CI ok**
- **Pronto quando:** o PR desta task passa com todos os jobs; `sh scripts/aplicar-ruleset.sh --conferir` mostra o ruleset ativo na `main` com os checks `CI ok` e `Título do PR`.
- **Arquivos:** `.github/workflows/ci.yml`, `.github/workflows/codeql.yml`, `.github/dependabot.yml`, `tests/infra/ci.spec.ts`
- **Fora do escopo:** publicação (T-1318); mutação (T-0121); Lighthouse, regressão visual e backend externo (módulo 13).
- **Depende de:** T-0006, T-0009, T-0010, T-0012

---

## Pendências

- **Aplicar o ruleset.** O `ruleset-main.json` só protege depois de aplicado: rodar `sh scripts/aplicar-ruleset.sh` logo depois do primeiro PR (o que traz os workflows). A T-0011 confere que continua ativo.
- **Hospedagem (premissa P6 do PRD).** O CI ficou no GitHub Actions (ADR 0014). O provedor de hospedagem continua a confirmar com o TI; a T-1318 só publica a imagem.
- **Tempo do job E2E.** Quando passar de 10 minutos, dividir em fatias (`--shard`) com matriz. Abrir task no módulo em que isso acontecer.
- **Numeração dos marcos.** O roadmap vai de M0 a M6; o campo "Marco" de algumas specs usa outra numeração (a 13 diz M10; a 12, M9; as 09, 10 e 11, M8). Alinhar pelo roadmap.
- **ESLint sem o módulo `@nuxt/eslint`.** Optei por `typescript-eslint` + `eslint-plugin-vue` direto em `eslint.config.mjs`, sem instalar `@nuxt/eslint` nem tocar `nuxt.config.ts` (fora do "Arquivos" da T-0002). Perde-se a detecção automática de auto-imports do Nuxt nas regras de lint; se isso gerar falso positivo mais adiante (variável de auto-import marcada como não definida), revisitar e trocar pelo módulo oficial.
- **`vue/multi-word-component-names` desligada.** O roteamento por arquivo do Nuxt exige nomes de um termo só (`index.vue`, `error.vue`, futuramente `[id].vue`); a regra recomendada do `eslint-plugin-vue` reprovava isso. Desligada globalmente para `**/*.vue`.
- **Prettier não cobre `docs/`, `specs/`, `prompts/` nem os `.md` da raiz.** Essa prosa foi revisada em sessões anteriores com formatação própria; reformatá-la agora geraria um diff gigante e alheio ao escopo desta task. `format`/`format:check` cobrem o código (TS, Vue, JSON, configs) e crescem com o projeto.
- **`nuxt typecheck` em vez de `tsc --noEmit` direto.** O `tsconfig.json` da T-0001 é só um arquivo de projeto-referência (`files: []` + `references`) que o Nuxt gera; `strict` e `noUncheckedIndexedAccess` já vêm ligados por padrão nos tsconfigs gerados (confirmado, não precisou tocar `nuxt.config.ts`). A fixture de `any` implícito do teste mora em `tests/nuxt/_prova/`, o único padrão de `tests/**` que o Nuxt já inclui; `layers/*/domain` e `application/` (que ainda não existem) vão precisar de atenção na T-0004.
- **O pnpm baixa o próprio binário a cada comando.** Todo `bin/pnpm` começa com "Downloading the pnpm 12.23.0 binary", alguns segundos por execução, porque o contêiner é descartado e o cache não fica na imagem. Ajustar o `Dockerfile` (T-0000) para o binário já vir na imagem; conferir no `scripts/conferir-ambiente.sh`.
- **Política de instalação do pnpm 12.** Pacote publicado há menos de um dia é recusado, e script de instalação só roda para o que está em `allowBuilds` do `pnpm-workspace.yaml` (hoje, só `esbuild`). Na T-0001 o `vue-router` ficou na 5.5.1 por isso. Dependência nova que precise de script de build entra nessa lista na task que a instala.
- **Verificadores em dois lugares.** `scripts/handoff/` deste repositório é a cópia que vale. As de `tools/handoff/` no repositório de discovery ficaram para o dev decidir.
