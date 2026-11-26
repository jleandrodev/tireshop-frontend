# Linguagem ubíqua

Os termos que negócio, design, frontend e backend usam com o mesmo sentido. O nome no código e no
JSON é o da coluna "No código". Se um termo novo aparecer numa conversa, ele entra aqui antes de
entrar no código.

## Catálogo

| Termo | Definição | Não confundir com | No código |
|---|---|---|---|
| **Pneu / Produto** | Item vendável do catálogo. Hoje todo produto é um pneu. | Kit (variante do card, fora do escopo) | `Produto` |
| **Código** | Identificador do produto na TireShop (ex.: `3084`). Aparece como "Cód." | EAN | `ProdutoId`, `id` |
| **Medida** | Largura / altura (perfil) e aro, como gravado no pneu: `225/45 R17`. | Aro sozinho | `Medida` |
| **Largura** | Primeiro número da medida, em milímetros (`225`). | | `largura` |
| **Altura** (perfil) | Segundo número, percentual da largura (`45`). | Altura física | `altura` |
| **Aro** | Diâmetro da roda em polegadas (`17`, `17,5`, `16C`). É texto, não número. | Medida | `aro` |
| **Índice de carga** | Código e peso máximo por pneu (`91` = 615 kg). | | `indiceCarga` |
| **Índice de velocidade** | Letra e velocidade máxima (`V` = 240 km/h). | | `indiceVelocidade` |
| **Departamento** | Tipo de veículo: Carros, Pick-ups e SUVs, Vans, Caminhões, Agrícola, Competição, UTV, OTR. | Categoria | `Departamento` |
| **Categoria** | Página de listagem com um recorte do catálogo. Tem quatro tipos: departamento, aro, medida e marca. | Departamento (que é um dos tipos) | `Categoria` |
| **Marca** | Fabricante do pneu (Hankook, Fortune…). | Marcas que a loja física trabalha (freios, óleo) | `Marca` |
| **Faceta** | Grupo de filtro da listagem com a contagem de produtos por opção (Aro, Medida, Marca, Preço, Run flat, Terreno, Desenho). | Filtro de pneus (a busca) | `Faceta` |
| **Filtro de pneus / Busca** | O componente de busca por medida, por aro ou por veículo. | Facetas da listagem | `BuscaPneu` |
| **Run flat** | Pneu que roda sem ar por um trecho. | | `runFlat` |
| **Terreno** | Uso do pneu: Asfalto, A/T, H/T, M/T, R/T. | | `terreno` |
| **Desenho** | Banda de rodagem: Assimétrico, Direcional, Simétrico. | | `desenho` |
| **Giro 360°** | Sequência de fotos reais do pneu, girável. Quando existe, a galeria abre nela. | Foto ilustrativa do fabricante | `giro360` |
| **Etiqueta do INMETRO** | Imagem da etiqueta (eficiência, aderência no molhado, ruído). Hoje só imagem. | Notas A a G estruturadas (pendente) | `inmetro` |
| **Original de** | Selo "Original do [veículo]" para pneu de equipamento original. | | `originalDe` |
| **Selo de frete** | Regra de frete grátis do produto: região ("Sul e Sudeste", "todo o Brasil") e valor mínimo. | Prazo de entrega | `freteGratis` |
| **Disponibilidade** | `em_estoque` ou `sem_estoque`. Sem estoque não mostra preço nem CEP. | | `disponibilidade` |
| **Previsão de chegada** | Data em que o produto sem estoque volta. | Prazo de entrega | `previsaoChegada` |
| **Comparação** | Conjunto de 2 a 4 pneus vistos lado a lado. | | `Comparacao` |

## Preço

| Termo | Definição | No código |
|---|---|---|
| **Preço parcelado** | Valor total em até 12x sem juros. É o preço "cheio" exibido. | `preco.parcelado` |
| **Parcela** | Valor de cada uma das parcelas. | `preco.parcelado.valorParcela` |
| **Preço à vista** | Valor com desconto no Pix, boleto ou 1x no cartão (5% no e-commerce). | `preco.aVista` |
| **Preço de** | Preço anterior riscado, quando em promoção. | `preco.de` |
| **Dinheiro** | Valor em centavos inteiros e moeda. Nunca número decimal. | `Dinheiro` |

