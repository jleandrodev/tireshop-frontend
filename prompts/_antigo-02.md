# Prompt 02 — implementar a task (portões 3, 4 e 5)

Use depois de revisar e aprovar o teste.

## Aprovar o teste e pedir o código

```text
Teste aprovado. {{ajustes que eu fiz ou quero, se houver}}

Portão 3, VERDE: escreva o mínimo de código de produção para o teste da task {{T-xxxx}} passar.
Só nos arquivos que a task autoriza. Rode a suíte do módulo inteira.

Portão 4, REFATORAÇÃO: com tudo verde, remova duplicação e melhore nomes, rodando a suíte a cada
mudança. Confira as regras de dependência de docs/architecture.md (domínio não importa adaptador
nem UI; nenhum DTO fora do adaptador).

Responda no formato "TASK … · VERDE + REFATORAÇÃO" do AGENTS.md e PARE.
```

## Fechar a task

```text
Ok, feche a task {{T-xxxx}}:
1. Marque a task como concluída em tasks.md, com a data.
2. Atualize a documentação que a task tocou (contrato, domínio, mapa do protótipo), se tocou.
3. Liste em "Pendências" o que você viu fora do escopo.
4. Proponha a mensagem de commit ("T-xxxx: …"). Não faça o commit sem eu pedir.
Não comece a próxima task.
```

## Quando o teste precisa mudar

```text
O teste da task {{T-xxxx}} está errado porque {{motivo}}. Volte ao portão 2: proponha a correção do
teste, mostre a falha nova e pare. Não toque no código de produção.
```
