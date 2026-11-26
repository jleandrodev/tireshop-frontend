# Lojas físicas

Schemas: `HubDeLojas`, `LojaResumo`, `Loja`.

As lojas físicas têm administração própria. A **página de loja é independente do e-commerce**: não
mostra menu, busca, carrinho nem contatos do site, e o único caminho para o site é o logo do cabeçalho. Por isso
`GET /lojas/{slug}` traz tudo o que a página precisa, inclusive os contatos da loja.

## GET /lojas

**Telas:** hub de lojas, seção de lojas da Home, mega menu "Lojas Físicas", Sobre nós.
[Exemplo](../examples/lojas.json).

| Campo | Regra |
|---|---|
| `titulo` | H1 do hub |
| `intro` | Parágrafo abaixo do H1 |
| `lojas[]` | `LojaResumo`, na ordem de exibição |
| `textoApoio` | Texto da liveSEO do hub; `titulo` pode ser `null` (o texto já começa com um H2) |
| `faq` | Perguntas do hub, para o `FAQPage` |

## GET /lojas/{slug}

**Tela:** página de loja. Exemplos: [com banners](../examples/loja-curitiba.json),
[com agendamento](../examples/loja-novo-hamburgo.json), [sem banners](../examples/loja-curitiba-sem-banners.json).

Slugs atuais: `curitiba`, `sao-paulo`, `ribeirao-preto`, `joinville`, `novo-hamburgo`.

| Campo | Regra | A tela faz |
|---|---|---|
| `telefone`, `whatsapp[]` | Da **loja**. O primeiro WhatsApp é o principal | Cabeçalho, cards, rodapé e botão flutuante da loja |
| `agendamentoUrl` | `null` na maioria (hoje só Novo Hamburgo e Ribeirão Preto têm) | Botão "Agendar serviço" só quando há URL |
| `orcamentoUrl` | Obrigatório | Botão "Solicite orçamento" |
| `banners[]` | **Vazio ou com itens** | Ver "Abertura" abaixo |
| `banners[].imagem` | 1600×250 | Carrossel no computador |
| `banners[].imagemCelular` | 800×400; `null` = usa a de computador recortada | Carrossel no celular. Hoje é `null` em todos: a arte de celular está pendente |
| `banners[].destino` | `mapa`, `whatsapp`, `orcamento` ou `url` (com a `url`) | O clique do banner |
| `vitrine[]` | `ProdutoResumo` com **preço de loja**. Vazio = seção escondida | "Ofertas da loja", com o botão "Pedir no WhatsApp" (não há carrinho na loja) |
| `servicos[]` | Nome, texto e foto | Grade de serviços |
| `marcas[]` | Grupos na ordem `pneus`, `freios`, `suspensao`, `filtros`, `oleo`, `outras`. Toda marca com logo | Guias; **Pneus abre primeiro** |
| `mapa` | `link` (abre o Google Maps) e `embed` | Mapa só carrega ao tocar |
| `condicoes[]` | Condições da loja (10x, 6% à vista…) | Faixa de vantagens |
| `textoApoio`, `faq` | `null` e `[]` quando não há | Bloco de texto da liveSEO; sem texto, a tela mostra o FAQ |
| `ilustrativo.vitrine` | `true` enquanto a vitrine é de exemplo | Só documentação |

### Abertura da página: três componentes

| `banners` | A página abre com |
|---|---|
| Com itens | Carrossel de banners + **introdução clara** (fundo branco) com H1, frase, WhatsApp, Agendar e fachada |
| Vazio | **Hero preto**, com o mesmo conteúdo |

Nunca os dois. A loja liga e desliga os banners pelo conteúdo, sem mudança de código.

### Regras de negócio que o conteúdo precisa respeitar

- Nenhum texto ou banner com "cobrimos qualquer oferta" (pedido do cliente em 23/11).
- Nenhuma chamada para comprar no e-commerce dentro da página de loja.
- Os preços da `vitrine` são os da loja física, que tem política de preço própria.

**Erros:** 404 se o slug não existe.

## Em aberto

- De onde vêm os produtos e os preços da vitrine da loja (dúvida D6).
- Artes de banner para celular (800×400).
- Textos da liveSEO para Joinville, Novo Hamburgo e Ribeirão Preto.
