# ADR 0002 — Arquitetura hexagonal por contexto, em Nuxt Layers

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

O frontend cobre áreas com regras diferentes (catálogo, lojas físicas, conteúdo, carrinho). O backend ainda não existe e vai mudar. O cliente quer manutenção fácil e adaptadores trocáveis.

## Decisão

Um contexto delimitado por **Nuxt Layer** (`layers/catalogo`, `layers/lojas`…), mais `layers/shared` (kernel) e `app/` (composição). Dentro de cada layer: `domain/` (entidades, value objects, portas), `application/` (casos de uso), `adapters/` (implementações das portas) e `ui/` (componentes e composables). Dependência só para dentro. Cada layer expõe uma API pública em `index.ts`.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Pastas por tipo (`components/`, `composables/`, `services/`) | Mistura os contextos; uma mudança em lojas toca arquivos ao lado do catálogo. |
| Feature folders sem camadas | Regra de negócio acaba no componente e HTTP no composable. |
| Monorepo com pacotes por contexto | Custo de build e de versão alto demais para uma equipe pequena; layers dão o mesmo isolamento. |

## Consequências

- Cada contexto pode ser entendido, testado e alterado sozinho.
- Trocar a API é trocar adaptadores.
- Mais arquivos e mais cerimônia que um projeto Nuxt comum; o lint de dependência é obrigatório, senão a estrutura degrada.

## Como verificar

Regras ESLint de import por camada e entre layers (ver antipadrões A3 e A5); teste de arquitetura que falha se `domain/` importar `vue`, `#imports` ou `zod`.
