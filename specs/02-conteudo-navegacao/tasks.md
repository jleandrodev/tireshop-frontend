# Tasks 02 — Conteúdo: navegação, layout padrão e newsletter

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. São duas fatias, cada uma de dentro para fora: a **navegação** (T-0201 a
T-0214, contexto Conteúdo) e a **newsletter** (T-0215 a T-0218, contexto Relacionamento). O e2e
(T-0219) fecha as duas. O id T-0205 é citado por outros módulos: não renumere.

---

### [x] T-0201 · `Navegacao` e o caso de uso `obterNavegacao` — 2026-11-27

- **Requisito:** REQ-02-01, REQ-02-05, REQ-02-18
- **Camada:** aplicação
- **Teste primeiro:** `layers/conteudo/application/obter-navegacao.spec.ts` (com `NavegacaoRepositoryFalso`) e `layers/conteudo/domain/navegacao.spec.ts`
  - `obterNavegacao` devolve a `Navegacao` da porta; erro da porta sai como `Result` de falha, sem lançar
  - `temAros(departamento)` é falso para a lista vazia (a tela mostra só o título e o `resumoAros`)
  - `totalDeLinksDeAro(navegacao)` soma os aros de todos os departamentos (59 com os dados do exemplo)
  - `linksVisiveis(links)` tira os itens com `href` nulo ("Meus Pedidos", "Rastrear pedido", "Aros")
  - `tipoDoItemDeMenu(item)` devolve `lojas` para o item que aponta para o hub de lojas, `marcas` para o que aponta para `#marcas`, e `link` para os outros
  - `linkDoWhatsapp(contato)` devolve `https://wa.me/554133172251`
  - a fábrica `umaNavegacao()` cria uma navegação válida e aceita sobrescritas
- **Pronto quando:** tipo `Navegacao` (contato, redes, menu, departamentos com aros, ajuda, extras, marcas, rodapé com colunas e texto fiscal) e porta `NavegacaoRepository` em `domain/`; falso em `application/__falsos__/`; modelo raso, sem classe.
- **Arquivos:** `layers/conteudo/domain/navegacao.ts`, `navegacao.spec.ts`, `domain/portas.ts`, `domain/__fabricas__/navegacao.ts`, `application/obter-navegacao.ts`, `obter-navegacao.spec.ts`, `application/__falsos__/navegacao-repository-falso.ts`
- **Fora do escopo:** `ConteudoRepository` (Home, políticas, Sobre nós: módulos 09 a 11).
- **Depende de:** T-0101, T-0105, T-0107, T-0108
- **Decisões:** primeiro import cruzado de contexto de verdade no projeto (`conteudo` → `shared`,
  pela API pública). Dois achados por causa disso, nenhum visível só lendo a task:
  (1) `#layers/shared` é o alias que o próprio Nuxt gera, um por layer (`.nuxt/tsconfig.*.json`,
  docs/architecture.md A5) — só o TypeScript sabe dele; o projeto "unidade" do Vitest roda sem o
  Nuxt, então precisa do mesmo alias de novo (`resolve.alias`, em `vitest.config.ts` e
  `vitest.mutacao.config.ts` — cresce um item por contexto que vier a importar o shared, hoje só
  este); (2) importar `#layers/shared` (a API pública inteira) carrega `use-cliente-http.ts`, que
  importa `h3` — pacote que só existia como dependência transitiva do Nuxt, nunca declarada; fora
  do contexto do Nuxt (este projeto, "unidade") o Node não acha. `h3` entrou em `dependencies`,
  fixado na mesma versão que o Nuxt já usa por dentro (`1.15.11` — não a última, pra não ter duas
  versões de h3 coexistindo com tipos possivelmente incompatíveis). `ErroDeConteudo` começa só com
  `ErroDeRede | ErroDeContrato`: `PaginaNaoEncontrada` entra quando a task que precisar dele
  (`obterPolitica`, módulo 11) chegar. A fábrica `umaNavegacao()` espelha os 8 departamentos e a
  contagem de aros de `docs/api/examples/navegacao.json` (59), sem copiar cada `href` real.


### [ ] T-0202 · `HttpNavegacaoRepository` entende `GET /navegacao`

