# Tasks 04 — Catálogo: produto

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. Uma task por vez. Os valores dos casos vêm de `produto-3084.json` (comum),
`produto-3016-com-360.json` (giro) e `produto-4360-sem-estoque.json`.

---

### [ ] T-0401 · `Produto` completo sabe o que a página pode mostrar

- **Requisito:** REQ-04-03, REQ-04-04, REQ-04-15, REQ-04-20
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/produto.spec.ts`
  - em estoque: `podeComprar()` e `mostraPreco()` verdadeiros; sem estoque: os dois falsos, e `previsaoChegada` existe
  - `abreNoGiro()` é verdadeiro só quando há giro 360°
  - `temSeloOriginal()` é verdadeiro com `originalDe` "Hyundai i30 e VW Golf" e falso com nulo
  - `fraseDosIndices()` devolve "Índice 91V: até 615 kg por pneu e 240 km/h"; sem um dos índices, devolve nada
  - `IndiceCarga` recusa `kg` zero ou negativo; `IndiceVelocidade` recusa `kmh` zero ou negativo
  - `mostraBuscaDeVeiculos()` é verdadeiro com 9 veículos e falso com 8
  - `veiculosCom('golf')` devolve só as linhas do Golf, sem diferenciar maiúsculas; termo vazio devolve todas
  - `resumo()` devolve o `ProdutoResumo` do mesmo produto; a fábrica `umProduto()` cria um válido e aceita sobrescritas
- **Pronto quando:** `Produto`, `IndiceCarga` e `IndiceVelocidade` publicados em `layers/catalogo/index.ts`; classe imutável.
- **Arquivos:** `layers/catalogo/domain/produto.ts`, `produto.spec.ts`, `indices.ts`, `__fabricas__/produto.ts`, `index.ts`
- **Fora do escopo:** o giro em si (T-0402); metadados (T-0430).
- **Depende de:** T-0301, T-0302, T-0303

### [ ] T-0402 · `Giro360` escolhe o quadro pelo arraste e pelas setas

- **Requisito:** REQ-04-03
- **Camada:** domínio
- **Teste primeiro:** `layers/catalogo/domain/giro-360.spec.ts`
  - aceita de 12 a 36 quadros e recusa menos de 12 (`GiroInvalido`)
  - começa no quadro 0
  - `avancar()` no último quadro volta ao primeiro; `recuar()` no primeiro vai ao último
  - `quadroPorArraste(inicio, deslocamentoPx)` anda 1 quadro a cada 14 px: 28 px a partir do 0 dá o quadro 2
  - arraste negativo dá a volta: -14 px a partir do 0, com 12 quadros, dá o quadro 11
- **Pronto quando:** value object imutável, sem DOM; o passo de 14 px é uma constante com nome.
- **Arquivos:** `layers/catalogo/domain/giro-360.ts`, `giro-360.spec.ts`
- **Fora do escopo:** eventos de ponteiro e pré-carga (T-0419).
- **Depende de:** T-0101

### [ ] T-0403 · Caso de uso `obterProduto`

- **Requisito:** REQ-04-01, REQ-04-24
- **Camada:** aplicação
- **Teste primeiro:** `layers/catalogo/application/obter-produto.spec.ts` (com `ProdutoRepositoryFalso`)
  - devolve o produto pelo código "3084"
  - código vazio ou só com espaços devolve `ProdutoNaoEncontrado` sem chamar a porta
  - código inexistente ("9999") devolve `ProdutoNaoEncontrado`
  - erro de rede da porta sai como `Result` de falha, sem lançar
- **Pronto quando:** `criarObterProduto(produtos)` recebe a porta por parâmetro; o falso ganha `obter`.
- **Arquivos:** `layers/catalogo/application/obter-produto.ts`, `obter-produto.spec.ts`, `application/__falsos__/produto-repository-falso.ts`
- **Fora do escopo:** relacionados, avaliações e frete (chamadas próprias).
- **Depende de:** T-0401, T-0306

### [ ] T-0404 · Caso de uso `listarRelacionados`

- **Requisito:** REQ-04-17
- **Camada:** aplicação
- **Teste primeiro:** `layers/catalogo/application/listar-relacionados.spec.ts`
  - devolve os relacionados do "3084" na ordem recebida
  - nunca devolve mais de 4, mesmo que a porta mande 6
  - nunca devolve o próprio produto
  - lista vazia é sucesso
  - erro da porta sai como `Result` de falha
- **Pronto quando:** `criarListarRelacionados(produtos)`; o falso ganha `relacionados`.
- **Arquivos:** `layers/catalogo/application/listar-relacionados.ts`, `listar-relacionados.spec.ts`, `application/__falsos__/produto-repository-falso.ts`
- **Fora do escopo:** a regra de quais produtos são relacionados (é do backend).
- **Depende de:** T-0306

### [ ] T-0405 · `Cep` valida, formata e não se deixa guardar

- **Requisito:** REQ-04-09
- **Camada:** domínio
- **Teste primeiro:** `layers/entrega/domain/cep.spec.ts`
  - `Cep.criar('80010000')` e `Cep.criar('80010-000')` dão o mesmo CEP, com `formatado` "80010-000"
  - recusa "8001", "800100000" e texto vazio com `CepInvalido` e a mensagem "Digite o CEP completo, com 8 números."
  - ignora espaços e pontos; recusa letras
  - `mascarar('80010')` devolve "80010" e `mascarar('800100')` devolve "80010-0" (para o campo, enquanto digita)
  - `JSON.stringify(cep)` não expõe o valor (proteção contra persistência acidental)
- **Pronto quando:** `Cep.criar` devolve `Result<Cep, CepInvalido>`; publicado em `layers/entrega/index.ts`.
- **Arquivos:** `layers/entrega/domain/cep.ts`, `cep.spec.ts`, `layers/entrega/index.ts`
- **Fora do escopo:** saber se o CEP existe (é do backend).
- **Depende de:** T-0101

### [ ] T-0406 · `SimulacaoDeFrete` diz o prazo e o frete em texto

- **Requisito:** REQ-04-09
- **Camada:** domínio
- **Teste primeiro:** `layers/entrega/domain/simulacao-de-frete.spec.ts`
  - `PrazoEntrega` de 2 a 4 dá "Chega em 2 a 4 dias úteis"; mínimo igual ao máximo dá "Chega em 3 dias úteis"
  - recusa mínimo maior que o máximo e valores negativos
  - frete `gratis` dá "Frete grátis"; `a_calcular` dá "Frete calculado no carrinho"; valor de 3990 centavos dá "R$ 39,90"
  - `resumo()` junta "Chega em 2 a 4 dias úteis · Frete grátis"
  - com `tipo` `oficina`, o resumo diz "na oficina conveniada"
- **Pronto quando:** `PrazoEntrega`, `TipoDeEntrega` e `SimulacaoDeFrete` imutáveis; usa `Dinheiro`.
- **Arquivos:** `layers/entrega/domain/simulacao-de-frete.ts`, `simulacao-de-frete.spec.ts`, `prazo-entrega.ts`
- **Fora do escopo:** calcular prazo ou frete (antipadrão A8).
- **Depende de:** T-0102

### [ ] T-0407 · Caso de uso `simularFrete`

- **Requisito:** REQ-04-09
- **Camada:** aplicação
- **Teste primeiro:** `layers/entrega/application/simular-frete.spec.ts` (com `FreteGatewayFalso`)
  - com "80010000", produto "3084", quantidade 4 e `endereco`, chama a porta e devolve a simulação
  - CEP incompleto devolve `CepInvalido` e **não** chama a porta
  - quantidade 0 ou 9 devolve `ErroDeValidacao` sem chamar a porta
  - repassa `oficina` quando o cliente escolhe a oficina conveniada
  - `CepNaoAtendido` da porta sai como falha, com a mensagem do servidor
  - erro de rede sai como `Result` de falha, sem lançar
- **Pronto quando:** `FreteGateway` declarado em `domain/portas.ts`; `ErroDeEntrega` tipado; falso em `application/__falsos__/`.
- **Arquivos:** `layers/entrega/domain/portas.ts`, `application/simular-frete.ts`, `simular-frete.spec.ts`, `application/__falsos__/frete-gateway-falso.ts`
- **Fora do escopo:** guardar o último CEP (proibido, RNF-08).
- **Depende de:** T-0405, T-0406

### [ ] T-0408 · Caso de uso `pedirAviso`

- **Requisito:** REQ-04-21
- **Camada:** aplicação
- **Teste primeiro:** `layers/relacionamento/application/pedir-aviso.spec.ts` (com `LeadsGatewayFalso`)
  - com o produto "4360" e "cliente@exemplo.com.br", chama a porta e devolve a mensagem de confirmação
  - "Cliente@Exemplo.com.br" é enviado em minúsculas
  - "cliente@" e texto vazio devolvem `EmailInvalido` e não chamam a porta
  - código de produto vazio é recusado
  - erro de rede sai como `Result` de falha, sem lançar
- **Pronto quando:** `Email` e `PedidoAviso` no domínio; `LeadsGateway.pedirAviso` em `domain/portas.ts` devolvendo a confirmação; falso em memória.
- **Arquivos:** `layers/relacionamento/domain/email.ts`, `email.spec.ts`, `pedido-aviso.ts`, `portas.ts`, `application/pedir-aviso.ts`, `pedir-aviso.spec.ts`, `application/__falsos__/leads-gateway-falso.ts`, `layers/relacionamento/index.ts`
- **Fora do escopo:** newsletter (módulo 02). Se `Email` já existir por causa dela, reutilize e não duplique.
- **Depende de:** T-0101

### [ ] T-0409 · O schema e o mapper de `Produto` entendem a API

- **Requisito:** REQ-04-02, REQ-04-03, REQ-04-05, REQ-04-06, REQ-04-13, REQ-04-14, REQ-04-20
- **Camada:** adaptador
- **Teste primeiro:** `layers/catalogo/adapters/http/produto.mapper.spec.ts`
  - `produto-3084.json` valida e vira `Produto` com preço de R$ 529,00, 4 formas de pagamento, 17 linhas de ficha, 9 veículos e 3 migalhas
  - `produto-3016-com-360.json` vira produto com `Giro360` de 12 quadros (480×320)
  - `produto-4360-sem-estoque.json` (`preco: null`, `formasPagamento: []`) vira produto sem preço exibível, com previsão em 12/12/2026
  - `originalDe`, `giro360`, `inmetro`, `indiceCarga` e `previsaoChegada` nulos viram ausência, sem erro
  - `descricaoHtml` e `respostaHtml` viram `HtmlSeguro`; `<script>` na descrição é recusado
  - migalha com `href: null` vira item sem link
  - falta de `galeria` (ou galeria vazia) é recusada pelo schema, com o caminho do campo
- **Pronto quando:** `ProdutoSchema` estende o `ProdutoResumoSchema`; `paraProduto(dto)` é função pura; o DTO não sai de `adapters/`.
- **Arquivos:** `layers/catalogo/adapters/http/produto.schema.ts`, `produto.mapper.ts`, `produto.mapper.spec.ts`
- **Fora do escopo:** chamada HTTP (T-0410).
- **Depende de:** T-0401, T-0402, T-0308, T-0104

### [ ] T-0410 · `HttpProdutoRepository` busca o produto e os relacionados

- **Requisito:** REQ-04-17, REQ-04-24
- **Camada:** adaptador
- **Teste primeiro:** `layers/catalogo/adapters/http/http-produto-repository.spec.ts` (com `ClienteHttp` falso)
  - `obter('3084')` faz `GET /produtos/3084` e devolve o `Produto`
  - 404 (`erro-404.json`) vira `ProdutoNaoEncontrado`
  - resposta fora do contrato vira `ErroDeContrato` com o endpoint e o caminho
  - `relacionados('3084')` faz `GET /produtos/3084/relacionados` e devolve 4 `ProdutoResumo`
  - `{ "itens": [] }` vira lista vazia, sem erro
  - falha de rede e 5xx viram `ErroDeRede`
- **Pronto quando:** `obter` e `relacionados` da porta implementados; o código vai codificado na URL.
- **Arquivos:** `layers/catalogo/adapters/http/http-produto-repository.ts`, `http-produto-repository.spec.ts`, `relacionados.schema.ts`
- **Fora do escopo:** `porIds` (módulo 08).
- **Depende de:** T-0403, T-0404, T-0409, T-0103

### [ ] T-0411 · `HttpFreteGateway` simula o frete e traduz os erros

- **Requisito:** REQ-04-09
- **Camada:** adaptador
- **Teste primeiro:** `layers/entrega/adapters/http/http-frete-gateway.spec.ts` (com `ClienteHttp` falso)
  - envia `POST /frete/simulacoes` com o corpo de `frete-simulacao.requisicao.json` (CEP sem traço, `produtoId`, `quantidade`, `tipo`)
  - `frete-simulacao.json` vira simulação de 2 a 4 dias úteis com frete `gratis`
  - `frete.tipo: "valor"` com 3990 centavos vira `Dinheiro`; `a_calcular` vira o estado correspondente
  - 422 com `erros[].campo = "cep"` vira `CepNaoAtendido`, com a mensagem do servidor
  - resposta fora do contrato vira `ErroDeContrato`; falha de rede, `ErroDeRede`
- **Pronto quando:** `SimulacaoDeFreteSchema` e o mapper prontos; o campo `ilustrativo` é ignorado.
- **Arquivos:** `layers/entrega/adapters/http/frete.schema.ts`, `frete.mapper.ts`, `http-frete-gateway.ts`, `http-frete-gateway.spec.ts`
- **Fora do escopo:** cache da simulação.
- **Depende de:** T-0407, T-0103

### [ ] T-0412 · `HttpLeadsGateway.pedirAviso` envia o pedido e trata as recusas

- **Requisito:** REQ-04-21
- **Camada:** adaptador
- **Teste primeiro:** `layers/relacionamento/adapters/http/http-leads-gateway.spec.ts` (com `ClienteHttp` falso)
  - envia `POST /produtos/4360/avise-me` com `{ "email": "cliente@exemplo.com.br" }`
  - 201 com `confirmacao.json` devolve a mensagem "Pronto: avisamos cliente@exemplo.com.br assim que o pneu voltar ao estoque."
  - 422 vira `EmailInvalido`, com a mensagem do servidor
  - 404 vira erro de produto não encontrado
  - falha de rede vira `ErroDeRede`
- **Pronto quando:** `ConfirmacaoSchema` valida a resposta; nada é gravado em `localStorage` ou `sessionStorage`.
- **Arquivos:** `layers/relacionamento/adapters/http/confirmacao.schema.ts`, `http-leads-gateway.ts`, `http-leads-gateway.spec.ts`
- **Fora do escopo:** `assinar` (newsletter, módulo 02).
- **Depende de:** T-0408, T-0103

### [ ] T-0413 · O mock serve o produto e os relacionados

- **Requisito:** REQ-04-17, REQ-04-24
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/produtos/[id].get.spec.ts`
  - `GET /api/mock/produtos/3084` devolve o produto, igual a `produto-3084.json`
  - `/produtos/3016` vem com `giro360` de 12 quadros; `/produtos/4360` vem `sem_estoque`, com `preco: null`
  - `/produtos/9999` devolve 404 em `problem+json`
  - `/produtos/3084/relacionados` devolve 4 itens do aro 17, nenhum deles o 3084
  - relacionados de um produto sem vizinhos de aro completa com o departamento
  - as respostas validam no `ProdutoSchema` e no schema de relacionados
