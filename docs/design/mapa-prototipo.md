# Do protótipo para o Nuxt

O protótipo em alta fidelidade (https://tireshop.homolog.live/prototipos/) é a referência de layout e
de comportamento. Este arquivo liga cada peça dele ao que será construído. Os arquivos-fonte ficam
no repositório de discovery da N1 (`ui/templates`, `ui/css`, `ui/js`, `ui/data`, `tools/hifi`).

## Páginas

| Protótipo (template → arquivos) | Rota proposta | Página Nuxt | Layout | Contextos | Módulo |
|---|---|---|---|---|---|
| `home.html.j2` → `home.html` | `/` | `pages/index.vue` | `default` | Conteúdo, Catálogo, Lojas, Avaliações | 09 |
| `categoria.html.j2` → `categoria-<slug>[-n].html` | `/c/<slug>?pagina=n` | `pages/c/[slug].vue` | `default` | Catálogo | 03 |
| `produto.html.j2` → `produto-<id>.html` | `/p/<id>/<slug>` | `pages/p/[id]/[[slug]].vue` | `default` | Catálogo, Entrega, Avaliações, Carrinho, Relacionamento | 04 |
| `comparar.html.j2` → `comparar.html` | `/comparar?p=id,id` | `pages/comparar.vue` | `default` | Catálogo, Carrinho | 08 |
| `politica.html.j2` → `politica-<slug>.html` | `/ajuda/<slug>` | `pages/ajuda/[slug].vue` | `default` | Conteúdo | 10 |
| `sobre-nos.html.j2` → `sobre-nos.html` | `/sobre-nos` | `pages/sobre-nos.vue` | `default` | Conteúdo, Lojas | 11 |
| `lojas.html.j2` → `lojas.html` | `/lojas` | `pages/lojas/index.vue` | `default` | Lojas | 12 |
| `loja.html.j2` → `loja-<slug>.html` | `/lojas/<slug>` | `pages/lojas/[slug].vue` | `loja` | Lojas | 12 |

As rotas são **propostas**: a forma final é decisão do cliente (D2 do PRD) e fica isolada em
`shared/routing` (ADR 0008).

## Parciais → componentes

| Parcial do protótipo | Componente | Contexto | Observação |
|---|---|---|---|
| `cabecalho.html.j2` | `SiteCabecalho`, `MegaMenuDepartamentos`, `MegaMenuLojas`, `MegaMenuMarcas`, `MenuCelular`, `BuscaPorMedida` | Conteúdo (+ Catálogo na busca) | Mega menus são `details` com fechamento ao abrir outro |
| `rodape.html.j2` | `SiteRodape`, `FormularioNewsletter` | Conteúdo, Relacionamento | Colunas viram acordeão no celular |
| `base.html.j2` (minicart) | `Minicart`, `BotaoComprar` | Carrinho | `dialog` lateral |
| `base.html.j2` (cookies, FAB) | `AvisoCookies`, `BotaoWhatsapp` | shared/ui | O FAB sobe quando há barra fixa |
| `filtro.html.j2` | `FiltroPneus` (abas Medida, Aro, Veículo) | Catálogo | Recebe a medida ativa da categoria |
| `filtro-compacto.html.j2` | `FiltroPneusCompacto` | Catálogo | Uma linha, até 80 px de altura |
| `card.html.j2` | `CardProduto` (variante `loja`) | Catálogo | Nome em H2; variante de loja troca Comprar por "Pedir no WhatsApp" |
| `filtros-laterais.html.j2` | `FacetasListagem`, `PainelFiltrosCelular` | Catálogo | Mesmo formulário nas duas telas |
| `paginacao.html.j2` | `Paginacao` | shared/ui | Números e "Próxima página" na mesma linha |
| `banner.html.j2` | `CarrosselBanners` | Conteúdo | Sem rotação automática |
| `texto-seo.html.j2` | `TextoDeApoio` | shared/ui | "Ler mais"; centralizado quando sem imagem |
| `faq.html.j2` | `Acordeao` | shared/ui | Botão dentro de título; também usado no Comparar |
| `faixa-avaliacoes.html.j2` | `FaixaAvaliacoes` (variante embutida) | Avaliações | Mesma peça na Home e no produto |
| `migalhas.html.j2` | `Migalhas` | shared/ui | Gera `BreadcrumbList` |
| `loja-cartao.html.j2` | `CartaoLoja` | Lojas | Home, hub, Sobre nós |
| `cabecalho-loja.html.j2`, `rodape-loja.html.j2` | `LojaCabecalho`, `LojaRodape` | Lojas | Só no layout `loja` |
| `banner-loja.html.j2` | `LojaBanners` | Lojas | Faixa 1600×250; arte própria no celular |
| `loja-intro.html.j2` | `LojaIntroducao` | Lojas | Abertura clara, quando há banners |
| `loja-hero.html.j2` | `LojaHero` | Lojas | Abertura preta, quando não há banners |
| `politicas-nav.html.j2` | `MenuPoliticas` | Conteúdo | Lateral de 280 px, fixo; acordeão no celular |
| `contato-ajuda.html.j2` | `BlocoContato` | Conteúdo | |
| (produto) galeria e giro | `GaleriaProduto`, `Giro360` | Catálogo | Arraste e setas do teclado |
| (produto) bloco de compra | `BlocoCompra`, `SeletorQuantidade`, `SimuladorFrete`, `FormularioAviseMe`, `BarraCompraCelular` | Catálogo, Entrega, Relacionamento | |
| (produto) avaliações | `ListaAvaliacoes` | Avaliações | 5 por vez, "Ver mais (restam N)" |
| (loja) guias de marcas | `Guias` + `GradeDeMarcas` | shared/ui, Lojas | Setas, Home e End |
| (comparar) | `SeletorDeComparacao`, `TabelaComparativa`, `ResumoComparacao` | Catálogo | Primeira coluna fixa |
| (sobre nós) vídeo | `CapaDeVideo` | shared/ui | Carrega o player só ao tocar |
| (lojas) mapa | `CapaDeMapa` | shared/ui | Idem |

## CSS

| Arquivo do protótipo | Papel | Destino |
|---|---|---|
| `tokens.css`, `tokens-web.css`, `tokens-acao.css`, `tokens-terceiros.css`, `tokens-fonts-web.css` | Cores, tipos, espaços, raios, sombras, camadas | `app/assets/css/tokens/` (global) |
| `base.css`, `componentes.css` | Reset, tipografia, componentes globais | `app/assets/css/` (global) |
| `home.css`, `catalogo.css`, `institucional.css`, `comparar.css` | Folhas por página | Carregadas pela página que usa |

Regras de marca que o lint cobra (ADR 0006): nenhuma cor literal fora dos tokens; `--ts-acao` (verde)
só em botões de seguir, comprar e confirmar; amarelo como `color` só sobre preto, com o comentário
`/* sobre preto */`; identificadores que parecem hexadecimal (`#aba`, `#fab`) são proibidos.

## JavaScript → composables e componentes

| Protótipo | Vira |
|---|---|
| `site.js`: mega menu, menu do celular, carrossel, acordeão, guias, "ler mais", cookies | Componentes de `shared/ui` com estado local; nada global |
| `site.js`: minicart e carrinho em `sessionStorage` | Contexto Carrinho: domínio + `CarrinhoRepository` + store Pinia |
| `site.js`: dados do filtro de pneus | `BuscaPneuGateway` + `useBuscaPneu()` |
| `catalogo.js`: filtros, ordenação e contagem sobre os cards da página | `listarProdutos` no servidor (facetas vêm da API); a URL guarda o estado dos filtros |
| `catalogo.js`: galeria, 360°, quantidade, CEP, veículos, Avise-me, "ver mais" avaliações | Componentes do produto + casos de uso de Entrega, Relacionamento e Avaliações |
| `comparar.js` | Agregado `Comparacao` + `useComparacao()` + store Pinia |
| `institucional.js` | `CapaDeVideo` |

Diferença importante: no protótipo, filtros e ordenação agem sobre os 12 cards da página (ilustrativo).
No Nuxt, cada mudança de filtro é um pedido à API, e o estado fica na URL (`?aro=17&marca=hankook`),
para a página ser compartilhável e indexável conforme a regra de SEO.

## Rastreabilidade

| Tela | Endpoints | Spec |
|---|---|---|
| Global (cabeçalho, rodapé, minicart) | `/navegacao`, `/busca/medidas`, `/carrinho`, `POST /newsletter` | 02, 05, 06 |
| Home | `/home`, `/produtos?vitrine=ofertas`, `/lojas`, `/avaliacoes/resumo` | 09 |
| Listagem | `/categorias/{slug}`, `/produtos` | 03 |
| Produto | `/produtos/{id}`, `/produtos/{id}/relacionados`, `/produtos/{id}/avaliacoes`, `POST /frete/simulacoes`, `POST /produtos/{id}/avise-me`, `POST /carrinho/itens` | 04, 07 |
| Comparar | `/produtos`, `/produtos/comparar` | 08 |
| Políticas | `/politicas`, `/politicas/{slug}` | 10 |
| Sobre nós | `/institucional`, `/lojas` | 11 |
| Hub de lojas | `/lojas` | 12 |
| Página de loja | `/lojas/{slug}` | 12 |
