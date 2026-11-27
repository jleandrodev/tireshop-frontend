# Tasks 01 — Shared kernel

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. Primeiro o que é TypeScript puro (T-0101 a T-0108), depois a ligação do
cliente HTTP, os componentes de `shared/ui` e, por fim, o e2e na página de prova. Os ids T-0101 a
T-0117 são citados por outros módulos: não renumere.

---

### [x] T-0101 · `Result` representa sucesso ou falha sem exceção · 2026-11-27

- **Requisito:** REQ-01-01
- **Camada:** domínio
- **Teste primeiro:** `layers/shared/domain/result.spec.ts`
  - `ok(42)` é sucesso e expõe o valor; `falha(e)` é falha e expõe o erro
  - `mapear` transforma o valor do sucesso e deixa a falha intacta
  - `encadear` com uma função que falha devolve aquela falha
  - `encadear` sobre uma falha não chama a função
  - `ouPadrao(0)` devolve o valor no sucesso e `0` na falha
  - o TypeScript só deixa ler `valor` depois de conferir `ok` (teste de tipo com `expectTypeOf`)
- **Pronto quando:** `Result<T, E>` é uma união discriminada por `ok`, exportada por `layers/shared/index.ts`; nenhum `throw` no arquivo.
- **Arquivos:** `layers/shared/domain/result.ts`, `result.spec.ts`, `layers/shared/index.ts`
- **Fora do escopo:** versões assíncronas (`Promise<Result>` se resolve com `await`); erros do kernel (T-0103).
- **Depende de:** T-0003

**Pendência:** o `@ts-expect-error` sozinho não bastava — `resultado.valor` como expressão solta
reprovava no `@typescript-eslint/no-unused-expressions`. Resolvido com `// eslint-disable-line`
na mesma linha (um `eslint-disable-next-line` separado, numa linha acima do `@ts-expect-error`,
mira a linha errada: a do comentário, não a da expressão). Confirmado que `nuxt typecheck` cobre
`layers/*/domain/**`, inclusive `.spec.ts` — ao contrário de `tests/infra/`, `scripts/` e
`tests/contract/` (Pendência da T-0003): o teste de tipo é mesmo verificado.

### [x] T-0102 · `Dinheiro` guarda centavos inteiros e formata em reais · 2026-11-27

- **Requisito:** REQ-01-02
- **Camada:** domínio
- **Teste primeiro:** `layers/shared/domain/dinheiro.spec.ts`
  - `Dinheiro.deCentavos(52900).formatar()` devolve `R$ 529,00` (com espaço inseparável, para o preço não quebrar de linha)
  - `100510` centavos formata `R$ 1.005,10`; `0` formata `R$ 0,00`
  - recusa centavos não inteiros (`529.9`), `NaN` e negativos
  - `somar` devolve um novo `Dinheiro`; o original não muda
  - `maiorQue`, `menorOuIgual` e `igual` comparam pelos centavos
  - recusa moeda diferente de `BRL`
  - não existe método de dividir, multiplicar por fração ou aplicar percentual
- **Pronto quando:** `Dinheiro.deCentavos` devolve `Result<Dinheiro, DinheiroInvalido>`; classe imutável; fábrica de teste `umDinheiro(centavos)` em `__fabricas__/`.
- **Arquivos:** `layers/shared/domain/dinheiro.ts`, `dinheiro.spec.ts`, `layers/shared/domain/__fabricas__/dinheiro.ts`
- **Fora do escopo:** parcelamento e desconto (vêm prontos da API; `Preco` é do módulo 03).
- **Depende de:** T-0101

### [x] T-0103 · `ClienteHttp` valida a resposta e converte toda falha em erro do kernel · 2026-11-27

