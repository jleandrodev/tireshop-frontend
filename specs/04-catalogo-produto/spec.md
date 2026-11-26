# Spec 04 — Catálogo: produto

| | |
|---|---|
| Marco | M4 |
| Contexto do domínio | [Catálogo](../../docs/domain/catalogo.md), com [Entrega](../../docs/domain/entrega.md) (frete por CEP) e [Relacionamento](../../docs/domain/relacionamento.md) (Avise-me) |
| Telas do protótipo | `produto-3084.html` (comum), `produto-3016.html` (com giro 360°), `produto-4360-sem-estoque.html` |
| ADRs que se aplicam | 0002, 0003, 0004, 0007, 0008, 0010, 0011, 0012 |
| Depende de | 00, 01, 02, 03 (e 05 e 06 para o filtro compacto e o botão Comprar) |

## 1. Objetivo

O cliente abre um pneu, vê as fotos (ou o giro 360°), entende o preço em 12x e à vista, escolhe a
quantidade, simula prazo e frete pelo CEP e compra. Abaixo, lê descrição, ficha técnica, etiqueta do
INMETRO, veículos compatíveis e perguntas, e vê quatro alternativas. Se o pneu está sem estoque, a
página não mostra preço nem frete: mostra a previsão de chegada e o "Avise-me".

O filtro compacto do topo é do módulo 05, o comportamento do Comprar (minicart) é do módulo 06 e o
conteúdo da seção de avaliações é do módulo 07. Aqui a página reserva o lugar de cada um.

## 2. Requisitos

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-04-01 | A página abre com o filtro compacto (uma linha, até 80 px no computador) e as migalhas. Não tem banner nem a faixa global de avaliações acima do rodapé. | RF-06, RF-02, 04/11 |
| REQ-04-02 | A galeria mostra a foto principal (640×569), as miniaturas, os selos (Promoção e frete grátis) e a legenda. A miniatura ativa é marcada com `aria-pressed`. | RF-06 |
| REQ-04-03 | Com giro 360°, a galeria **abre no giro**: gira ao arrastar e com as setas do teclado, dá a volta nos dois sentidos e pré-carrega os quadros. A foto comum fica na miniatura. | RF-06 |
| REQ-04-04 | Marca, código, H1 (nome completo com a medida), estrelas, selo "Original do {veículo}" e a frase dos índices ficam **dentro do cartão de compra**, ao lado da foto. | RF-06, 04/11 |
| REQ-04-05 | O preço aparece em dois blocos lado a lado, total em até 12x e à vista, com tamanhos de fonte próximos (razão de até 1,25). O preço anterior aparece riscado só em promoção. Nenhum valor é calculado na tela. | RF-06 |
| REQ-04-06 | "Ver todas as formas de pagamento" abre a tabela com as linhas que a API manda, na ordem recebida. | RF-06 |
| REQ-04-07 | A quantidade vai de 1 a 8: o botão de menos desativa em 1 e o de mais em 8, e a mudança é anunciada. | RF-09 |
| REQ-04-08 | O cartão tem o botão Comprar (verde, leva a quantidade escolhida ao carrinho), a dica de pares, o botão do WhatsApp e o link "Comparar com outros pneus", que abre o Comparar com este pneu escolhido. | RF-09, RF-11 |
| REQ-04-09 | O bloco "Prazo e frete pelo CEP" simula pelo CEP e pela quantidade, com a opção de oficina conveniada, e mostra "Chega em x a y dias úteis" e o frete. CEP incompleto não chega à API. O CEP não é guardado. | RF-07, RNF-08 |
| REQ-04-10 | A faixa de confiança mostra quatro garantias da compra. A garantia do fabricante aparece só nela e na ficha, nunca no cartão de compra. | RF-06 |
| REQ-04-11 | Uma barra de âncoras, fixa ao rolar, leva a Descrição, Ficha técnica, INMETRO, Veículos compatíveis, Avaliações e Perguntas. Toda âncora tem destino. | RF-06 |
| REQ-04-12 | A descrição vem recolhida, com "Ler mais" (largura total no celular). | RF-06 |
| REQ-04-13 | A ficha técnica lista os pares rótulo e valor na ordem recebida. | RF-06 |
| REQ-04-14 | A seção do INMETRO mostra a etiqueta como imagem e a explicação dos três itens; sem etiqueta, só a explicação. | RF-06 |
| REQ-04-15 | Os veículos compatíveis aparecem em tabela; com mais de 8, há busca por modelo. Lista vazia mostra a mensagem padrão. | RF-06 |
| REQ-04-16 | As perguntas do produto aparecem em acordeão. | RF-06 |
| REQ-04-17 | "Veja também" mostra até 4 cards de pneus relacionados, em chamada própria. Lista vazia ou falha esconde a seção sem derrubar a página. | RF-06, RNF-06 |
| REQ-04-18 | No celular, uma barra fixa no pé mostra o preço e o Comprar; o botão do WhatsApp sobe e não a cobre. | RF-09, RNF-02 |
| REQ-04-19 | Descrição, ficha, INMETRO, veículos, avaliações e perguntas ficam em uma coluna de 900 px, centralizada no container. | RF-06, 04/11 |
| REQ-04-20 | Produto sem estoque: sem preço, sem formas de pagamento, sem quantidade, sem Comprar, sem CEP e sem barra fixa. Mostra "Sem estoque no momento", a previsão de chegada e o formulário Avise-me; a seção de alternativas se chama "Alternativas disponíveis". | RF-08 |
| REQ-04-21 | O Avise-me valida o e-mail antes de enviar, mostra a confirmação que a API devolve e não guarda o e-mail no navegador. | RF-08, RNF-08 |
| REQ-04-22 | A página reserva a seção `#avaliacoes-produto` com o H2 e a nota do produto; as estrelas do título são um link para ela. Sem avaliação, estrelas, âncora e seção não aparecem. | RF-10 |
| REQ-04-23 | Metadados: título e descrição do produto, canônica, e JSON-LD `Product` (com EAN, marca, preço e disponibilidade) e `BreadcrumbList`, no HTML do servidor. | RNF-01 |
| REQ-04-24 | Código de produto inexistente responde 404 no servidor, com a página de não encontrado. | RNF-06 |

