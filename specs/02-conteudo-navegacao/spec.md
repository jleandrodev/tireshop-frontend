# Spec 02 — Conteúdo: navegação, layout padrão e newsletter

| | |
|---|---|
| Marco | M2 |
| Contexto do domínio | [Conteúdo](../../docs/domain/conteudo.md) (parte de navegação) e [Relacionamento](../../docs/domain/relacionamento.md) (newsletter) |
| Telas do protótipo | `partials/cabecalho.html.j2`, `partials/rodape.html.j2` e `base.html.j2` (link de pular, aviso de cookies, botão do WhatsApp), presentes em todas as páginas do e-commerce |
| ADRs que se aplicam | 0002, 0003, 0004, 0007, 0008, 0009, 0010, 0013 |
| Depende de | Módulos 00, 01 |

## 1. Objetivo

Toda página do e-commerce passa a ter a moldura validada no protótipo: barra de topo com telefone e
WhatsApp, cabeçalho com logo, campo de busca por medida, Entrar e carrinho, os três mega menus
(Departamentos com os aros de cada um, Lojas Físicas e Marcas), o menu do celular em gaveta, o rodapé
com colunas que viram acordeão, a newsletter funcionando, o aviso de cookies e o botão flutuante do
WhatsApp.

Dois lugares ficam só reservados, com a interface pronta: o campo de busca por medida emite o texto
digitado (a lógica é do módulo 05) e o botão do carrinho recebe a contagem e emite o pedido de abrir
(o minicart é do módulo 06).

## 2. Requisitos

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-02-01 | A navegação vem de `GET /navegacao`, é buscada uma vez por requisição no servidor e reaproveitada por cabeçalho, menus e rodapé. | RF-01, RNF-05 |
| REQ-02-02 | O layout padrão monta, nesta ordem: link "Pular para o conteúdo", barra de topo, cabeçalho, `main#conteudo`, lugar da faixa de avaliações, rodapé, botão do WhatsApp, aviso de cookies e lugar do minicart. | RF-01, RNF-01, RNF-02 |
| REQ-02-03 | A barra de topo mostra o telefone com os ícones de telefone e de WhatsApp e o rótulo "Telefone e WhatsApp", em um link só para o WhatsApp, mais os atalhos "Meus Pedidos" e "Ajuda" (escondidos no celular). | RF-01 |
| REQ-02-04 | O cabeçalho mostra o logo com link para a Home, o campo "Busca por Medida" (emite `buscar` com o texto), "Entrar" e o botão do carrinho com a contagem recebida. | RF-02, RF-09 |
| REQ-02-05 | O mega menu Departamentos lista os 8 departamentos com ícone e, em cada um, os aros que existem nele, cada aro com o seu link. Departamento sem aros mostra só o título e o resumo. | RF-01 |
| REQ-02-06 | Só um mega menu fica aberto por vez. Ele fecha com Esc (o foco volta ao título do menu), com clique fora e ao escolher um link, e abre mesmo sem JavaScript. | RF-01, RNF-02 |
| REQ-02-07 | O mega menu Lojas Físicas mostra foto, cidade, UF e endereço de cada loja recebida, mais "Ver todas as lojas". Sem lojas, o item é um link simples para o hub. | RF-14 |
| REQ-02-08 | O mega menu Marcas mostra os logotipos das marcas; marca com página tem link, marca sem página é só o logotipo. | RF-01 |
| REQ-02-09 | No celular, o botão de menu abre uma gaveta pela esquerda: Departamentos em acordeão, com o nome ao lado do ícone, a seta à direita e os aros em grade; os itens do menu com a seta à direita; "Ajuda para escolher"; conta; e o WhatsApp no pé. Fecha no X, com Esc, com clique fora, ao escolher um item e ao passar de 900 px. | RF-01, RNF-02 |
| REQ-02-10 | O rodapé mostra a marca, as redes sociais e as colunas de links, que ficam abertas no computador e viram acordeão fechado no celular. Não há título H2 nem H3 no rodapé. | RF-01, RNF-01 |
| REQ-02-11 | O rodapé mostra os selos de confiança, as formas de pagamento, o texto fiscal, a razão social, o CNPJ, o telefone, o e-mail e o horário de atendimento, em todas as páginas. | RNF-01 (R2-20, R2-23) |
| REQ-02-12 | A newsletter aceita e-mail (obrigatório) e WhatsApp (opcional, 10 ou 11 dígitos com DDD), valida antes de enviar, envia para `POST /newsletter` e mostra a mensagem de confirmação, anunciada a leitores de tela. Nada fica guardado no navegador. | RF-16, RNF-08 |
| REQ-02-13 | Na newsletter, erro de campo aparece junto do campo; falha de rede mostra "Tentar de novo" e mantém o que foi digitado. | RF-16, RNF-06 |
| REQ-02-14 | O aviso de cookies aparece até o "Entendi", e o aceite fica lembrado no navegador. | RF-18 |
| REQ-02-15 | O botão flutuante do WhatsApp aparece em todas as páginas do e-commerce e, no celular, não cobre barra fixa nem o aviso de cookies. | RNF-02 |
| REQ-02-16 | Se a navegação falhar, o cabeçalho e o rodapé caem para uma versão mínima (logo, busca, carrinho; dados fiscais ausentes), e o conteúdo da página aparece normalmente. | RNF-06 |
| REQ-02-17 | Rota inexistente responde 404 no servidor e mostra a página de não encontrado dentro do layout padrão; erro inesperado mostra a página de erro, com o status certo. | RNF-06, ADR 0010 |
| REQ-02-18 | Todo link da navegação passa por `shared/routing`: caminho interno vira navegação do Nuxt, URL completa vira link externo, e item com `href` nulo não é renderizado. | ADR 0008 |