- **Requisito:** REQ-02-01, REQ-02-18
- **Camada:** adaptador
- **Teste primeiro:** `layers/conteudo/adapters/http/http-navegacao-repository.spec.ts` (com `ClienteHttpFalso`)
  - `mocks/fixtures/navegacao.json` valida no schema e vira `Navegacao`, com 8 departamentos, 17 marcas e 4 colunas de rodapé
  - o logotipo de cada marca vira `Imagem` (`alliance.webp`, 152×25)
  - `href: null` (marca sem página, "Meus Pedidos") é aceito e vira ausência de link
  - departamento com `aros: []` é aceito
  - falta de `contato.whatsapp` vira `ErroDeContrato` com o caminho do campo
  - falha de rede vira `ErroDeRede`; campo desconhecido é ignorado
- **Pronto quando:** `NavegacaoSchema` (Zod), `paraNavegacao(dto)` e o repositório chamam `GET /navegacao` pelo `ClienteHttp`; o DTO não sai de `adapters/`.
- **Arquivos:** `layers/conteudo/adapters/http/navegacao.schema.ts`, `navegacao.mapper.ts`, `http-navegacao-repository.ts`, `http-navegacao-repository.spec.ts`
- **Fora do escopo:** os outros endpoints de conteúdo.
- **Depende de:** T-0201, T-0103

### [ ] T-0203 · O mock de `/navegacao` responde no contrato do adaptador

- **Requisito:** REQ-02-01, REQ-02-05
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/navegacao.get.spec.ts` (acrescenta casos ao teste da T-0008)
  - a resposta de `GET /api/mock/navegacao` valida no `NavegacaoSchema`
  - há 8 departamentos e pelo menos 50 links de aro no total
  - todo `href` interno é reconhecido por `resolverRota` (nenhum `desconhecida`)
  - todo `href` de categoria aponta para um slug que existe em `mocks/fixtures/_base/categorias.json`
  - `?_falha=500` continua devolvendo `problem+json`
- **Pronto quando:** o teste passa; o link do aro 17 de Carros, hoje `/c/carros-aro?pagina=17`, está corrigido para `/c/carros-aro-17` em `docs/api/examples/navegacao.json` e em `mocks/fixtures/navegacao.json` (`pnpm mocks:sincronizar`).
- **Arquivos:** `server/api/mock/navegacao.get.spec.ts`, `docs/api/examples/navegacao.json`, `mocks/fixtures/navegacao.json`
- **Fora do escopo:** mudar o formato do contrato (se for preciso, é a seção 5 do `AGENTS.md`).
- **Depende de:** T-0008, T-0202

### [ ] T-0204 · O contexto Conteúdo é ligado em um lugar só, com uma busca por requisição

- **Requisito:** REQ-02-01
- **Camada:** infra
- **Teste primeiro:** `layers/conteudo/ui/composables/use-navegacao.spec.ts` (ambiente Nuxt)
  - `useNavegacao()` devolve `navegacao` e `estado` (`sucesso` ou `erro`)
  - dois componentes que chamam `useNavegacao()` na mesma página provocam uma única chamada à porta
  - com o provedor trocado no teste, usa o repositório falso
  - falha da porta deixa `estado` em `erro` e `navegacao` nula, sem lançar
  - no servidor, cada requisição recebe a própria instância
- **Pronto quando:** `app/plugins/12.conteudo.ts` é o único lugar que instancia `HttpNavegacaoRepository`; `useNavegacao` usa `useAsyncData` com a chave fixa `navegacao`; `layers/conteudo/index.ts` publica o composable e os tipos; a navegação não é copiada para store (ADR 0007).
- **Arquivos:** `app/plugins/12.conteudo.ts`, `layers/conteudo/ui/composables/use-navegacao.ts`, `use-navegacao.spec.ts`, `layers/conteudo/index.ts`
- **Fora do escopo:** componentes.
- **Depende de:** T-0202, T-0118

### [ ] T-0205 · O layout padrão monta cabeçalho, conteúdo e rodapé

- **Requisito:** REQ-02-02, REQ-02-16
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/layout.spec.ts` (computador), contra o mock
  - o HTML do servidor de `/` tem, nesta ordem: o link "Pular para o conteúdo", um `header`, `main#conteudo` e um `footer`
  - o cabeçalho traz o telefone "(41) 3317-2251" vindo de `/navegacao`; o rodapé, o texto fiscal
  - o primeiro Tab da página foca "Pular para o conteúdo", e ativá-lo leva o foco ao `main`
  - a página fez uma única chamada a `/navegacao`
  - CA-02-09: com `?_falha=500` em `/navegacao`, o status é 200, o conteúdo da página aparece e o cabeçalho mostra só o logo
  - o layout expõe os lugares `faixa` e `minicart`, vazios por enquanto