- **Requisito:** REQ-01-03, REQ-01-04
- **Camada:** adaptador
- **Teste primeiro:** `layers/shared/http/cliente-http.spec.ts` (com `fetch` falso injetado)
  - `obter('/produtos', { consulta: { aro: ['17', '18'], pagina: 1, marca: undefined } })` chama `{apiBase}/produtos?aro=17&aro=18&pagina=1`, com a base lida da configuração (`/api/mock` no teste)
  - resposta 200 que valida no schema recebido vira `ok` com o valor já tipado
  - resposta 200 sem `contato.telefone` vira `ErroDeContrato` com `endpoint: 'GET /navegacao'` e `caminho: 'contato.telefone'`
  - 404 com o corpo de `erro-404.json` vira `NaoEncontrado` com o título "Produto não encontrado"
  - 422 com o corpo de `erro-422.json` vira `ErroDeValidacao` com `campos: [{ campo: 'cep', mensagem: 'Digite o CEP completo, com 8 números.' }]`
  - 500, falha de rede e tempo esgotado (limite padrão de 8 s, configurável) viram `ErroDeRede` com `tentarDeNovo: true`
  - no servidor, repassa o cabeçalho `cookie` recebido na configuração; no navegador, envia as credenciais
  - `enviar('POST', '/newsletter', corpo)` manda JSON e aceita 201 com schema, e 204 sem corpo
- **Pronto quando:** `criarClienteHttp({ apiBase, tempoLimiteMs, cabecalhos, fetch })` devolve a interface `ClienteHttp` (`obter`, `enviar`); os quatro erros estão em `layers/shared/domain/erros.ts`, como união discriminada por `tipo`; nenhum método lança; o schema é recebido como `{ safeParse }`, sem importar o Zod; existe `ClienteHttpFalso` em `layers/shared/http/__falsos__/` para os adaptadores dos contextos.
- **Arquivos:** `layers/shared/domain/erros.ts`, `erros.spec.ts`, `layers/shared/http/cliente-http.ts`, `cliente-http.spec.ts`, `layers/shared/http/__falsos__/cliente-http-falso.ts`, `layers/shared/index.ts`
- **Fora do escopo:** ler o `runtimeConfig` e os cabeçalhos da requisição do Nuxt (T-0118); autenticação (dúvida D1 do PRD); repetição automática.
- **Depende de:** T-0101

**Decisões:** o erro de `safeParse` segue o formato real do `SafeParseReturnType` do Zod
(`{ success: false, error: { issues: [{ path, message }] } }`) — mesmo sem importar o pacote, é
esse formato que um schema Zod de verdade devolve. `ErroDeContrato.caminho` vem de
`issues[0].path.join('.')`. Qualquer status de falha fora de 404/422 vira `ErroDeRede`. Acrescentei
`argsIgnorePattern: '^_'` ao ESLint (global): parâmetro não usado prefixado com `_` é intencional
(apareceu no fake de fetch e deve se repetir em portas/falsos futuros).

### [x] T-0104 · `HtmlSeguro` só aceita a lista branca de tags · 2026-11-27

- **Requisito:** REQ-01-05
- **Camada:** domínio
- **Teste primeiro:** `layers/shared/domain/html-seguro.spec.ts`
  - aceita `p`, `h2`, `h3`, `ul`, `ol`, `li`, `strong`, `em`, `a` e `br`
  - recusa `script`, `style`, `iframe` e `img`, dizendo a tag
  - recusa qualquer atributo que não seja `href` (`onclick`, `style`, `class`), dizendo o atributo
  - recusa `href` com `javascript:`; aceita `https:`, `mailto:`, `tel:`, caminho (`/ajuda/garantia`) e âncora (`#faq-medida`)
  - `table`, `tr` e `td` só passam com a opção `{ tabelas: true }` (descrição do produto)
  - texto sem tag nenhuma é aceito; texto vazio é aceito
  - o texto de apoio de `categoria-pneus-para-carros.json` é aceito sem alteração
- **Pronto quando:** `HtmlSeguro.criar(html, opcoes?)` devolve `Result<HtmlSeguro, ErroDeContrato>`; o construtor é privado; roda em `node`, sem DOM e sem dependência nova.
- **Arquivos:** `layers/shared/domain/html-seguro.ts`, `html-seguro.spec.ts`
- **Fora do escopo:** limpar ou corrigir o HTML (o kernel recusa; quem conserta é o backend); renderização.
- **Depende de:** T-0103

**Decisão:** o esquema do `href` é lista branca (`https:`, `mailto:`, `tel:`, caminho começando
com `/` mas não `//`, âncora `#...`), não só um bloqueio de `javascript:` — mais seguro contra
`data:`, protocolo relativo etc. Confirmado contra a fixture real (links absolutos
`https://www.tireshop.com.br/...` no texto de apoio).

