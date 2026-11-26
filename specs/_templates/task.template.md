# Tasks NN — <nome do módulo>

Spec: [spec.md](spec.md). Ciclo e portões: [../README.md](../README.md).

Ordem: de cima para baixo. Uma task por vez. Todo comando roda no contêiner: `pnpm x` é `bin/pnpm x`.

---

### [ ] T-NN01 · <comportamento, em uma frase>

- **Requisito:** REQ-NN-xx
- **Camada:** domínio | aplicação | adaptador | mock | ui | e2e | infra
- **Teste primeiro:** `<caminho/do/arquivo.spec.ts>`
  - <caso 1, em frase: "recusa aro vazio">
  - <caso 2>
- **Pronto quando:** <critério objetivo>. Se a task cria uma verificação: **CI:** <job e passo acrescentados ao `ci.yml`, e o caso no `ci.spec.ts`>
- **Arquivos:** `<caminho/arquivo.ts>`, `<caminho/arquivo.spec.ts>`
- **Fora do escopo:** <o que não fazer aqui>
- **Depende de:** T-NNxx

---

## Pendências

- <o que apareceu e não cabia em nenhuma task>
