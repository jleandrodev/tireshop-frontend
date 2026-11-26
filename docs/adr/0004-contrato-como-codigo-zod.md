# ADR 0004 — Contrato como código, com Zod na borda

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

Frontend e backend são de times diferentes. O contrato precisa ser exato, verificável por máquina e impossível de divergir em silêncio.

## Decisão

Cada adaptador HTTP declara o DTO em um schema **Zod** (`*.schema.ts`). Os tipos do DTO são inferidos do schema. Toda resposta é validada na borda; resposta fora do contrato vira `ErroDeContrato` (com o caminho do campo), nunca um `undefined` na tela. O `docs/api/openapi.yaml` descreve os mesmos schemas para o backend, e um teste de contrato garante que cada fixture valida **nos dois**. O mapper converte DTO em entidades; o DTO não sai do adaptador.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Só tipos TypeScript, sem validação em tempo de execução | O tipo mente quando o backend muda; o erro aparece longe da causa. |
| Gerar o cliente a partir do OpenAPI | O backend ainda não existe; o OpenAPI é produto desta entrega, não insumo. Pode-se inverter depois. |
| Validar só em desenvolvimento | Dado ruim em produção é justamente o caso que precisa de mensagem clara. |

## Consequências

- Divergência de contrato é detectada no primeiro pedido, com mensagem que aponta o campo.
- Custo de validação em cada resposta (pequeno frente à rede).
- Três artefatos para manter em sincronia; o teste de contrato e o prompt 03 existem para isso.

## Como verificar

`tests/contract/`: para cada endpoint, fixture × schema Zod e fixture × OpenAPI. CI falha se um endpoint do OpenAPI não tiver fixture ou schema.