## 3. Critérios de aceite

**CA-02-01 · A moldura vem do servidor**
- **Dado** o mock no ar
- **Quando** peço `/` sem executar JavaScript
- **Então** o HTML traz a barra de topo com "(41) 3317-2251", o menu com "Departamentos", pelo menos 50 links de aro, o rodapé com o texto fiscal e o CNPJ "80.171.671/0001-54", e houve uma única chamada a `/navegacao`

**CA-02-02 · Departamentos com os aros**
- **Dado** a página aberta em 1440 px
- **Quando** abro "Departamentos"
- **Então** vejo os 8 departamentos; em Carros, 14 aros (do 10 ao 24); em Vans, os aros 14, 15 e 16; e os grupos "Ajuda para escolher" e "Também vendemos"

**CA-02-03 · Um mega menu por vez, e o teclado manda**
- **Dado** "Departamentos" aberto
- **Quando** abro "Marcas" e depois aperto Esc
- **Então** "Departamentos" fecha ao abrir "Marcas", e o Esc fecha "Marcas" devolvendo o foco ao título dele

**CA-02-04 · Menu do celular**
- **Dado** a página em 390 px
- **Quando** toco no botão de menu, abro "Departamentos" e depois "Carros"
- **Então** a gaveta entra pela esquerda, vejo "Todos os pneus de carros" e os aros em grade, cada departamento tem o nome ao lado do ícone e a seta à direita, e tocar em um aro fecha a gaveta

**CA-02-05 · Rodapé no celular**
- **Dado** a página em 390 px
- **Quando** rolo até o rodapé
- **Então** as quatro colunas estão fechadas; tocar em "Ajuda para escolher" abre a lista com "Comparar pneus"; em 1440 px as quatro estão abertas

**CA-02-06 · Assinar a newsletter**
- **Dado** o formulário do rodapé
- **Quando** digito "cliente@exemplo.com.br" e "41999990000" e toco em "Assinar"
- **Então** o mock recebe `{ "email": "cliente@exemplo.com.br", "whatsapp": "41999990000" }`, a mensagem de confirmação aparece e é anunciada, e não há nada em `localStorage` nem em `sessionStorage` com o e-mail

**CA-02-07 · Newsletter com dado inválido**
- **Dado** o formulário do rodapé
- **Quando** digito "cliente@" e toco em "Assinar"
- **Então** nenhuma chamada é feita, o campo de e-mail fica marcado como inválido com a mensagem ao lado, e o foco vai para ele

**CA-02-08 · Aviso de cookies**
- **Dado** a primeira visita
- **Quando** toco em "Entendi" e recarrego a página
- **Então** o aviso some e não volta

**CA-02-09 · Navegação fora do ar**
- **Dado** o mock com `?_falha=500` em `/navegacao`
- **Quando** abro `/`
- **Então** a página responde 200, vejo o logo, o campo de busca e o carrinho, o conteúdo da página aparece, e não há mega menu nem colunas no rodapé

**CA-02-10 · Rota inexistente**
- **Dado** o caminho `/nao-existe`
- **Quando** peço a página
- **Então** o status é 404, a página mostra "Página não encontrada" em um H1, com o cabeçalho, o rodapé e um link para a Home

## 4. Contratos

| Endpoint | Schema | Usado para |
|---|---|---|
| `GET /navegacao` | `Navegacao` | Barra de topo, cabeçalho, mega menus de Departamentos e de Marcas, menu do celular, rodapé, botão do WhatsApp |
| `POST /newsletter` | `InscricaoNewsletter` → `Confirmacao` | Formulário do rodapé |

