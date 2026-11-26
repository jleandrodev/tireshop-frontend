# ADR 0013 — Domínio e contratos em português

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

O negócio, o cliente, os dados e os dois times são brasileiros. Os termos do domínio (medida, aro, loja, oficina conveniada, à vista) não têm tradução consagrada no time, e traduzir cria um dicionário paralelo.

## Decisão

Linguagem ubíqua em **português** em entidades, value objects, casos de uso, rotas da API e campos do JSON, em camelCase e sem acento (`precoAVista`, `indiceCarga`, `porPagina`). Termos de padrão técnico ficam em inglês (`Repository`, `Gateway`, `UseCase`, `Mapper`, `Schema`, `Result`). Envelope de paginação: `{ itens, pagina, porPagina, total, totalPaginas }`. Dinheiro: `{ centavos, moeda }`.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Tudo em inglês | Tradução forçada de termos do negócio e divergência com os dados e com o cliente. |
| Código em inglês e API em português | Mapeamento mental a cada arquivo. |

## Consequências

- Código lê como o negócio fala.
- Quem não lê português tem barreira; aceitável para o time atual.
- Identificadores sem acento exigem atenção (`suspensao`, `preco`).

## Como verificar

Revisão; glossário em `docs/domain/ubiquitous-language.md` é a referência de nomes.
