# TireShop Frontend (Nuxt)

Frontend do novo e-commerce da TireShop, em Nuxt, entregue pela N1 para o time de TI da TireShop.
O backend é do cliente. Este repositório entrega **só o frontend**, que consome uma API descrita em
[docs/api/](docs/api/README.md). Enquanto a API real não existe, um servidor de mocks responde no
mesmo formato, e trocar um pelo outro é mudar uma variável de ambiente.

> **Estado em 26/11/2026:** base documental pronta (arquitetura, ADRs, domínio, contratos, specs e
> tasks), ambiente em contêiner e esqueleto do CI (`T-0000`). **Ainda não há código Nuxt.** O projeto
> nasce na task `T-0001`, seguindo o ciclo abaixo.

## Como rodar

Só é preciso **Docker**. Node, pnpm, o navegador dos testes e o Python dos verificadores ficam nas
imagens do projeto ([ADR 0014](docs/adr/0014-conteiner-ci-progressivo-e-main-protegida.md)).

```
sh scripts/conferir-ambiente.sh                          # constrói a imagem e confere o ambiente
docker compose --profile ferramentas run --rm handoff    # specs e contrato
bin/pnpm install                                         # a partir da T-0001
bin/pnpm dev                                             # http://localhost:3000
bin/pnpm test          bin/pnpm test:e2e                 # os demais comandos estão em docs/testing.md
```

`bin/pnpm x` roda `pnpm x` dentro do contêiner, com o seu usuário: os arquivos criados na pasta são
seus. No VS Code, "Reopen in Container" usa o mesmo ambiente (`.devcontainer/`).

## Como uma mudança chega à `main`

A `main` é protegida: **uma task, uma branch, um pull request, um commit** (squash). O merge só
libera com dois checks verdes: `CI ok`, que agrega todos os jobs do
[ci.yml](.github/workflows/ci.yml), e `Título do PR`, que confere Conventional Commits em inglês,
com o id da task no escopo (`feat(T-0304): filter the listing by rim size`). O CI cresce com o projeto: cada verificação entra na task que a
cria (a tabela está no [roadmap](specs/roadmap.md)). Depois de criar o repositório no GitHub, a
proteção se aplica com `sh scripts/aplicar-ruleset.sh`.

## Como este repositório funciona

O projeto é **guiado por especificação** e desenvolvido com **TDD**, em pares humano + IA:

```
docs/   →  o porquê e o como (PRD, arquitetura, decisões, domínio, contratos)
specs/  →  o quê, em ordem (um módulo por pasta: requisitos + tasks)
código  →  só existe para fazer um teste aprovado passar
```

Cada task passa por cinco portões, e a IA **para** em cada um que pede aprovação:

| # | Portão | Quem age | Sai com |
|---|---|---|---|
| 1 | **Vermelho** | IA escreve só o teste, roda e mostra a falha | teste falhando pelo motivo certo |
| 2 | **Revisão do teste** | Dev lê, ajusta e aprova | teste aprovado |
| 3 | **Verde** | IA escreve o mínimo de código para passar | suíte verde |
| 4 | **Refatoração** | IA propõe e aplica, com a suíte verde | código limpo, suíte verde |
| 5 | **Fechamento** | Dev aprova; a task é marcada em `tasks.md`; a IA sugere os commits e o dev commita e abre o PR | task concluída, CI verde |

Para começar, o dev só diz **"vamos para a próxima task"**. O agente sabe onde estão as tasks, informa
qual é a próxima e conduz o ciclo: tudo isso está no [AGENTS.md](AGENTS.md), que ele carrega em toda
sessão. As frases do dia a dia estão em [prompts/01-dia-a-dia.md](prompts/01-dia-a-dia.md).

## Por onde ler

| Você é | Leia nesta ordem |
|---|---|
| **Dev de backend** (vai construir a API) | [docs/api/README.md](docs/api/README.md) → [docs/api/openapi.yaml](docs/api/openapi.yaml) → [docs/api/endpoints/](docs/api/endpoints/) → [docs/api/examples/](docs/api/examples/) |
| **Dev de frontend** (vai desenvolver com a IA) | [docs/prd.md](docs/prd.md) → [docs/architecture.md](docs/architecture.md) → [docs/domain/](docs/domain/context-map.md) → [specs/README.md](specs/README.md) → [specs/roadmap.md](specs/roadmap.md) |
| **Quem decide** (líder técnico) | [docs/prd.md](docs/prd.md) → [docs/adr/](docs/adr/README.md) → [specs/roadmap.md](specs/roadmap.md) |
| **Quem vai iniciar outro projeto assim** | [prompts/00-kickoff-spec-driven-tdd.md](prompts/00-kickoff-spec-driven-tdd.md) |

## Mapa da pasta

```
tireshop-frontend/
├── README.md            este arquivo
├── AGENTS.md            o agente: como achar a próxima task, ciclo de TDD, portões, proibições
├── CLAUDE.md            aponta para o AGENTS.md (carregado automaticamente pelo Claude Code)
├── Dockerfile           imagens: dev (Node 22, pnpm, Chromium) e handoff (verificadores)
├── compose.yaml         o ambiente de desenvolvimento; compose.discovery.yaml monta as origens do protótipo
├── bin/pnpm             roda o pnpm dentro do contêiner
├── scripts/             conferência do ambiente, aplicação do ruleset e verificadores das specs
├── .github/             CI, título do PR, ruleset da main, Dependabot e modelo de PR
├── prompts/             esqueleto de kickoff (reutilizável) e as frases do dia a dia
├── docs/
│   ├── prd.md           escopo, fora de escopo e critérios de aceite da entrega
│   ├── architecture.md  camadas, regras de dependência, padrões e antipadrões
│   ├── adr/             decisões de arquitetura, uma por arquivo
│   ├── domain/          DDD tático: linguagem ubíqua, mapa de contextos, um arquivo por contexto
│   ├── api/             contratos para o backend: convenções, OpenAPI, endpoints e exemplos
│   ├── design/          protótipo → componentes, rotas, tokens e regras de marca
│   └── testing.md       pirâmide de testes e definição de pronto
└── specs/
    ├── README.md        como o ciclo funciona e o modelo de spec e de task
    ├── roadmap.md       marcos, ordem e dependências
    ├── _templates/      modelos de spec e de task
    └── NN-<modulo>/     spec.md + tasks.md de cada módulo
```

## Fonte de verdade visual

O protótipo em alta fidelidade, validado com o cliente, é a referência de layout e comportamento:
https://tireshop.homolog.live/prototipos/

Os arquivos-fonte dele (templates, CSS, JS e dados) ficam no repositório de discovery da N1, em `ui/`
e `tools/hifi/`. O mapa de cada tela do protótipo para componentes e rotas está em
[docs/design/mapa-prototipo.md](docs/design/mapa-prototipo.md).

## Glossário rápido

| Termo | Significa |
|---|---|
| **Contexto** | Contexto delimitado do DDD: uma área do negócio com modelo e linguagem próprios (Catálogo, Lojas físicas…). |
| **Porta** | Interface que o domínio ou a aplicação define para falar com o mundo de fora (ex.: `ProdutoRepository`). |
| **Adaptador** | Implementação de uma porta (ex.: `HttpProdutoRepository`, que chama a API). |
| **DTO** | Formato do dado no fio (JSON da API). Nunca passa do adaptador para dentro. |
| **Fixture** | JSON de exemplo que o servidor de mocks devolve. É o mesmo de `docs/api/examples/`. |
| **Portão** | Ponto do ciclo em que a IA para e espera o dev. |
