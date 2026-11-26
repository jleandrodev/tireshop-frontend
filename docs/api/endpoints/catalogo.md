# Catálogo

Schemas em [../openapi.yaml](../openapi.yaml): `Categoria`, `ListaDeProdutos`, `ProdutoResumo`,
`Produto`, `Faceta`, `OpcoesDeMedida`, `OpcoesDeVeiculo`.

## GET /categorias/{slug}

**Para quê:** montar o topo e o rodapé de uma página de listagem. **Não** traz produtos: eles vêm de
`GET /produtos?categoria={slug}`, para o filtro não recarregar o cabeçalho.

**Tela:** listagem (`/c/{slug}`). **Exemplos:** [departamento](../examples/categoria-pneus-para-carros.json),
[aro](../examples/categoria-carros-aro-17.json), [medida](../examples/categoria-225-45-r17.json),
[marca](../examples/categoria-hankook.json).

| Campo | Regra | A tela faz |
|---|---|---|
| `tipo` | `departamento`, `aro`, `medida` ou `marca` | Define migalhas e o banner |
| `titulo` | Obrigatório | É o H1 |
| `departamento` | `null` em categoria de marca | Com valor, mostra o ícone ao lado do H1 |
| `arte` | Duas imagens: computador (720×420) e celular (390×290) | Arte à esquerda do filtro; `href` nulo = sem link |
| `busca` | Como o filtro de pneus abre | `aba: "medida"` com largura, altura e aro preenchidos na categoria de medida; `aba: "aro"` na de aro |
| `selecao` | Filtros fixos da categoria | Só informativo; o backend aplica ao receber `categoria` em `/produtos` |
| `textoApoio` | `null` = sem bloco | Texto com "Ler mais", título em H2 |
| `faq` | `[]` = sem bloco | Acordeão + JSON-LD `FAQPage` |
| `seo` | Obrigatório | `<title>` e meta description |

**Erros:** 404 se o slug não existe.

## GET /produtos

**Para quê:** a listagem. Uma chamada devolve os produtos da página, o total, as opções de ordenação
e as **facetas com contagem**.

**Telas:** listagem; vitrine "Ofertas da semana" da Home (`?vitrine=ofertas&porPagina=8`); seletor do
Comparar (`?medida=…&marca=…&preco=…&porPagina=48`).
**Exemplos:** [primeira página](../examples/produtos-lista.json), [última](../examples/produtos-lista-pagina-3.json),
[por medida](../examples/produtos-lista-medida-225-45-r17.json), [vazia](../examples/produtos-lista-vazia.json),
[vitrine](../examples/produtos-vitrine-ofertas.json).

| Parâmetro | Regra |
|---|---|
| `categoria` | Slug. Aplica a seleção fixa da categoria (departamento, aro, medida ou marca). |
| `aro`, `medida`, `marca`, `preco`, `runflat`, `terreno`, `desenho` | Repetíveis. O valor é o `valor` da opção da faceta. |
| `ordem` | `mais_vendidos` (padrão), `menor_preco`, `maior_preco`, `melhor_avaliados`. |
| `pagina`, `porPagina` | Padrão 1 e 12. A listagem sempre pede 12. |
| `vitrine` | `ofertas`: lista curada pelo comercial. Ignora facetas. |

Regras da resposta:

- **Facetas**: ordem de exibição = ordem do array. Hoje: Aro, Medida, Marca, Preço à vista, Run flat,
  Tipo de terreno, Desenho. Não entram aplicação, avaliação e INMETRO (pedido do cliente).
- A contagem (`total`) de cada opção considera os **outros** filtros marcados, não o da própria faceta.
- Opção com `total` 0 pode ser omitida. Faceta com uma opção só é escondida pela tela.
- `chave` da faceta = nome do parâmetro de consulta. A faceta de preço devolve faixas prontas
  (`valor: "450-550"`, `rotulo: "R$ 450 a R$ 550"`).
- Página além da última: devolver `itens: []` com os totais corretos, não 404.
- Produto sem estoque pode aparecer; vem com `preco: null`.

**`ProdutoResumo`** (o card):

