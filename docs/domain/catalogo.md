# Contexto: Catálogo (núcleo)

Encontrar, listar, filtrar, mostrar e comparar pneus. É o contexto com mais regra e mais telas.

**Dentro:** produto, categoria, facetas, ordenação, paginação, busca por medida, aro e veículo,
relacionados, comparação.
**Fora:** carrinho, frete e prazo, avaliações completas (aqui só o resumo que vem no produto),
conteúdo editorial da Home.

## Modelo

### Value objects

| VO | Campos | Invariantes |
|---|---|---|
| `ProdutoId` | `valor: string` | Não vazio. É o "Cód." exibido. |
| `Medida` | `largura: number`, `altura: number`, `aro: string` | Largura e altura inteiros positivos; aro não vazio (texto: `17`, `17,5`, `16C`). `rotulo` = `225/45 R17`. Duas medidas iguais têm os três campos iguais. |
| `IndiceCarga` | `codigo: string`, `kg: number` | `kg` positivo. |
| `IndiceVelocidade` | `codigo: string`, `kmh: number` | `kmh` positivo. |
| `Preco` | `de?: Dinheiro`, `parcelado: { total, parcelas, valorParcela }`, `aVista: { valor, descontoPercentual }` | `parcelas` entre 1 e 12; `aVista.valor` ≤ `parcelado.total`; se há `de`, `de` > `parcelado.total`. Só leitura: o front não recalcula. |
| `SeloFrete` | `regiao: string`, `valorMinimo: Dinheiro` | Texto exibido: "Frete grátis {regiao} acima de {valorMinimo}". |
| `Disponibilidade` | `'em_estoque' \| 'sem_estoque'` | |
| `Faceta` | `chave`, `rotulo`, `opcoes: { valor, rotulo, total }[]` | Opção com `total` 0 não é exibida. Faceta com uma opção só não é exibida (ex.: Aro numa categoria de um aro). |
| `Ordenacao` | `'mais_vendidos' \| 'menor_preco' \| 'maior_preco' \| 'melhor_avaliados'` | Padrão: `mais_vendidos`. |
| `Paginacao` | `pagina`, `porPagina`, `total`, `totalPaginas` | `porPagina` é 12 na listagem. `pagina` ≥ 1. |

### Agregados

**`Produto`** (raiz). Identidade: `ProdutoId`.

- Dados: nome, marca, medida, departamento, imagens, preço, promoção, selo de frete, 360°,
  resumo de avaliações, disponibilidade, run flat, terreno, desenho.
- No detalhe: código, EAN, original de, índices, galeria, giro 360°, descrição, ficha técnica,
  etiqueta do INMETRO, veículos compatíveis, garantia, formas de pagamento, previsão de chegada.
- Comportamento:
  - `podeComprar()`: verdadeiro só se `em_estoque`.
  - `mostraPreco()`: falso se `sem_estoque` (RF-08).
  - `abreNoGiro()`: verdadeiro se há giro 360° (RT45).
  - `temSeloOriginal()`: verdadeiro se `originalDe` existe.
- Duas formas do mesmo agregado trafegam: `ProdutoResumo` (card, listagem, vitrine, carrinho) e
  `Produto` completo (página de produto). `ProdutoResumo` é um tipo publicado para outros contextos.

**`Categoria`** (raiz). Identidade: `slug`.

- Dados: tipo (`departamento | aro | medida | marca`), H1, departamento, ícone, arte da primeira
  dobra, medida ou aro pré-selecionado na busca, migalhas, texto de apoio, FAQ.
- Comportamento: `abaInicialDaBusca()` (`medida` ou `aro`), `filtroInicial()`.

**`Comparacao`** (raiz, de vida curta, no cliente).

- Dados: lista ordenada de `ProdutoId`.
- Invariantes: no máximo **4** itens; sem repetidos; comparável a partir de **2**.
- Comportamento: `adicionar(id)`, `remover(id)`, `limpar()`, `estaCheia()`, `podeComparar()`,
  `medidasDiferentes(produtos)` (gera o aviso), `melhorPorLinha(produtos)` (menor preço; maior índice
  de carga, de velocidade, treadwear e nota), `linhasIguais(produtos)` (para "só as diferenças").

