# Mapa de contextos

O negócio foi dividido em sete contextos delimitados e um núcleo compartilhado. Cada contexto é uma
Nuxt Layer (`layers/<contexto>`), com modelo e linguagem próprios, e fala com os outros só pela API
pública (ADR 0002). Os termos estão em [ubiquitous-language.md](ubiquitous-language.md).

## Os contextos

| Contexto | Tipo | Responsabilidade em uma frase | Arquivo |
|---|---|---|---|
| **Catálogo** | Núcleo | Encontrar, listar, filtrar, mostrar e comparar pneus. | [catalogo.md](catalogo.md) |
| **Lojas físicas** | Núcleo | Apresentar as cinco lojas como negócios independentes do e-commerce. | [lojas.md](lojas.md) |
| **Carrinho** | Suporte | Guardar o que o cliente quer comprar e os totais. | [carrinho.md](carrinho.md) |
| **Entrega** | Suporte | Dizer quando e por quanto o pedido chega a um CEP. | [entrega.md](entrega.md) |
| **Avaliações** | Suporte | Mostrar o que os clientes dizem da loja e de cada produto. | [avaliacoes.md](avaliacoes.md) |
| **Relacionamento** | Suporte | Captar contatos: newsletter e "Avise-me". | [relacionamento.md](relacionamento.md) |
| **Conteúdo** | Genérico | Servir o que é editorial: navegação, Home, políticas, Sobre nós, SEO e FAQ. | [conteudo.md](conteudo.md) |
| **Shared kernel** | Compartilhado | Tipos que todos usam: `Dinheiro`, `Result`, `Slug`, `Imagem`, erros, HTTP, rotas. | [shared-kernel.md](shared-kernel.md) |

"Núcleo" é onde o projeto se diferencia e onde o DDD tático vale o custo. Em "Genérico" o modelo é
raso de propósito: Conteúdo é quase só leitura e exibição, e ali entidades ricas seriam enfeite.

## Quem depende de quem

```
                         ┌──────────────────────┐
                         │     Shared kernel     │  ◄── todos dependem
                         └──────────────────────┘

   ┌───────────┐  ProdutoResumo   ┌───────────┐
   │ Carrinho  │ ───────────────► │           │
   └───────────┘                  │           │  ◄──────────  ┌────────────┐
   ┌───────────┐  ProdutoId       │ Catálogo  │  ProdutoId    │ Avaliações │
   │  Entrega  │ ───────────────► │           │               └────────────┘
   └───────────┘                  │           │  ◄──────────  ┌────────────────┐
   ┌───────────┐  ProdutoResumo   │           │  ProdutoId    │ Relacionamento │
   │   Lojas   │ ───────────────► └───────────┘               └────────────────┘
   └───────────┘   (só o tipo, para a vitrine)

   ┌───────────┐
   │ Conteúdo  │   não depende de nenhum contexto; a composição (app/) junta os blocos
   └───────────┘
```

| De | Para | O que usa | Relação |
|---|---|---|---|
| Carrinho | Catálogo | `ProdutoId`, `ProdutoResumo` e `lerProdutoResumo` (nome, imagem, preços) | Cliente / fornecedor: Carrinho se conforma ao modelo publicado pelo Catálogo |
| Entrega | Catálogo | `ProdutoId` | Só o identificador |
| Avaliações | Catálogo | `ProdutoId` | Só o identificador |
| Relacionamento | Catálogo | `ProdutoId` | Só o identificador |
| Lojas | Catálogo | `ProdutoResumo`, o leitor `lerProdutoResumo` (schema + mapper) e o componente `CardProduto` na variante de loja, para a vitrine | Conformista, só leitura, pela API pública do Catálogo. Lojas **não** usa casos de uso do Catálogo nem o Carrinho |
| Todos | Shared kernel | Tipos e utilidades | Núcleo compartilhado, mudado com cuidado |

Regras:

- **Lojas não conhece Carrinho, Entrega nem a navegação do e-commerce.** É a independência pedida pelo
  cliente (ADR 0009). A vitrine da loja mostra produtos com preço de loja e leva ao WhatsApp da loja.
- **Conteúdo não conhece Catálogo.** A Home mostra a vitrine de ofertas porque a **página** junta um
  bloco de Conteúdo com um bloco de Catálogo; um contexto não chama o outro.
- **Catálogo não conhece ninguém** além do kernel. É o fornecedor.
- Dependência circular entre contextos é proibida. Se aparecer a necessidade, falta um conceito:
  ou vai para o kernel, ou a composição resolve.

## Fronteira com o backend

Cada contexto tem as suas portas de saída, implementadas por adaptadores HTTP. Do ponto de vista do
frontend, a API da TireShop é um sistema externo com o qual a relação é de **camada anticorrupção**:
o adaptador valida (Zod) e traduz (mapper) o DTO para o modelo do contexto. O que o backend chama de
uma coisa e o frontend de outra é resolvido no mapper, nunca na tela.

| Contexto | Portas | Endpoints (ver [../api/](../api/README.md)) |
|---|---|---|
| Catálogo | `ProdutoRepository`, `CategoriaRepository`, `BuscaPneuGateway` | `/categorias/{slug}`, `/produtos`, `/produtos/{id}`, `/produtos/{id}/relacionados`, `/produtos/comparar`, `/busca/medidas`, `/busca/veiculos` |
| Carrinho | `CarrinhoRepository` | `/carrinho`, `/carrinho/itens`, `/carrinho/itens/{id}` |
| Entrega | `FreteGateway` | `POST /frete/simulacoes` |
| Avaliações | `AvaliacoesGateway` | `/avaliacoes/resumo`, `/produtos/{id}/avaliacoes/resumo`, `/produtos/{id}/avaliacoes` |
| Lojas | `LojaRepository` | `/lojas`, `/lojas/{slug}` |
| Conteúdo | `NavegacaoRepository`, `ConteudoRepository` | `/navegacao`, `/home`, `/politicas`, `/politicas/{slug}`, `/institucional` |
| Relacionamento | `LeadsGateway` | `POST /newsletter`, `POST /produtos/{id}/avise-me` |

## Como ler o arquivo de um contexto

Todos seguem a mesma ordem: responsabilidade e limites → modelo (agregados, value objects,
invariantes) → casos de uso (entrada, saída, erros) → portas → telas que o usam → dúvidas.