- **Pronto quando:** `app/layouts/default.vue` usa `useNavegacao` e monta `SiteCabecalho` e `SiteRodape` em versão mínima (logo, telefone, texto fiscal), que as próximas tasks completam; a página inicial provisória (T-0001) usa o layout e tem um H1.
- **Arquivos:** `app/layouts/default.vue`, `app/app.vue`, `app/pages/index.vue`, `layers/conteudo/ui/components/SiteCabecalho.vue`, `SiteRodape.vue`, `tests/e2e/layout.spec.ts`
- **Fora do escopo:** menus, rodapé completo, cookies e WhatsApp (tasks seguintes); layout `loja` (módulo 12).
- **Depende de:** T-0204, T-0010

### [ ] T-0206 · O cabeçalho mostra barra de topo, logo, busca por medida, Entrar e carrinho

- **Requisito:** REQ-02-03, REQ-02-04
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/SiteCabecalho.spec.ts`
  - a barra de topo é um link só para `https://wa.me/554133172251`, com o número "(41) 3317-2251" e o rótulo "Telefone e WhatsApp"
  - a `nav` "Atalhos" tem "Ajuda", com link para `rotas.politica('perguntas-frequentes')`
  - o logo é um link para `rotas.home()` com o nome "TireShop, página inicial"
  - a busca é um `form` com `role="search"`, rótulo "Busca por Medida" e o texto de exemplo "Encontre o pneu ex: 225/45R17"
  - enviar a busca com "225/45R17" emite `buscar` com o texto; com o campo vazio, não emite
  - com `quantidadeNoCarrinho: 2`, o botão tem `aria-label` "Carrinho, 2 pneus" e mostra o número 2; com 1, "Carrinho, 1 pneu"
  - com `quantidadeNoCarrinho: 0`, o `aria-label` é "Carrinho, vazio" e o número não aparece
  - clicar no carrinho emite `abrir-carrinho`; clicar no botão de menu emite `abrir-menu`
- **Pronto quando:** `BarraDeTopo` e `BuscaPorMedida` são componentes próprios, usados pelo `SiteCabecalho`; classes `ts-topbar*`, `ts-header*` e `ts-busca*` do protótipo; o cabeçalho não importa Catálogo nem Carrinho.
- **Arquivos:** `layers/conteudo/ui/components/SiteCabecalho.vue`, `BarraDeTopo.vue`, `BuscaPorMedida.vue`, `SiteCabecalho.spec.ts`
- **Fora do escopo:** interpretar a medida e navegar (módulo 05); contagem real e minicart (módulo 06); destino de "Entrar" e de "Meus Pedidos" (ver Pendências).
- **Depende de:** T-0205, T-0119

### [ ] T-0207 · O mega menu Departamentos mostra os aros de cada departamento

