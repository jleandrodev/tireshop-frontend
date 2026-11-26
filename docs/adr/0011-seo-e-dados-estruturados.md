# ADR 0011 — SEO e dados estruturados gerados pela aplicação

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

A liveSEO definiu regras por página: um H1, H2 nos nomes de produto da listagem, texto de apoio com "Ler mais", FAQ, e dados estruturados (Product, BreadcrumbList, FAQPage, AutomotiveBusiness).

## Decisão

Título, descrição, canônica, migalhas e JSON-LD de cada página saem de funções puras do contexto dono da página (`metadadosDoProduto(produto)`, `metadadosDaLoja(loja)`…), testadas em unidade. A página só aplica com `useSeoMeta` e `useHead`. Textos de SEO e FAQ vêm da API (são editáveis pelo cliente e pela liveSEO). `robots` e canônica são configuráveis por ambiente (homologação com `noindex`).

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Montar metas e JSON-LD em cada página | Duplica regra e fica sem teste. |
| Módulo de SEO pronto gerando tudo | Não conhece as regras do domínio (ex.: disponibilidade, oferta). |

## Consequências

- Regras de SEO testáveis sem navegador.
- Uma mudança de regra em um lugar.
- Exige disciplina para não escrever meta direto na página.

## Como verificar

Testes de unidade dos geradores; e2e que lê o HTML do servidor e valida H1 único, hierarquia e JSON-LD.
