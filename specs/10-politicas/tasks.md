# Tasks 10 — Políticas e ajuda

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. Uma task por vez.

---

### [ ] T-1001 · `Politica` guarda os blocos na ordem e não mexe no texto

- **Requisito:** REQ-10-04, REQ-10-05, REQ-10-06, REQ-10-08
- **Camada:** domínio
- **Teste primeiro:** `layers/conteudo/domain/politica.spec.ts`
  - guarda slug, título, rótulo do menu, ícone, data de atualização e os blocos na ordem recebida
  - `BlocoDeTexto` é uma união fechada de `paragrafo`, `titulo`, `lista`, `passos`, `aviso` e `faq`; `titulo` com nível fora de 2 ou 3 é recusado
  - `temFaq()` é verdadeiro em uma política com bloco `faq` e falso em uma só com parágrafos
  - `perguntas()` junta as perguntas de todos os blocos `faq`, na ordem
  - `nivelDasPerguntas(indice)` devolve 2 para um `faq` sem título antes e 3 para um `faq` depois de um `titulo` de nível 2
  - `textoDeContato(contatoPadrao)` devolve o contato da política quando existe
  - sem contato próprio, devolve "Caso tenha alguma dúvida, nossa equipe está à disposição para atender de Segunda-Feira à Sexta-Feira das 08:00 às 17:45 horas através do e-mail contato@tireshop.com.br, telefone (41) 3317-2251 ou WhatsApp (41) 3317-2251."
  - o título "Politica de Garantia" sai como entrou (nenhum método altera texto)
- **Pronto quando:** tipos imutáveis; fábricas `umaPolitica()` e `umBloco.*()` em `__fabricas__/`; publicados em `layers/conteudo/index.ts`.
- **Arquivos:** `layers/conteudo/domain/bloco-de-texto.ts`, `politica.ts`, `politica.spec.ts`, `__fabricas__/politica.ts`, `layers/conteudo/index.ts`
- **Fora do escopo:** bloco `video` (módulo 11); validar HTML (é do adaptador, com `HtmlSeguro`).
- **Depende de:** T-0101, T-0104, T-0107

### [ ] T-1002 · O menu das políticas marca um item, e só um

- **Requisito:** REQ-10-02
- **Camada:** domínio
- **Teste primeiro:** `layers/conteudo/domain/menu-de-politicas.spec.ts`
  - com os 8 resumos e o slug `trocas-e-devolucoes`, só "Trocas e Devoluções" sai com `ativo: true`
  - mantém a ordem recebida: "Prazo de Entrega" primeiro, "Perguntas Frequentes" por último
  - com um slug que não está na lista, nenhum item fica ativo
  - cada item leva slug, rótulo e ícone (`truck`, `credit-card`, `shield-check`…)
  - lista vazia devolve lista vazia
- **Pronto quando:** `menuDePoliticas(resumos, slugAtual)` é função pura; o tipo `ResumoDePolitica` (`slug`, `rotuloMenu`, `icone`) existe.
- **Arquivos:** `layers/conteudo/domain/menu-de-politicas.ts`, `menu-de-politicas.spec.ts`
- **Fora do escopo:** gerar a URL de cada item (a tela usa `rotas.politica`).
- **Depende de:** T-1001

### [ ] T-1003 · Casos de uso `listarPoliticas` e `obterPolitica`

- **Requisito:** REQ-10-01, REQ-10-10, REQ-10-11
- **Camada:** aplicação
- **Teste primeiro:** `layers/conteudo/application/politicas.spec.ts` (com `ConteudoRepositoryFalso`)
  - `listarPoliticas()` devolve os 8 resumos, na ordem da porta
  - `obterPolitica('garantia')` devolve a política pedida
  - slug inexistente devolve `PaginaNaoEncontrada`, sem lançar
  - slug com formato inválido (`Garantia!`) devolve `PaginaNaoEncontrada`, sem chamar a porta
  - erro de rede da porta sai como `Result` de falha, com `ErroDeRede`
  - a falha de `listarPoliticas` não impede `obterPolitica` (são chamadas independentes)