### [x] T-0105 · `rotas` gera toda URL interna e `resolverRota` faz o caminho de volta · 2026-11-27

- **Requisito:** REQ-01-06
- **Camada:** domínio
- **Teste primeiro:** `layers/shared/routing/rotas.spec.ts`
  - `rotas.home()` é `/`; `rotas.home({ ancora: 'faq-medida' })` é `/#faq-medida`
  - `rotas.categoria('pneus-para-carros')` é `/c/pneus-para-carros`; com `{ pagina: 2 }`, `/c/pneus-para-carros?pagina=2`; a página 1 não entra na URL
  - `rotas.produto({ id: '3084', slug: 'pneu-hankook-ventus-prime-2-k115-225-45-r17-91v' })` é `/p/3084/pneu-hankook-ventus-prime-2-k115-225-45-r17-91v`
  - `rotas.politica('trocas-e-devolucoes')` é `/ajuda/trocas-e-devolucoes`; `rotas.sobreNos()` é `/sobre-nos`; `rotas.lojas()` é `/lojas`; `rotas.loja('curitiba')` é `/lojas/curitiba`
  - `rotas.comparar(['3084', '3026'])` é `/comparar?p=3084,3026`; sem ids, `/comparar`
  - `resolverRota` devolve o tipo e os parâmetros de cada URL gerada acima
  - `resolverRota('/1/5/Pneus-para-carros_Pneu-Aro-17')` devolve `{ tipo: 'legado', caminho }`; caminho desconhecido devolve `{ tipo: 'desconhecida' }`
  - `classificarHref` devolve `interno` para `/c/hankook`, `externo` para `https://www.tireshop.com.br/Blog` e `ausente` para `null`
- **Pronto quando:** as rotas propostas em [docs/design/mapa-prototipo.md](../../docs/design/mapa-prototipo.md) estão em um arquivo só; a regra de lint do antipadrão A11 (literal `.html` e `/produto/` em `ui/`) continua passando.
- **Arquivos:** `layers/shared/routing/rotas.ts`, `rotas.spec.ts`, `layers/shared/index.ts`
- **Fora do escopo:** consultar a API para resolver caminho legado; redirecionamentos; a decisão final de URL (dúvida D2 do PRD).
- **Depende de:** T-0003

### [x] T-0106 · `shared/seo` define os metadados e monta `BreadcrumbList` e `FAQPage` · 2026-11-27

- **Requisito:** REQ-01-07
- **Camada:** domínio
- **Teste primeiro:** `layers/shared/seo/json-ld.spec.ts`
  - `breadcrumbList` com Home, "Pneus para carros" e "Aro 17" gera três `ListItem`, com `position` 1, 2 e 3
  - cada `item` vira URL absoluta a partir da origem recebida (`https://www.tireshop.com.br/c/pneus-para-carros`)
  - o último item, sem `href`, sai sem `item`
  - `faqPage` gera uma `Question` por pergunta, com a resposta em texto sem tags
  - `faqPage` com a lista vazia devolve nada (a página não emite o bloco)
  - o resultado passa por `JSON.stringify` e `JSON.parse` sem perda
- **Pronto quando:** existe o tipo `Metadados` (`titulo`, `descricao`, `canonica`, `robots`, `jsonLd[]`) e o tipo `Migalha` (`rotulo`, `href` ou nulo), usados pelas funções de metadados de cada contexto.
- **Arquivos:** `layers/shared/seo/metadados.ts`, `json-ld.ts`, `json-ld.spec.ts`, `layers/shared/index.ts`
- **Fora do escopo:** `Product` e `AutomotiveBusiness` (cada contexto monta o seu); `useSeoMeta` e `useHead` (só na página).
- **Depende de:** T-0105

### [x] T-0107 · `Slug`, `Imagem` e `Pagina<T>` validam os próprios invariantes — 2026-11-27

- **Requisito:** REQ-01-08
- **Camada:** domínio
- **Teste primeiro:** `layers/shared/domain/tipos-basicos.spec.ts`
  - `Slug` aceita `pneus-para-carros` e `225-45-r17`
  - `Slug` recusa maiúscula, espaço, acento, barra e texto vazio
  - `Imagem` aceita `{ src: '/img/produtos/3084-320.webp', largura: 320, altura: 284, alt: '…' }`
  - `Imagem` recusa largura ou altura zero ou negativa; aceita `alt` vazio (imagem decorativa)
  - `Pagina` com `pagina: 1`, `porPagina: 12`, `total: 26` e `totalPaginas: 3` tem `temProxima()` verdadeiro; na página 3, falso
  - `Pagina` recusa `pagina` menor que 1
  - `Pagina` vazia (`total: 0`) é válida e não tem próxima
