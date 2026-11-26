# Prompt 01 — iniciar uma task (portão 1, vermelho)

Cole na IA, trocando o id. Ela escreve **só o teste** e para.

```text
Inicie a task {{T-xxxx}}.

Antes de escrever:
1. Leia AGENTS.md, docs/architecture.md e o arquivo do contexto em docs/domain/.
2. Leia a spec.md e a tasks.md do módulo da task. Confira que as dependências dela estão concluídas.
   Se não estiverem, pare e me diga quais faltam.

Portão 1, VERMELHO:
- Escreva SÓ o teste descrito em "Teste primeiro" da task, no arquivo indicado.
- Não crie código de produção. Se o teste precisar de um tipo ou de uma função que ainda não existe,
  deixe o import quebrar de propósito só se a falha for clara; prefira um esqueleto vazio que faça a
  asserção falhar.
- Rode o teste e mostre o comando e a falha. A falha tem de ser de asserção, pelo motivo da task.
- Responda no formato "TASK … · VERMELHO" do AGENTS.md e PARE.

Se a task estiver grande demais ou ambígua, não escreva o teste: proponha a divisão ou a pergunta.
```