- **Pronto quando:** as rotas leem `mocks/fixtures/_base/produtos.json`; `?_falha` e `?_atraso` funcionam nas duas.
- **Arquivos:** `server/api/mock/produtos/[id].get.ts`, `server/api/mock/produtos/[id]/relacionados.get.ts`, `server/utils/mock-catalogo.ts`, os `.spec.ts`
- **Fora do escopo:** `/produtos/comparar` (módulo 08); avaliações (módulo 07).
- **Depende de:** T-0008, T-0311, T-0410

### [ ] T-0414 · O mock simula o frete por faixa de CEP

- **Requisito:** REQ-04-09
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/frete/simulacoes.post.spec.ts`
  - CEP `80010000` com 4 unidades do 3084 devolve prazo de 2 a 4 e frete `gratis` (R$ 2.010,20 no Sul)
  - o mesmo CEP com 1 unidade (R$ 502,55) devolve `a_calcular`
  - CEP `01310100` devolve prazo de 3 a 5; CEP `60000000` devolve de 6 a 10 e `a_calcular` para produto de frete grátis "Sul e Sudeste"
  - `tipo: "oficina"` devolve a mensagem com "na oficina conveniada"
  - CEP com 7 dígitos devolve 422 com `erros[0].campo = "cep"`; `00000000` devolve 422 de CEP não atendido
  - a resposta valida no `SimulacaoDeFreteSchema` e traz `ilustrativo: true`
- **Pronto quando:** a regra é a do protótipo (prefixo 80 ou mais: Sul; até 39: Sudeste; valor mínimo do selo de frete do produto), isolada em `server/utils/mock-frete.ts`.
- **Arquivos:** `server/api/mock/frete/simulacoes.post.ts`, `server/utils/mock-frete.ts`, `simulacoes.post.spec.ts`
- **Fora do escopo:** tabela real de frete (vem do TI).
- **Depende de:** T-0008, T-0411

### [ ] T-0415 · O mock aceita o Avise-me

- **Requisito:** REQ-04-21
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/produtos/[id]/avise-me.post.spec.ts`
  - `POST /produtos/4360/avise-me` com e-mail válido devolve 201 e a mensagem com o e-mail enviado
  - e-mail inválido devolve 422 com `erros[0].campo = "email"`
  - produto inexistente devolve 404
  - o mesmo e-mail duas vezes devolve 201 nas duas (não revela se já existe)
  - a resposta valida no `ConfirmacaoSchema`