- **Pronto quando:** os três devolvem `Result` na criação e são imutáveis.
- **Arquivos:** `layers/shared/domain/slug.ts`, `imagem.ts`, `pagina.ts`, `tipos-basicos.spec.ts`
- **Fora do escopo:** gerar slug a partir de texto livre; `srcset` e otimização de imagem.
- **Depende de:** T-0101
- **Decisões:** `Pagina<T>.de` recebe `itens: readonly T[]` junto de `pagina`/`porPagina`/`total` (a
  entidade genérica guarda a própria página de itens); `totalPaginas` é calculado
  (`Math.ceil(total / porPagina)`, com `0` quando `total` é `0`), nunca recebido como parâmetro —
  evita os dois poderem contradizer um ao outro. `porPagina <= 0` não é validado: nenhum caso pede
  isso e os chamadores (módulos de listagem) sempre fixam o valor, não vem de entrada externa.

### [ ] T-0108 · Datas, números, telefones e plurais saem em pt-BR

- **Requisito:** REQ-01-09
- **Camada:** domínio
- **Teste primeiro:** `layers/shared/formatacao/formatacao.spec.ts`
  - `formatarData('2026-12-12')` devolve "12 de dezembro", em qualquer fuso do servidor
  - `formatarData('2026-12-12', { ano: true })` devolve "12 de dezembro de 2026"
  - `formatarNumero(4.9)` devolve "4,9"; `formatarNumero(1234)` devolve "1.234"
  - `formatarTelefone('4133172251')` devolve "(41) 3317-2251"; com 11 dígitos, "(41) 99999-0000"
  - `linkDeTelefone('(41) 3317-2251')` devolve `tel:+554133172251`
  - `linkDoWhatsapp('554133172251')` devolve `https://wa.me/554133172251`
  - `plural(1, 'pneu', 'pneus')` devolve "1 pneu"; com 2, "2 pneus"
  - entrada inválida (data que não existe, telefone com 5 dígitos) devolve o texto original, sem lançar
- **Pronto quando:** funções puras, sem estado; `Intl` com a localidade `pt-BR` fixa.
- **Arquivos:** `layers/shared/formatacao/datas.ts`, `numeros.ts`, `telefones.ts`, `formatacao.spec.ts`, `layers/shared/index.ts`
- **Fora do escopo:** dinheiro (é do `Dinheiro`); validação de telefone (é do Relacionamento); máscara de campo.
- **Depende de:** T-0003

### [ ] T-0109 · `Acordeao` abre e fecha cada item sozinho

- **Requisito:** REQ-01-10
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/Acordeao.spec.ts`
  - cada pergunta é um `button` dentro de um título do nível pedido (padrão `h3`)
  - o primeiro item começa aberto; os outros, fechados e com o painel `hidden`
  - clicar alterna `aria-expanded` e mostra ou esconde o painel apontado por `aria-controls`
  - abrir um item não fecha os outros
  - Enter e Espaço no botão têm o mesmo efeito do clique
  - a resposta aceita `HtmlSeguro` e é renderizada como HTML
  - `abrir(id)` exposto pelo componente abre o item pedido (uso: "Onde encontro a medida?")
  - o prefixo dos ids vem por prop, para dois acordeões na mesma página não colidirem
- **Pronto quando:** usa as classes `ts-faq*` do protótipo, sem CSS novo; a resposta completa está no HTML do servidor.
- **Arquivos:** `layers/shared/ui/Acordeao.vue`, `Acordeao.spec.ts`
- **Fora do escopo:** JSON-LD `FAQPage` (T-0106, aplicado pela página); acordeão do rodapé (é `details`, módulo 02).
- **Depende de:** T-0104

### [ ] T-0110 · `Guias` troca de painel com clique, setas, Home e End

- **Requisito:** REQ-01-11
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/Guias.spec.ts`
  - renderiza `tablist`, um `tab` por guia e um `tabpanel` por painel, ligados por `aria-controls` e `aria-labelledby`
  - só a guia ativa tem `aria-selected="true"` e `tabindex="0"`; as outras, `tabindex="-1"`
  - seta para a direita vai para a próxima guia e move o foco; na última, volta para a primeira
  - seta para a esquerda na primeira vai para a última
  - Home vai para a primeira; End, para a última
  - só o painel da guia ativa fica visível
  - a guia inicial vem por prop; mudar emite `mudar` com o id da guia
  - no HTML do servidor todos os painéis estão presentes
