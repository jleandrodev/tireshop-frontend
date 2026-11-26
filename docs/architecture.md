# Arquitetura

Como o frontend é organizado, por que, e o que é e não é permitido. As decisões que sustentam este
documento estão em [adr/](adr/README.md); o modelo do negócio, em [domain/](domain/context-map.md).

## 1. Visão em uma figura

```
 navegador ─────────────────────────────────────────────────────────────────────────────┐
                                                                                         │
  ┌──────────────────────────────── Nuxt (SSR + hidratação) ───────────────────────────┐ │
  │                                                                                     │ │
  │  app/            páginas finas e layouts: só compõem blocos e chamam casos de uso   │ │
  │    │                                                                                │ │
  │    ▼                                                                                │ │
  │  layers/<contexto>/                                                                 │ │
  │    ui/           componentes e composables de tela        ── depende de ──┐         │ │
  │    application/  casos de uso (orquestram, devolvem Result)  ── depende ──┤         │ │
  │    domain/       entidades, value objects, PORTAS (TS puro)  ◄────────────┘         │ │
  │    adapters/     implementam as portas: HTTP (Zod + mapper), sessão, terceiros      │ │
  │         │                                                                           │ │
  └─────────┼───────────────────────────────────────────────────────────────────────────┘ │
            │ HTTP, sempre                                                                 │
            ▼                                                                              │
   NUXT_PUBLIC_API_BASE ──► hoje:   /api/mock  (rotas Nitro servindo fixtures)             │
                            depois: API da TireShop (backend do cliente)                   │
```

Três ideias sustentam o resto:

1. **O domínio não conhece o Nuxt.** Regra de negócio é TypeScript puro, testado sem framework.
2. **A tela não conhece a API.** Entre as duas há uma porta (interface) e um adaptador que traduz.
3. **O mock é um servidor.** O frontend faz HTTP de verdade desde o primeiro dia.

## 2. Camadas e a regra de dependência

| Camada | Pasta | Pode importar | Não pode importar | Contém |
|---|---|---|---|---|
| **Domínio** | `domain/` | `shared/domain` | Vue, Nuxt, Zod, `adapters/`, `application/`, `ui/` | Entidades, value objects, invariantes, **portas** (interfaces), erros de domínio |
| **Aplicação** | `application/` | `domain/`, `shared/` | Vue, Nuxt, `adapters/`, `ui/` | Casos de uso: uma função ou classe por intenção do usuário; recebem as portas por parâmetro |
| **Adaptadores** | `adapters/` | `domain/`, `application/` (tipos), `shared/`, Zod, `$fetch` | `ui/` | Schemas do DTO, mappers DTO ↔ domínio, repositórios HTTP, armazenamento de sessão, terceiros |
| **UI** | `ui/` | `application/`, `domain/` (tipos e VOs), `shared/` | `adapters/` | Componentes Vue, composables de tela, view models |
| **Composição** | `app/` | A API pública de cada contexto | Caminho interno de contexto | Páginas, layouts, o plugin que liga portas a adaptadores |

A seta de dependência aponta **sempre para dentro** (UI → aplicação → domínio). Quem liga uma porta a
um adaptador é só a composição (`app/plugins/`), em um lugar por contexto.

Entre contextos, vale uma regra a mais: um contexto só enxerga outro pela **API pública** dele (o
`index.ts` na raiz da layer). O mapa de quem fala com quem está em
[domain/context-map.md](domain/context-map.md).

## 3. Estrutura de pastas

```
tireshop-frontend/
├── nuxt.config.ts               extends das layers, runtimeConfig, routeRules
├── app/                         composição
│   ├── app.vue
│   ├── layouts/                 default.vue (e-commerce) · loja.vue (loja física, independente)
│   ├── pages/                   rotas finas: buscam com um caso de uso e montam blocos
│   ├── plugins/                 01.http.ts · 10.catalogo.ts · 11.lojas.ts … (injeção por contexto)
│   └── assets/css/              tokens e folhas ts-* vindas do protótipo
├── layers/
│   ├── shared/                  kernel: Dinheiro, Result, Slug, erros, cliente HTTP, formatação, rotas
│   ├── catalogo/
│   │   ├── nuxt.config.ts
│   │   ├── index.ts             API pública do contexto (o único import permitido de fora)
│   │   ├── domain/              produto.ts, medida.ts, portas.ts …  (+ *.spec.ts ao lado)
│   │   ├── application/         listar-produtos.ts, obter-produto.ts, comparar-produtos.ts …
│   │   ├── adapters/http/       produto.schema.ts, produto.mapper.ts, http-produto-repository.ts
│   │   └── ui/                  components/, composables/
│   ├── carrinho/  entrega/  lojas/  conteudo/  avaliacoes/  relacionamento/
├── server/
│   └── api/mock/                servidor de mocks: uma rota por endpoint do contrato
├── mocks/fixtures/              JSON servido pelo mock (cópia viva de docs/api/examples/)
├── tests/
│   ├── contract/                toda fixture valida no schema do adaptador e no OpenAPI
│   └── e2e/                     Playwright: fluxos e invariantes por tipo de página
├── docs/   specs/   prompts/
```

