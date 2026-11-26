# API TireShop — contratos para o backend

Este é o documento de entrada para o **time de backend**. Ele descreve a API que o frontend Nuxt
consome: 24 operações, cada uma ligada a uma tela. O frontend já roda contra um servidor de mocks que
responde exatamente neste formato; quando a API real responder igual, basta apontar o frontend para ela.

| Arquivo | Para quê |
|---|---|
| [openapi.yaml](openapi.yaml) | Especificação de máquina (OpenAPI 3.1). Fonte para gerar servidor, cliente ou documentação. |
| [endpoints/](endpoints/) | Um arquivo por área, em linguagem de gente: para que serve cada endpoint, que tela usa, regras de campo. |
| [examples/](examples/) | Respostas de exemplo, com **dados reais** do site atual. Cada uma valida no schema. |
| [examples/_base/](examples/_base/) | Conjuntos completos (31 produtos, 5 lojas, 8 políticas, 4 categorias) usados pelo servidor de mocks. |

## Como ligar o frontend ao backend real

```
NUXT_PUBLIC_API_BASE=https://api.tireshop.com.br/v1
```

Nada mais muda no frontend (ADR 0003). Se algum endpoint responder fora do contrato, o frontend
registra um erro de contrato com o endpoint e o campo, e a tela mostra o estado de erro daquele bloco.

## Lista de endpoints

| Área | Método e rota | Tela que usa | Cache sugerido |
|---|---|---|---|
| [Conteúdo](endpoints/conteudo.md) | `GET /navegacao` | Cabeçalho e rodapé de todo o e-commerce | 1 h |
| | `GET /home` | Home | 10 min |
| | `GET /politicas` | Menu lateral das políticas | 1 dia |
| | `GET /politicas/{slug}` | Página de política | 1 dia |
| | `GET /institucional` | Sobre nós | 1 dia |
| [Catálogo](endpoints/catalogo.md) | `GET /categorias/{slug}` | Topo e rodapé da listagem | 1 h |
| | `GET /produtos` | Listagem, vitrine da Home, seletor do Comparar | 1 a 5 min |
| | `GET /produtos/{id}` | Página de produto | 1 a 5 min |
| | `GET /produtos/{id}/relacionados` | "Veja também" | 10 min |
| | `GET /produtos/comparar` | Comparar pneus | 1 a 5 min |
| | `GET /busca/medidas` | Filtro de pneus (medida e aro) | 1 h |
| | `GET /busca/veiculos` | Filtro de pneus (veículo) | 1 dia |
| [Entrega](endpoints/entrega.md) | `POST /frete/simulacoes` | Prazo e frete na página de produto | sem cache |
| [Avaliações](endpoints/avaliacoes.md) | `GET /avaliacoes/resumo` | Faixa "O que dizem os clientes" | 1 h |
| | `GET /produtos/{id}/avaliacoes/resumo` | Carrossel do produto | 1 h |
| | `GET /produtos/{id}/avaliacoes` | Lista "Todas as avaliações" | 1 h |
| [Lojas](endpoints/lojas.md) | `GET /lojas` | Hub de lojas, Home, mega menu "Lojas Físicas" (a página junta com a navegação), Sobre nós | 1 h |
| | `GET /lojas/{slug}` | Página de loja | 10 min |
| [Carrinho](endpoints/carrinho.md) | `GET /carrinho` | Minicart | sem cache |
| | `POST /carrinho/itens` | Botão Comprar | sem cache |
| | `PATCH /carrinho/itens/{id}` | Quantidade no minicart | sem cache |
| | `DELETE /carrinho/itens/{id}` | Remover do minicart | sem cache |
| [Relacionamento](endpoints/relacionamento.md) | `POST /newsletter` | Rodapé | sem cache |
| | `POST /produtos/{id}/avise-me` | Produto sem estoque | sem cache |

## Convenções

**Formato.** JSON em UTF-8. Nomes de campo em **português, camelCase, sem acento** (`precoAVista`
não existe; é `preco.aVista`). Valores de enumeração em minúsculas com sublinhado (`em_estoque`).

**Campo opcional vem `null`, não some.** Todo campo do contrato está sempre presente. Isso deixa
claro o que é "não tem" e evita `undefined` na tela. Lista sem itens vem `[]`.

**Campo a mais é ignorado.** O frontend não quebra se o backend mandar campos que ele não conhece.
Remover ou renomear campo, ou mudar o tipo, é mudança de contrato (ver "Mudanças").

**Dinheiro.** Sempre o objeto `{ "centavos": 52900, "moeda": "BRL" }`. Inteiro, em centavos. Nunca
`529.0` nem `"529,00"`. **O frontend não faz conta de preço**: total parcelado, valor da parcela e
preço à vista vêm prontos.

**Datas.** ISO 8601. Só data: `"2026-12-12"`. Data e hora: `"2026-11-26T14:30:00-03:00"`.

**Imagens.** Sempre `{ "src", "largura", "altura", "alt" }`. Largura e altura em pixels do arquivo:
o frontend usa para reservar o espaço e evitar salto de layout. `alt` vazio só em imagem decorativa.
`src` pode ser caminho absoluto no mesmo domínio ou URL completa (CDN).