- **Pronto quando:** o mock não guarda o e-mail em lugar nenhum.
- **Arquivos:** `server/api/mock/produtos/[id]/avise-me.post.ts`, `avise-me.post.spec.ts`
- **Fora do escopo:** `POST /newsletter` (módulo 02).
- **Depende de:** T-0008, T-0412

### [ ] T-0416 · Os contextos da página de produto são ligados aos adaptadores

- **Requisito:** REQ-04-09, REQ-04-17, REQ-04-21
- **Camada:** infra
- **Teste primeiro:** `layers/entrega/ui/composables/use-entrega.spec.ts` e `layers/relacionamento/ui/composables/use-relacionamento.spec.ts` (ambiente Nuxt)
  - `useCatalogo()` passa a devolver também `obterProduto` e `listarRelacionados`
  - `useEntrega()` devolve `simularFrete`; `useRelacionamento()` devolve `pedirAviso`
  - com o provedor trocado no teste, os casos de uso usam os falsos
  - em SSR, cada requisição recebe a própria instância
- **Pronto quando:** `app/plugins/12.entrega.ts` e `app/plugins/13.relacionamento.ts` são os únicos lugares que instanciam `HttpFreteGateway` e `HttpLeadsGateway`.
- **Arquivos:** `app/plugins/10.catalogo.ts`, `app/plugins/12.entrega.ts`, `app/plugins/13.relacionamento.ts`, `layers/catalogo/ui/composables/use-catalogo.ts`, `layers/entrega/ui/composables/use-entrega.ts`, `layers/relacionamento/ui/composables/use-relacionamento.ts`, os `.spec.ts`, os `index.ts` das três layers
- **Fora do escopo:** telas.
- **Depende de:** T-0410, T-0411, T-0412, T-0312

