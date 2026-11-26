# ADR 0008 — Mapa de rotas isolado em um módulo

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

O protótipo usa nomes amigáveis (`categoria-carros-aro-17`), o site atual usa ids numéricos (`/1/5/Pneus-para-carros_Pneu-Aro-17`), e a decisão de trocar URLs ficou com o cliente para depois do lançamento (RT11). Mudança de URL tem impacto direto em SEO.

## Decisão

Toda URL interna é gerada por funções de `layers/shared/routing` (`rotas.produto(p)`, `rotas.categoria(c)`, `rotas.loja(l)`, `rotas.politica(p)`…). As páginas em `app/pages/` usam parâmetros genéricos e um resolvedor de rota (`resolverRota(caminho)`) que pode consultar a API para caminhos legados. Componentes nunca montam URL com string.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| URLs fixas no código, como no protótipo | A decisão do cliente viraria uma caça a strings. |
| Deixar o backend redirecionar tudo | Não resolve a geração de links no frontend. |

## Consequências

- Trocar o padrão de URL é alterar um arquivo.
- Dá para suportar os dois padrões ao mesmo tempo, com redirecionamento.
- Uma indireção a mais para quem lê o código.

## Como verificar

Lint: literal de caminho interno proibido em `ui/` (antipadrão A11); teste do módulo de rotas com os dois padrões.