- **Pronto quando:** `ConteudoRepository` em `domain/portas.ts` tem `politicas()` e `politica(slug)`; o falso em memória aceita preparar sucesso e falha de cada método.
- **Arquivos:** `layers/conteudo/domain/portas.ts`, `application/listar-politicas.ts`, `obter-politica.ts`, `politicas.spec.ts`, `application/__falsos__/conteudo-repository-falso.ts`
- **Fora do escopo:** os outros métodos da porta (`paginaInicial` é do módulo 09; `institucional`, do 11).
- **Depende de:** T-1001, T-1002

### [ ] T-1004 · Metadados e dados estruturados da política

- **Requisito:** REQ-10-12
- **Camada:** aplicação
- **Teste primeiro:** `layers/conteudo/application/metadados-da-politica.spec.ts`
  - o título é "Trocas e Devoluções | Ajuda | TireShop" e a descrição é "Política de Trocas e Devoluções da TireShop | Saiba mais" (vêm de `seo`)
  - a canônica é a URL absoluta de `rotas.politica('trocas-e-devolucoes')`
  - as migalhas são Home, "Ajuda" (sem link) e "Trocas e Devoluções" (o rótulo do menu)
  - gera `BreadcrumbList` com as mesmas três migalhas
  - Perguntas Frequentes gera `FAQPage` com 17 perguntas
  - política sem bloco `faq` não gera `FAQPage`
- **Pronto quando:** `metadadosDaPolitica(politica, origem)` é função pura e devolve `Metadados` e `Migalha[]` de `shared/seo`.
- **Arquivos:** `layers/conteudo/application/metadados-da-politica.ts`, `metadados-da-politica.spec.ts`
- **Fora do escopo:** aplicar com `useSeoMeta` (T-1012); `robots` por ambiente (módulo 13).
- **Depende de:** T-1001, T-0105, T-0106

### [ ] T-1005 · O schema e o mapper de `Politica` entendem a API

- **Requisito:** REQ-10-05, REQ-10-13
- **Camada:** adaptador
- **Teste primeiro:** `layers/conteudo/adapters/http/politica.mapper.spec.ts`
  - `politicas.json` valida e vira 8 resumos
  - `politica-trocas-e-devolucoes.json` vira uma política com 9 blocos: 3 parágrafos, 2 avisos, 3 títulos de nível 2 e 1 bloco de 4 passos
  - `politica-perguntas-frequentes.json` vira uma política com um bloco `faq` de 17 perguntas
  - `contatoHtml: null` vira ausência de contato, sem erro
  - o HTML de parágrafo, aviso, item de lista, passo e resposta vira `HtmlSeguro`; um `<script>` em qualquer um deles é recusado, com o caminho (`blocos.0.html`)
  - bloco com `tipo` desconhecido é recusado pelo schema, com o caminho do bloco
  - falta de `titulo` é recusada; campo a mais é ignorado
  - as 8 políticas de `_base/politicas.json` passam pelo schema e pelo mapper
- **Pronto quando:** `ListaDePoliticasSchema`, `BlocoDeTextoSchema` e `PoliticaSchema` (Zod) e `paraPolitica(dto)`; o DTO não sai de `adapters/`.
- **Arquivos:** `layers/conteudo/adapters/http/bloco-de-texto.schema.ts`, `politica.schema.ts`, `politica.mapper.ts`, `politica.mapper.spec.ts`
- **Fora do escopo:** o tipo `video` no `BlocoDeTextoSchema` (T-1104).
- **Depende de:** T-1001, T-0103, T-0104

### [ ] T-1006 · `HttpConteudoRepository` busca a lista e a política, e trata o 404

- **Requisito:** REQ-10-10, REQ-10-11, REQ-10-13
- **Camada:** adaptador
- **Teste primeiro:** `layers/conteudo/adapters/http/http-conteudo-repository.politicas.spec.ts` (com `ClienteHttpFalso`)
  - `politicas()` chama `GET /politicas` e devolve os resumos
  - `politica('garantia')` chama `GET /politicas/garantia`
  - 404 vira `PaginaNaoEncontrada`
  - resposta sem `blocos` vira `ErroDeContrato` com o endpoint `GET /politicas/garantia` e o caminho `blocos`
  - 500 e falha de rede viram `ErroDeRede`