- **Pronto quando:** usa as classes `ts-abas*`; o `tablist` tem `aria-label` recebido por prop; cada guia tem pelo menos 44 px de altura.
- **Arquivos:** `layers/shared/ui/Guias.vue`, `Guias.spec.ts`
- **Fora do escopo:** conteúdo das guias (filtro de pneus no módulo 05; marcas da loja no módulo 12).
- **Depende de:** T-0007

### [ ] T-0111 · `Carrossel` só anda quando o usuário manda

- **Requisito:** REQ-01-12
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/Carrossel.spec.ts`
  - "Anterior" começa desativado; "Próximo" fica desativado no último slide
  - clicar em "Próximo" rola o trilho um passo (largura do item mais o espaço entre eles)
  - com `pontos`, há um botão por slide, e o atual tem `aria-current="true"`
  - clicar em um ponto leva ao slide dele
  - com `prefers-reduced-motion`, a rolagem não é animada
  - com temporizadores falsos, 10 segundos se passam e a posição não muda (não há `setInterval`)
  - as setas e os pontos têm nome acessível ("Anterior", "Próximo", "Ir para o slide 2 de 3")
  - sem slides, o componente não renderiza nada
- **Pronto quando:** trilho com `scroll-snap`, como no protótipo; região com `aria-label` por prop; setas de 44 px e pontos de 24 px; não existe prop de rotação automática.
- **Arquivos:** `layers/shared/ui/Carrossel.vue`, `Carrossel.spec.ts`
- **Fora do escopo:** o conteúdo dos slides (`CarrosselBanners` é do módulo 09); a rotação do carrossel de Marcas (ver Pendências).
- **Depende de:** T-0007

### [ ] T-0112 · `Dialogo` é modal, prende o foco e fecha com Esc

- **Requisito:** REQ-01-13
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/Dialogo.spec.ts`
  - com `aberto`, o `dialog` é aberto por `showModal()`; sem, fica fechado
  - Esc fecha e emite `fechar`
  - o botão de fechar tem o `aria-label` recebido ("Fechar o carrinho") e emite `fechar`
  - clique fora da caixa fecha; clique dentro, não
  - ao fechar, o foco volta ao elemento que tinha o foco na abertura
  - o nome acessível vem de `aria-labelledby` (com título) ou de `aria-label` (sem título)
  - com `fecharAcimaDe: 900`, fecha quando a janela passa de 900 px
  - as variantes `direita` e `esquerda` aplicam a classe da gaveta lateral
- **Pronto quando:** usa o `dialog` nativo (o navegador prende o foco e deixa o fundo inerte); serve ao minicart, ao menu do celular e ao painel de filtros.
- **Arquivos:** `layers/shared/ui/Dialogo.vue`, `Dialogo.spec.ts`
- **Fora do escopo:** conteúdo das gavetas (módulos 02, 03 e 06).
- **Depende de:** T-0007

### [ ] T-0113 · `EstadoVazio`, `EstadoDeErro` e `Esqueleto` cobrem os estados que não são sucesso