| Campo | Regra | A tela faz |
|---|---|---|
| `id` | Código do produto | Chave; vai no botão Comprar |
| `nome` | Nome completo, com a medida | H2 do card, sem cortar |
| `imagem` | 320×284 | Foto do card |
| `preco` | `null` se sem estoque | Sem preço e sem botão Comprar |
| `preco.de` | `null` fora de promoção | Preço riscado |
| `preco.parcelado` | `total`, `parcelas`, `valorParcela` | "R$ 529,00 em até 12x de R$ 44,08 sem juros" |
| `preco.aVista` | `valor`, `descontoPercentual` | "R$ 502,55 à vista" e o texto do desconto |
| `promocao` | Booleano | Selo "Promoção" |
| `freteGratis` | `null` = sem selo | Selo com a região; texto alternativo "Frete grátis {regiao} acima de {valorMinimo}" |
| `tem360` | Booleano | Selo "360°" |
| `avaliacao` | `null` = sem estrelas | Estrelas, nota e total |
| `runFlat`, `terreno`, `desenho` | | Usados só nas facetas e na ficha |

## GET /produtos/{id}

**Para quê:** a página de produto inteira, menos avaliações, frete e relacionados (chamadas próprias,
para um bloco lento não segurar a página).

**Exemplos:** [comum](../examples/produto-3084.json), [com 360°](../examples/produto-3016-com-360.json),
[sem estoque](../examples/produto-4360-sem-estoque.json).

Tudo de `ProdutoResumo`, mais:

| Campo | Regra | A tela faz |
|---|---|---|
| `originalDe` | `null` na maioria | Selo "Original do {valor}" |
| `indiceCarga`, `indiceVelocidade` | Podem ser `null` | "Índice 91V: até 615 kg por pneu e 240 km/h" |
| `galeria` | Ao menos 1 imagem, 640×569 | Foto principal e miniaturas |
| `giro360` | `null` = sem giro. `quadros`: de 12 a 36 URLs, na ordem do giro | **Com giro, a galeria abre nele** (RT45) |
| `descricaoHtml` | HTML restrito | Recolhida, com "Ler mais" |
| `ficha` | Pares rótulo e valor, na ordem de exibição | Tabela "Ficha técnica" |
| `inmetro` | Imagem da etiqueta; `null` = bloco só com a explicação | Hoje é imagem. Notas A a G estruturadas: dúvida D5 |
| `veiculos` | `[]` = mensagem padrão | Tabela com busca por modelo quando há mais de 8 |
| `formasPagamento` | `[]` se sem estoque | Tabela "Ver todas as formas de pagamento" |
| `previsaoChegada` | Só se sem estoque | "Previsão de chegada: 12 de dezembro" |
| `migalhas` | O último item é o produto, com `href: null` | Migalhas + JSON-LD |
| `faq` | Perguntas do produto | Acordeão |

Sem estoque (`disponibilidade: "sem_estoque"`): `preco` é `null`, `formasPagamento` é `[]`,
`previsaoChegada` tem data. A tela esconde preço e CEP e mostra o "Avise-me".

**Erros:** 404 se o código não existe.

## GET /produtos/{id}/relacionados

Até 4 `ProdutoResumo` do mesmo aro e departamento; se faltar, completa com o departamento.
[Exemplo](../examples/produto-3084-relacionados.json). Lista vazia esconde a seção.

## GET /produtos/comparar?ids=3084,3026,4223

De 2 a 4 códigos. Devolve os `Produto` completos **na ordem pedida**. Código inexistente é omitido
(a tela mostra os que vieram). Menos de 2 ou mais de 4: 422. [Exemplo](../examples/produtos-comparar.json).

Linhas que a tela monta hoje: preço à vista, parcelado, frete, medida, índice de carga, índice de
velocidade, treadwear, tração, temperatura, construção, desenho, run flat, garantia, nota, 360° e a
etiqueta do INMETRO. Treadwear, tração, temperatura e construção vêm de `ficha` (pelo `rotulo`); se
vocês preferirem campos próprios, é uma mudança simples de contrato.

## GET /busca/medidas

Alimenta o filtro de pneus em cascata: escolhida a largura, a tela mostra só as alturas daquela
largura; escolhida a altura, só os aros daquela medida. [Exemplo](../examples/busca-medidas.json).

| Campo | Regra |
|---|---|
| `larguras` | Em ordem crescente |
| `alturasPorLargura` | Chave = largura, como texto |
| `arosPorMedida` | Chave = `"largura/altura"`; valores = aros, como texto |
| `aros` | Todos os aros com produto, para a aba "Por aro" |

Só entram combinações que têm produto. A busca leva à categoria da medida (`/c/225-45-r17`) ou do aro.

## GET /busca/veiculos

**Proposta, a validar com o TI.** Cascata fabricante → modelo → versão e ano, devolvendo as medidas
que servem. [Exemplo](../examples/busca-veiculos.json). Sem parâmetros: só `fabricantes`. Com
`fabricante`: também `modelos`. Com os dois: `versoes`, cada uma com as `medidas`.
