# Spec 10 — Políticas e ajuda

| | |
|---|---|
| Marco | M8 |
| Contexto do domínio | [Conteúdo](../../docs/domain/conteudo.md) |
| Telas do protótipo | `politica-prazo-de-entrega.html`, `politica-formas-de-pagamento.html`, `politica-garantia.html`, `politica-trocas-e-devolucoes.html`, `politica-seguranca-e-privacidade.html`, `politica-privacidade.html`, `politica-como-comprar.html`, `politica-perguntas-frequentes.html` |
| ADRs que se aplicam | 0002, 0003, 0004, 0008, 0010, 0011 |
| Depende de | 00, 01, 02 (e 05 e 07 para o filtro compacto e a faixa de avaliações) |

## 1. Objetivo

O cliente lê as oito páginas de ajuda (prazo, pagamento, garantia, trocas, segurança, privacidade,
como comprar e perguntas frequentes), cada uma na própria URL, e passa de uma para a outra pelo menu
lateral, que fica fixo ao rolar e marca a página aberta.

O texto é **literal do cliente**: vem da API em blocos e o frontend só o exibe. Não corrige, não
resume e não reordena.

## 2. Requisitos

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-10-01 | Cada política abre em `/ajuda/<slug>`, com o rótulo "Políticas e ajuda" e o H1 igual ao `titulo` da API. | RF-12 |
| REQ-10-02 | O menu lateral lista as 8 políticas na ordem da API, com ícone e rótulo, e marca **um só** item com `aria-current="page"`. | RF-12 |
| REQ-10-03 | No computador o menu tem 280 px e fica fixo ao rolar. No celular ele some e dá lugar ao acordeão "Todas as políticas", que abre fechado. | RF-12, RNF-02 |
| REQ-10-04 | O corpo é renderizado bloco a bloco, na ordem recebida: `paragrafo`, `titulo` (H2 ou H3), `lista`, `passos` (com o número em destaque), `aviso` (em caixa) e `faq` (em acordeão). | RF-12 |
| REQ-10-05 | O texto é literal: o frontend não altera palavra, acento nem ordem. O HTML dos blocos só entra na tela como `HtmlSeguro`. | RF-12, pedido de 04/11 |
| REQ-10-06 | Na página Perguntas Frequentes as perguntas são títulos H2 com botão (o acordeão vem logo abaixo do H1); depois de um `titulo` de nível 2, as perguntas são H3. | RF-12, RNF-01 |
| REQ-10-07 | Abaixo do H1, uma linha mostra a data de atualização do texto (`atualizadoEm`), no lugar do "Texto do site no ar, capturado em…" do protótipo. | RF-12 |
| REQ-10-08 | A página termina com o bloco "Precisa falar com a gente?": o `contatoHtml` da política ou, quando ele é nulo, o texto padrão com os contatos da navegação; e os botões de WhatsApp e de e-mail. | RF-12 |
| REQ-10-09 | A página leva o filtro compacto no topo (só o lugar; o componente é do módulo 05), as migalhas Home › Ajuda › página, e a faixa de avaliações antes do rodapé (componente do módulo 07). | RF-02, RF-10 |
| REQ-10-10 | Slug que não existe responde 404 no servidor, com a página de não encontrado. | RNF-06 |
| REQ-10-11 | Falha ao buscar o menu não derruba o texto; falha ao buscar a política mostra o estado de erro com "Tentar de novo" e mantém o menu. | RNF-06 |
| REQ-10-12 | Metadados: título e descrição de `seo`, canônica, `BreadcrumbList` e, quando há bloco `faq`, `FAQPage` com todas as perguntas. | RNF-01 |
| REQ-10-13 | As respostas de `GET /politicas` e `GET /politicas/{slug}` são validadas por schema na borda; resposta fora do contrato vira `ErroDeContrato` com o caminho do campo. | RNF-05, ADR 0004 |

## 3. Critérios de aceite

**CA-10-01 · Abrir Trocas e Devoluções**
- **Dado** a política `trocas-e-devolucoes`
- **Quando** abro `/ajuda/trocas-e-devolucoes` em 1440 px
- **Então** vejo o H1 "Política de trocas e devoluções TireShop: Saiba como funciona", as migalhas "Home › Ajuda › Trocas e Devoluções", o menu lateral com 280 px e só "Trocas e Devoluções" marcado, duas caixas de aviso e quatro passos numerados, o primeiro pedindo "pelo menos três imagens dos produtos com suas etiquetas"

**CA-10-02 · Trocar de página pelo menu**
- **Dado** a página de Trocas e Devoluções aberta
- **Quando** clico em "Como Comprar" no menu lateral
- **Então** a URL passa a ser `/ajuda/como-comprar`, o H1 é "Como Comprar Pneus Online na TireShop de Forma Fácil" e o único item marcado é "Como Comprar"

**CA-10-03 · O menu acompanha a rolagem**
- **Dado** `/ajuda/privacidade` em 1440 px (o texto mais longo)
- **Quando** rolo a página 1.500 px
- **Então** o menu lateral continua visível, logo abaixo do cabeçalho

**CA-10-04 · Menu no celular**
- **Dado** `/ajuda/garantia` em 390 px
- **Quando** a página abre
- **Então** o menu lateral fixo não aparece e, acima do texto, há o acordeão "Todas as políticas", fechado; ao abri-lo vejo os 8 links, com "Política de Garantia" marcado

