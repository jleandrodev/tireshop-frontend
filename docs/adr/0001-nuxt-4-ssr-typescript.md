# ADR 0001 — Nuxt 4 com SSR e TypeScript estrito

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

O cliente pediu a entrega em Nuxt. O projeto é guiado por SEO: a liveSEO definiu H1, hierarquia de títulos, textos de apoio e dados estruturados em cada tipo de página, e o tráfego entra por produto e categoria. O time de TI vai manter o código.

## Decisão

Nuxt 4, Vue 3 com `<script setup>`, TypeScript em modo estrito, `pnpm`, Node 22. Renderização no servidor (SSR) com hidratação. Cache por rota com `routeRules`: políticas e Sobre nós com revalidação longa; Home, listagem e produto com revalidação curta; carrinho e simulação de frete sem cache.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| SPA (só cliente) | Sem HTML no servidor o SEO depende de o buscador executar JavaScript; fere o RNF-01. |
| Geração estática de tudo | Preço e estoque mudam o tempo todo, e o catálogo real tem cerca de 2.300 produtos. |
| Nuxt 3 | Em manutenção; começar projeto novo nele obriga a migrar logo. |

## Consequências

- HTML completo para buscadores e primeira pintura rápida.
- Exige servidor Node em produção (premissa P6 do PRD).
- Código precisa ser seguro para SSR: nada de `window` fora de `onMounted`, estado por requisição.

## Como verificar

`pnpm build` gera saída de servidor; teste e2e confere o H1 e o JSON-LD no HTML bruto (sem executar JavaScript).
