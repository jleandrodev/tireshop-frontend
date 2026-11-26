# ADR 0006 — Reaproveitar o CSS do protótipo e portar o lint de marca

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

O layout foi validado com o cliente no protótipo, com CSS próprio em camadas (tokens, base, componentes, folhas por página) e regras de marca conferidas por lint: só as cores do manual, verde reservado a seguir, comprar e confirmar, amarelo nunca como texto sobre branco.

## Decisão

As folhas do protótipo entram no projeto como estão (`tokens*.css`, `base.css`, `componentes.css`, `home.css`, `catalogo.css`, `institucional.css`, `comparar.css`), com as classes `ts-*`. Componentes Vue usam essas classes; estilo novo segue o mesmo padrão e só usa `var(--…)`. O lint de marca do protótipo é portado para o CI. Sem Tailwind e sem biblioteca de componentes.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Reescrever em Tailwind | Refazer e revalidar um layout já aprovado, sem ganho para o cliente. |
| CSS com escopo por componente (`<style scoped>`) reescrito | Mesma perda; pode ser adotado aos poucos em componentes novos. |
| Biblioteca de componentes | Impõe visual e marcação diferentes dos validados. |

## Consequências

- Fidelidade ao protótipo por construção.
- Zero retrabalho visual.
- CSS global exige disciplina de nomes; o prefixo `ts-` e o lint cuidam disso.

## Como verificar

Lint de marca no CI; teste e2e de regressão visual nas páginas-modelo (comparação com as capturas do protótipo, com tolerância).