- **Pronto quando:** os dois métodos implementam a porta da T-1003, sem `try/catch` de fluxo.
- **Arquivos:** `layers/conteudo/adapters/http/http-conteudo-repository.ts`, `http-conteudo-repository.politicas.spec.ts`
- **Fora do escopo:** os outros métodos do repositório.
- **Depende de:** T-1003, T-1005

### [ ] T-1007 · O mock serve as 8 políticas e responde 404 para o resto

- **Requisito:** REQ-10-10, REQ-10-13
- **Camada:** mock
- **Teste primeiro:** `server/api/mock/politicas.get.spec.ts`
  - `GET /api/mock/politicas` devolve 8 itens, com `prazo-de-entrega` primeiro e `perguntas-frequentes` por último
  - cada item tem só `slug`, `rotuloMenu` e `icone`
  - `GET /api/mock/politicas/trocas-e-devolucoes` devolve o título "Política de trocas e devoluções TireShop: Saiba como funciona"
  - cada um dos 8 slugs responde 200 e valida no `PoliticaSchema`
  - `GET /api/mock/politicas/nao-existe` responde 404 em `application/problem+json`
  - `?_falha=500` e `?_atraso=300` funcionam nas duas rotas
- **Pronto quando:** as rotas leem `mocks/fixtures/_base/politicas.json`; a lista é derivada dele (uma fonte só).
- **Arquivos:** `server/api/mock/politicas.get.ts`, `server/api/mock/politicas/[slug].get.ts`, `server/api/mock/politicas.get.spec.ts`
- **Fora do escopo:** `/institucional` (T-1105).
- **Depende de:** T-0008, T-1005

### [ ] T-1008 · O contexto Conteúdo entrega os casos de uso das políticas em um lugar só

- **Requisito:** REQ-10-11
- **Camada:** infra
- **Teste primeiro:** `layers/conteudo/ui/composables/use-conteudo.politicas.spec.ts` (ambiente Nuxt)
  - `useConteudo()` devolve `listarPoliticas` e `obterPolitica` prontos
  - com o provedor trocado no teste, os casos de uso usam o `ConteudoRepositoryFalso`
  - em SSR, cada requisição recebe a própria instância
- **Pronto quando:** `app/plugins/12.conteudo.ts` (criado no módulo 02) continua sendo o único lugar que instancia `HttpConteudoRepository`; `useConteudo()` (que já entrega `obterPaginaInicial` desde o módulo 09) ganha os dois casos de uso, sem mudar o que já existe.
- **Arquivos:** `app/plugins/12.conteudo.ts`, `layers/conteudo/ui/composables/use-conteudo.ts`, `use-conteudo.politicas.spec.ts`, `layers/conteudo/index.ts`
- **Fora do escopo:** telas.
- **Depende de:** T-1006

### [ ] T-1009 · `BlocosDeTexto` renderiza cada tipo de bloco como no protótipo