## 3. Critérios de aceite

**CA-04-01 · Abrir um produto comum**
- **Dado** o produto 3084, em estoque e sem giro
- **Quando** abro `/p/3084`
- **Então** vejo as migalhas "Pneus para carros › Aro 17 › nome do pneu", o H1 dentro do cartão de compra, "Hankook · Cód. 3084", "4,9 (31 avaliações)", o selo "Original do Hyundai i30 e VW Golf" e "Índice 91V: até 615 kg por pneu e 240 km/h"; não vejo banner nem a faixa global de avaliações

**CA-04-02 · Preço em 12x e à vista**
- **Dado** o produto 3084
- **Quando** olho o cartão de compra
- **Então** vejo "R$ 620,00" riscado, "R$ 529,00 em até 12x de R$ 44,08 sem juros" e "R$ 502,55 à vista", os dois valores com razão de fonte de até 1,25, e "Ver todas as formas de pagamento" abre 4 linhas, a segunda com "4x de R$ 128,28 (3% de desconto)"

**CA-04-03 · Galeria abre no giro**
- **Dado** o produto 3016, com 12 quadros de giro
- **Quando** abro a página
- **Então** a miniatura "360°" está ativa e a foto comum, oculta; arrastar para a direita ou apertar a seta direita troca o quadro; a seta esquerda no primeiro quadro leva ao último; tocar na miniatura da foto mostra a foto

**CA-04-04 · Quantidade e Comprar**
- **Dado** o produto 3084 com a quantidade em 1
- **Quando** toco em "Mais um pneu" três vezes e em Comprar
- **Então** a quantidade mostra 4 e o carrinho recebe 4 unidades do 3084; depois de 8, o botão de mais fica desativado

**CA-04-05 · Prazo e frete pelo CEP**
- **Dado** o produto 3084 com a quantidade em 4
- **Quando** digito `80010000` (o campo mostra `80010-000`) e toco em Calcular
- **Então** vejo "Chega em 2 a 4 dias úteis · Frete grátis", anunciado a leitores de tela, e nenhum armazenamento do navegador contém o CEP

**CA-04-06 · CEP incompleto e oficina conveniada**
- **Dado** o bloco de CEP
- **Quando** envio `8001` **Então** vejo "Digite o CEP completo, com 8 números.", o foco volta ao campo e nenhuma chamada sai
- **Quando** escolho "Montar em uma oficina conveniada" e calculo com um CEP válido **Então** a simulação é pedida com `tipo: "oficina"` e o resultado fala da oficina conveniada

**CA-04-07 · Veículos compatíveis**
- **Dado** o produto 3084, com 9 veículos
- **Quando** digito "golf" em "Buscar modelo"
- **Então** a tabela mostra só as 2 linhas do Golf; no produto com 8 veículos ou menos, o campo de busca não existe

**CA-04-08 · Produto sem estoque**
- **Dado** o produto 4360, sem estoque
- **Quando** abro a página
- **Então** não há preço, quantidade, Comprar, CEP nem barra fixa; vejo "Sem estoque no momento", "Previsão de chegada: 12 de dezembro", o formulário Avise-me e a seção "Alternativas disponíveis" com 4 cards

**CA-04-09 · Avise-me**
- **Dado** o produto 4360
- **Quando** envio `cliente@exemplo.com.br`
- **Então** vejo "Pronto: avisamos cliente@exemplo.com.br assim que o pneu voltar ao estoque."; com `cliente@` vejo o erro do campo e nenhuma chamada sai

**CA-04-10 · Barra fixa no celular**
- **Dado** o produto 3084 em 390 px
- **Quando** rolo a página
- **Então** a barra com "R$ 529,00", "12x de R$ 44,08 · R$ 502,55 à vista" e Comprar fica fixa no pé, e o botão do WhatsApp fica acima dela

**CA-04-11 · Miolo e âncoras**
- **Dado** o produto 3084 em 1440 px
- **Quando** toco em "Ficha técnica" na barra de âncoras
- **Então** a página rola até a seção; todas as âncoras têm destino; o centro da seção Descrição coincide com o centro do container (desvio de até 2 px) e ela tem 900 px de largura