### [ ] T-0417 · `GaleriaProduto` mostra foto, miniaturas e selos, e abre no giro quando ele existe

- **Requisito:** REQ-04-02, REQ-04-03
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/GaleriaProduto.spec.ts`
  - sem giro: foto de 640×569 visível, uma miniatura com `aria-pressed="true"` e a legenda "Imagem ilustrativa do fabricante."
  - com giro: a miniatura "360°" vem com `aria-pressed="true"`, a foto fica oculta e a legenda é "Fotos reais do produto, em 360°."
  - tocar na miniatura da foto mostra a foto e inverte os `aria-pressed`
  - selo "Promoção" só em promoção; selo de frete com o texto alternativo "Frete grátis Sul e Sudeste acima de R$ 1.000,00"
  - a lista de miniaturas tem o rótulo "Imagens do produto"
  - a foto principal tem `width`, `height`, `alt` com o nome do pneu e **não** tem `loading="lazy"` (é a imagem da primeira dobra)
- **Pronto quando:** usa as classes `ts-galeria*`; o giro entra por um encaixe (`Giro360`, T-0418).
- **Arquivos:** `layers/catalogo/ui/components/GaleriaProduto.vue`, `GaleriaProduto.spec.ts`
- **Fora do escopo:** ampliação da foto; vídeo.
- **Depende de:** T-0401

### [ ] T-0418 · `Giro360` gira com o arraste e com as setas do teclado

- **Requisito:** REQ-04-03
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/Giro360.spec.ts`
  - renderiza o primeiro quadro, com `role="img"`, `tabindex="0"` e o rótulo "Foto em 360 graus do {nome}: arraste para girar"
  - seta direita mostra o quadro 2; seta esquerda no primeiro mostra o último (12)
  - arrastar 28 px para a direita com o ponteiro avança 2 quadros; soltar encerra o arraste
  - ao montar no cliente, pré-carrega os 12 quadros; no servidor, só o primeiro entra no HTML
  - mostra a dica "Arraste para girar"
  - a imagem tem `width` 480 e `height` 320 (sem salto de layout ao trocar de quadro)
