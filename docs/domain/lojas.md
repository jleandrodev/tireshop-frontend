# Contexto: Lojas físicas (núcleo)

Apresentar as cinco lojas como negócios independentes do e-commerce (ADR 0009).

**Dentro:** hub de lojas, página de loja, banners da loja, abertura (introdução clara ou hero preto),
cards de contato, vitrine da loja, serviços, marcas por grupo, mapa, texto de apoio e FAQ da loja,
cabeçalho e rodapé da loja.
**Fora:** carrinho, checkout, busca de pneus, navegação e contatos do e-commerce. A página de loja
**não** vende pelo site: leva ao WhatsApp, ao orçamento e ao agendamento da própria loja.

## Modelo

### Value objects

| VO | Campos | Invariantes |
|---|---|---|
| `Endereco` | `logradouro`, `cidade`, `uf` | `uf` com 2 letras. |
| `Horario` | `linhas: string[]` | Ao menos uma linha. Texto do cliente, exibido como vem. |
| `Contato` | `telefone`, `whatsapp: string[]` (E.164 sem `+`), `instagram?`, `facebook?` | Ao menos um WhatsApp. O primeiro é o principal. |
| `BannerLoja` | `imagem` (com `alt`), `imagemCelular?`, `destino: 'mapa' \| 'whatsapp' \| 'orcamento' \| url` | `imagem.alt` não vazio: é o texto do banner. |
| `Servico` | `nome`, `texto?`, `foto?` | |
| `GrupoDeMarcas` | `grupo` (`pneus \| freios \| suspensao \| filtros \| oleo \| outras`), `rotulo`, `marcas: { nome, logo }[]` | Toda marca tem logo. Grupo vazio não é exibido. |
| `Mapa` | `linkExterno`, `embed` | O `embed` só carrega após interação. |

### Agregado

**`Loja`** (raiz). Identidade: `slug`.

- Dados: cidade, UF, nome, endereço, horário, contato, CNPJ, frase de apresentação, fachada,
  agendamento (URL ou nulo), orçamento (URL), banners, vitrine (`ProdutoResumo[]` com preço de loja),
  serviços, grupos de marcas, mapa, condições da loja, texto de apoio, FAQ.
- Comportamento:
  - `abertura()`: `'banners_e_introducao'` se há banners; senão `'hero'`. É a regra dos três
    componentes de abertura (26/11).
  - `temAgendamento()`: verdadeiro só se a API mandar a URL (hoje Novo Hamburgo e Ribeirão Preto).
  - `temVitrine()`: verdadeiro se a vitrine tem ao menos um produto.
  - `whatsappPrincipal()`, `linkWhatsapp(mensagem?)`.
  - `gruposDeMarcas()`: na ordem pneus, freios, suspensão, filtros, óleo, outras; **Pneus abre primeiro**.

`LojaResumo` é a forma usada no hub, no mega menu "Lojas Físicas" e na Home: slug, cidade, UF,
endereço, horário, telefone, foto, serviços resumidos.

### Erros

`LojaNaoEncontrada` · `ErroDeRede` · `ErroDeContrato`.

## Casos de uso

| Caso de uso | Entrada | Saída (`Result`) | Tela |
|---|---|---|---|
| `listarLojas` | — | `{ lojas: LojaResumo[], seo, faq }` | Hub, Home, mega menu |
| `obterLoja` | `slug` | `Loja` | Página de loja |
| `metadadosDaLoja` | `Loja` | título, descrição, JSON-LD `AutomotiveBusiness` (+ `FAQPage` se houver FAQ) | Página de loja |
| `metadadosDoHub` | lista | título, descrição, `BreadcrumbList`, `FAQPage` | Hub |

Regras:

- Na página de loja, o **único** link para o e-commerce é o **logo** do cabeçalho, que leva à Home (26/11: não há botão "Loja online").
- Nenhuma menção a "cobrimos qualquer oferta" nem chamada de compra online (pedido do cliente, 23/11).
- O H1 fica no componente de abertura que aparecer; sempre um só.

## Porta

```ts
interface LojaRepository {
  listar(): Promise<Result<HubDeLojas, ErroDeLojas>>
  obter(slug: Slug): Promise<Result<Loja, LojaNaoEncontrada | ErroDeLojas>>
}
```

## Telas

`lojas.html` (hub, com o layout do e-commerce) e `loja-*.html` (layout `loja`, independente).
`loja-curitiba-sem-banners.html` mostra o estado sem banners.

## Dúvidas em aberto

- D6 do PRD: origem dos produtos e dos preços da vitrine da loja.
- Banners para celular: hoje o site só tem a arte de 1600×250. O contrato já prevê `imagemCelular`.
- Textos da liveSEO para Joinville, Novo Hamburgo e Ribeirão Preto ainda não existem.
