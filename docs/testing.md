# Testes

Como se testa neste projeto, o que cada camada cobre e quando uma task está pronta. A decisão está no
[ADR 0005](adr/0005-tdd-e-piramide-de-testes.md); o ciclo, no [AGENTS.md](../AGENTS.md).

## Pirâmide

| Nível | Ferramenta | O que cobre | Onde fica | Velocidade |
|---|---|---|---|---|
| **Unidade de domínio** | Vitest (ambiente `node`) | Value objects, entidades, invariantes, funções puras (formatação, metadados de SEO) | `layers/<ctx>/domain/*.spec.ts` | milissegundos |
| **Unidade de aplicação** | Vitest (`node`) | Casos de uso, com **portas falsas** em memória | `layers/<ctx>/application/*.spec.ts` | milissegundos |
| **Adaptador** | Vitest (`node`) | Schema (aceita a fixture, recusa a quebrada), mapper DTO → domínio, repositório com HTTP falso | `layers/<ctx>/adapters/**/*.spec.ts` | milissegundos |
| **Contrato** | Vitest (`node`) | Toda fixture valida no schema Zod **e** no `openapi.yaml`; todo endpoint do OpenAPI tem fixture | `tests/contract/` | rápido |
| **Componente** | `@nuxt/test-utils` + Testing Library | Renderização por estado (carregando, sucesso, vazio, erro), eventos, teclado, ARIA | `layers/<ctx>/ui/**/*.spec.ts` | centenas de ms |
| **Servidor de mocks** | `@nuxt/test-utils` (`$fetch` do servidor) | Filtro, ordenação, paginação e erros das rotas de mock | `server/api/mock/**/*.spec.ts` | centenas de ms |
| **Ponta a ponta** | Playwright (1440 px e 390 px) | Fluxos críticos e invariantes por tipo de página | `tests/e2e/` | segundos |

Proporção esperada: a grande maioria em unidade; e2e só para o que atravessa camadas.

## O que cada nível prova

- **Domínio:** a regra existe. Ex.: "não deixa passar de 8 unidades por item".
- **Aplicação:** a intenção é atendida com as portas certas. Ex.: "mudar o filtro volta para a página 1".
- **Adaptador:** o frontend entende a API. Ex.: "produto sem `preco.de` vira `Preco` sem preço anterior".
- **Contrato:** frontend, documentação e mock concordam.
- **Componente:** a tela reage. Ex.: "com a lista vazia, mostra 'Nenhum pneu com esses filtros'".
- **e2e:** o usuário consegue. Ex.: "filtra por aro 17, abre um produto, adiciona ao carrinho".

## Invariantes de página (herdados do protótipo)

O protótipo era conferido por `tools/hifi/verify.py`, com regras por tipo de página. Cada regra vira
um teste e2e. As comuns a todas as páginas:

- Um único H1; níveis de título sem pulo.
- Nenhuma rolagem horizontal em 390 px e em 1440 px.
- Contraste AA em todo texto (axe).
- Toda imagem com `alt`, `width` e `height`; nenhuma quebrada.
- Alvos de toque de 44 px (24 px para pontos de carrossel).
- Todo link interno aponta para rota existente; toda âncora tem destino.
- `iframe` só depois de interação, e com `title`. (O protótipo carregava o mapa com `loading=lazy`; no Nuxt ele é capa clicável, pelo ADR 0012.)
- JSON-LD presente e válido.
- No celular, o botão do WhatsApp não cobre barra fixa.
- Nenhum carrossel anda sozinho. (No protótipo, o de marcas da Home girava a cada 5 s com botão de pausa; no Nuxt ele passa a ser manual, como os demais.)

As específicas (listagem, produto, loja, comparar, políticas, Sobre nós) estão na `spec.md` de cada módulo.

## Dados de teste

