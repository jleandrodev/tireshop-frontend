# Avaliações

Schemas: `ResumoDeAvaliacoes`, `FatiaDeAvaliacoes`, `Avaliacao`. **Hoje ilustrativo**: aguardando o
acesso à Trustvox. O frontend fala só com a API da TireShop; como ela obtém as avaliações é decisão
do backend (dúvida D4).

Falha em qualquer endpoint daqui **não derruba a página**: o bloco some ou mostra o próprio erro.

## GET /avaliacoes/resumo

Nota geral da loja e depoimentos em destaque. **Telas:** faixa "O que dizem os clientes" (Home,
políticas, hub de lojas). [Exemplo](../examples/avaliacoes-resumo.json).

## GET /produtos/{id}/avaliacoes/resumo

Nota do produto, total e as **6** avaliações do carrossel. [Exemplo](../examples/produto-3084-avaliacoes-resumo.json).
Produto sem avaliação: `total: 0`, `destaques: []`; a tela esconde a seção.

## GET /produtos/{id}/avaliacoes?deslocamento=6&limite=5

A lista "Todas as avaliações", da mais recente para a mais antiga. A tela começa em
`deslocamento=6` (as 6 primeiras estão no carrossel) e pede de 5 em 5 a cada "Ver mais".
[Exemplo](../examples/produto-3084-avaliacoes.json).

| Campo | Regra | A tela faz |
|---|---|---|
| `total` | Total de avaliações do produto | "Ver mais avaliações (restam N)"; o botão some quando acaba |
| `itens[].iniciais` | 1 ou 2 letras | Avatar |
| `itens[].nota` | Inteiro de 1 a 5 | Estrelas |
| `itens[].data` | ISO | "03/08/2026" |
| `itens[].cidade` | Pode ser `null` | Some da linha |
