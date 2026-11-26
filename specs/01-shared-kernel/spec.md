# Spec 01 — Shared kernel

| | |
|---|---|
| Marco | M1 |
| Contexto do domínio | [Shared kernel](../../docs/domain/shared-kernel.md) |
| Telas do protótipo | nenhuma página própria; peças de `base.html.j2`, `partials/faq.html.j2`, `paginacao.html.j2`, `migalhas.html.j2`, `texto-seo.html.j2`, `banner.html.j2` e o comportamento de `ui/js/site.js` e `institucional.js` |
| ADRs que se aplicam | 0002, 0003, 0004, 0005, 0006, 0008, 0010, 0011, 0012, 0013, 0014 |
| Depende de | Módulo 00 |

## 1. Objetivo

O pouco que todos os contextos usam, pronto e testado: os tipos de domínio compartilhados (`Result`,
`Dinheiro`, `Slug`, `Imagem`, `Pagina<T>`, `HtmlSeguro`), os erros comuns, o cliente HTTP único, o
mapa de rotas, a formatação em pt-BR, os tipos de SEO e os componentes de interface sem regra de
negócio (acordeão, guias, carrossel, diálogo, estados, paginação, texto de apoio, migalhas, capas de
vídeo e de mapa, botão e campo).

Ao fim deste módulo, nenhum contexto precisa inventar um tipo de erro, formatar preço, montar URL ou
escrever a navegação por teclado de um componente.

## 2. Requisitos

| Id | Requisito | Origem |
|---|---|---|
| REQ-01-01 | `Result<T, E>` representa sucesso ou falha sem exceção, com `ok`, `falha`, `mapear`, `encadear` e `ouPadrao`. | ADR 0010, RNF-07 |
| REQ-01-02 | `Dinheiro` guarda centavos inteiros em BRL, compara e soma na mesma moeda e formata `R$ 529,00`. Não divide nem aplica desconto. | RNF-07, premissa P3 do PRD |
| REQ-01-03 | Os erros comuns do kernel (`ErroDeRede`, `ErroDeContrato`, `NaoEncontrado`, `ErroDeValidacao`) formam uma união fechada, e cada um leva o que a tela precisa para reagir. | ADR 0010, RNF-06 |
| REQ-01-04 | `ClienteHttp` é a única saída HTTP: lê `apiBase` da configuração, aplica tempo limite, repassa os cookies da requisição no SSR, valida a resposta com o schema recebido e converte falha de rede, status e `problem+json` em erros do kernel. Nunca lança. | RNF-05, ADR 0003, ADR 0004 |
| REQ-01-05 | `HtmlSeguro` só existe para HTML que passou pela lista branca de tags e atributos; o resto é recusado. | RNF-06, ADR 0004 |
| REQ-01-06 | Toda URL interna é gerada por `rotas.*`, e `resolverRota(caminho)` faz o caminho de volta, reconhecendo também o padrão legado do site atual. | ADR 0008 |
| REQ-01-07 | `shared/seo` define o tipo de metadados de página e monta `BreadcrumbList` e `FAQPage` válidos. | RNF-01, ADR 0011 |
| REQ-01-08 | `Slug`, `Imagem` e `Pagina<T>` validam os próprios invariantes na criação. | RNF-07 |
| REQ-01-09 | Datas, números, telefones e plurais saem em pt-BR por funções puras. | RNF-07 |
| REQ-01-10 | `Acordeao` abre e fecha cada item sozinho, com botão dentro de título e os atributos ARIA do padrão. | RF-17, RNF-02 |
| REQ-01-11 | `Guias` segue o padrão de abas da WAI-ARIA: setas, Home e End trocam de guia, e só a guia ativa recebe o Tab. | RF-15, RNF-02 |
| REQ-01-12 | `Carrossel` só se move por ação do usuário: setas, pontos de pelo menos 24 px, arraste e teclado. Não há rotação automática. | RF-17, RNF-02 |
| REQ-01-13 | `Dialogo` é modal: prende o foco, fecha com Esc, com o botão de fechar e com clique fora, e devolve o foco a quem abriu. | RF-09, RNF-02 |
| REQ-01-14 | `EstadoVazio`, `EstadoDeErro` e `Esqueleto` dão a todo bloco os estados de vazio, erro (com "Tentar de novo" quando faz sentido) e carregando. | RNF-06, ADR 0010 |
| REQ-01-15 | `Paginacao` mostra os números e "Próxima página" na mesma linha, com links de verdade e a página atual marcada. | RF-05 |
| REQ-01-16 | `TextoDeApoio` mostra o texto recolhido, com "Ler mais" e "Ler menos"; o texto inteiro está sempre no HTML. | RF-03, RF-17, RNF-01 |
| REQ-01-17 | `Migalhas` começa em Home e termina na página atual, que não é link. | RNF-01 |
| REQ-01-18 | `CapaDeVideo` e `CapaDeMapa` mostram uma capa e só criam o `iframe` depois do toque do usuário. | RF-13, RF-15, RNF-03, ADR 0012 |
| REQ-01-19 | O `ClienteHttp` é entregue à aplicação em um lugar só (`app/plugins/01.http.ts`), uma instância por requisição no servidor. | RNF-05, ADR 0002 |
| REQ-01-20 | `Botao` e `Campo` aplicam as classes do protótipo, garantem alvo de 44 px e só pintam de verde a variante de ação. | RNF-02, RNF-04, ADR 0006 |
| REQ-01-21 | Os testes do domínio e da aplicação são medidos por teste de mutação, toda semana e sob demanda, fora do pull request, com um limite mínimo que reprova a execução. | RNF-07, ADR 0005, ADR 0014 |