Exemplos: [navegacao.json](../../docs/api/examples/navegacao.json),
[newsletter.requisicao.json](../../docs/api/examples/newsletter.requisicao.json),
[confirmacao.json](../../docs/api/examples/confirmacao.json). Detalhes em
[conteudo.md](../../docs/api/endpoints/conteudo.md) e [relacionamento.md](../../docs/api/endpoints/relacionamento.md).

O mega menu de Lojas Físicas **não** tem dado em `/navegacao`: as lojas vêm de `GET /lojas`, do
contexto Lojas (módulo 12). Aqui o componente recebe a lista por prop; quem liga é a composição.

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Cabeçalho e menus | No servidor, não há | Navegação completa | Departamento sem aros: título e resumo; marca sem página: logotipo sem link | Versão mínima: logo, busca, Entrar e carrinho |
| Mega menu Lojas | — | Cartões das lojas | Link simples "Lojas Físicas" para o hub | Igual ao vazio |
| Rodapé | No servidor, não há | Colunas, redes, selos, texto fiscal | Coluna sem link visível some | Versão mínima: logo, newsletter e "Todos os direitos reservados" |
| Newsletter | Botão "Assinar" ocupado, campos travados | Mensagem de confirmação no lugar do formulário | — | Campo marcado (validação) ou mensagem com "Tentar de novo" (rede) |
| Aviso de cookies | Não aparece no HTML do servidor | Aviso visível | Aceite lembrado: não aparece | `localStorage` indisponível: o aviso some no "Entendi" e volta na próxima visita |
| Página de não encontrado | — | H1, texto e link para a Home | — | — |

## 6. Regras de marca, acessibilidade e SEO do módulo

- Verde de ação só em "Assinar" (confirmar) e em "Entendi" do aviso de cookies (confirmar). O botão
  "Buscar" do cabeçalho é um ícone sem fundo verde. O botão do WhatsApp usa o verde próprio do
  WhatsApp (`--ts-whatsapp`), não o de ação.
- Amarelo só sobre preto: nos ícones e no sublinhado do telefone da barra de topo. Nunca como texto
  sobre branco.
- O rodapé e os menus não têm título H2 nem H3 (LS02): os títulos das colunas são `summary` com `span`.
  O H1 é sempre da página.
- Link "Pular para o conteúdo" é o primeiro elemento focável e aponta para `#conteudo`.
- `nav` com nome: "Atalhos" (barra de topo), "Principal" (menu), "Principal no celular" (gaveta).
- Mega menus são `details` com `summary`; os links do painel têm pelo menos 24 px (WCAG 2.5.8), os
  títulos dos menus, 44 px.
- Botão de menu: `aria-label="Abrir menu"`, `aria-haspopup="dialog"`. Carrinho: `aria-label`
  "Carrinho, 2 pneus" ou "Carrinho, vazio"; o número é decorativo (`aria-hidden`).
- Busca: `form` com `role="search"`, rótulo visível "Busca por Medida", texto de exemplo
  "Encontre o pneu ex: 225/45R17", botão com `aria-label="Buscar"`.
- Redes sociais com `aria-label` "TireShop no Instagram"; logotipos de marca com `alt` igual ao nome.
- Newsletter: rótulos "Seu e-mail" e "Seu WhatsApp" para leitor de tela, `autocomplete` `email` e
  `tel`, erro com `aria-invalid` e `aria-describedby`, confirmação com `role="status"`.
- Aviso de cookies: `role="region"` com `aria-label="Aviso de cookies"`.
- Botão do WhatsApp: `aria-label` "Falar no WhatsApp: (41) 3317-2251"; 56 px no celular.
- O texto da moldura nunca usa "numa" (o cliente pediu "em uma").
- Toda a navegação está no HTML do servidor (links de aro contam para SEO: pelo menos 50).

## 7. Fora do escopo

- Lógica da busca por medida, validação do texto e destino: módulo 05.
- Minicart, contagem real do carrinho e botão Comprar: módulo 06.
- Dados do mega menu de Lojas (`GET /lojas`) e a ligação dele no layout: módulo 12.
- Faixa de avaliações acima do rodapé e a nota do selo "Loja confiável": módulo de Avaliações.
- Cabeçalho e rodapé da página de loja física (layout `loja`, ADR 0009): módulo 12.
- Login, cadastro e Meus Pedidos (fora da entrega): os links não têm destino no contrato.
- "Avise-me" (`pedirAviso`): módulo 04.
- Home, políticas e Sobre nós (`obterPaginaInicial`, `obterPolitica`, `obterInstitucional`): módulos 09, 10 e 11.
