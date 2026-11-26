# Prompt 03 — mudar um contrato da API

Use quando o backend pedir (ou o frontend precisar de) uma mudança de rota, campo, tipo ou erro.
Um contrato vive em três lugares, e os três mudam juntos (ADR 0004).

```text
Preciso mudar o contrato {{endpoint}}: {{o que muda e por quê}}.

Antes de escrever, responda:
1. Quais telas e casos de uso consomem esse endpoint (procure em docs/api/endpoints/ e no código).
2. Se a mudança quebra quem já consome (campo removido, tipo trocado, obrigatório novo) ou só acrescenta.
3. O que muda em cada um destes: schema Zod do adaptador, docs/api/openapi.yaml, fixture em
   docs/api/examples/, mapper, entidade ou value object, spec.md do módulo.
PARE e espere eu confirmar.

Depois de confirmado, em UMA task nova (proponha o texto dela em tasks.md):
- Portão 1: ajuste primeiro o teste de contrato (a fixture nova tem de validar no schema novo, e a
  antiga tem de falhar) e o teste do mapper. Mostre a falha e pare.
- Portões 3 e 4: schema, mapper, fixture e OpenAPI. Rode o teste de contrato de todos os endpoints.
- Registre a decisão: ADR novo em docs/adr/ se a mudança altera uma convenção; senão, uma linha em
  "Histórico" no .md do endpoint, com a data e o motivo.
```
