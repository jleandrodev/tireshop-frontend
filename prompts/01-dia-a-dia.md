# O que dizer no dia a dia

Não há prompt para colar. O ciclo de TDD, onde ficam as tasks e como achar a próxima estão no
[AGENTS.md](../AGENTS.md), que o agente carrega em toda sessão (o `CLAUDE.md` aponta para ele). Você
conversa; ele conduz.

| Você diz | O agente faz |
|---|---|
| "Vamos para a próxima task." | Lê a ordem de execução no roadmap e os `tasks.md`, diz **qual é a próxima** (id, requisito, o teste que vai escrever, dependências) e pergunta se pode começar. |
| "Pode ir." | Marca a task como em andamento, lê a spec e o contexto, escreve **só o teste**, roda e mostra a falha. Para. |
| "Teste aprovado." (ou os ajustes que você quer) | Escreve o mínimo de código, deixa a suíte verde, refatora e mostra o resultado. Para. |
| "Ok, fecha." | Marca a task como concluída, atualiza a documentação tocada, sugere a branch, os commits e o título do PR (quem commita é você) e diz qual é a próxima. |
| "Onde estamos?" | Resume: módulo atual, tasks feitas e a fazer, bloqueadas e pendências. |
| "Inicia a T-0304." | Confere as dependências. Se faltar alguma, avisa e diz qual seria a próxima pela ordem. |
| "O teste está errado porque…" | Volta à revisão do teste, sem tocar no código de produção. |
| "Preciso mudar o contrato de /produtos: …" | Diz o impacto, espera a confirmação e abre uma task que muda schema, OpenAPI e exemplo juntos. |

Se o agente começar a escrever código antes de você aprovar o teste, ou não souber dizer a próxima
task, ele não carregou o `AGENTS.md`: peça "leia o AGENTS.md e recomece".