Os componentes e composables de `ui/` são auto-importados pelo Nuxt (cada layer registra as suas
pastas). `domain/`, `application/` e `adapters/` **não** são auto-importados: import explícito,
para a regra de dependência ser visível e verificável.

## 4. Um pedido, do clique à tela

Exemplo: abrir a listagem de pneus para carros, filtrada por aro 17.

```
1. app/pages/c/[slug].vue
     const { listar } = useCatalogo()                          // casos de uso já com as portas
     const { data } = await useAsyncData(chave, () => listar({ categoria: slug, aro: ['17'], pagina: 1 }))

2. layers/catalogo/application/listar-produtos.ts
     valida a entrada (pagina >= 1, porPagina fixo em 12) e chama a porta:
     produtos.listar(criterio): Promise<Result<ListaDeProdutos, ErroDeCatalogo>>

3. layers/catalogo/adapters/http/http-produto-repository.ts     (implementa a porta)
     GET {apiBase}/produtos?categoria=pneus-para-carros&aro=17&pagina=1&porPagina=12
     ListaProdutosSchema.parse(json)        → falha de formato vira ErroDeContrato, não exceção solta
     paraListaDeProdutos(dto)               → entidades Produto, com Dinheiro e Medida

4. de volta à página: Result ok → <ListagemProdutos :lista> · Result erro → <EstadoDeErro :erro>
```

Hoje `{apiBase}` é `/api/mock`, e quem responde é `server/api/mock/produtos.get.ts`, que filtra a
fixture. Amanhã é a API da TireShop. Os passos 1, 2 e 4 não mudam.

## 5. Estratégias transversais

**Dados e cache.** Leitura do servidor com `useAsyncData`, chave derivada dos parâmetros. Cache de
rota com `routeRules` (ex.: políticas e institucional com revalidação longa; produto e listagem
curtas; carrinho sem cache). Nada de dado do servidor em store.

**Estado de cliente.** Pinia só para o que atravessa páginas e nasce no navegador: carrinho
(espelho otimista do servidor) e seleção do comparador. Aceite de cookies em `localStorage`; nada
pessoal é persistido.

**Erros.** Casos de uso devolvem `Result<T, E>`; não lançam para fluxo esperado. O adaptador
converte falha de rede, 4xx/5xx e JSON fora do contrato em erros tipados. A tela decide o que
mostrar por tipo de erro. Um bloco que falha mostra o próprio estado de erro e não derruba a página.

**SEO.** Cada página chama um caso de uso que devolve também os metadados (título, descrição,
migalhas, JSON-LD). `useSeoMeta` e `useHead` só na página. Um H1 por página, garantido por teste.

**Acessibilidade.** Componentes interativos (mega menu, guias, carrossel, acordeão, diálogo) têm
teste de teclado e de papéis ARIA. Imagens sempre com `width`, `height` e `alt`.

**Desempenho.** Imagens com `loading="lazy"` fora da primeira dobra; vídeo e mapa só depois da
interação (capa clicável); CSS por página, como no protótipo; JavaScript de tela carregado sob demanda.

**Estilo.** O CSS do protótipo entra como está (classes `ts-*`, tokens em `tokens*.css`). Sem
Tailwind e sem biblioteca de componentes. O lint de marca roda no CI.

**Rotas.** Nenhum componente monta URL na mão: usa `rotas.produto(p)`, `rotas.categoria(c)`,
`rotas.loja(l)` de `shared/routing`. A forma final das URLs é decisão do cliente.

## 6. Padrões (faça assim)

**P1 · Value object valida na criação e é imutável.**
```ts
// layers/catalogo/domain/medida.ts
export class Medida {
  private constructor(readonly largura: number, readonly altura: number, readonly aro: string) {}
  static criar(l: number, a: number, aro: string): Result<Medida, MedidaInvalida> { /* regras */ }
  get rotulo() { return `${this.largura}/${this.altura} R${this.aro}` }
}
```

**P2 · Porta no domínio, com o nome do negócio.**
```ts
// layers/catalogo/domain/portas.ts
export interface ProdutoRepository {
  listar(criterio: CriterioDeListagem): Promise<Result<ListaDeProdutos, ErroDeCatalogo>>
  obter(id: ProdutoId): Promise<Result<Produto, ProdutoNaoEncontrado | ErroDeCatalogo>>
}
```

**P3 · Caso de uso recebe as portas; não as busca.**
```ts
export const criarListarProdutos = (produtos: ProdutoRepository) =>
  (entrada: EntradaListar) => produtos.listar(paraCriterio(entrada))
```

**P4 · Adaptador = schema + mapper + repositório, nessa ordem.**
O schema Zod descreve o DTO; o mapper é uma função pura DTO → domínio, testada com a fixture; o
repositório só faz a chamada, valida e mapeia.

**P5 · Composable de tela é a ponte para o Vue.**
`useListagem()` chama o caso de uso dentro de `useAsyncData`, expõe `lista`, `estado` e ações.
Componente não chama caso de uso direto quando há estado de tela envolvido.

