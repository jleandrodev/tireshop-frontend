# ADR 0007 — Estado: dado do servidor fora de store

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

Projetos Vue costumam guardar tudo em store, o que duplica a fonte de verdade e mostra dado velho. Aqui quase tudo é leitura do servidor.

## Decisão

Dado do servidor é lido com `useAsyncData`, com chave derivada dos parâmetros, e vive só ali. **Pinia** é usada apenas para estado que nasce no cliente e atravessa páginas: o carrinho (espelho otimista, reconciliado com a resposta da API) e a seleção do comparador. Preferências simples (aceite de cookies) vão em `localStorage`. Nada pessoal é persistido no navegador; o CEP não é guardado.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Store para tudo | Duplica cache, complica SSR e invalidação. |
| Sem store nenhuma | Carrinho e comparador precisam sobreviver à navegação. |

## Consequências

- Uma fonte de verdade por dado.
- SSR simples: o estado da store é pequeno.
- O carrinho precisa de reconciliação cuidadosa entre o otimista e o servidor.

## Como verificar

Revisão; regra na spec: nenhuma store com dado vindo de `GET` de catálogo, conteúdo ou lojas.