**CA-04-12 · SEO no HTML do servidor**
- **Dado** a URL do produto 3084
- **Quando** peço a página sem executar JavaScript
- **Então** o HTML traz um único H1, o `<title>` do produto, o JSON-LD `Product` com `gtin13` 8808563325293, preço 502.55 e `InStock`, e o `BreadcrumbList` com 3 itens

**CA-04-13 · Produto inexistente e bloco que falha**
- **Dado** o código 9999 **Quando** abro `/p/9999` **Então** a resposta é 404 com a página de não encontrado
- **Dado** o mock com `?_falha=500` em `/produtos/3084/relacionados` **Quando** abro o produto **Então** a página responde 200, sem a seção "Veja também"

## 4. Contratos

| Endpoint | Schema | Usado para |
|---|---|---|
| `GET /produtos/{id}` | `Produto` | A página inteira, menos avaliações, frete e relacionados |
| `GET /produtos/{id}/relacionados` | `ProdutoResumo[]` | "Veja também" |
| `POST /frete/simulacoes` | `PedidoDeSimulacao` → `SimulacaoDeFrete` | Bloco "Prazo e frete pelo CEP" |
| `POST /produtos/{id}/avise-me` | `PedidoDeAviso` → `Confirmacao` | Formulário Avise-me |

Detalhes em [catalogo.md](../../docs/api/endpoints/catalogo.md), [entrega.md](../../docs/api/endpoints/entrega.md) e
[relacionamento.md](../../docs/api/endpoints/relacionamento.md). Exemplos: `produto-3084.json`,
`produto-3016-com-360.json`, `produto-4360-sem-estoque.json`, `produto-3084-relacionados.json`,
`frete-simulacao.json`, `confirmacao.json`, `erro-404.json`, `erro-422.json`.

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Produto (galeria, cartão, miolo) | No servidor, não há | Produto | 404 | Página de erro |
| Giro 360° | Primeiro quadro visível enquanto os outros carregam | Giro | Sem giro: foto comum | Quadro que falha é pulado |
| Prazo e frete | Botão "Calculando…", desativado | "Chega em x a y dias úteis · frete" | Antes de calcular: só o campo | Mensagem abaixo do campo (CEP inválido ou não atendido; falha de rede com "Tentar de novo") |
| Avise-me | Botão desativado | Confirmação da API | — | Erro do campo ou mensagem com "Tentar de novo" |
| Veículos compatíveis | — | Tabela | Mensagem padrão; busca sem resultado: "Nenhum veículo com esse modelo" | — |
| Veja também | 4 esqueletos de card | Até 4 cards | Some | Some |
| Seção de avaliações | (módulo 07) | Nota do produto | Some, com as estrelas e a âncora | (módulo 07) |

## 6. Regras de marca, acessibilidade e SEO do módulo

- Um único H1, o nome do produto, dentro do cartão. H2: Descrição, Ficha técnica, Classificação do
  INMETRO, Veículos compatíveis, Avaliações de quem comprou, Perguntas frequentes, Veja também.
- Verde de ação só no Comprar (cartão e barra fixa) e no Avise-me. "Calcular" é botão escuro; "Ler mais", contorno.
- O giro é focável, tem `role="img"` e rótulo "Foto em 360 graus do {nome}: arraste para girar"; as setas giram um quadro por toque.
- Estrelas com `aria-label` "Nota 4,9 de 5, em 31 avaliações". Preço anterior com "Preço anterior:" para leitor de tela.
- O resultado do CEP e a confirmação do Avise-me usam `role="status"`. O campo de CEP tem `inputmode="numeric"` e `autocomplete="postal-code"`.
- Descrição só entra por `v-html` como `HtmlSeguro`. Imagens com `width`, `height` e `alt`; a etiqueta do INMETRO com `loading="lazy"`.
- Nenhuma URL montada à mão: `rotas.produto`, `rotas.categoria`, `rotas.comparar` (antipadrão A11).
- Regras herdadas de `_produto` em `tools/hifi/verify.py`: sem banner; filtro compacto de até 80 px; âncoras com destino; com 360° abre nele; razão de fonte até 1,25; CEP presente; barra fixa no celular; sem estoque sem preço nem CEP e com Avise-me; 4 cards em alternativas; H1 no cartão; sem faixa global; link Comparar; estrelas ancoradas; descrição centralizada; botões soltos em largura total no celular.

## 7. Fora do escopo

- O componente do filtro compacto (módulo 05), o minicart e o caso de uso de adicionar ao carrinho (módulo 06).
- Carrossel de depoimentos, lista "Todas as avaliações" e "Ver mais" (módulo 07).
- A página Comparar (módulo 08); aqui só o link de entrada.
- Vídeo do produto (RT50): o site não tem conteúdo. Selo de garantia de preço (RT47): nenhum produto marcado.
- Frete no carrinho e no checkout. INMETRO em notas A a G (dúvida D5).
- Lembrar o CEP entre páginas: proibido (RNF-08).
