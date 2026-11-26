# ADR 0005 — TDD com portões e pirâmide de testes

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

O cliente pediu desenvolvimento por specs com TDD, em pares dev + IA, com revisão humana do teste antes do código.

## Decisão

Toda task segue os cinco portões (vermelho, revisão, verde, refatoração, fechamento) descritos em `AGENTS.md`. Pirâmide: **unidade** com Vitest em `domain/` e `application/` (sem Nuxt, rápidos, maioria dos testes); **integração** de adaptadores com fixtures e de componentes com `@nuxt/test-utils` e Testing Library; **contrato** em `tests/contract/`; **ponta a ponta** com Playwright para fluxos críticos e para os invariantes por tipo de página herdados do `verify.py` do protótipo. Cobertura mínima de 90% em domínio e aplicação.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Testes depois do código | Fura o pedido do cliente e produz teste que confirma a implementação em vez de especificá-la. |
| Só e2e | Lento, frágil e não localiza o erro. |
| Snapshot de componente como teste principal | Aprova qualquer coisa e quebra a cada ajuste de marcação. |

## Consequências

- O teste aprovado é o requisito executável da task.
- Ritmo mais lento por task; previsível no conjunto.
- Exige disciplina: a IA para nos portões.

## Como verificar

Histórico de commits com o id da task; CI com cobertura por pasta; nenhuma task fechada sem arquivo de teste novo ou alterado.