**P6 · Componente burro, página esperta.**
Componentes recebem dados por `props` e emitem eventos. Quem busca é a página (ou o composable dela).

**P7 · Toda tela tem quatro estados testados:** carregando, sucesso, vazio e erro.

**P8 · Fixture é dado real.** Vem do protótipo (dados do site), não é inventada; cobre o caso cheio,
o vazio e o nulo de cada campo opcional.

**P9 · Bloco de página composto por dados.** A página de loja monta a abertura conforme o que a API
manda (banners → introdução clara; sem banners → hero preto), sem `if` espalhado pelos componentes.

**P10 · Um teste por regra, com nome em frase:** `"não deixa passar de 8 unidades por item"`.

## 7. Antipadrões (não faça; e como se pega)

| # | Antipadrão | Por que é ruim | Faça em vez disso | Quem pega |
|---|---|---|---|---|
| A1 | `$fetch`/`useFetch` em componente, página ou caso de uso | Acopla tela à API; impede trocar backend e testar sem rede | Chame um caso de uso; HTTP só em `adapters/http` | ESLint `no-restricted-globals`/`imports` fora de `adapters/` |
| A2 | DTO da API usado em componente ou no domínio | Uma mudança de campo no backend quebra telas | Mapper no adaptador; a tela usa entidade ou view model | ESLint: `*.schema.ts` só importável em `adapters/` |
| A3 | `domain/` importando Vue, Nuxt, Zod ou adaptador | O domínio deixa de ser testável e portável | Domínio em TS puro; validação de formato fica no adaptador | ESLint `import/no-restricted-paths` por camada |
| A4 | `if (useRuntimeConfig().public.mock)` ou fixture importada em tela | Dois caminhos de código; o do mock é o único testado | Mock é servidor (ADR 0003) | ESLint: `mocks/` só importável em `server/` e `tests/` |
| A5 | Import cruzado entre contextos por caminho interno | Vira uma bola de lama; não dá para mexer num contexto sozinho | Use o `index.ts` do contexto, e só o que o mapa de contextos permite | ESLint `no-restricted-imports` com o padrão `layers/*/!(index)` |
| A6 | Dado do servidor copiado para a store | Duas fontes de verdade, dado velho na tela | `useAsyncData` com chave; store só para estado de cliente | Revisão + regra na spec do módulo |
| A7 | Regra de negócio em componente (cálculo de parcela, limite de quantidade, regra de frete) | Regra duplicada e sem teste | Regra no domínio; a tela só exibe | Revisão; teste de domínio obrigatório na task |
| A8 | Preço calculado no frontend | Diverge do backend e do checkout | A API manda os valores; o front formata (`Dinheiro.formatar`) | Revisão; contrato sem campos "calculáveis" |
| A9 | `number` para dinheiro em reais (`529.9`) | Erro de ponto flutuante | `Dinheiro` em centavos inteiros | Tipo do domínio; schema exige inteiro |
| A10 | Cor literal ou verde de ação fora da regra | Quebra o manual da marca validado com o cliente | Tokens; verde só em seguir, comprar, confirmar | Lint de marca no CI |
| A11 | URL montada com string no componente | A decisão de URL do cliente vira retrabalho | `rotas.*` de `shared/routing` | ESLint: literal `.html` e `/produto/` proibidos em `ui/` |
| A12 | `any`, `as` para calar o tipo, `// @ts-ignore` | Esconde o erro que o contrato deveria pegar | Tipar; se o dado é incerto, é `unknown` + schema | `tsc --strict` + ESLint |
| A13 | Teste que conhece a implementação (espiona função interna) | Quebra a cada refatoração e não protege comportamento | Teste pelo resultado observável | Revisão do portão 2 |
| A14 | Lançar exceção para fluxo esperado (produto não encontrado, CEP inválido) | A tela não é obrigada a tratar | `Result` com erro tipado | Tipo de retorno das portas |
| A15 | Vídeo, mapa ou widget de terceiro carregado na abertura da página | Pesa o LCP e vaza dados antes do consentimento | Capa clicável; carrega ao tocar | Teste e2e: zero `iframe` antes da interação |
| A16 | Código de produção sem teste aprovado antes | Fura o ciclo; o teste vira enfeite | Portões 1 e 2 | Processo (AGENTS.md) |

## 8. Onde cada contexto aparece

| Tela | Contextos que compõem |
|---|---|
| Home | Conteúdo (banners, blocos, SEO, FAQ) · Catálogo (vitrine, busca) · Lojas · Avaliações |
| Listagem | Catálogo · Conteúdo (navegação) |
| Produto | Catálogo · Entrega · Avaliações · Carrinho · Relacionamento (Avise-me) |
| Comparar | Catálogo · Carrinho |
| Políticas, Sobre nós | Conteúdo |
| Hub de lojas | Lojas · Conteúdo (navegação, SEO) |
| Página de loja | Lojas (layout próprio, sem Carrinho nem navegação do e-commerce) |
| Global (cabeçalho, rodapé) | Conteúdo (navegação) · Catálogo (busca por medida) · Carrinho · Relacionamento (newsletter) |