- **Pronto quando:** toda a conta de quadro vem do `Giro360` do domínio; nenhum temporizador (o giro não anda sozinho).
- **Arquivos:** `layers/catalogo/ui/components/Giro360.vue`, `Giro360.spec.ts`
- **Fora do escopo:** inércia e zoom.
- **Depende de:** T-0402, T-0417

### [ ] T-0419 · `CabecaProduto` põe título, nota e selos dentro do cartão de compra

- **Requisito:** REQ-04-04, REQ-04-22
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/CabecaProduto.spec.ts`
  - o nome do produto está em um `h1`
  - mostra "Hankook", com link para a categoria da marca (via `rotas.categoria`), e "Cód. 3084"
  - as estrelas são um link para `#avaliacoes-produto`, com `aria-label` "Nota 4,9 de 5, em 31 avaliações" e o texto "4,9 (31 avaliações)"
  - sem avaliação, não há estrelas nem link
  - o selo "Original do Hyundai i30 e VW Golf" só aparece com `originalDe`
  - a frase "Índice 91V: até 615 kg por pneu e 240 km/h" só aparece com os dois índices
- **Pronto quando:** usa `ts-compra__cabeca` e `ts-produto__meta`; não mostra a garantia.
- **Arquivos:** `layers/catalogo/ui/components/CabecaProduto.vue`, `CabecaProduto.spec.ts`
- **Fora do escopo:** preço e ações (T-0420, T-0425).
- **Depende de:** T-0401, T-0105

### [ ] T-0420 · `PrecosProduto` mostra 12x e à vista lado a lado, e as formas de pagamento

- **Requisito:** REQ-04-05, REQ-04-06
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/PrecosProduto.spec.ts`
  - mostra "R$ 529,00" com "em até 12x de R$ 44,08 sem juros"
  - mostra "R$ 502,55" com "à vista, com 5% de desconto"
  - mostra "R$ 620,00" riscado, com "Preço anterior:" para leitor de tela, só quando há preço anterior
  - "Ver todas as formas de pagamento" é um `details` fechado, com 4 linhas na ordem recebida
  - a linha de 4 parcelas mostra "4x de R$ 128,28" e "(3% de desconto)"; a de 12, "12x de R$ 44,08" e "sem juros"
  - sem formas de pagamento, o `details` não existe
  - nenhum valor exibido é diferente dos recebidos (o componente só formata)
- **Pronto quando:** os dois valores usam a mesma classe de tamanho (`ts-compra__preco strong`); a razão de fonte é conferida no e2e (T-0425).
- **Arquivos:** `layers/catalogo/ui/components/PrecosProduto.vue`, `PrecosProduto.spec.ts`
- **Fora do escopo:** barra fixa do celular (T-0428).
- **Depende de:** T-0401, T-0102

### [ ] T-0421 · `SeletorQuantidade` vai de 1 a 8

- **Requisito:** REQ-04-07
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/SeletorQuantidade.spec.ts`
  - começa em 1, com "Menos um pneu" desativado
  - "Mais um pneu" soma 1 e emite `update:modelValue`
  - em 8, "Mais um pneu" fica desativado e o valor não passa
  - o valor está em um `output` com `aria-live="polite"`
  - valor recebido fora dos limites (0 ou 12) é mostrado dentro deles
  - os dois botões têm pelo menos 44 px
- **Pronto quando:** os limites chegam por `props` (`minimo`, `maximo`); a página passa os do Carrinho (a regra de 1 a 8 é dele).
- **Arquivos:** `layers/catalogo/ui/components/SeletorQuantidade.vue`, `SeletorQuantidade.spec.ts`
- **Fora do escopo:** adicionar ao carrinho (T-0428).
- **Depende de:** nada

### [ ] T-0422 · `SimuladorFrete` calcula prazo e frete pelo CEP

- **Requisito:** REQ-04-09
- **Camada:** ui
- **Teste primeiro:** `layers/entrega/ui/components/SimuladorFrete.spec.ts` (com `simularFrete` falso)
  - digitar "80010000" mostra "80010-000" no campo
  - Calcular com CEP válido chama o caso de uso com o produto, a quantidade recebida e `endereco`, e mostra "Chega em 2 a 4 dias úteis · Frete grátis" em `role="status"`
  - CEP incompleto mostra "Digite o CEP completo, com 8 números.", devolve o foco ao campo e não chama o caso de uso
  - escolher "Montar em uma oficina conveniada" envia `oficina`
  - enquanto calcula, o botão fica desativado; `CepNaoAtendido` mostra a mensagem do servidor; erro de rede mostra "Tentar de novo"
  - mudar a quantidade depois do cálculo limpa o resultado
  - depois de calcular, `localStorage`, `sessionStorage` e cookies não contêm o CEP