- **Requisito:** REQ-02-05, REQ-02-06
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/MegaMenuDepartamentos.spec.ts`
  - lista os 8 departamentos, cada um com ícone e link para a categoria
  - Carros mostra 14 links, de "Aro 10" a "Aro 24"; Vans mostra "Aro 14", "Aro 15" e "Aro 16"
  - a lista de aros tem `aria-label` "Aros de Carros"
  - departamento sem aros mostra o `resumoAros` como texto, sem lista
  - o pé do painel tem os grupos "Ajuda para escolher" e "Também vendemos", só com os links que têm `href`
  - link interno usa a navegação do Nuxt; link externo sai com a URL completa
  - escolher um link emite `fechar`
- **Pronto quando:** o painel fica dentro de um `details` com `summary` "Departamentos"; o componente `MegaMenu` (invólucro) fecha com Esc devolvendo o foco ao `summary`, fecha com clique fora e avisa o cabeçalho ao abrir, para os outros fecharem.
- **Arquivos:** `layers/conteudo/ui/components/MegaMenu.vue`, `MegaMenuDepartamentos.vue`, `MegaMenuDepartamentos.spec.ts`, `MegaMenu.spec.ts`, `SiteCabecalho.vue`
- **Fora do escopo:** menus de Lojas e de Marcas (T-0208).
- **Depende de:** T-0206

### [ ] T-0208 · Os mega menus de Lojas Físicas e de Marcas

- **Requisito:** REQ-02-06, REQ-02-07, REQ-02-08
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/MegaMenusDeLista.spec.ts`
  - com 5 lojas recebidas por prop, mostra a foto, a cidade, a UF e o endereço de cada uma, com link para `rotas.loja(slug)`
  - o pé do menu de lojas tem "Ver todas as lojas" (`rotas.lojas()`) e o WhatsApp com o telefone
  - sem lojas, "Lojas Físicas" é um link simples para `rotas.lojas()`, sem painel
  - o menu de marcas mostra os 17 logotipos, cada um com `alt` igual ao nome, `width` e `height`
  - Hankook tem link para `/c/hankook` com o nome "Pneus Hankook"; marca com `href` nulo é só o logotipo
  - os itens do menu que não são mega menu ("Promoções", "Blog", "Sobre Nós") saem como links simples, na ordem recebida
  - abrir "Marcas" com "Departamentos" aberto fecha "Departamentos"
- **Pronto quando:** `MegaMenuLojas` recebe `lojas` por prop com um tipo próprio do Conteúdo (`LojaDoMenu`: slug, cidade, UF, endereço, foto), sem importar o contexto Lojas; o cabeçalho decide o tipo de cada item com `tipoDoItemDeMenu`.
- **Arquivos:** `layers/conteudo/ui/components/MegaMenuLojas.vue`, `MegaMenuMarcas.vue`, `MegaMenusDeLista.spec.ts`, `SiteCabecalho.vue`, `layers/conteudo/domain/navegacao.ts`
- **Fora do escopo:** buscar as lojas (`GET /lojas`, módulo 12); página de marca.
- **Depende de:** T-0207

### [ ] T-0209 · O menu do celular abre em gaveta, com departamentos e aros em acordeão

- **Requisito:** REQ-02-09
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/MenuCelular.spec.ts`
  - com `aberto`, é um diálogo modal com `aria-label="Menu"`, na variante que entra pela esquerda
  - "Departamentos" abre a lista dos 8 departamentos, cada um com o ícone, o nome ao lado e a seta à direita
  - abrir "Carros" mostra "Todos os pneus de carros" e os 14 aros
  - os itens do menu principal aparecem na ordem recebida, cada um com a seta à direita
  - "Ajuda para escolher" abre os links de ajuda que têm `href`
  - a lista de conta mostra "Entrar ou criar conta" com o ícone e o nome
  - o pé tem o botão "WhatsApp (41) 3317-2251" e o horário de atendimento
  - escolher qualquer link emite `fechar`; o X tem `aria-label` "Fechar o menu"
- **Pronto quando:** usa o `Dialogo` (variante `esquerda`, `fecharAcimaDe: 900`); classes `ts-menu*` do protótipo (os aros em grade vêm do CSS); o `SiteCabecalho` abre a gaveta no `abrir-menu`.
- **Arquivos:** `layers/conteudo/ui/components/MenuCelular.vue`, `MenuCelular.spec.ts`, `SiteCabecalho.vue`
- **Fora do escopo:** lojas e marcas dentro da gaveta (no celular são links simples, como no protótipo).
- **Depende de:** T-0206, T-0112

### [ ] T-0210 · O rodapé mostra colunas, redes, selos, pagamentos e os dados fiscais

- **Requisito:** REQ-02-10, REQ-02-11
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/SiteRodape.spec.ts`
  - mostra as 4 colunas recebidas ("Comprar", "Ajuda para escolher", "Entrega e pagamento", "Atendimento e empresa"), cada uma em um `details`
  - a coluna "Ajuda para escolher" tem o link "Comparar pneus" para `rotas.comparar()`
  - links com `href` nulo ("Rastrear pedido", "Meus Pedidos") não são renderizados
  - as 4 redes têm `aria-label` "TireShop no Instagram", "…no Facebook", "…no YouTube" e "…no TikTok"
  - não existe `h2` nem `h3` dentro do rodapé
  - o texto fiscal recebido aparece inteiro
  - a linha da empresa traz a razão social, "CNPJ: 80.171.671/0001-54", o telefone com `tel:+554133172251` e o e-mail com `mailto:`
  - os selos ("Loja confiável", "Site Seguro Google", "Certificado SSL") e as 7 formas de pagamento aparecem, com `alt` nas imagens
