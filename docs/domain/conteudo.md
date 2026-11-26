# Contexto: Conteúdo (genérico)

Servir o que é editorial. É quase só leitura e exibição, então o modelo é **raso de propósito**:
tipos de dados e blocos, sem agregados ricos. Aqui o DDD tático não paga o custo.

**Dentro:** navegação (menu, departamentos com aros, rodapé, contatos), Home (banners, benefícios,
blocos), políticas, Sobre nós, textos de apoio e FAQ dessas páginas, aviso de cookies.
**Fora:** produtos (Catálogo), lojas (Lojas), avaliações (Avaliações). A Home junta blocos de vários
contextos na **página**, não aqui.

## Modelo

| Tipo | Campos principais | Regra |
|---|---|---|
| `Navegacao` | `contato`, `redes[]`, `menu[]`, `departamentos[]` (com `aros[]`), `ajuda[]`, `extras[]`, `marcas[]`, `rodape.colunas[]`, `rodape.textoFiscal` | Cada departamento lista os aros que existem nele; departamento sem aros mostra só o título. |
| `Banner` | `id`, `titulo`, `texto`, `chamada`, `destino`, `imagens` (computador e celular) | Até 3 na Home; quem troca é o usuário (sem rotação automática). |
| `Beneficio` | `icone`, `titulo`, `texto` | |
| `PaginaInicial` | `banners`, `beneficios`, `entrega`, `seguranca`, `blog[]`, `textoApoio`, `faq` | Departamentos e marcas da Home vêm da `Navegacao`; produtos, lojas e avaliações vêm de outros contextos. |
| `BlocoDeTexto` | união: `paragrafo`, `titulo` (nível 2 ou 3), `lista`, `passos`, `aviso`, `faq`, `video` | HTML restrito à lista branca do perfil **texto** de `HtmlSeguro` (ver shared kernel). |
| `Politica` | `slug`, `titulo`, `rotuloMenu`, `icone`, `blocos: BlocoDeTexto[]`, `contato` | Texto literal do cliente. |
| `Institucional` | `titulo`, `secoes[]` (texto e vídeos), `fatos[]`, `estoque` | Vídeo = `{ id, titulo, capa }`; carrega só ao tocar. |
| `TextoDeApoio` | `titulo`, `html` | Recolhido, com "Ler mais". |
| `Faq` | `itens: { pergunta, respostaHtml }[]` | Vira `FAQPage` no JSON-LD. |

Único comportamento com regra: `Politica.itemAtivo(slug)` para o menu lateral, e a sanitização do
HTML na borda (o adaptador recusa tag fora da lista branca).

Erros: `PaginaNaoEncontrada` · `ErroDeRede` · `ErroDeContrato`.

## Casos de uso

| Caso de uso | Saída | Tela |
|---|---|---|
| `obterNavegacao` | `Navegacao` | Cabeçalho, mega menu, menu do celular, rodapé |
| `obterPaginaInicial` | `PaginaInicial` | Home |
| `listarPoliticas` | `{ slug, rotuloMenu, icone }[]` | Menu lateral das políticas |
| `obterPolitica(slug)` | `Politica` | Página de política |
| `obterInstitucional` | `Institucional` | Sobre nós |

`obterNavegacao` é chamado uma vez por requisição no servidor e reaproveitado na página (cache longo).

## Portas

```ts
interface NavegacaoRepository { obter(): Promise<Result<Navegacao, ErroDeConteudo>> }
interface ConteudoRepository {
  paginaInicial(): Promise<Result<PaginaInicial, ErroDeConteudo>>
  politicas(): Promise<Result<ResumoDePolitica[], ErroDeConteudo>>
  politica(slug: Slug): Promise<Result<Politica, PaginaNaoEncontrada | ErroDeConteudo>>
  institucional(): Promise<Result<Institucional, ErroDeConteudo>>
}
```

## Telas

Cabeçalho e rodapé do e-commerce, Home, as 8 políticas, Sobre nós.