- **Requisito:** REQ-10-04, REQ-10-05, REQ-10-06
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/BlocosDeTexto.spec.ts`
  - `paragrafo` vira `p`, com o `strong` de "número do Pedido" preservado
  - `titulo` de nível 2 vira `h2` ("Procedimentos de troca e devolução"); de nível 3, `h3`
  - `lista` vira `ul` com um `li` por item
  - `passos` vira `ol`; cada item tem o número em destaque (`1` a `4`), com `aria-hidden`
  - `aviso` vira uma caixa com ícone decorativo e o texto "O Prazo para realização da troca ou devolução é de 7 dias…"
  - `faq` vira o `Acordeao` do kernel, com a primeira pergunta aberta e o nível de título recebido (`h2` em Perguntas Frequentes)
  - os blocos saem na ordem recebida; lista de blocos vazia não renderiza nada
  - o componente só aceita `HtmlSeguro` nos campos de HTML (teste de tipo)
- **Pronto quando:** usa as classes `ts-politica__texto`, `ts-politica__aviso` e `ts-passos*` do protótipo, sem CSS novo.
- **Arquivos:** `layers/conteudo/ui/components/BlocosDeTexto.vue`, `BlocosDeTexto.spec.ts`
- **Fora do escopo:** bloco `video` (T-1106); tabela (não está no contrato).
- **Depende de:** T-1001, T-0109

### [ ] T-1010 · `MenuPoliticas` mostra a lista fixa e o acordeão do celular

- **Requisito:** REQ-10-02, REQ-10-03
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/MenuPoliticas.spec.ts`
  - renderiza um `aside` com `aria-label="Políticas e ajuda"`
  - a lista fixa tem 8 links, cada um com ícone e rótulo, apontando para `rotas.politica(slug)`
  - com `trocas-e-devolucoes` ativo, só o link "Trocas e Devoluções" tem `aria-current="page"` na lista fixa
  - o acordeão é um `details` fechado, com o `summary` "Todas as políticas" e os mesmos 8 links
  - o rodapé do menu mostra o horário de atendimento recebido e o botão de WhatsApp com "(41) 3317-2251"
  - ícone desconhecido não quebra o item (usa o ícone padrão `file-text`)
  - no estado de erro, mostra o `EstadoDeErro` no lugar da lista e emite `tentar`
  - no estado carregando, mostra 8 linhas de esqueleto
- **Pronto quando:** recebe os itens de `menuDePoliticas` e o contato por props; usa as classes `ts-politicas-nav*`; o botão do WhatsApp não é o verde de ação.
- **Arquivos:** `layers/conteudo/ui/components/MenuPoliticas.vue`, `MenuPoliticas.spec.ts`
- **Fora do escopo:** largura de 280 px e `sticky` (conferidos no e2e da T-1012).
- **Depende de:** T-1002, T-0105, T-0113

### [ ] T-1011 · `BlocoContato` fecha a página com o texto e os canais

- **Requisito:** REQ-10-08
- **Camada:** ui
- **Teste primeiro:** `layers/conteudo/ui/components/BlocoContato.spec.ts`
  - mostra o título "Precisa falar com a gente?" em `h2`
  - mostra o texto recebido como parágrafo
  - o botão "WhatsApp (41) 3317-2251" aponta para `https://wa.me/554133172251`
  - o botão "contato@tireshop.com.br" aponta para `mailto:contato@tireshop.com.br`
  - sem os dados de contato (navegação indisponível), mostra só o texto, sem botões
  - a seção tem nome acessível pelo título (`aria-labelledby`)
- **Pronto quando:** recebe `texto` e `contato` por props; usa as classes `ts-contato*`; os links vêm de `shared/formatacao`.
- **Arquivos:** `layers/conteudo/ui/components/BlocoContato.vue`, `BlocoContato.spec.ts`
- **Fora do escopo:** decidir qual texto usar (regra da T-1001).
- **Depende de:** T-1001

### [ ] T-1012 · A página de política monta menu, texto, contato e metadados

- **Requisito:** REQ-10-01, REQ-10-03, REQ-10-07, REQ-10-09, REQ-10-10, REQ-10-11, REQ-10-12
- **Camada:** ui
- **Teste primeiro:** `tests/e2e/politicas.spec.ts` (computador), contra o mock
  - CA-10-01, CA-10-02 e CA-10-03
  - o menu fixo tem `position: sticky` e 280 px de largura (tolerância de 1 px)
  - a linha abaixo do H1 mostra "Atualizado em 4 de novembro de 2026"
  - CA-10-06 (H1 "Politica de Garantia") e CA-10-07 (contato próprio e contato padrão)
  - CA-10-08 (404) e CA-10-09 (falha do menu com `?_falha=500`)
  - o lugar do filtro compacto existe acima das migalhas, e a faixa de avaliações vem antes do rodapé
  - o HTML do servidor tem um H1, a canônica e o `BreadcrumbList`