- **Pronto quando:** as colunas abrem e fecham conforme a largura (abertas a partir de 900 px, fechadas abaixo), também quando a janela muda de tamanho; o rodapé expõe o lugar `newsletter`; o ano de "Todos os direitos reservados" vem do servidor.
- **Arquivos:** `layers/conteudo/ui/components/SiteRodape.vue`, `SiteRodape.spec.ts`
- **Fora do escopo:** formulário de newsletter (T-0218); a nota do selo "Loja confiável" (vem de Avaliações; ver Pendências).
- **Depende de:** T-0205

### [ ] T-0211 · O botão flutuante do WhatsApp aparece sem cobrir barra fixa

- **Requisito:** REQ-02-15
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/BotaoWhatsapp.spec.ts`
  - é um link para `https://wa.me/554133172251`, a partir do número recebido
  - tem `aria-label` "Falar no WhatsApp: (41) 3317-2251"
  - o ícone é decorativo (`aria-hidden`)
  - com `acimaDaBarra`, recebe a classe que o sobe acima da barra fixa
  - sem número, não renderiza
- **Pronto quando:** componente em `shared/ui` (o layout da loja física usa o mesmo, com o número da loja); o layout padrão o monta com o contato da navegação; usa a classe `ts-fab` e o token `--ts-whatsapp`.
- **Arquivos:** `layers/shared/ui/BotaoWhatsapp.vue`, `BotaoWhatsapp.spec.ts`, `app/layouts/default.vue`
- **Fora do escopo:** as barras fixas em si (módulos 03 e 04); o e2e de sobreposição é da T-0219 e dos módulos que têm barra.
- **Depende de:** T-0205, T-0108

### [ ] T-0212 · O aviso de cookies some no "Entendi" e fica lembrado

- **Requisito:** REQ-02-14
- **Camada:** ui
- **Teste primeiro:** `layers/shared/ui/AvisoCookies.spec.ts`
  - no HTML do servidor o aviso não aparece
  - no navegador, sem aceite gravado, aparece com o texto e o link "Política de privacidade" (`rotas.politica('privacidade')`)
  - "Entendi" esconde o aviso e grava `ts-cookies = 1` em `localStorage`
  - com o aceite gravado, não aparece
  - com `localStorage` lançando erro, o aviso aparece, some no "Entendi" e nada quebra
  - é uma região com `aria-label="Aviso de cookies"`
- **Pronto quando:** componente em `shared/ui`, montado pelo layout padrão; a chave guarda só `1` (nenhum dado pessoal); "Entendi" é o botão de variante `acao`.
- **Arquivos:** `layers/shared/ui/AvisoCookies.vue`, `AvisoCookies.spec.ts`, `app/layouts/default.vue`
- **Fora do escopo:** gestão de consentimento por categoria; bloqueio de scripts de terceiros.
- **Depende de:** T-0205, T-0119

### [ ] T-0213 · Rota inexistente mostra a página de não encontrado, com status 404

