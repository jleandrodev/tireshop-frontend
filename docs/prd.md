# PRD — Frontend TireShop em Nuxt

| | |
|---|---|
| Versão | 1 (26/11/2026) |
| Cliente | TireShop (tireshop.com.br) |
| Quem entrega | N1 |
| Quem recebe e mantém | Time de TI da TireShop |

## 1. Problema

A TireShop vai trocar o frontend do e-commerce. O layout novo foi desenhado e validado em um protótipo
estático de alta fidelidade (56 páginas HTML geradas a partir de 9 templates). O time de TI precisa
receber isso em forma de **aplicação**, na stack que vai manter, e de um jeito que deixe claro o que
o backend deles tem de servir.

## 2. Objetivo

Entregar um **frontend Nuxt** que reproduz o protótipo validado, consome uma API por contratos
explícitos e roda hoje com dados mockados no mesmo formato da API. O time de backend recebe a
documentação dos endpoints e implementa do lado deles; ligar o frontend ao backend real é configurar
a URL base.

## 3. Quem usa

| Público | Precisa de |
|---|---|
| Dev de backend da TireShop | Lista de endpoints, formato exato de cada resposta, exemplos reais e regras de campo |
| Dev de frontend da TireShop | Código legível, com testes, arquitetura documentada e pontos de extensão claros |
| Líder técnico | Decisões registradas (ADRs), escopo fechado e critérios de aceite |
| Cliente final (comprador) | As mesmas telas e fluxos do protótipo validado |

## 4. Escopo

Telas (cada uma corresponde a um template do protótipo):

| # | Tela | Rota no protótipo | Módulo |
|---|---|---|---|
| 1 | Home | `home.html` | 09-home |
| 2 | Listagem de categoria (departamento, aro, medida, marca) | `categoria-*.html` | 03-catalogo-listagem |
| 3 | Produto, com variante sem estoque | `produto-*.html` | 04-catalogo-produto |
| 4 | Comparar pneus | `comparar.html` | 08-comparar |
| 5 | Políticas e ajuda (8 páginas, menu lateral) | `politica-*.html` | 10-politicas |
| 6 | Sobre nós | `sobre-nos.html` | 11-institucional |
| 7 | Lojas físicas (hub) | `lojas.html` | 12-lojas |
| 8 | Página de loja, independente do e-commerce | `loja-*.html` | 12-lojas |

Componentes globais: cabeçalho com busca por medida, mega menu de departamentos com aros, menus de lojas
e de marcas, menu do celular, rodapé, minicart, aviso de cookies, botão flutuante do WhatsApp, filtro
de pneus (completo e compacto), card de produto, faixa de avaliações.

## 5. Fora de escopo

Ficam fora desta entrega. Onde existe um contrato previsto, ele está indicado em `docs/api/`, sem tela:

- Checkout, pagamento e confirmação de pedido.
- Login, cadastro, Meus Pedidos e área do cliente.
- Blog (a Home só lista os três artigos mais recentes, com link para o blog atual).
- Calculadora de pneus e "Medida dos pneus" (links para as páginas atuais).
- Painel administrativo e gestão de conteúdo.
- Backend, banco de dados, infraestrutura e publicação em produção.
- Integração real com Trustvox, gateway de pagamento e ERP: o frontend fala com a **API da TireShop**,
  e é ela que integra com terceiros.

## 6. Requisitos funcionais

| Id | Requisito | Origem no projeto |
|---|---|---|
| RF-01 | Navegar por departamentos e aros pelo mega menu, com os aros de cada departamento. | LS14, retorno de 12/11 |
| RF-02 | Buscar pneu por medida (largura, altura, aro), por aro e por veículo, a partir de qualquer página do e-commerce. | RT12 a RT16 |
| RF-03 | Listar produtos de uma categoria com 12 por página, 3 por linha no computador e 2 no celular. | RT43, 04/11 |
| RF-04 | Filtrar a listagem por aro, medida, marca, preço, run flat, tipo de terreno e desenho, com contagem por opção. | RT37 a RT42, 23/11 |
| RF-05 | Ordenar a listagem (mais vendidos, menor preço, maior preço, melhor avaliados) e paginar. | P03 |
| RF-06 | Ver o produto: galeria que abre no giro 360° quando existe, preço em 12x e à vista, quantidade, ficha técnica, etiqueta do INMETRO, veículos compatíveis, descrição, perguntas. | RT44 a RT50 |
| RF-07 | Simular prazo e frete pelo CEP na página do produto, com a opção de oficina conveniada. | RT02, RT22, RT68 |
| RF-08 | Produto sem estoque: sem preço e sem CEP, com previsão de chegada e "Avise-me". | RT03, RT51 |
| RF-09 | Adicionar ao carrinho e ver o minicart com totais à vista e em 12x; quantidade de 1 a 8 por item. | C9 |
| RF-10 | Ver avaliações: nota geral da loja e, no produto, 6 em carrossel mais a lista paginada de 5 em 5. | C14, RT19, 04/11 |
| RF-11 | Comparar de 2 a 4 pneus, escolhendo por filtros de medida, marca e preço, com destaque do melhor valor e "só as diferenças". | P06, 23/11 |
| RF-12 | Ler as 8 políticas, com menu lateral fixo e item ativo. | P20 a P26 |
| RF-13 | Ler o Sobre nós, com os dois vídeos carregando só ao tocar. | P18, 23/11 |
| RF-14 | Ver as 5 lojas no hub e abrir a página de cada uma. | P15 |
| RF-15 | Página de loja independente do e-commerce: cabeçalho, rodapé e contatos da loja; banners; introdução clara ou hero preto; vitrine opcional; serviços; marcas em guias; mapa. | P16, PDF de 23/11, 26/11 |
| RF-16 | Assinar a newsletter com e-mail e WhatsApp. | R2-22 |
| RF-17 | Home com banners, filtro, ofertas, benefícios, lojas, departamentos, entrega, marcas, avaliações, blog, texto de apoio e perguntas (nesta ordem, a do protótipo). | R2 |
| RF-18 | Aviso de cookies com aceite lembrado no navegador. | LGPD |

