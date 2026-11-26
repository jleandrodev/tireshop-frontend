# Spec 05 — Busca de pneu

| | |
|---|---|
| Marco | M5 |
| Contexto do domínio | [Catálogo](../../docs/domain/catalogo.md) (`BuscaPneuGateway`, `listarOpcoesDeMedida`, `listarVeiculos`, `resolverBusca`) |
| Telas do protótipo | `partials/filtro.html.j2` (completo: Home e listagem), `partials/filtro-compacto.html.j2` (produto, políticas, conteúdo), o campo de busca de `partials/cabecalho.html.j2` e os selects encadeados de `ui/js/site.js` |
| ADRs que se aplicam | 0002, 0003, 0004, 0007, 0008, 0010, 0012 |
| Depende de | Módulos 00, 01, 02, 03 |

## 1. Objetivo

De qualquer página do e-commerce, o cliente chega aos pneus que servem no carro dele: escolhe
largura, altura e aro no filtro de pneus, ou só o aro, ou o veículo, ou digita a medida no campo do
cabeçalho ("225/45R17"). A busca leva à categoria da medida ou do aro.

O módulo entrega o filtro completo (três abas), o filtro compacto de uma linha, a lógica do campo do
cabeçalho e o pré-preenchimento do filtro na página de categoria.

A busca por veículo depende de `GET /busca/veiculos`, que é uma **proposta de contrato ainda não
validada pelo TI**. As tasks que tocam nela estão marcadas; o resto do módulo não depende dela.

## 2. Requisitos

| Id | Requisito | RF do PRD |
|---|---|---|
| REQ-05-01 | O filtro completo tem três abas, nesta ordem e com o mesmo peso: "Por medida", "Por aro" e "Por veículo", cada uma com ícone e o rótulo inteiro. | RF-02, RNF-02 |
| REQ-05-02 | Na aba "Por medida", os campos são encadeados: a largura libera as alturas daquela largura; a altura libera os aros daquela medida. Trocar a largura limpa a altura e o aro. Só aparecem combinações que têm produto. | RF-02 |
| REQ-05-03 | Campo sem escolha mostra o exemplo (225, 45, 17) em traço leve. "Buscar pneus" nunca fica desativado: se faltar um campo, o navegador aponta qual. | RF-02, RNF-02 |
| REQ-05-04 | Na aba "Por aro", o aro libera a lista de largura/altura daquele aro, com o aviso de que um aro tem várias medidas. | RF-02 |
| REQ-05-05 | Na aba "Por veículo", a marca libera os modelos, o modelo libera as versões com o ano, e a versão libera as medidas que servem. O aviso da API aparece abaixo dos campos. | RF-02 (contrato em proposta) |
| REQ-05-06 | Os campos da aba "Por medida" têm a mesma altura e o mesmo tamanho de letra dos campos da aba "Por veículo". | RF-02 (R2-07) |
| REQ-05-07 | Cada aba tem o link "Onde encontro a medida?", que leva à pergunta sobre a medida, na Home, já aberta. | RF-02 |
| REQ-05-08 | A busca leva à rota da categoria da medida (`225/45 R17` → categoria `225-45-r17`) ou, quando só há o aro, à categoria do aro. O destino sai de `rotas.*`. | RF-02, ADR 0008 |
| REQ-05-09 | Na página de categoria, o filtro abre como a API manda no campo `busca`: na categoria de medida, aba "Por medida" com largura, altura e aro preenchidos; na de aro, aba "Por aro" com o aro escolhido. O preenchimento já vem no HTML do servidor. | RF-02, RNF-01 |
| REQ-05-10 | O filtro compacto mostra, em uma linha de até 80 px de altura no computador, o rótulo, os três campos da medida, "Buscar pneus" e o link "Buscar por aro ou veículo". No celular, quebra em linhas com o botão em largura total. | RF-02 |
| REQ-05-11 | O campo do cabeçalho aceita a medida digitada ("225/45R17", "225/45 r17", "225 45 17", "2254517") e leva à mesma categoria. Texto que não é medida mostra a mensagem com o exemplo, sem navegar. | RF-02 |
| REQ-05-12 | Enquanto as opções carregam, os campos ficam travados com o exemplo; se a chamada falhar, o filtro mostra a mensagem e "Tentar de novo", e a página continua de pé. A falha da aba de veículo não afeta as outras abas. | RNF-06 |
| REQ-05-13 | As opções vêm de `GET /busca/medidas` e de `GET /busca/veiculos`, pela porta `BuscaPneuGateway`, são lidas com `useAsyncData` e não vão para store. | RNF-05, ADR 0007 |