### Erros do contexto

`ProdutoNaoEncontrado` · `CategoriaNaoEncontrada` · `MedidaInvalida` · `ComparacaoCheia` ·
`ErroDeRede` · `ErroDeContrato` (os dois últimos vêm do kernel).

## Casos de uso

| Caso de uso | Entrada | Saída (`Result`) | Erros | Tela |
|---|---|---|---|---|
| `obterCategoria` | `slug` | `Categoria` | `CategoriaNaoEncontrada` | Listagem |
| `listarProdutos` | `categoria?`, facetas marcadas, `ordem`, `pagina` | `{ itens: ProdutoResumo[], paginacao, facetas, ordenacoes }` | rede, contrato | Listagem |
| `obterProduto` | `ProdutoId` | `Produto` | `ProdutoNaoEncontrado` | Produto |
| `listarRelacionados` | `ProdutoId` | `ProdutoResumo[]` (4) | rede | Produto ("Veja também") |
| `compararProdutos` | `ProdutoId[]` (2 a 4) | `Produto[]` na ordem pedida | não encontrado | Comparar |
| `listarOpcoesDeMedida` | — | larguras, alturas por largura, aros por medida | rede | Busca |
| `listarVeiculos` | `fabricante?`, `modelo?` | fabricantes, modelos e versões (cada uma com o ano e as medidas) | rede | Busca |
| `resolverBusca` | `Medida` ou `aro` ou veículo | Rota de destino (categoria de medida, de aro…) | `MedidaInvalida` | Busca |
| `metadadosDoProduto` | `Produto` | título, descrição, migalhas, JSON-LD `Product` + `BreadcrumbList` | — | Produto (SEO) |
| `metadadosDaCategoria` | `Categoria`, paginação | título, descrição, canônica, `BreadcrumbList`, `FAQPage` | — | Listagem (SEO) |

Regras que os casos de uso garantem:

- `listarProdutos` (a listagem) nunca pede mais de 12 por página; mudar de filtro ou de ordem volta para a página 1.
- O seletor do Comparar usa outro caso de uso, `listarCandidatos`, que pede até 48 por página pela mesma porta.
- Filtros são combinados com **E** entre facetas e **OU** dentro da mesma faceta.
- As contagens das facetas vêm do backend, já considerando os outros filtros marcados.
- Produto sem estoque entra nas listagens só se a API o devolver; a tela não filtra por conta própria.

## Portas

```ts
interface ProdutoRepository {
  listar(c: CriterioDeListagem): Promise<Result<ListaDeProdutos, ErroDeCatalogo>>
  obter(id: ProdutoId): Promise<Result<Produto, ProdutoNaoEncontrado | ErroDeCatalogo>>
  relacionados(id: ProdutoId): Promise<Result<ProdutoResumo[], ErroDeCatalogo>>
  porIds(ids: ProdutoId[]): Promise<Result<Produto[], ErroDeCatalogo>>
}
interface CategoriaRepository {
  obter(slug: Slug): Promise<Result<Categoria, CategoriaNaoEncontrada | ErroDeCatalogo>>
}
interface BuscaPneuGateway {
  opcoesDeMedida(): Promise<Result<OpcoesDeMedida, ErroDeCatalogo>>
  veiculos(f: FiltroDeVeiculo): Promise<Result<OpcoesDeVeiculo, ErroDeCatalogo>>
}
interface ComparacaoStore {            // porta de saída para o estado de cliente (sessão)
  ler(): ProdutoId[]
  gravar(ids: ProdutoId[]): void
}
```

## Telas

Listagem (`categoria-*.html`), Produto (`produto-*.html`), Comparar (`comparar.html`), o filtro de
pneus em todas as páginas do e-commerce, o card de produto, e a vitrine "Ofertas da semana" da Home.

## Dúvidas em aberto

- D2 (URL final de produto e de categoria) e D5 (linhas do comparador, INMETRO em notas, regra do
  "Qual escolher") do [PRD](../prd.md).
- Busca por veículo: o protótipo tem a aba, sem base de veículos. O contrato `/busca/veiculos` é uma
  proposta a validar com o TI.
