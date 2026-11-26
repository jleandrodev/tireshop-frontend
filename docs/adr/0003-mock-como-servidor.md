# ADR 0003 — Mock como servidor, não como condição no código

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

O backend do cliente não existe ainda. O frontend precisa rodar, ser testado e ser demonstrado com dados reais do protótipo, e depois apontar para a API de verdade sem reescrita.

## Decisão

O frontend **sempre** faz HTTP para `NUXT_PUBLIC_API_BASE`. Em desenvolvimento, teste e demonstração, essa base é `/api/mock`, um conjunto de rotas Nitro (`server/api/mock/**`) que serve as fixtures de `mocks/fixtures/`, aplicando filtro, ordenação e paginação como o backend fará. Para usar o backend real, muda-se a variável.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| `if (mock)` nos repositórios, devolvendo objetos em memória | Dois caminhos de código; o caminho HTTP só seria exercitado em produção. |
| MSW (interceptação no navegador) | Não cobre SSR de forma simples e some no build de demonstração. |
| Servidor de mocks separado (json-server, Prism) | Mais um processo para subir; filtros e facetas exigiriam código de qualquer forma. |

## Consequências

- O que é testado é o que roda em produção: mesma serialização, mesmos erros, mesma latência simulada.
- As rotas de mock são uma implementação de referência legível para o time de backend.
- As rotas de mock precisam ser mantidas em dia com o contrato (o teste de contrato cobre isso) e não podem ir para produção: ficam fora do build quando `NUXT_PUBLIC_API_BASE` é externo.

## Como verificar

Teste e2e sobe um segundo servidor falso em outra porta, aponta a variável para ele e roda a mesma suíte (critério 5 do PRD). Busca por `mocks/` fora de `server/` e `tests/` no lint.