## 3. Critérios de aceite

**CA-05-01 · Buscar pela medida**
- **Dado** a listagem `/c/pneus-para-carros` aberta
- **Quando** escolho largura 225, altura 45 e aro 17 e toco em "Buscar pneus"
- **Então** vou para `/c/225-45-r17` e vejo o H1 da categoria da medida

**CA-05-02 · A cascata só oferece o que existe**
- **Dado** o filtro com as opções de `busca-medidas.json`
- **Quando** escolho a largura 225
- **Então** a altura oferece 45, 50, 55, 65 e 75, e o aro continua travado; escolhida a altura 45, o aro oferece 17 e 18

**CA-05-03 · Campo faltando**
- **Dado** a largura 225 escolhida e a altura vazia
- **Quando** toco em "Buscar pneus"
- **Então** a página não muda, e o navegador aponta o campo Altura

**CA-05-04 · Buscar pelo aro**
- **Dado** a aba "Por aro"
- **Quando** escolho "Aro 17"
- **Então** o campo "Largura / altura" passa a listar as 10 medidas do aro 17; escolhendo "225/45" e buscando, vou para `/c/225-45-r17`

**CA-05-05 · Buscar pelo veículo** *(depende da validação do contrato)*
- **Dado** a aba "Por veículo"
- **Quando** escolho Hyundai, i30, "1.8 · 2014 a 2017" e a medida "225/45 R17" e busco
- **Então** vou para `/c/225-45-r17`, e o aviso "Não achou seu veículo? Busque pela medida escrita na lateral do pneu." esteve visível

**CA-05-06 · Categoria de medida abre preenchida**
- **Dado** a categoria `225-45-r17`
- **Quando** peço a página sem executar JavaScript
- **Então** o HTML já traz a aba "Por medida" ativa, com 225, 45 e 17 selecionados

**CA-05-07 · Categoria de aro abre na aba do aro**
- **Dado** a categoria `carros-aro-17`
- **Quando** abro a página
- **Então** a aba "Por aro" está ativa, com "Aro 17" selecionado e a lista de largura/altura liberada

**CA-05-08 · Busca do cabeçalho**
- **Dado** qualquer página do e-commerce
- **Quando** digito "225/45R17" no campo "Busca por Medida" e aperto Enter
- **Então** vou para `/c/225-45-r17`; digitando "pneu barato", fico na página e leio "Digite a medida como está no pneu, por exemplo 225/45R17."

**CA-05-09 · Filtro compacto**
- **Dado** uma página com o filtro compacto, em 1440 px
- **Quando** a página carrega
- **Então** o filtro tem no máximo 80 px de altura, com o rótulo, os três campos, o botão e o link na mesma linha; em 390 px, o botão ocupa a largura toda

**CA-05-10 · Opções fora do ar**
- **Dado** o mock com `?_falha=500` em `/busca/medidas`
- **Quando** abro a listagem
- **Então** a página responde 200, o filtro mostra "Não foi possível carregar as medidas." com "Tentar de novo", e a busca do cabeçalho continua funcionando

## 4. Contratos

| Endpoint | Schema | Usado para |
|---|---|---|
| `GET /busca/medidas` | `OpcoesDeMedida` | Cascata largura → altura → aro; lista de aros da aba "Por aro" |
| `GET /busca/veiculos` | `OpcoesDeVeiculo` | Cascata marca → modelo → versão e ano → medidas. **Proposta, a validar com o TI** |
| `GET /categorias/{slug}` (campo `busca`) | `Categoria` | Pré-preenchimento do filtro (já lido pelo módulo 03) |