- **Fixtures** em `mocks/fixtures/`, iguais a `docs/api/examples/`. São dados reais do site,
  capturados no protótipo. Não invente fixture: recorte uma real.
- **Fábricas** em `layers/<ctx>/domain/__fabricas__/` para testes de unidade: `umProduto({ ... })`
  devolve um `Produto` válido e aceita só o que o teste quer variar.
- **Portas falsas** em `layers/<ctx>/application/__falsos__/`: implementações em memória das portas,
  com métodos para preparar sucesso e falha.

## Nomes

- Arquivo de teste ao lado do código: `medida.ts` → `medida.spec.ts`.
- `describe` com o nome da unidade; `it` com uma **frase do comportamento**, em português, no presente:
  `it('recusa aro vazio')`, `it('mostra o preço à vista com 5% de desconto')`.
- Um comportamento por `it`. Organização: preparar, agir, conferir.

## O que NÃO se testa

- O framework (que o Vue renderiza, que o `useAsyncData` busca).
- Detalhe de implementação (função privada, ordem de chamadas internas).
- Estilo por classe CSS (use regressão visual nas páginas-modelo).
- Texto literal de conteúdo que vem da API.

## Definição de pronto

**De uma task:**

1. O teste da task foi escrito antes, revisado e aprovado.
2. A suíte do módulo passa; `pnpm lint` e `pnpm typecheck` passam.
3. Nenhuma regra de dependência foi quebrada (lint de arquitetura).
4. Documentação tocada atualizada; task marcada em `tasks.md`.

**De um módulo:**

1. Todas as tasks fechadas; todos os requisitos da `spec.md` com teste.
2. Os quatro estados de cada bloco de tela cobertos.
3. e2e do módulo passando em 1440 px e 390 px.
4. Cobertura de 90% ou mais em `domain/` e `application/` do contexto.
5. Regressão visual da página-modelo dentro da tolerância, comparada ao protótipo.

## Comandos (criados entre a T-0000 e a T-0010)

Tudo roda no contêiner do projeto (ADR 0014): nada de Node, pnpm ou navegador na máquina.

| Comando | Faz | Nasce na |
|---|---|---|
| `sh scripts/conferir-ambiente.sh` | Constrói a imagem e confere Node, pnpm, Chromium e os verificadores | T-0000 |
| `docker compose --profile ferramentas run --rm handoff` | Specs e contrato (verificadores) | T-0000 |
| `bin/pnpm install` · `bin/pnpm dev` | Instala e sobe em `http://localhost:3000` | T-0001 |
| `bin/pnpm test:e2e` | Playwright contra o servidor de mocks, com o Chromium da imagem | T-0001 |
| `bin/pnpm lint` · `bin/pnpm typecheck` · `bin/pnpm format:check` | ESLint, TypeScript, Prettier | T-0002 |
| `bin/pnpm test` | Unidade, adaptador, contrato e componente | T-0002 |
| `bin/pnpm test:watch <arquivo>` | Um arquivo em modo de observação (o do portão 1) | T-0003 |
| `bin/pnpm test:cobertura` | Cobertura com os limites por pasta | T-0003 |
| `bin/pnpm lint:marca` | Lint de marca | T-0006 |
| `bin/pnpm test:mutacao` | Teste de mutação no domínio e na aplicação | T-0121 |

Para ver o relatório do Playwright: `bin/pnpm exec playwright show-report --host 0.0.0.0`, com a
porta 9323 publicada (`docker compose run --rm --service-ports app pnpm exec playwright show-report --host 0.0.0.0`).

## O que o CI roda

O mesmo que os comandos acima, a cada pull request e a cada push na `main`. O e2e e a regressão
visual rodam **dentro da imagem do projeto**, para o navegador e as fontes serem os da máquina. O
calendário de quando cada verificação entra está no [roadmap](../specs/roadmap.md), seção "O CI
cresce com o projeto". A `main` exige os checks `CI ok` e `Título do PR`.