- **Requisito:** REQ-02-17
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/nao-encontrado.spec.ts` (computador e celular)
  - CA-02-10: `/nao-existe` responde 404 e mostra "Página não encontrada" em um único H1
  - a página tem o cabeçalho e o rodapé do layout padrão
  - há um link para a Home e um para o WhatsApp
  - um erro 500 lançado por uma página de prova mostra "Algo deu errado" e responde 500
  - `conferirInvariantes(page)` passa
- **Pronto quando:** `app/error.vue` trata 404 e os demais status, dentro do layout padrão; as páginas dos contextos usam `createError({ statusCode: 404 })` quando o caso de uso devolve `NaoEncontrado`.
- **Arquivos:** `app/error.vue`, `tests/e2e/nao-encontrado.spec.ts`, `tests/e2e/_paginas-de-prova/erro.vue`
- **Fora do escopo:** sugestões de produto na página de erro; redirecionamento de URL legada (D2).
- **Depende de:** T-0205, T-0113

### [ ] T-0214 · `Email`, `Telefone` e `InscricaoNewsletter` validam o contato

- **Requisito:** REQ-02-12
- **Camada:** domínio
- **Teste primeiro:** `layers/relacionamento/domain/inscricao-newsletter.spec.ts`
  - `Email` aceita "cliente@exemplo.com.br" e guarda em minúsculas ("Cliente@Exemplo.com.br" vira o mesmo valor)
  - `Email` recusa "cliente@", "cliente.exemplo.com" e texto vazio (`EmailInvalido`)
  - `Telefone` aceita "41999990000" e "(41) 3317-2251", guardando só os dígitos
  - `Telefone` recusa menos de 10 e mais de 11 dígitos (`TelefoneInvalido`)
  - `InscricaoNewsletter` com e-mail e sem WhatsApp é válida
  - WhatsApp em branco conta como ausente; WhatsApp preenchido e inválido recusa a inscrição
  - a falha diz o campo (`email` ou `whatsapp`) e a mensagem para a tela
- **Pronto quando:** value objects imutáveis, com `criar` devolvendo `Result`; mensagens: "Digite um e-mail válido, como nome@exemplo.com.br." e "Digite o WhatsApp com DDD: 10 ou 11 números."
- **Arquivos:** `layers/relacionamento/domain/email.ts`, `telefone.ts`, `inscricao-newsletter.ts`, `inscricao-newsletter.spec.ts`
- **Fora do escopo:** `PedidoAviso` (módulo 04).
- **Depende de:** T-0101

### [ ] T-0215 · Caso de uso `assinarNewsletter`

- **Requisito:** REQ-02-12, REQ-02-13
- **Camada:** aplicação
- **Teste primeiro:** `layers/relacionamento/application/assinar-newsletter.spec.ts` (com `LeadsGatewayFalso`)
  - com e-mail e WhatsApp válidos, chama a porta uma vez e devolve a mensagem de confirmação recebida
  - com e-mail inválido, devolve `ErroDeValidacao` com o campo `email` e **não** chama a porta
  - com WhatsApp inválido, devolve `ErroDeValidacao` com o campo `whatsapp` e não chama a porta
  - sem WhatsApp, a porta recebe a inscrição sem o campo
  - `ErroDeValidacao` vindo da porta (422) é repassado com os campos
  - `ErroDeRede` da porta sai como falha, sem lançar
- **Pronto quando:** porta `LeadsGateway` declarada em `domain/portas.ts`, com `assinar` devolvendo a confirmação; falso em memória em `application/__falsos__/`.
- **Arquivos:** `layers/relacionamento/domain/portas.ts`, `application/assinar-newsletter.ts`, `assinar-newsletter.spec.ts`, `application/__falsos__/leads-gateway-falso.ts`
- **Fora do escopo:** `pedirAviso` (declarado na porta, implementado no módulo 04).
- **Depende de:** T-0214, T-0103

### [ ] T-0216 · `HttpLeadsGateway.assinar` envia a inscrição para `POST /newsletter`

- **Requisito:** REQ-02-12, REQ-02-13
- **Camada:** adaptador
- **Teste primeiro:** `layers/relacionamento/adapters/http/http-leads-gateway.spec.ts` (com `ClienteHttpFalso`)
  - envia `POST /newsletter` com o corpo igual a `newsletter.requisicao.json` (`email` e `whatsapp` só com dígitos)
  - sem WhatsApp, envia `whatsapp: null`
  - 201 com `{ "mensagem" }` vira a confirmação
  - 422 com `erros: [{ campo: 'email', … }]` vira `ErroDeValidacao` com o campo
  - 201 sem `mensagem` vira `ErroDeContrato`
  - falha de rede vira `ErroDeRede`
- **Pronto quando:** `InscricaoNewsletterSchema` e `ConfirmacaoSchema` (Zod) validam `newsletter.requisicao.json` e `confirmacao.json`.
- **Arquivos:** `layers/relacionamento/adapters/http/newsletter.schema.ts`, `http-leads-gateway.ts`, `http-leads-gateway.spec.ts`
- **Fora do escopo:** `POST /produtos/{id}/avise-me`.
- **Depende de:** T-0215

### [ ] T-0217 · O mock de `POST /newsletter` aceita, recusa e não revela quem já assinou

- **Requisito:** REQ-02-12, REQ-02-13
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/newsletter.post.spec.ts`
  - o corpo de `newsletter.requisicao.json` devolve 201 com `{ "mensagem" }`, que valida no `ConfirmacaoSchema`
  - sem `whatsapp` (ou com `null`), devolve 201
  - e-mail inválido devolve 422 em `problem+json`, com `erros[0].campo` igual a `email`
  - WhatsApp com 9 dígitos devolve 422 com o campo `whatsapp`
  - o mesmo e-mail enviado duas vezes devolve 201 nas duas
  - `?_falha=500` devolve `problem+json` com status 500
