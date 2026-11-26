# Registro de decisões de arquitetura (ADR)

Uma decisão por arquivo. Decisão nova ganha o próximo número; decisão revista **não** é editada:
cria-se um ADR novo que a substitui, e o antigo recebe o status "Substituído por NNNN".

| Nº | Decisão | Status |
|---|---|---|
| [0001](0001-nuxt-4-ssr-typescript.md) | Nuxt 4 com SSR e TypeScript estrito | Aceito |
| [0002](0002-hexagonal-por-contexto-em-layers.md) | Arquitetura hexagonal por contexto, em Nuxt Layers | Aceito |
| [0003](0003-mock-como-servidor.md) | Mock como servidor, não como condição no código | Aceito |
| [0004](0004-contrato-como-codigo-zod.md) | Contrato como código, com Zod na borda | Aceito |
| [0005](0005-tdd-e-piramide-de-testes.md) | TDD com portões e pirâmide de testes | Aceito |
| [0006](0006-css-do-prototipo-e-lint-de-marca.md) | Reaproveitar o CSS do protótipo e portar o lint de marca | Aceito |
| [0007](0007-estado-servidor-vs-cliente.md) | Estado: dado do servidor fora de store | Aceito |
| [0008](0008-rotas-isoladas.md) | Mapa de rotas isolado em um módulo | Aceito |
| [0009](0009-lojas-fisicas-independentes.md) | Lojas físicas como área independente do e-commerce | Aceito |
| [0010](0010-erros-e-estados.md) | Erros tipados com Result e quatro estados por tela | Aceito |
| [0011](0011-seo-e-dados-estruturados.md) | SEO e dados estruturados gerados pela aplicação | Aceito |
| [0012](0012-terceiros-atras-de-portas.md) | Serviços de terceiros atrás de portas | Aceito |
| [0013](0013-idioma-do-dominio-e-dos-contratos.md) | Domínio e contratos em português | Aceito |
| [0014](0014-conteiner-ci-progressivo-e-main-protegida.md) | Desenvolvimento em contêiner, CI que cresce com as tasks e `main` protegida | Aceito |

## Modelo

```markdown
# ADR NNNN — Título curto, no formato "decidimos X"

- **Status:** Proposto | Aceito | Substituído por NNNN
- **Data:** dd/mm/aaaa

## Contexto
O que força a decisão. Fatos, não opiniões.

## Decisão
O que será feito, em frases afirmativas.

## Alternativas consideradas
| Alternativa | Por que não |

## Consequências
O que fica melhor, o que fica pior, o que passa a ser obrigatório.

## Como verificar
O lint, teste ou revisão que mostra que a decisão está sendo cumprida.
```