- **Requisito:** REQ-01-14
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/Estados.spec.ts`
  - `EstadoVazio` mostra o título, o texto e a ação recebida pelo slot
  - `EstadoDeErro` com `ErroDeRede` mostra a mensagem de conexão e o botão "Tentar de novo", que emite `tentar`
  - `EstadoDeErro` com `ErroDeContrato` mostra a mensagem genérica, sem botão e sem expor o caminho do campo
  - `EstadoDeErro` com `NaoEncontrado` mostra o título recebido
  - `EstadoDeErro` tem `role="alert"`; `EstadoVazio` tem `role="status"`
  - `Esqueleto` reserva a largura e a altura recebidas e tem `aria-hidden="true"`
  - "Tentar de novo" usa a variante de contorno, não a verde
- **Pronto quando:** as mensagens são as da seção 5 da spec; nenhum bloco de outro módulo precisa escrever o próprio estado de erro.
- **Arquivos:** `layers/shared/ui/EstadoVazio.vue`, `EstadoDeErro.vue`, `Esqueleto.vue`, `Estados.spec.ts`
- **Fora do escopo:** página de não encontrado (módulo 02); esqueletos com forma de card (cada contexto compõe o seu).
- **Depende de:** T-0103, T-0007

### [ ] T-0114 · `Paginacao` mostra os números e "Próxima página" na mesma linha

- **Requisito:** REQ-01-15
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/Paginacao.spec.ts`
  - com 3 páginas e a atual 1, mostra 1, 2 e 3 e o link "Próxima página"
  - a página atual é um `span` com `aria-current="page"`, não um link
  - cada número é um link com o `href` devolvido pela função recebida (`n => rotas.categoria(slug, { pagina: n })`)
  - na última página não há "Próxima página"
  - com uma página só, não renderiza nada
  - clicar em um número emite `ir` com a página (a tela decide entre navegar e refazer a busca)
- **Pronto quando:** recebe um `Pagina<T>` (ou os quatro números) por props; usa as classes `ts-paginacao*`; `nav` com `aria-label="Páginas"`; links com 44 px.
- **Arquivos:** `layers/shared/ui/Paginacao.vue`, `Paginacao.spec.ts`
- **Fora do escopo:** reticências para muitas páginas (o catálogo atual tem no máximo 3; ver Pendências); rolagem infinita.
- **Depende de:** T-0107

### [ ] T-0115 · `TextoDeApoio` recolhe o texto e abre com "Ler mais"

- **Requisito:** REQ-01-16
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/TextoDeApoio.spec.ts`
  - o título sai no nível pedido (`h1` na Home, `h2` nas categorias)
  - o corpo começa recolhido, e o texto inteiro está no HTML
  - "Ler mais" abre, vira "Ler menos" e marca `aria-expanded="true"`; clicar de novo recolhe
  - o botão aponta para o corpo com `aria-controls`
  - sem imagem, aplica a variante centralizada; com imagem, a imagem tem `width`, `height` e `alt`
  - o corpo só aceita `HtmlSeguro`
- **Pronto quando:** usa as classes `ts-seo*`; o botão é de contorno.
- **Arquivos:** `layers/shared/ui/TextoDeApoio.vue`, `TextoDeApoio.spec.ts`
- **Fora do escopo:** descrição do produto (módulo 04 reutiliza o componente).
- **Depende de:** T-0104

### [ ] T-0116 · `Migalhas` vai de Home até a página atual

- **Requisito:** REQ-01-17
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/Migalhas.spec.ts`
  - o primeiro item é sempre "Home", com link para `rotas.home()`
  - os itens do meio são links para o `href` recebido
  - o último item é texto, com `aria-current="page"`, mesmo que venha com `href`
  - item do meio sem `href` sai como texto
  - a lista é um `ol` dentro de `nav` com `aria-label="Você está em"`
- **Pronto quando:** recebe `Migalha[]` de `shared/seo`; usa as classes `ts-migalhas*`.
- **Arquivos:** `layers/shared/ui/Migalhas.vue`, `Migalhas.spec.ts`
- **Fora do escopo:** emitir o JSON-LD (a página aplica o `breadcrumbList` da T-0106 com as mesmas migalhas).
- **Depende de:** T-0105, T-0106

### [ ] T-0117 · `CapaDeVideo` e `CapaDeMapa` só carregam o `iframe` ao tocar