- **Pronto quando:** o campo tem `label`, `inputmode="numeric"` e `autocomplete="postal-code"`; as opções são um `fieldset` com `legend`; o link "como funciona" e o de "Prazo de entrega" vêm por `props`.
- **Arquivos:** `layers/entrega/ui/components/SimuladorFrete.vue`, `SimuladorFrete.spec.ts`
- **Fora do escopo:** lista de oficinas conveniadas.
- **Depende de:** T-0416

### [ ] T-0423 · `FormularioAviseMe` pede o aviso de chegada

- **Requisito:** REQ-04-20, REQ-04-21
- **Camada:** ui
- **Teste primeiro:** `layers/relacionamento/ui/components/FormularioAviseMe.spec.ts` (com `pedirAviso` falso)
  - o campo de e-mail tem `label`, `type="email"` e `autocomplete="email"`
  - enviar "cliente@exemplo.com.br" chama o caso de uso com o código do produto e mostra a confirmação em `role="status"`
  - "cliente@" mostra o erro ligado ao campo (`aria-describedby`) e não chama o caso de uso
  - enquanto envia, o botão "Avise-me" fica desativado
  - erro de rede mostra a mensagem e "Tentar de novo", mantendo o e-mail digitado
  - depois de enviar, nenhum armazenamento do navegador contém o e-mail
- **Pronto quando:** o botão usa `ts-btn--acao` (confirmar); o componente recebe só o `ProdutoId`.
- **Arquivos:** `layers/relacionamento/ui/components/FormularioAviseMe.vue`, `FormularioAviseMe.spec.ts`
- **Fora do escopo:** o texto de previsão de chegada (é da página, T-0429).
- **Depende de:** T-0416

### [ ] T-0424 · `VeiculosCompativeis` lista e busca por modelo

- **Requisito:** REQ-04-15
- **Camada:** ui
- **Teste primeiro:** `layers/catalogo/ui/components/VeiculosCompativeis.spec.ts`
  - mostra a tabela com as colunas Fabricante, Modelo, Versão e Ano (`th scope="col"`)
  - com 9 veículos há o campo "Buscar modelo", com rótulo para leitor de tela; com 8, não há
  - digitar "golf" deixa só as 2 linhas do Golf
  - busca sem resultado mostra "Nenhum veículo com esse modelo"
  - sem veículos, mostra só "Confira a medida gravada na lateral do pneu atual ou no manual do veículo."
  - com veículos, mostra a nota "Lista de referência."
- **Pronto quando:** o filtro usa `veiculosCom()` do `Produto`; a tabela rola dentro do próprio bloco no celular.
- **Arquivos:** `layers/catalogo/ui/components/VeiculosCompativeis.vue`, `VeiculosCompativeis.spec.ts`
- **Fora do escopo:** busca de pneu por veículo (módulo 05).
- **Depende de:** T-0401

### [ ] T-0425 · A página do produto monta a primeira dobra

- **Requisito:** REQ-04-01, REQ-04-04, REQ-04-05, REQ-04-08, REQ-04-09, REQ-04-24
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/produto.spec.ts` (computador), contra o mock
  - CA-04-01 e CA-04-02 (com a razão de fonte dos dois preços medida no navegador)
  - CA-04-03 no produto 3016
  - CA-04-05 e CA-04-06
  - `/p/9999` responde 404 e mostra a página de não encontrado
  - não existe banner nem `#avaliacoes` (faixa global); o lugar do filtro compacto existe e tem até 80 px
  - o link "Comparar com outros pneus" aponta para `rotas.comparar(['3084'])`; o botão do WhatsApp usa o número da navegação
- **Pronto quando:** `app/pages/p/[id]/[[slug]].vue` usa `useProduto` (que chama `obterProduto` em `useAsyncData`, com a chave pelo código, e lança o 404); `BlocoCompra` compõe cabeça, preços, quantidade, Comprar, dica, WhatsApp, link e simulador; o layout não mostra a faixa de avaliações nesta rota.
- **Arquivos:** `app/pages/p/[id]/[[slug]].vue`, `layers/catalogo/ui/composables/use-produto.ts`, `use-produto.spec.ts`, `layers/catalogo/ui/components/BlocoCompra.vue`, `tests/e2e/produto.spec.ts`
- **Fora do escopo:** miolo (T-0426), relacionados (T-0427), ligação do Comprar (T-0428), sem estoque (T-0429).
- **Depende de:** T-0413, T-0414, T-0417, T-0418, T-0419, T-0420, T-0421, T-0422, T-0116, T-0205, módulo 05 (FiltroPneus, variante compacta)

### [ ] T-0426 · O miolo da página: confiança, âncoras e seções centradas

