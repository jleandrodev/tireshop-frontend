# Spec 00 — Fundação

| | |
|---|---|
| Marco | M0 |
| Contexto do domínio | nenhum (infraestrutura) |
| Telas do protótipo | nenhuma |
| ADRs que se aplicam | 0001, 0002, 0003, 0004, 0005, 0006, 0014 |
| Depende de | nada |

## 1. Objetivo

Um projeto Nuxt que sobe, testa e valida contrato, com a estrutura de camadas e as regras de
arquitetura **verificadas por máquina**, o CSS do protótipo carregado e o servidor de mocks
respondendo. Tudo roda em contêiner, sem Node na máquina, e a `main` só recebe o que passou no CI.
Ao fim deste módulo, qualquer task de negócio pode começar pelo teste.

## 2. Requisitos

| Id | Requisito | Origem |
|---|---|---|
| REQ-00-01 | O projeto roda em Nuxt 4, com SSR, TypeScript estrito, `pnpm` e Node 22. | ADR 0001 |
| REQ-00-02 | `pnpm lint`, `pnpm typecheck` e `pnpm test` existem e falham quando devem. | ADR 0005 |
| REQ-00-03 | A estrutura de layers por contexto existe, e um teste de arquitetura reprova import proibido entre camadas e entre contextos. | ADR 0002 |
| REQ-00-04 | O CSS do protótipo (tokens, base, componentes e folhas de página) está no projeto e a fonte carrega. | ADR 0006 |
| REQ-00-05 | O lint de marca reprova cor literal fora dos tokens e verde de ação fora de botão de ação. | ADR 0006, RNF-04 |
| REQ-00-06 | As imagens do protótipo estão em `public/img`, nos mesmos caminhos dos exemplos da API. | ADR 0003 |
| REQ-00-07 | O servidor de mocks responde em `/api/mock`, lendo `mocks/fixtures`, com atraso e falha simuláveis. | ADR 0003 |
| REQ-00-08 | Um teste de contrato valida toda fixture contra o `openapi.yaml` e acusa endpoint sem fixture. | ADR 0004 |
| REQ-00-09 | Playwright roda em 1440 px e 390 px, com um ajudante que aplica os invariantes comuns de página. | ADR 0005, RNF-01, RNF-02 |
| REQ-00-10 | A integração contínua roda formatação, lint, tipos, testes, contrato, e2e, build e as verificações de segurança a cada pull request e a cada push na `main`. Ela cresce com o projeto: cada verificação entra no CI na task que a cria. | ADR 0005, ADR 0014 |
| REQ-00-11 | O desenvolvimento roda inteiro em contêiner (Docker Compose): instalar, subir, testar e rodar o e2e, sem Node nem pnpm na máquina. | ADR 0014 |
| REQ-00-12 | A `main` só recebe mudança por pull request, com squash e com os checks `CI ok` e `Título do PR` verdes; o ruleset é versionado e aplicado por script. | ADR 0014 |

## 3. Critérios de aceite

**CA-00-01 · O projeto sobe com SSR**
- **Dado** o repositório recém-clonado e `pnpm install` feito
- **Quando** rodo `pnpm dev` e peço `/` sem executar JavaScript
- **Então** recebo 200 e o HTML já contém o texto da página

**CA-00-02 · A arquitetura é verificada**
- **Dado** um arquivo em `layers/catalogo/domain/` que importa de `vue`
- **Quando** rodo `pnpm lint`
- **Então** o lint falha apontando o arquivo e a regra

**CA-00-03 · O mock responde como a API**
- **Dado** o servidor de desenvolvimento no ar
- **Quando** peço `GET /api/mock/navegacao`
- **Então** recebo o JSON de `mocks/fixtures/navegacao.json`, e com `?_falha=500` recebo um `problem+json` com status 500

**CA-00-04 · O contrato não diverge em silêncio**
- **Dado** uma fixture com um campo obrigatório removido
- **Quando** rodo `pnpm test`
- **Então** o teste de contrato falha dizendo o endpoint e o campo

**CA-00-05 · A marca é protegida**
- **Dado** um CSS com `color: #ff0000` fora dos arquivos de tokens
- **Quando** rodo `pnpm lint:marca`
- **Então** o lint falha apontando o arquivo e a linha

**CA-00-06 · O ambiente não pede nada além do Docker**
- **Dado** uma máquina só com Docker e o repositório recém-clonado
- **Quando** rodo `sh scripts/conferir-ambiente.sh`
- **Então** a imagem constrói, o Node 22 e o pnpm respondem, o Chromium abre e o script termina com "ambiente ok"

**CA-00-07 · A `main` é protegida**
- **Dado** um pull request com um job do CI falhando
- **Quando** tento fazer o merge
- **Então** o GitHub não deixa, porque o check `CI ok` não passou; e um push direto na `main` é recusado

## 4. Contratos

| Endpoint | Usado para |
|---|---|
| `GET /navegacao` | Primeira rota do mock, para provar o mecanismo |
| todos | Teste de contrato |

## 5. Estrutura que este módulo cria

A de [docs/architecture.md](../../docs/architecture.md), seção 3: `app/`, `layers/shared`, uma layer
vazia por contexto (`catalogo`, `carrinho`, `entrega`, `lojas`, `conteudo`, `avaliacoes`,
`relacionamento`), `server/api/mock`, `mocks/fixtures`, `tests/contract`, `tests/e2e`.

Fora da arquitetura da aplicação, a T-0000 cria o ambiente: `Dockerfile`, `compose.yaml`, `bin/pnpm`,
`scripts/` e `.github/` (workflows, ruleset, Dependabot e o modelo de PR).

## 6. De onde vêm os arquivos

| O quê | Origem (repositório de discovery da N1) | Destino |
|---|---|---|
| CSS | `ui/css/*.css` e `portal/alta-fidelidade/css/tokens-fonts-web.css` | `app/assets/css/` |
| Fontes | `ui/fonts/` | `public/fonts/` |
| Imagens | `portal/alta-fidelidade/img/` (cerca de 11 MB) | `public/img/` |
| Ícones | `ui/icons/` (Lucide, MDI, marcas) | `app/assets/icons/` |
| Fixtures | `docs/api/examples/` (deste repositório) | `mocks/fixtures/` |
| Lint de marca | `tools/brand_lint.py` (regras) | `scripts/lint-marca.ts` |

No contêiner, as origens de `ui/` e de `portal/alta-fidelidade/` aparecem em `/discovery`, somente
para leitura, quando o comando usa o `compose.discovery.yaml`. O que é copiado fica versionado aqui:
o CI não tem acesso ao repositório de discovery.

## 7. Fora do escopo

- Qualquer componente de tela ou regra de negócio.
- `Result`, `Dinheiro`, cliente HTTP e rotas: módulo 01.
- Publicação em produção e imagem de produção (módulo 13).
- Teste de mutação (T-0121).