## 7. Requisitos não funcionais

| Id | Requisito | Como se verifica |
|---|---|---|
| RNF-01 | **SEO**: páginas renderizadas no servidor, um H1 por página, hierarquia de títulos sem pulo, metas e JSON-LD (Product, BreadcrumbList, FAQPage, AutomotiveBusiness). | Testes e2e por tipo de página |
| RNF-02 | **Acessibilidade**: WCAG 2.2 AA; contraste, foco visível, alvos de 44 px, navegação por teclado em menus, guias e carrosséis. | axe nos e2e + testes de teclado |
| RNF-03 | **Desempenho**: LCP até 2,5 s e CLS até 0,1 em 4G, na Home, na listagem e no produto; imagens com largura e altura; nada de vídeo ou mapa antes da interação. | Lighthouse no CI, em modo aviso |
| RNF-04 | **Marca**: só as cores dos tokens; verde só para seguir, comprar e confirmar; amarelo nunca como texto sobre branco. | Lint de marca no CI |
| RNF-05 | **Troca de backend sem tocar em tela**: mudar `NUXT_PUBLIC_API_BASE` basta. | Teste de contrato + e2e contra o mock |
| RNF-06 | **Resiliência**: toda tela tem estado de carregando, vazio e erro; nenhuma falha de um bloco derruba a página. | Testes de componente por estado |
| RNF-07 | **Manutenção**: domínio sem dependência de framework; cobertura de 90% no domínio e na aplicação. | Regra de import no lint + cobertura no CI |
| RNF-08 | **Privacidade**: nenhum dado pessoal em `localStorage`; CEP não é guardado. | Revisão + teste |

## 8. Critérios de aceite da entrega

A entrega está pronta quando:

1. Todas as telas do escopo existem e passam nos testes e2e, no computador (1440 px) e no celular (390 px).
2. Toda task de `specs/` está concluída, e nenhuma foi fechada sem teste.
3. `pnpm test` e `pnpm test:e2e` passam do zero, com o servidor de mocks.
4. Todo endpoint de `docs/api/openapi.yaml` tem fixture que valida no schema, e o teste de contrato passa.
5. Subir um backend falso em outra URL e apontar `NUXT_PUBLIC_API_BASE` para ele funciona sem alterar código.
6. A documentação reflete o código: ADRs, domínio e contratos atualizados.

## 9. Premissas

| # | Premissa |
|---|---|
| P1 | O backend expõe uma API REST em JSON. Se for GraphQL ou outro formato, só os adaptadores mudam. |
| P2 | As URLs amigáveis do protótipo são o ponto de partida; a decisão final de URL é do cliente (RT11). |
| P3 | Preços, prazos, avaliações e estoque vêm sempre da API. O frontend não calcula preço: só formata. |
| P4 | Carrinho e sessão são do backend. No mock, o carrinho vive em memória por sessão. |
| P5 | Textos de SEO, políticas, banners e conteúdo das lojas são editáveis pelo cliente e vêm da API. |
| P6 | A hospedagem roda Node 22 (SSR). Se for só estático, o ADR 0001 precisa ser revisto. |

## 10. Dúvidas em aberto com o cliente

| # | Dúvida | Afeta |
|---|---|---|
| D1 | Autenticação da API (sessão por cookie, token, nada para leitura)? | Cliente HTTP, carrinho |
| D2 | Padrão final de URL de produto e de categoria (id numérico, slug ou os dois)? | Módulo de rotas |
| D3 | Regra de frete grátis por região e valor: vem pronta por produto ou o frontend monta o texto? | Contrato de produto |
| D4 | Avaliações: a API entrega as da Trustvox ou o frontend embute o widget? | Contexto Avaliações |
| D5 | Comparar: quais linhas, INMETRO em notas A a G, regra do "Qual escolher"? | Módulo 08 |
| D6 | Vitrine da loja física: de onde vêm os produtos e os preços de loja? | Contrato de loja |
| D7 | UTV no menu: qual aro está errado? | Navegação |

## 11. Glossário

Ver [domain/ubiquitous-language.md](domain/ubiquitous-language.md).
