# ADR 0012 — Serviços de terceiros atrás de portas

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

Avaliações (Trustvox), mapas (Google), vídeo (YouTube) e, no futuro, pagamento e análise dependem de terceiros. No protótipo as avaliações são ilustrativas e o acesso à Trustvox ainda não foi liberado.

## Decisão

Nenhum componente fala com terceiro direto. Avaliações entram pela porta `AvaliacoesGateway`, com adaptador HTTP para a API da TireShop (que decide como integrar a Trustvox). Mapa e vídeo são componentes de **capa clicável**: mostram imagem e só carregam o `iframe` após a interação. O que é ilustrativo hoje fica marcado no contrato (`ilustrativo: true`) e na documentação do endpoint.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Embutir o widget da Trustvox | Tira o controle de layout e de desempenho; pode ser adotado depois trocando o adaptador. |
| Carregar mapa e vídeo na abertura | Pesa o LCP e envia dados a terceiros antes da interação. |

## Consequências

- Trocar de fornecedor é trocar um adaptador.
- Páginas leves.
- A API do cliente precisa expor as avaliações (dúvida D4 do PRD).

## Como verificar

e2e: zero `iframe` antes do clique; teste do adaptador de avaliações com fixture.