- **Requisito:** REQ-01-18
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/Capas.spec.ts`
  - antes do toque, `CapaDeVideo` mostra a imagem de capa e nenhum `iframe`
  - a capa é um link para o vídeo no YouTube (funciona sem JavaScript) e tem nome acessível "Assistir: {título}"
  - ao tocar, a capa dá lugar a um `iframe` de `youtube-nocookie.com/embed/{id}`, com `title` igual ao título do vídeo, e o foco vai para ele
  - `CapaDeMapa` mostra a capa com o botão "Ver o mapa" e nenhum `iframe`
  - ao tocar, cria o `iframe` com a URL de incorporação e o `title` recebidos
  - a capa do mapa traz o link "Abrir no Google Maps", que funciona sem JavaScript
  - as imagens de capa têm `width`, `height` e `alt`
- **Pronto quando:** a área reservada não muda de tamanho na troca (sem salto de layout); nenhum pedido a `youtube` ou `google` acontece antes do toque.
- **Arquivos:** `layers/shared/ui/CapaDeVideo.vue`, `CapaDeMapa.vue`, `Capas.spec.ts`
- **Fora do escopo:** conteúdo do Sobre nós (módulo 11) e das lojas (módulo 12); consentimento de cookies de terceiros.
- **Depende de:** T-0107

### [ ] T-0118 · O `ClienteHttp` é criado em um lugar só, um por requisição

- **Requisito:** REQ-01-19
- **Camada:** infra
- **Teste primeiro:** `layers/shared/http/use-cliente-http.spec.ts` (ambiente Nuxt)
  - `useClienteHttp()` devolve um cliente com a base de `runtimeConfig.public.apiBase`
  - mudando `NUXT_PUBLIC_API_BASE` no teste, a chamada vai para a nova base
  - no servidor, o cliente leva o cabeçalho `cookie` da requisição atual
  - duas requisições ao servidor recebem instâncias diferentes (sem cookie de um cliente no outro)
  - com o cliente trocado no teste (`provide`), `useClienteHttp()` devolve o falso
- **Pronto quando:** `app/plugins/01.http.ts` é o único lugar que chama `criarClienteHttp`; os plugins dos contextos (`10.catalogo.ts`…) recebem o cliente dele; o tempo limite vem de `runtimeConfig.public.apiTempoLimiteMs`.
- **Arquivos:** `app/plugins/01.http.ts`, `layers/shared/http/use-cliente-http.ts`, `use-cliente-http.spec.ts`, `nuxt.config.ts` (runtimeConfig)
- **Fora do escopo:** adaptadores dos contextos; regras de cache (`routeRules`) de cada página.
- **Depende de:** T-0103, T-0008

### [ ] T-0119 · `Botao` e `Campo` aplicam a marca e o alvo de 44 px

- **Requisito:** REQ-01-20
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/BotaoECampo.spec.ts`
  - `Botao` sem variante é de contorno; só `variante="acao"` recebe a classe verde (`ts-btn--acao`)
  - com `href`, renderiza um link; sem, um `button` com `type="button"` por padrão
  - `carregando` desativa o botão e marca `aria-busy="true"`, mantendo o texto
  - `Campo` liga o rótulo ao controle pelo `id`; o rótulo pode ser só para leitor de tela
  - com `erro`, o controle recebe `aria-invalid="true"` e `aria-describedby` apontando para a mensagem
  - `Campo` aceita `input` e `select` pelo slot, sem mudar o comportamento
- **Pronto quando:** usa as classes `ts-btn*` e `ts-campo*`, sem CSS novo; `pnpm lint:marca` passa; botão e controle têm pelo menos 44 px de altura (conferido no e2e da T-0120).
- **Arquivos:** `layers/shared/ui/Botao.vue`, `Campo.vue`, `BotaoECampo.spec.ts`
- **Fora do escopo:** validação de valor (é do domínio de cada contexto); máscara.
- **Depende de:** T-0007, T-0006

### [ ] T-0120 · Os componentes do kernel funcionam com teclado no computador e no celular

