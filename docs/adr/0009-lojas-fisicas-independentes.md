# ADR 0009 — Lojas físicas como área independente do e-commerce

- **Status:** Aceito
- **Data:** 26/11/2026

## Contexto

O cliente explicou que as lojas físicas têm administração separada do site e que uma operação não deve prejudicar a outra. A página de loja não pode levar o cliente para o e-commerce nem mostrar os contatos dele. Cada loja tem banners e, opcionalmente, vitrine de produtos próprios.

## Decisão

O contexto **Lojas** tem layout próprio (`app/layouts/loja.vue`): cabeçalho, rodapé e botão de WhatsApp da loja, sem busca, menu, carrinho nem contatos do e-commerce, e com um único caminho para o e-commerce: o logo do cabeçalho, que leva à Home (sem botão "Loja online"). A página é composta por blocos conforme os dados da API: com banners, carrossel e **introdução clara**; sem banners, **hero preto**; vitrine só se houver produtos. O contexto Lojas não importa Carrinho nem a navegação do e-commerce.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Mesmo layout do site com itens escondidos por condição | Fácil de vazar um link ou contato do e-commerce; foi exatamente o que o cliente pediu para tirar. |
| Aplicação separada para as lojas | Duplicaria tokens, componentes e build sem necessidade. |

## Consequências

- A independência é garantida por estrutura, não por `if`.
- Cada loja liga e desliga blocos pelo conteúdo.
- Dois layouts para manter.

## Como verificar

Teste e2e herdado do protótipo: na página de loja não existe `.ts-header`, busca, minicart, telefone do e-commerce, e há exatamente um link para o site.
