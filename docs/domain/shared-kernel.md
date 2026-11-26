# Shared kernel

O pouco que todos os contextos usam. Fica em `layers/shared`. Muda raramente e com cuidado: uma
mudança aqui toca todos os contextos. Regra para entrar: ser usado por **três ou mais** contextos e
não carregar regra de um negócio específico.

## Domínio compartilhado (`shared/domain`)

| Tipo | O que é | Invariantes e comportamento |
|---|---|---|
| `Result<T, E>` | Sucesso (`ok`) ou falha (`erro`) | `ok(v)`, `falha(e)`, `mapear`, `encadear`, `ouPadrao`. Nenhum caso de uso lança para fluxo esperado (ADR 0010). |
| `Dinheiro` | `centavos: number` inteiro, `moeda: 'BRL'` | Sem ponto flutuante. `formatar()` → `R$ 529,00`. Comparação e soma só entre a mesma moeda. |
| `Slug` | Texto de URL | Minúsculas, dígitos e hífen. |
| `Imagem` | `src`, `largura`, `altura`, `alt` | Largura e altura positivas; `alt` pode ser vazio só para imagem decorativa. |
| `Pagina<T>` | `itens`, `pagina`, `porPagina`, `total`, `totalPaginas` | `pagina` ≥ 1. `temProxima()`. |
| `HtmlSeguro` | HTML já validado contra a lista branca | Dois perfis: **texto** (`p, h2, h3, ul, ol, li, strong, em, a, br`) e **descrição de produto** (o mesmo, mais `table, thead, tbody, tr, th, td`). Só o adaptador cria; a tela pode usar `v-html` **apenas** com este tipo. |

## Erros comuns (`shared/domain/erros`)

| Erro | Quando |
|---|---|
| `ErroDeRede` | Sem resposta, tempo esgotado, 5xx. Tem `tentarDeNovo: true`. |
| `ErroDeContrato` | A resposta não valida no schema. Leva o endpoint e o caminho do campo. |
| `NaoEncontrado` | 404 do recurso principal. Base dos `XNaoEncontrado` de cada contexto. |
| `ErroDeValidacao` | Entrada do usuário inválida, detectada antes ou pelo servidor (422). Leva os campos. |

## Infraestrutura compartilhada

| Módulo | Responsabilidade |
|---|---|
| `shared/http` | `ClienteHttp`: única porta de saída para HTTP. Lê `apiBase` da configuração, aplica tempo limite, repassa cookies no SSR, converte status e `problem+json` em erros do kernel e valida a resposta com o schema recebido. |
| `shared/routing` | `rotas.*`: geração de todas as URLs internas (ADR 0008). |
| `shared/formatacao` | Datas, números e telefones em pt-BR. Funções puras. |
| `shared/seo` | Tipos de metadados e montagem de JSON-LD comum (`BreadcrumbList`, `FAQPage`). |
| `shared/ui` | Componentes sem regra de negócio: botão, ícone, acordeão, guias, carrossel, diálogo, campo, estado vazio, estado de erro, esqueleto, capa de vídeo, capa de mapa. |

## O que não entra aqui

Tipos de um contexto só (`Medida` é do Catálogo, `Cep` é da Entrega), utilidades "talvez úteis",
qualquer coisa com `if` de regra de negócio.