- **Requisito:** REQ-04-10, REQ-04-11, REQ-04-12, REQ-04-13, REQ-04-14, REQ-04-15, REQ-04-16, REQ-04-19, REQ-04-22
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/produto.spec.ts` (computador)
  - CA-04-07 e CA-04-11
  - a faixa de confiança tem 4 itens, um deles com "5 anos contra defeitos de fabricação"; a garantia não aparece dentro do cartão de compra
  - a descrição abre recolhida; "Ler mais" expande e troca `aria-expanded`
  - a ficha tem 17 linhas, com `th scope="row"`, na ordem da API
  - a etiqueta do INMETRO é uma imagem de 600×449 com `alt`, ao lado da explicação dos três itens
  - as perguntas são um acordeão com 4 itens
  - `#avaliacoes-produto` existe, com o H2 "Avaliações de quem comprou" e a nota 4,9; as estrelas do título rolam até ela
- **Pronto quando:** as seções usam `ts-produto__secao` (900 px, centradas); `Acordeao` e o "Ler mais" vêm de `shared/ui`; a seção de avaliações aceita o conteúdo do módulo 07 por encaixe.
- **Arquivos:** `app/pages/p/[id]/[[slug]].vue`, `layers/catalogo/ui/components/{FaixaConfianca,AncorasProduto,DescricaoProduto,FichaTecnica,EtiquetaInmetro}.vue`, `tests/e2e/produto.spec.ts`
- **Fora do escopo:** carrossel e lista de avaliações (módulo 07).
- **Depende de:** T-0425, T-0424, T-0109, T-0115

### [ ] T-0427 · "Veja também" mostra quatro alternativas sem segurar a página

- **Requisito:** REQ-04-17
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/produto.spec.ts` (computador)
  - o produto 3084 mostra a seção "Veja também" com 4 cards em uma linha, nomes em H2 dentro dos cards
  - a introdução diz "Outros pneus aro 17 para o mesmo tipo de veículo." e há o link para o departamento
  - com `?_falha=500` em `/produtos/3084/relacionados`, a página responde 200 e a seção não existe (CA-04-13)
  - com a lista vazia, a seção não existe
  - com `?_atraso=800` nos relacionados, o H1 e o preço já estão no HTML do servidor
- **Pronto quando:** `useRelacionados` chama `listarRelacionados` em `useAsyncData` próprio, sem bloquear o produto; usa `CardProduto` e a grade `ts-grade-produtos--4`.
- **Arquivos:** `layers/catalogo/ui/composables/use-relacionados.ts`, `use-relacionados.spec.ts`, `layers/catalogo/ui/components/VejaTambem.vue`, `app/pages/p/[id]/[[slug]].vue`, `tests/e2e/produto.spec.ts`
- **Fora do escopo:** carrossel de relacionados.
- **Depende de:** T-0425, T-0313, T-0113

### [ ] T-0428 · Comprar leva a quantidade ao carrinho, e a barra fica fixa no celular

- **Requisito:** REQ-04-08, REQ-04-18
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/produto-celular.spec.ts` (390 px) e `tests/e2e/produto.spec.ts` (computador)
  - CA-04-04: com a quantidade em 4, Comprar adiciona 4 unidades do 3084 e o minicart abre
  - CA-04-10: a barra tem `position: fixed`, mostra "R$ 529,00" e "12x de R$ 44,08 · R$ 502,55 à vista"
  - o Comprar da barra adiciona a mesma quantidade escolhida no cartão
  - o botão do WhatsApp fica acima da barra, sem sobrepor (as caixas não se cruzam)
  - no computador, a barra não é visível
  - o Comprar do cartão e o da barra têm fundo com o token de ação e pelo menos 44 px de altura
- **Pronto quando:** `BarraCompraCelular` recebe o produto e emite `comprar`; a página avisa o layout de que há barra fixa (classe `ts-tem-barra`), e é isso que sobe o WhatsApp e o aviso de cookies.
- **Arquivos:** `layers/catalogo/ui/components/BarraCompraCelular.vue`, `BarraCompraCelular.spec.ts`, `app/pages/p/[id]/[[slug]].vue`, `tests/e2e/produto-celular.spec.ts`, `tests/e2e/produto.spec.ts`
- **Fora do escopo:** o minicart e o caso de uso de adicionar (módulo 06).
- **Depende de:** T-0425, módulo 06 (useCarrinho)

### [ ] T-0429 · Produto sem estoque troca a compra pelo Avise-me