Exemplos: [busca-medidas.json](../../docs/api/examples/busca-medidas.json),
[busca-veiculos.json](../../docs/api/examples/busca-veiculos.json),
[categoria-225-45-r17.json](../../docs/api/examples/categoria-225-45-r17.json),
[categoria-carros-aro-17.json](../../docs/api/examples/categoria-carros-aro-17.json).
Detalhes em [docs/api/endpoints/catalogo.md](../../docs/api/endpoints/catalogo.md).

`/busca/veiculos` responde em três passos: sem parâmetros, só `fabricantes`; com `fabricante`, também
`modelos`; com `fabricante` e `modelo`, as `versoes`, cada uma com `ano` e `medidas`. O exemplo vem com
`ilustrativo: true` (ADR 0012): a base de veículos de verdade é do backend.

## 5. Estados de tela

| Bloco | Carregando | Sucesso | Vazio | Erro |
|---|---|---|---|---|
| Abas "Por medida" e "Por aro" | Campos travados, com o exemplo | Cascata funcionando | Aro sem medida: "Sem medidas neste aro" no campo | "Não foi possível carregar as medidas." + "Tentar de novo" |
| Aba "Por veículo" | Campo seguinte travado até a resposta | Cascata funcionando | Marca sem modelo ou modelo sem versão: campo travado e o aviso da API | Mensagem + "Tentar de novo", só nesta aba |
| Filtro compacto | Campos travados, com o exemplo | Cascata funcionando | — | Mostra só o link "Buscar por aro ou veículo" |
| Busca do cabeçalho | — | Navega para a categoria | — | Mensagem com o exemplo, junto do campo |

No servidor, as opções de medida vêm junto com a página (não há "carregando" na primeira dobra).

## 6. Regras de marca, acessibilidade e SEO do módulo

- Verde de ação só em "Buscar pneus" (seguir). As abas, o link de ajuda e "Tentar de novo" não são verdes.
- O título do filtro ("Encontre o pneu pela medida") é um parágrafo, **não** um título: o H1 é da página.
- Abas no padrão WAI-ARIA (`Guias` do kernel): `tablist` com `aria-label="Como buscar"`, setas trocam
  de aba, só a ativa recebe o Tab.
- Cada painel é um `form` com `fieldset` e `legend` para leitor de tela ("Medida do pneu: largura,
  altura e aro"). Cada campo tem `label`; no filtro compacto o rótulo é só para leitor de tela.
- Os campos são `select` nativos (sem campo de digitar, RT34), com 44 px de altura. Os separadores
  "/" e "R" são decorativos (`aria-hidden`).
- Dois filtros na mesma página (completo e compacto) não repetem `id`: o prefixo vem por prop.
- A mensagem de erro da busca do cabeçalho é ligada ao campo por `aria-describedby` e anunciada.
- O filtro compacto é um `form` com `aria-label="Busca de pneus pela medida"`.
- O link "Onde encontro a medida?" aponta para uma âncora que existe na Home (`#faq-medida`).
- O filtro pré-preenchido vem no HTML do servidor (regra herdada do `verify.py`, RT14).

## 7. Fora do escopo

- Facetas laterais da listagem (módulo 03) e o seletor do Comparar (módulo 08).
- A posição do filtro na Home, com o primeiro campo acima da dobra no celular, e a pergunta
  `#faq-medida`: módulo 09.
- Colocar o filtro compacto nas páginas de produto, políticas e Sobre nós: módulos 04, 10 e 11
  (aqui o componente fica pronto e provado).
- Páginas de loja física e o hub de lojas **não** levam filtro (S12, ADR 0009).
- Busca por texto livre, por nome de produto ou por marca; sugestões enquanto digita.
- "Calculadora de pneus" e "Medida dos pneus" (links para o site atual).
- A base real de veículos.