## 3. Critérios de aceite

Este módulo não tem tela própria. Os critérios CA-01-01 a CA-01-06 são provados por testes de unidade
e de adaptador (T-0102 a T-0105 e T-0118); os CA-01-07 a CA-01-09, pelo e2e na página de prova (T-0120).

**CA-01-01 · Falha esperada não vira exceção**
- **Dado** o `ClienteHttp` apontado para um servidor que responde 500
- **Quando** peço `GET /navegacao`
- **Então** recebo um `Result` de falha com `ErroDeRede` e `tentarDeNovo: true`, e nenhuma exceção sobe

**CA-01-02 · Resposta fora do contrato é apontada**
- **Dado** uma resposta de `GET /navegacao` sem o campo `contato.telefone`
- **Quando** o `ClienteHttp` valida com o schema recebido
- **Então** recebo `ErroDeContrato` com o endpoint `GET /navegacao` e o caminho `contato.telefone`

**CA-01-03 · Trocar de backend é trocar a URL**
- **Dado** `NUXT_PUBLIC_API_BASE` apontando para outro servidor
- **Quando** qualquer adaptador chama o `ClienteHttp`
- **Então** a chamada vai para a nova base, sem mudança de código

**CA-01-04 · Dinheiro sem ponto flutuante**
- **Dado** `Dinheiro` de 50255 centavos
- **Quando** somo com ele mesmo e formato
- **Então** leio `R$ 1.005,10`

**CA-01-05 · HTML fora da lista branca é recusado**
- **Dado** um texto de apoio com `<script>` ou com `onclick`
- **Quando** o adaptador tenta criar o `HtmlSeguro`
- **Então** recebe `ErroDeContrato` dizendo a tag ou o atributo recusado

**CA-01-06 · URL em um lugar só**
- **Dado** um produto de código `3084` e slug `pneu-hankook-ventus-prime-2-k115-225-45-r17-91v`
- **Quando** chamo `rotas.produto(...)` e depois `resolverRota` com o resultado
- **Então** obtenho `/p/3084/pneu-hankook-ventus-prime-2-k115-225-45-r17-91v` e, de volta, `{ tipo: 'produto', id: '3084' }`

**CA-01-07 · Componentes usáveis só com o teclado**
- **Dado** a página de prova dos componentes, em 1440 px e em 390 px
- **Quando** navego só com Tab, setas, Home, End, Enter, Espaço e Esc
- **Então** abro e fecho o acordeão, troco de guia, passo os slides do carrossel, abro e fecho o diálogo com o foco voltando ao botão, e o foco é sempre visível

**CA-01-08 · Nada de terceiro antes do toque**
- **Dado** a página de prova com uma capa de vídeo e uma capa de mapa
- **Quando** a página termina de carregar
- **Então** não há nenhum `iframe`; depois de tocar na capa, há um `iframe` com `title`

**CA-01-09 · Nenhum carrossel anda sozinho**
- **Dado** um carrossel com três slides na página de prova
- **Quando** espero 6 segundos sem interagir
- **Então** o slide visível é o mesmo

**CA-01-10 · Teste que não pega defeito aparece**
- **Dado** uma regra do domínio com um teste que a executa mas não confere o resultado
- **Quando** rodo `pnpm test:mutacao`
- **Então** o relatório lista o mutante que sobreviveu, com o arquivo e a linha, e a execução reprova se a pontuação ficar abaixo do limite

## 4. Contratos

Este módulo não é dono de endpoint. Ele define como **todo** endpoint é lido.