- **Requisito:** REQ-04-20, REQ-04-21
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/produto.spec.ts` e `tests/e2e/produto-celular.spec.ts`, no produto 4360
  - CA-04-08: sem `.ts-compra__precos`, sem quantidade, sem Comprar, sem bloco de CEP
  - vejo "Sem estoque no momento" e "Previsão de chegada: 12 de dezembro"
  - CA-04-09: o Avise-me confirma com a mensagem da API; e-mail inválido mostra o erro do campo
  - a seção de relacionados se chama "Alternativas disponíveis" e o texto do cartão tem o link para ela
  - no celular, não há barra fixa e o WhatsApp fica na posição normal
  - o link "Comparar com outros pneus" não aparece
- **Pronto quando:** o `BlocoCompra` decide pela variante com `mostraPreco()` e `podeComprar()` do `Produto`, sem `if` de disponibilidade espalhado; a data usa `shared/formatacao`.
- **Arquivos:** `layers/catalogo/ui/components/BlocoCompra.vue`, `BlocoSemEstoque.vue`, `BlocoSemEstoque.spec.ts`, `app/pages/p/[id]/[[slug]].vue`, os dois e2e
- **Fora do escopo:** card sem estoque na listagem (T-0313).
- **Depende de:** T-0415, T-0423, T-0427, T-0428

### [ ] T-0430 · Metadados e dados estruturados do produto

- **Requisito:** REQ-04-23
- **Camada:** aplicação
- **Teste primeiro:** `layers/catalogo/application/metadados-do-produto.spec.ts`
  - título e descrição vêm de `seo` do produto
  - a canônica é a rota do produto com o slug oficial, mesmo aberta sem slug
  - gera `Product` com `name`, `sku` "3084", `gtin13` "8808563325293", `brand` "Hankook" e a imagem de 640 px
  - em estoque: `offers` com `price` "502.55", `priceCurrency` "BRL" e `InStock`; sem estoque: `OutOfStock` e nenhum `price`
  - com avaliação: `aggregateRating` com 4.9 e 31; sem avaliação, o campo não existe
  - gera `BreadcrumbList` com Home e as migalhas; item sem link entra sem `item`
- **Pronto quando:** função pura; a página aplica com `useSeoMeta` e `useHead`; o e2e prova o CA-04-12 no HTML do servidor (JavaScript desligado), com H1 único e JSON-LD válido.
- **Arquivos:** `layers/catalogo/application/metadados-do-produto.ts`, `metadados-do-produto.spec.ts`, `app/pages/p/[id]/[[slug]].vue`, `tests/e2e/produto.spec.ts`
- **Fora do escopo:** sitemap; `Review` individual (as avaliações são ilustrativas).
- **Depende de:** T-0426, T-0106

### [ ] T-0431 · A página de produto passa nos invariantes, no computador e no celular

- **Requisito:** REQ-04-01, REQ-04-11, REQ-04-12, REQ-04-18, REQ-04-19, REQ-04-20
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/produto-invariantes.spec.ts` (projetos `computador` 1440 e `celular` 390), nos produtos 3084, 3016 e 4360
  - `conferirInvariantes(page)` passa nas três páginas, nos dois tamanhos
  - as regras de `_produto` do `verify.py`: sem banner; filtro compacto de até 80 px; âncoras com destino; com 360° a miniatura do giro está ativa; 4 cards em alternativas; H1 dentro do cartão; sem faixa global; estrelas ancoradas
  - em 1440: razão de fonte dos dois preços de até 1,25 e descrição com desvio de centro de até 2 px
  - em 390: barra de compra fixa (só em estoque), "Ler mais" da descrição em largura total, WhatsApp sem cobrir a barra, nenhuma rolagem horizontal
  - sem estoque: nenhum preço, nenhum CEP, Avise-me presente
  - fluxo completo no celular: abrir o 3084, calcular o CEP `80010000`, pôr 2 unidades e comprar
- **Pronto quando:** o arquivo roda nos dois projetos do Playwright; regressão visual das três páginas dentro da tolerância.
- **Arquivos:** `tests/e2e/produto-invariantes.spec.ts`
- **Fora do escopo:** carrossel e lista de avaliações (os invariantes deles são do módulo 07).
- **Depende de:** T-0429, T-0430, T-0010

---

## Pendências

- **Descrição do produto fora da lista branca.** As três fixtures trazem `table`, `tbody`, `tr` e `td` em `descricaoHtml`, e o `openapi.yaml` restringe o HTML a `p, h2, h3, ul, ol, li, strong, em, a, br`. Decidir com o TI: ampliar a lista para a descrição ou o backend limpar. A T-0409 depende disso.
- **Limite de 1 a 8.** A regra é do Carrinho (módulo 06). O `SeletorQuantidade` recebe os limites por `props`; o módulo 06 precisa publicar a constante e, se tiver um seletor próprio no minicart, reaproveitar este.
- **`Email`.** Pode nascer na newsletter (módulo 02). A T-0408 reutiliza se já existir.
- **Numeração dos plugins** (`12.entrega.ts`, `13.relacionamento.ts`): conferir com os módulos 05 e 06 para não repetir número.
- **Preço no JSON-LD.** Usamos o preço à vista em `offers.price`. Validar com a liveSEO (à vista ou total parcelado).
- **Migalhas sem link.** Em `produto-3016-com-360.json` os níveis "Pneus para pick-ups e SUVs" e "Aro 18" vêm com `href: null` (categorias que o mock não tem). A tela mostra sem link; o backend real deve mandar o link.
- **Ficha técnica.** O protótipo acrescentava as linhas "Run flat" e "Tipo de terreno" à ficha; a API já manda "Pneu é Run Flat" entre as 17 linhas. A tela mostra só o que a API manda.
- **Frete com valor.** O contrato prevê `frete.tipo: "valor"`, mas o mock nunca devolve esse caso; ele só é coberto no teste do adaptador (T-0411).
- **D2 do PRD** (URL final do produto): a página aceita `/p/{id}` com ou sem slug e a canônica usa o slug oficial.
- **D3 do PRD** (texto do frete grátis): hoje montado a partir de `freteGratis.regiao` e `valorMinimo`.
- Vídeo do produto (RT50) e selo de garantia de preço (RT47): sem conteúdo; ficam para quando existir.