- **Requisito:** REQ-01-10, REQ-01-11, REQ-01-12, REQ-01-13, REQ-01-14, REQ-01-15, REQ-01-16, REQ-01-17, REQ-01-18, REQ-01-20
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/kernel.spec.ts` (projetos `computador` 1440 px e `celular` 390 px, na página de prova)
  - CA-01-07: acordeão, guias, carrossel e diálogo operados só com o teclado, com o foco voltando ao botão ao fechar o diálogo
  - CA-01-08: zero `iframe` ao carregar; um `iframe` com `title` depois de tocar em cada capa
  - CA-01-09: o carrossel não muda de posição em 6 segundos
  - os pontos do carrossel têm pelo menos 24 px; botões, guias e links de paginação, pelo menos 44 px
  - "Ler mais" abre o texto de apoio, e o texto inteiro já estava no HTML do servidor
  - só o botão de variante `acao` tem o fundo do token `--ts-acao`
  - `conferirInvariantes(page)` passa nos dois tamanhos
- **Pronto quando:** existe a página de prova `tests/e2e/_paginas-de-prova/kernel.vue`, registrada só fora de produção, com um exemplo de cada componente de `shared/ui`; o teste passa nos dois projetos.
- **Arquivos:** `tests/e2e/kernel.spec.ts`, `tests/e2e/_paginas-de-prova/kernel.vue`, `nuxt.config.ts` (registro da página de prova)
- **Fora do escopo:** regressão visual (as páginas-modelo são dos módulos de tela).
- **Depende de:** T-0109, T-0110, T-0111, T-0112, T-0113, T-0114, T-0115, T-0116, T-0117, T-0119, T-0010

### [ ] T-0121 · O teste de mutação mostra onde os testes do domínio não pegam defeito

- **Requisito:** REQ-01-21
- **Camada:** infra
- **Teste primeiro:** `tests/infra/mutacao.spec.ts`
  - `stryker.config.mjs` muta só `layers/*/domain/**` e `layers/*/application/**`, sem `*.spec.ts`, `__fabricas__/` nem `__falsos__/`
  - usa o executor do Vitest, só com o projeto `unidade`
  - o limite que reprova (`break`) é 80, declarado em um lugar só
  - o script `test:mutacao` existe no `package.json`
  - `mutacao.yml` roda toda segunda de manhã e sob demanda, nunca em `pull_request`, com `permissions: contents: read` e actions fixadas por SHA
  - o relatório fica como artefato por 30 dias
- **Pronto quando:** CA-01-10: `pnpm test:mutacao` passa no kernel; cada mutante que sobreviveu em `Result`, `Dinheiro`, `Slug`, `Imagem`, `Pagina` e nos erros ganhou um caso de teste novo ou está justificado em Pendências. Dependências novas: `@stryker-mutator/core` e `@stryker-mutator/vitest-runner`, em `devDependencies`. **CI:** workflow novo `mutacao.yml`, fora do `ci.yml` e fora dos checks obrigatórios (leva minutos e muda devagar).
- **Arquivos:** `stryker.config.mjs`, `package.json`, `.github/workflows/mutacao.yml`, `tests/infra/mutacao.spec.ts`, `.gitignore`, arquivos `*.spec.ts` do kernel (só casos novos)
- **Fora do escopo:** rodar em todo pull request; mutar `ui/` e `adapters/`; alterar caso de teste já aprovado (só acrescentar).
- **Depende de:** T-0120, T-0012

---

## Pendências

- **Carrossel de Marcas com rotação automática.** O protótipo (`ui/js/site.js`) e o `tools/hifi/verify.py` abrem uma exceção: o carrossel de Marcas anda sozinho a cada 5 s, com botão de pausa (pedido do cliente). O [docs/testing.md](../../docs/testing.md) e o shared kernel dizem "nenhum carrossel anda sozinho". Aqui o `Carrossel` não tem rotação automática; confirmar com o cliente antes do módulo 09 (Home) e, se a exceção valer, abrir task lá com pausa, parada no foco e respeito a `prefers-reduced-motion` (WCAG 2.2.2).
- **Autenticação da API (D1).** O `ClienteHttp` repassa cookie e nada mais. Se o backend exigir token, muda só a T-0103 e a T-0118.
- **Tempo limite padrão de 8 s** é premissa nossa; validar com o TI.
- **Limite da mutação.** Os 80% da T-0121 são ponto de partida. Subir quando os contextos de negócio (módulos 03 a 12) estiverem estáveis; a meta é 90%.
- **`Paginacao` sem reticências.** Com mais de 7 páginas a linha não cabe em 390 px. Abrir task quando o catálogo real passar disso.
- **Caminhos legados.** `resolverRota` reconhece o padrão do site atual (`/1/5/…`) mas não sabe o destino; a consulta à API prevista no ADR 0008 depende da decisão D2.
- **`formatar()` com espaço inseparável.** Escolha nossa, para o preço não quebrar de linha; os testes de tela comparam texto com espaço normalizado.
- O [specs/README.md](../README.md) cita `roadmap.md`, que ainda não existe na pasta `specs/`.