- **Pronto quando:** `app/pages/ajuda/[slug].vue` busca a lista e a política em dois `useAsyncData` independentes (chave com o slug), aplica `metadadosDaPolitica` com `useSeoMeta` e `useHead`, importa `institucional.css` e tem `routeRules` com revalidação de 1 dia para `/ajuda/**`.
- **Arquivos:** `app/pages/ajuda/[slug].vue`, `nuxt.config.ts` (routeRules), `tests/e2e/politicas.spec.ts`
- **Fora do escopo:** o filtro compacto e a faixa de avaliações em si; celular (T-1013).
- **Depende de:** T-1004, T-1007, T-1008, T-1009, T-1010, T-1011, T-0116, T-0205, módulo 05 (FiltroPneusCompacto), módulo 07 (FaixaAvaliacoes)

### [ ] T-1013 · As 8 políticas passam no computador e no celular

- **Requisito:** REQ-10-01, REQ-10-02, REQ-10-03, REQ-10-06, REQ-10-12
- **Camada:** e2e
- **Teste primeiro:** `tests/e2e/politicas-todas.spec.ts` (projetos `computador` 1440 px e `celular` 390 px)
  - cada um dos 8 slugs abre com status 200, um H1 e exatamente um item ativo na lista visível
  - CA-10-04: no celular o menu fixo tem `display: none` e o acordeão "Todas as políticas" está fechado; aberto, mostra os 8 links
  - CA-10-05: 17 perguntas em H2, a primeira aberta, e `FAQPage` com 17 itens
  - CA-10-10: sem JavaScript, o HTML traz as 17 respostas
  - abrir e fechar uma pergunta só com o teclado (Tab, Enter)
  - em Trocas e Devoluções, o texto contém "imagens" no passo 1 (regra herdada do protótipo)
  - `conferirInvariantes(page)` passa nas 8 páginas, nos dois tamanhos
- **Pronto quando:** o teste percorre a lista de slugs devolvida por `GET /politicas` (sem lista fixa no teste).
- **Arquivos:** `tests/e2e/politicas-todas.spec.ts`
- **Fora do escopo:** regressão visual (módulo 13).
- **Depende de:** T-1012, T-0010

---

## Pendências

- **Linha da data.** O protótipo mostra "Texto do site no ar, capturado em 29/10/2026", que só faz sentido no protótipo. Aqui a linha vira "Atualizado em {data}", a partir de `atualizadoEm`. Confirmar o texto com o cliente.
- **Título de Trocas e Devoluções (RT70).** O H1 é o do site. A frase sugerida ("Mudou de ideia ou comprou o pneu errado? Veja como resolver.") entra quando o cliente trocar o `titulo` na API; não há código a mudar.
- **Texto padrão de contato.** A frase com o horário ("Segunda-Feira à Sexta-Feira das 08:00 às 17:45") está fixa no frontend, como no protótipo. Melhor seria a API mandar `contatoHtml` em todas as políticas; propor ao backend.
- **Bloco `tabela`.** O [docs/domain/conteudo.md](../../docs/domain/conteudo.md) lista `tabela` entre os blocos; o `openapi.yaml` e os exemplos não têm (têm `video`). Vale o contrato. Corrigir o documento de domínio, ou abrir mudança de contrato se o cliente precisar de tabela.
- **Bloco de tipo desconhecido.** Hoje derruba a política com `ErroDeContrato` (ADR 0004). Se o backend quiser acrescentar tipos sem coordenar, trocar para "ignora o bloco e registra"; decisão do líder técnico.
- **Arquivos compartilhados do contexto Conteúdo.** `domain/portas.ts`, `http-conteudo-repository.ts`, `conteudo-repository-falso.ts`, `use-conteudo.ts` e `app/plugins/12.conteudo.ts` nascem nos módulos 02 e 09. As tasks T-1003, T-1006 e T-1008 só **acrescentam** os métodos das políticas; os testes daqueles módulos têm de continuar passando.
- **Página `/ajuda`.** Não existe. Se o cliente quiser um índice das políticas, é task nova.