| Convenção do contrato | Onde é tratada | Regra |
|---|---|---|
| Erro em `application/problem+json` ([erro-404.json](../../docs/api/examples/erro-404.json), [erro-422.json](../../docs/api/examples/erro-422.json)) | `ClienteHttp` | 404 → `NaoEncontrado` com a `title`; 422 → `ErroDeValidacao` com `erros[]` (`campo`, `mensagem`); 5xx, sem resposta e tempo esgotado → `ErroDeRede` |
| Dinheiro `{ "centavos": 52900, "moeda": "BRL" }` | `Dinheiro` | Inteiro, em centavos |
| Imagem `{ "src", "largura", "altura", "alt" }` | `Imagem` | Largura e altura positivas |
| Campos terminados em `Html` | `HtmlSeguro` | Lista branca: `p`, `h2`, `h3`, `ul`, `ol`, `li`, `strong`, `em`, `a`, `br`; com a opção de tabela, também `table`, `tr`, `td`. Só o atributo `href` |
| `href` interno é caminho, externo é URL completa, `null` é item sem link | `shared/routing` | `classificarHref` devolve `interno`, `externo` ou `ausente` |
| Datas ISO 8601 | `shared/formatacao` | Só data não sofre deslocamento de fuso |

Detalhes das convenções em [docs/api/README.md](../../docs/api/README.md).

## 5. Estados de tela

Os componentes deste módulo são os tijolos dos estados de todos os outros.

| Componente | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| `Esqueleto` | É o próprio estado: bloco cinza com as dimensões recebidas, `aria-hidden` | — | — | — |
| `EstadoVazio` | — | — | Título, texto e a ação que vem pelo slot | — |
| `EstadoDeErro` | — | — | — | Mensagem conforme o tipo do erro; "Tentar de novo" só com `tentarDeNovo` |
| `Carrossel` | Reserva a altura do trilho | Slides, setas e pontos | Sem slides: não renderiza | — |
| `Paginacao` | — | Números e "Próxima página" | Uma página só: não renderiza | — |
| `CapaDeVideo`, `CapaDeMapa` | Capa (imagem com dimensões) | `iframe` depois do toque | — | Sem JavaScript, a capa é um link para o vídeo ou para o mapa |

Mensagens do `EstadoDeErro`: rede → "Não foi possível carregar. Confira a conexão e tente de novo.";
contrato → "Tivemos um problema ao mostrar esta parte da página."; não encontrado → o título recebido.

## 6. Regras de marca, acessibilidade e SEO do módulo

- Domínio, formatação, rotas e SEO são TypeScript puro: sem Vue, Nuxt ou Zod. O `ClienteHttp` recebe
  o schema por uma interface estrutural (`{ safeParse }`), sem importar o Zod.
- Verde de ação só na variante `acao` do `Botao`. "Tentar de novo", "Ler mais", "Próxima página" e as
  setas do carrossel usam a variante de contorno.
- Amarelo nunca como texto sobre branco: nenhum componente daqui usa amarelo como `color`.
- Alvos de toque de 44 px em botões, guias, títulos de acordeão e links de paginação; pontos do
  carrossel com 24 px.
- Foco sempre visível (`:focus-visible` dos tokens). Nenhum componente remove o contorno.
- `Acordeao`: `button` dentro do título (nível por prop, padrão `h3`), com `aria-expanded` e `aria-controls`.
- `Guias`: `tablist`, `tab`, `tabpanel`, `aria-selected`, `tabindex` rotativo. Sem JavaScript, todos
  os painéis aparecem.
- `Dialogo`: elemento `dialog` nativo com `showModal()`, nome acessível por `aria-labelledby` ou `aria-label`.
- `Carrossel`: respeita `prefers-reduced-motion` (rolagem sem animação).
- `Migalhas`: `nav` com `aria-label="Você está em"`; o último item com `aria-current="page"`.
- `Paginacao`: `nav` com `aria-label="Páginas"`; a página atual com `aria-current="page"`; os números
  são links, para o buscador seguir.
- `v-html` só com `HtmlSeguro`.
- Imagens sempre com `width`, `height` e `alt`, a partir de `Imagem`.

## 7. Fora do escopo

- Tipos de um contexto só: `Medida`, `Preco` e `ProdutoId` são do Catálogo; `Cep`, da Entrega;
  `Email` e `Telefone`, do Relacionamento.
- `Icone` (feito na T-0007) e o lint de marca (T-0006).
- `AvisoCookies` e `BotaoWhatsapp`: ficam em `shared/ui`, mas são construídos no módulo 02, junto do layout.
- `CarrosselBanners`, `Minicart`, mega menus e qualquer componente com dado de negócio.
- Sitemap, `robots.txt` e canônica por ambiente (ficam com o módulo de cada página).
- O carrossel de Marcas com rotação automática do protótipo: ver Pendências em [tasks.md](tasks.md).
