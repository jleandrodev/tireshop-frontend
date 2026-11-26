# Conteúdo

Schemas: `Navegacao`, `PaginaInicial`, `ListaDePoliticas`, `Politica`, `Institucional`, `BlocoDeTexto`.
É o conteúdo que o cliente (e a liveSEO) edita. O frontend só exibe.

## GET /navegacao

**Para quê:** tudo o que o cabeçalho e o rodapé do e-commerce mostram. Chamado uma vez por página, no
servidor. [Exemplo](../examples/navegacao.json).

| Campo | Regra | A tela faz |
|---|---|---|
| `contato` | Telefone, WhatsApp (só dígitos, com 55), e-mail, horário, razão social, CNPJ | Barra do topo, rodapé, botão flutuante |
| `menu` | Itens na ordem de exibição | Menu principal |
| `departamentos[].aros` | Os aros **que existem** naquele departamento, com o link de cada um | Botões de aro no mega menu. Lista vazia = só o título e o `resumoAros` |
| `marcas` | Com logo e, se houver página, `href` | Mega menu "Marcas" |
| `ajuda`, `extras` | Links | Rodapé do mega menu |
| `rodape.colunas` | Título e links | Colunas; acordeão no celular |
| `rodape.textoFiscal` | Texto obrigatório em todas as páginas | Pé do rodapé |

Os aros por departamento hoje (do menu do site): Carros 10 a 24; Pick-ups e SUVs 15 a 24; Vans 14, 15
e 16; Caminhões 17,5, 22,5 e 24; Agrícola 15 a 48; Competição 13 a 18; UTV 15; OTR 25, 33 e 35.

A página de loja física **não** usa este endpoint (ver [lojas.md](lojas.md)).

## GET /home

**Para quê:** os blocos editoriais da Home. Produtos, lojas e avaliações da Home vêm dos próprios
endpoints. [Exemplo](../examples/home.json).

| Campo | Regra |
|---|---|
| `banners` | Até 3. Cada um com arte de computador (1440×320) e de celular (390×290). O texto do banner vai no `alt`. O usuário troca; não há rotação automática. |
| `beneficios` | 4 itens (ícone, título, texto) |
| `entrega` | Cartões "No seu endereço" e "Em oficina conveniada" |
| `seguranca` | Faixa de confiança |
| `blog` | Os 3 artigos mais recentes, com link para o blog atual |
| `textoApoio` | O H1 da Home é o título deste bloco (pedido da liveSEO) |
| `faq` | Acordeão + `FAQPage` |

## GET /politicas e GET /politicas/{slug}

**Para quê:** as páginas de ajuda. A lista alimenta o menu lateral; o detalhe, a página.
Exemplos: [lista](../examples/politicas.json), [trocas](../examples/politica-trocas-e-devolucoes.json),
[perguntas frequentes](../examples/politica-perguntas-frequentes.json).

Slugs atuais: `prazo-de-entrega`, `formas-de-pagamento`, `garantia`, `trocas-e-devolucoes`,
`seguranca-e-privacidade`, `privacidade`, `como-comprar`, `perguntas-frequentes`.

O corpo é uma lista de **blocos**, na ordem de exibição:

| `tipo` | Campos | Vira |
|---|---|---|
| `paragrafo` | `html` | `<p>` |
| `titulo` | `nivel` (2 ou 3), `texto` | `<h2>` ou `<h3>` |
| `lista` | `itens[]` (HTML) | Lista com marcadores |
| `passos` | `itens[]` (HTML) | Lista numerada, com o número em destaque |
| `aviso` | `html` | Caixa de destaque |
| `faq` | `itens[]` (`pergunta`, `respostaHtml`) | Acordeão + `FAQPage` |
| `video` | `video` (`id`, `provedor`, `titulo`, `canal`, `capa`) | Capa clicável (usado no Sobre nós) |

Blocos em vez de um HTML único permitem estilizar passos e avisos e gerar dados estruturados. Se o
CMS de vocês só tiver HTML, combinem conosco: um bloco `paragrafo` com o HTML inteiro funciona, com
perda de formatação.

`contatoHtml` é o parágrafo de contato do fim da página (`null` = usa o padrão da navegação).
`titulo` é o H1. **Erros:** 404.

## GET /institucional

**Para quê:** a página Sobre nós. [Exemplo](../examples/institucional.json).

| Campo | Regra | A tela faz |
|---|---|---|
| `titulo` | H1 | |
| `secoes[]` | `titulo` (`null` na primeira) e blocos de `paragrafo`, `lista` e `video` | Texto de um lado, vídeo ou texto do outro |
| `fatos` | 4 itens | Cartões "em poucas palavras" |
| `lojasTexto` | Parágrafo de apoio | Ao lado dos cartões das lojas (que vêm de `GET /lojas`) |
| `estoque` | Título, blocos e 3 fotos | Seção "Estoque" |

Vídeo: o frontend mostra a `capa` e só carrega o player do YouTube quando o usuário toca.