- **Pronto quando:** a rota usa o utilitário da T-0008 para falha e atraso; nada é gravado em disco.
- **Arquivos:** `server/api/mock/newsletter.post.ts`, `newsletter.post.spec.ts`
- **Fora do escopo:** envio de e-mail de verdade.
- **Depende de:** T-0008, T-0216

### [ ] T-0218 · `FormularioNewsletter` valida, envia e anuncia a confirmação

- **Requisito:** REQ-02-12, REQ-02-13
- **Camada:** ui
- **Teste primeiro:** `layers/relacionamento/ui/components/FormularioNewsletter.spec.ts` (caso de uso falso)
  - tem os campos "Seu e-mail" (`type="email"`, `autocomplete="email"`) e "Seu WhatsApp" (`type="tel"`, `autocomplete="tel"`) e o botão "Assinar"
  - com "cliente@", não chama o caso de uso, marca o e-mail com `aria-invalid` e a mensagem, e leva o foco a ele
  - com dados válidos, chama o caso de uso com o e-mail e o WhatsApp digitados
  - enquanto envia, o botão fica ocupado e não aceita segundo envio
  - no sucesso, mostra a mensagem recebida em um elemento com `role="status"` e limpa os campos
  - `ErroDeValidacao` do servidor marca o campo indicado
  - `ErroDeRede` mostra a mensagem com "Tentar de novo" e mantém o que foi digitado
  - nada é escrito em `localStorage` nem em `sessionStorage`
- **Pronto quando:** `app/plugins/16.relacionamento.ts` é o único lugar que instancia `HttpLeadsGateway`; `useRelacionamento()` entrega `assinarNewsletter`; o layout padrão põe o formulário no lugar `newsletter` do `SiteRodape`; "Assinar" é o botão de variante `acao`.
- **Arquivos:** `layers/relacionamento/ui/components/FormularioNewsletter.vue`, `FormularioNewsletter.spec.ts`, `layers/relacionamento/ui/composables/use-relacionamento.ts`, `layers/relacionamento/index.ts`, `app/plugins/16.relacionamento.ts`, `app/layouts/default.vue`
- **Fora do escopo:** máscara de telefone; "Avise-me".
- **Depende de:** T-0210, T-0215, T-0216, T-0217, T-0119

### [ ] T-0219 · A moldura do site funciona no computador e no celular