**Texto com HTML.** Campos terminados em `Html` (`descricaoHtml`, `respostaHtml`, `html`) aceitam
só: `p`, `h2`, `h3`, `ul`, `ol`, `li`, `strong`, `em`, `a`, `br` e, na descrição do produto, `table`,
`tr`, `td`. Sem `script`, `style`, `iframe` nem atributos além de `href`. O frontend recusa o resto.

**Links.** `href` interno é caminho (`/c/carros-aro-17`); externo é URL completa. `null` significa
item sem link. A forma final das URLs internas é decisão de vocês (dúvida D2 do PRD): o frontend
isola isso em um módulo.

**Paginação.** Listagem de produtos: `pagina` (começa em 1) e `porPagina` (padrão 12). A resposta
traz `{ itens, pagina, porPagina, total, totalPaginas }`. Avaliações usam `deslocamento` e `limite`,
porque a tela começa na 7ª.

**Filtros.** Parâmetro repetido para vários valores: `?aro=17&aro=18&marca=hankook`. Facetas
diferentes combinam com **E**; valores da mesma faceta, com **OU**. O valor de cada filtro é o
`valor` devolvido na faceta correspondente.

**Erros.** Corpo em `application/problem+json` (RFC 9457):

```json
{
  "type": "https://api.tireshop.com.br/erros/validacao",
  "title": "Dados inválidos",
  "status": 422,
  "detail": "Confira os campos destacados.",
  "erros": [{ "campo": "cep", "mensagem": "Digite o CEP completo, com 8 números." }]
}
```

| Status | Quando | O que a tela faz |
|---|---|---|
| 200, 201 | Sucesso | Mostra |
| 404 | Recurso principal não existe (produto, categoria, loja, política) | Página "não encontrado", com status 404 no HTML |
| 422 | Entrada inválida. `erros[]` aponta os campos | Mensagem no campo |
| 429 | Limite de requisições | "Tente de novo em instantes" |
| 5xx | Falha do servidor | Estado de erro do bloco, com "Tentar de novo" |

`title` e `mensagem` são mostrados ao usuário: escrevam em português, sem jargão.

**Cache.** A tabela acima sugere tempos. Mandem `Cache-Control` e, se possível, `ETag`. O frontend
respeita os cabeçalhos no servidor (SSR) e revalida em segundo plano.

**Autenticação e sessão.** Em aberto (dúvida D1). Esta versão assume leitura pública e carrinho por
cookie de sessão `HttpOnly` definido pelo backend. O frontend repassa os cookies do navegador nas
chamadas feitas no servidor. Se for por token, só o cliente HTTP do frontend muda.

**CORS.** Se a API ficar em outro domínio: liberar a origem do site, com credenciais.

**Versão.** A versão vai no caminho base (`/v1`). Mudança incompatível = `/v2`, com as duas no ar
durante a migração.

**Desempenho esperado.** Páginas de catálogo dependem de `GET /produtos` e `GET /produtos/{id}`:
o alvo é responder em até 300 ms no percentil 95, para o LCP da página ficar abaixo de 2,5 s.

## O que é ilustrativo hoje

Dados que o protótipo simula e que precisam de fonte real. Vêm marcados com `"ilustrativo": true`.

| Dado | Endpoint | Situação |
|---|---|---|
| Avaliações (nota, total, depoimentos) | `/avaliacoes/*`, `/produtos/{id}/avaliacoes*` | Aguardando acesso à Trustvox |
| Prazo e frete por CEP | `POST /frete/simulacoes` | O mock simula por faixa de CEP |
| Vitrine de produtos da loja física | `/lojas/{slug}` → `vitrine` | Hoje nenhuma loja anuncia; origem e preço a definir |
| Busca por veículo | `/busca/veiculos` | Proposta de contrato; montada a partir dos veículos compatíveis dos produtos |
| Texto de apoio de medida e de marca | `/categorias/{slug}` → `ilustrativo` | Escrito pela N1, falta validação da liveSEO |
| Previsão de chegada | `/produtos/{id}` → `previsaoChegada` | Data de exemplo |

## Fora desta versão

Sem contrato detalhado, porque não há tela no escopo: checkout e pagamento, login e cadastro, Meus
Pedidos, cupom, rastreio, blog (a Home só lista três artigos com link externo), calculadora de pneus.
Quando entrarem, seguem as mesmas convenções.

## Mudanças no contrato

O contrato vive em três lugares que mudam juntos: o `openapi.yaml`, os exemplos e o schema de
validação do frontend. Para propor uma mudança, abram uma issue com o endpoint, o campo e o motivo.
Acrescentar campo opcional não quebra nada. Remover, renomear ou mudar tipo precisa de combinação
prévia e de data.

## Como conferir

Os exemplos são validados contra o `openapi.yaml` por script, em modo estrito (campo fora do contrato
reprova). Neste repositório, no contêiner de ferramentas (é o que o job Specs do CI roda):

```
docker compose --profile ferramentas run --rm handoff python3 scripts/handoff/validar_contratos.py   # 24 operações, 104 validações
```

No repositório de discovery da N1, para regravar os exemplos a partir dos dados do protótipo:

```
python3 tools/handoff/gerar_exemplos.py
```

Para o lint do OpenAPI, sem instalar nada: `docker run --rm -v "$PWD:/spec" redocly/cli lint docs/api/openapi.yaml`.

No projeto Nuxt, o mesmo é feito por `pnpm test` em `tests/contract/` (criado na task T-0009).