**CA-10-05 · Perguntas Frequentes**
- **Dado** a política `perguntas-frequentes`, com um bloco `faq` de 17 perguntas
- **Quando** abro `/ajuda/perguntas-frequentes`
- **Então** vejo 17 perguntas, cada uma um botão dentro de um H2, a primeira ("TireShop tem loja física?") aberta, e o HTML traz um `FAQPage` com 17 perguntas

**CA-10-06 · O texto não é corrigido**
- **Dado** a política `garantia`, cujo título vem "Politica de Garantia" (sem acento, como no site)
- **Quando** abro a página
- **Então** o H1 é exatamente "Politica de Garantia"

**CA-10-07 · Bloco de contato**
- **Dado** `trocas-e-devolucoes` (com `contatoHtml`) e `privacidade` (com `contatoHtml` nulo)
- **Quando** abro cada uma
- **Então** a primeira mostra o parágrafo recebido ("…telefone 41-3317-2251 ou Whatsapp 41-3317-2251.") e a segunda mostra o texto padrão com "contato@tireshop.com.br" e "(41) 3317-2251"; as duas têm os botões "WhatsApp (41) 3317-2251" e "contato@tireshop.com.br"

**CA-10-08 · Página que não existe**
- **Dado** o slug `politica-inexistente`
- **Quando** peço `/ajuda/politica-inexistente`
- **Então** a resposta tem status 404 e mostra a página de não encontrado

**CA-10-09 · Falha de um bloco não derruba a página**
- **Dado** o mock com `?_falha=500` em `/politicas`
- **Quando** abro `/ajuda/garantia`
- **Então** o texto da política aparece inteiro, o lugar do menu mostra o estado de erro, e o status da página é 200

**CA-10-10 · Tudo no HTML do servidor**
- **Dado** `/ajuda/perguntas-frequentes`
- **Quando** peço a página sem executar JavaScript
- **Então** o HTML já traz o H1, as 17 perguntas e as 17 respostas

## 4. Contratos

| Endpoint | Schema | Usado para |
|---|---|---|
| `GET /politicas` | `ListaDePoliticas` | Menu lateral e acordeão do celular |
| `GET /politicas/{slug}` | `Politica` (com `BlocoDeTexto[]`) | H1, corpo, contato, data, metadados |

Detalhes em [docs/api/endpoints/conteudo.md](../../docs/api/endpoints/conteudo.md). Slugs atuais:
`prazo-de-entrega`, `formas-de-pagamento`, `garantia`, `trocas-e-devolucoes`,
`seguranca-e-privacidade`, `privacidade`, `como-comprar`, `perguntas-frequentes`.

O contato padrão (telefone, WhatsApp, e-mail, horário de atendimento) vem de `GET /navegacao`, já
carregado pelo layout (módulo 02).

O bloco `video` do contrato é do módulo 11 (Sobre nós). Este módulo trata os outros seis tipos.

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Texto da política (H1, blocos) | No servidor, não há | Política | 404 | `EstadoDeErro` + "Tentar de novo"; o menu continua |
| Menu lateral e acordeão | Esqueleto de 8 linhas | 8 links, um ativo | Some | `EstadoDeErro` discreto no lugar; o texto continua |
| Bloco de contato | — | Texto da política ou padrão | Usa o padrão | Sem os dados da navegação, mostra só o texto recebido |

Ao trocar de política pelo menu, o texto anterior fica visível até o novo chegar.

## 6. Regras de marca, acessibilidade e SEO do módulo

- Um H1 por página (o `titulo` da API). Os subtítulos são os do cliente (`titulo` de nível 2 ou 3).
- As perguntas do FAQ ficam um nível abaixo do último título anterior: H2 sem título antes, H3 depois de um H2. Nenhum nível é pulado.
- O menu é um `aside` com `aria-label="Políticas e ajuda"`. O item ativo é o único com `aria-current="page"` **dentro de cada lista** (a fixa e a do acordeão); só uma das duas é visível por tamanho de tela.
- Links do menu com pelo menos 44 px de altura. O acordeão do celular é um `details` com `summary` de 52 px.
- O número de cada passo é decorativo (`aria-hidden`): a lista é um `ol`, e o leitor de tela já anuncia a posição.
- A caixa de aviso usa as cores dos tokens. Nenhum verde de ação na página: o botão do WhatsApp usa a variante `whatsapp`, não a de ação.
- Menu fixo com `position: sticky`, abaixo do cabeçalho (`--ts-header-h`).
- A canônica é a URL de `rotas.politica(slug)`. Texto com cache longo (revalidação de 1 dia).

Invariantes herdados do `tools/hifi/verify.py` (regra `_politica`), que viram e2e: um só item ativo no
menu fixo; filtro compacto presente; migalhas com "Ajuda"; no computador, menu `sticky` com 280 px; no
celular, menu fixo oculto e acordeão fechado; em Trocas, o H1 literal do site e o passo das fotos.

## 7. Fora do escopo

- Filtro compacto (módulo 05) e faixa de avaliações (módulo 07): aqui só o lugar.
- Bloco `video` (módulo 11).
- Página índice `/ajuda` (não existe no protótipo; "Ajuda" nas migalhas é texto, sem link).
- Formulário de devolução dentro de Meus Pedidos (área logada, fora da entrega).
- Edição do texto. O título sugerido no RT70 para Trocas só entra quando o cliente trocar o conteúdo na API.
- Busca dentro das políticas.