- **Requisito:** REQ-02-02, REQ-02-05, REQ-02-06, REQ-02-09, REQ-02-10, REQ-02-11, REQ-02-12, REQ-02-14, REQ-02-15, REQ-02-18
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/navegacao.spec.ts` (computador, 1440 px) e `tests/e2e/navegacao-celular.spec.ts` (celular, 390 px), contra o mock
  - CA-02-01 (HTML do servidor com pelo menos 50 links de aro) e CA-02-02 (Departamentos com os aros)
  - CA-02-03: um mega menu por vez; Esc fecha e devolve o foco; os links do painel têm pelo menos 24 px
  - CA-02-04: a gaveta do celular abre, mostra os aros em grade, prende o foco e fecha ao escolher um aro
  - CA-02-05: colunas do rodapé fechadas em 390 px e abertas em 1440 px; "Comparar pneus" presente
  - CA-02-06 e CA-02-07: newsletter com sucesso e com e-mail inválido
  - CA-02-08: "Entendi" esconde o aviso de cookies, e ele não volta ao recarregar
  - em 390 px, o botão do WhatsApp não cobre o aviso de cookies nem uma barra fixa de prova; a barra de topo não mostra os atalhos
  - `conferirInvariantes(page)` passa nos dois tamanhos, com o mega menu fechado e aberto
- **Pronto quando:** os dois arquivos passam; o texto visível da moldura não contém "numa"; o campo de WhatsApp da newsletter existe (regras herdadas de `tools/hifi/verify.py`).
- **Arquivos:** `tests/e2e/navegacao.spec.ts`, `tests/e2e/navegacao-celular.spec.ts`, `tests/e2e/_paginas-de-prova/barra-fixa.vue`
- **Fora do escopo:** busca por medida funcionando (módulo 05); minicart (módulo 06).
- **Depende de:** T-0207, T-0208, T-0209, T-0210, T-0211, T-0212, T-0213, T-0218

---

## Pendências

- **Erro na fixture.** Em `docs/api/examples/navegacao.json`, o aro 17 de Carros aponta para `/c/carros-aro?pagina=17`; o certo é `/c/carros-aro-17`. A T-0203 corrige nos dois lugares.
- **Mega menu de Lojas.** `/navegacao` não traz as lojas; o `docs/api/README.md` diz que o mega menu usa `GET /lojas`, que é do módulo 12. Até lá o item "Lojas Físicas" é um link simples. Abrir task no módulo 12: o layout padrão busca as lojas e passa a lista ao `MegaMenuLojas`.
- **Como saber qual item do menu é mega menu.** O protótipo decide pelo rótulo ("Lojas Físicas", "Marcas"). Aqui a decisão é pelo destino (`tipoDoItemDeMenu`). Proposta ao TI: um campo `tipo` (`link`, `lojas`, `marcas`) em `menu[]`; seria mudança de contrato (a seção 5 do `AGENTS.md`).
- **Itens com `href` nulo.** "Meus Pedidos", "Rastrear pedido", "Aros" e "Todos os aros" vêm sem destino. A spec não os renderiza. Confirmar com o cliente se devem apontar para as páginas do site atual; "Entrar" e "Meus Pedidos" do cabeçalho também não têm URL no contrato (login está fora do escopo).
- **Textos fixos da moldura que não estão no contrato.** O parágrafo da marca no rodapé ("Pneus novos com nota fiscal…"), o título e o apoio da newsletter, o texto do aviso de cookies e a lista de formas de pagamento estão escritos no protótipo. O `relacionamento.md` diz que o texto de consentimento ao lado do formulário "vem da navegação", mas `navegacao.json` não tem esse campo. Decidir: incluir em `/navegacao` (premissa P5) ou manter fixo no frontend.
- **Selo "Loja confiável".** O protótipo mostra a nota da Trustvox no rodapé; ela vem de `GET /avaliacoes/resumo`. Neste módulo o selo aparece sem a nota; o módulo de Avaliações passa a nota por prop.
- **Modelo de `Navegacao` no domínio.** O `docs/domain/conteudo.md` não lista `extras` nem `marcas`, e põe `textoFiscal` e `redes` na raiz; o contrato tem `extras`, `marcas`, `redes` na raiz e `rodape.textoFiscal`. A T-0201 segue o contrato; atualizar o `conteudo.md` no fechamento.
- **Porta `LeadsGateway`.** O `docs/domain/relacionamento.md` declara `assinar` devolvendo `Result<void, …>`, mas o caso de uso devolve a mensagem de confirmação, que vem do `201` da API. A T-0215 faz a porta devolver a confirmação; atualizar o `relacionamento.md` no fechamento.
- **UTV no menu (D7).** O contrato traz UTV só com o aro 15; aguardando o cliente dizer qual aro está errado.
- **Âncoras da Home.** O menu e o rodapé apontam para `/#marcas`, `/#ofertas`, `/#entrega` e `/#departamentos`. Os destinos nascem no módulo 09; até lá o e2e não confere essas âncoras.
- **Marcas sem página.** No protótipo, marca sem página leva a `home.html#marcas`; no contrato vem `href: null`, e aqui fica só o logotipo. Confirmar.
- **Numeração dos plugins.** Usamos `12.conteudo.ts` e `16.relacionamento.ts`; a arquitetura só fixa `01.http`, `10.catalogo` e `11.lojas`.