O frontend **não calcula** preço. Parcelado, parcela e à vista vêm da API.

## Carrinho e entrega

| Termo | Definição | No código |
|---|---|---|
| **Carrinho** | Itens escolhidos e os totais. É do cliente (sessão), mantido pelo backend. | `Carrinho` |
| **Minicart** | A gaveta lateral que mostra o carrinho. É tela, não conceito. | componente |
| **Item** | Um produto e a quantidade, de 1 a 8. | `ItemCarrinho` |
| **CEP** | Código postal de 8 dígitos. Usado para simular, nunca guardado. | `Cep` |
| **Prazo de entrega** | Faixa em dias úteis ("3 a 5 dias úteis"), a partir da liberação do pedido. | `PrazoEntrega` |
| **Oficina conveniada** | Oficina parceira onde o cliente manda entregar e montar. **Não é ponto de retirada.** | `oficina` |

## Lojas físicas

| Termo | Definição | Não confundir com | No código |
|---|---|---|---|
| **Loja física / Autocenter** | Uma das cinco unidades (Curitiba, São Paulo, Ribeirão Preto, Joinville, Novo Hamburgo). Negócio independente do e-commerce. | Oficina conveniada; "loja online" | `Loja` |
| **Loja online** | O e-commerce. Na página de loja física não há botão para ela: só o logo do cabeçalho leva à Home. | | rota |
| **Hub de lojas** | Página que lista as cinco lojas. | | página |
| **Banner da loja** | Arte promocional da própria loja, no carrossel do topo da página dela. | Banner da Home | `BannerLoja` |
| **Introdução clara / Hero preto** | Os dois componentes de abertura da página de loja: claro abaixo dos banners; preto quando não há banners. | | componentes |
| **Vitrine da loja** | Produtos que a loja anuncia, com preço de loja. Opcional. | Vitrine da Home | `vitrine` |
| **Serviço** | O que a loja faz (alinhamento, freios…), com foto e texto. | | `Servico` |
| **Marcas da loja** | Marcas que a loja trabalha, por grupo: pneus, freios, suspensão, filtros, óleo, outras. | Marca do catálogo | `marcas` |
| **Agendamento** | Marcar serviço pelo site. Só Novo Hamburgo e Ribeirão Preto. | Orçamento | `agendamento` |
| **Orçamento** | Pedido de preço à loja, sem compromisso. | | `orcamento` |

## Conteúdo, avaliações e relacionamento

| Termo | Definição | No código |
|---|---|---|
| **Navegação** | Menu, departamentos com aros, rodapé e contatos do e-commerce. | `Navegacao` |
| **Política** | Página de ajuda (prazo, pagamento, garantia, trocas…). Texto do cliente. | `Politica` |
| **Texto de apoio** | Texto de SEO com "Ler mais", escrito pela liveSEO. | `textoApoio` |
| **FAQ** | Perguntas e respostas de uma página. | `Faq` |
| **Migalhas** | Caminho de navegação (Home › Pneus para carros › Aro 17). | `migalhas` |
| **Avaliação** | Nota de 1 a 5 e comentário de quem comprou. | `Avaliacao` |
| **Resumo de avaliações** | Nota média e total, da loja ou de um produto. | `ResumoAvaliacoes` |
| **Avise-me** | Pedido de aviso por e-mail quando um produto sem estoque voltar. | `PedidoAviso` |
| **Newsletter** | Inscrição com e-mail e WhatsApp. | `InscricaoNewsletter` |

## Termos de marca e de interface que viram regra

| Termo | Regra |
|---|---|
| **Verde de ação** | Só em botões de seguir, comprar e confirmar. |
| **Amarelo da marca** | Marca e destaque. Nunca como cor de texto sobre fundo claro. |
| **Ilustrativo** | Dado de exemplo que ainda não vem do sistema real (avaliações, prazo por CEP, vitrine da loja). Marcado no contrato. |
