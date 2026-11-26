# ADR 0010 — Erros tipados com Result e quatro estados por tela

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

Com backend de terceiros, falha é caso normal: rede, 404, 5xx, JSON fora do contrato, lista vazia. A tela precisa reagir a cada uma de forma previsível.

## Decisão

Casos de uso e portas devolvem `Result<T, E>` com erros de uma união fechada por contexto (`NaoEncontrado`, `ErroDeRede`, `ErroDeContrato`, `ErroDeValidacao`, erros de negócio). A API responde erros em `application/problem+json`. Cada bloco de tela implementa quatro estados: carregando (esqueleto), sucesso, vazio e erro (com ação de tentar de novo). Falha de um bloco não derruba a página; 404 de recurso principal vira página de não encontrado com status HTTP correto no SSR.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Exceções e `try/catch` nas telas | Nada obriga a tela a tratar; o erro aparece como tela branca. |
| Página de erro única para tudo | Perde a página inteira por causa de um bloco secundário. |

## Consequências

- Tratamento de erro visível no tipo.
- Telas previsíveis em qualquer falha.
- Mais código por bloco; compensa em robustez.

## Como verificar

Teste de componente para os quatro estados de cada bloco; e2e com o mock em modo de falha (`?_falha=500`).
