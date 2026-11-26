# Contexto: Avaliações (suporte)

Mostrar o que os clientes dizem da loja e de cada produto. A origem dos dados é um terceiro
(Trustvox), sempre por trás da API da TireShop (ADR 0012).

## Modelo

| Tipo | Campos | Invariantes |
|---|---|---|
| `Nota` (VO) | `valor: number` | De 1 a 5; uma casa decimal na média. `estrelasCheias()` arredonda. |
| `Avaliacao` | `autor`, `iniciais`, `cidade?`, `data`, `nota`, `texto` | `iniciais` com 1 ou 2 letras, para o avatar. |
| `ResumoAvaliacoes` | `nota`, `total`, `destaques: Avaliacao[]`, `ilustrativo: boolean` | `total` ≥ 0. |

Erros: `ErroDeRede` · `ErroDeContrato`. Falha aqui **nunca** derruba a página: o bloco some ou mostra
o próprio estado de erro.

## Casos de uso

| Caso de uso | Entrada | Saída | Tela |
|---|---|---|---|
| `obterResumoDaLoja` | — | `ResumoAvaliacoes` (nota geral + destaques) | Faixa "O que dizem os clientes" |
| `obterResumoDoProduto` | `ProdutoId` | `ResumoAvaliacoes` (nota + **6** destaques) | Carrossel da página de produto |
| `listarAvaliacoesDoProduto` | `ProdutoId`, `deslocamento`, `limite` | fatia de **5** avaliações + total | Lista "Todas as avaliações", com "Ver mais" |

Regras: o carrossel do produto mostra 6; a lista abaixo começa na 7ª e carrega de 5 em 5; o botão
mostra quantas restam e some quando acaba.

## Porta

```ts
interface AvaliacoesGateway {
  resumoDaLoja(): Promise<Result<ResumoAvaliacoes, ErroDeAvaliacoes>>
  resumoDoProduto(id: ProdutoId): Promise<Result<ResumoAvaliacoes, ErroDeAvaliacoes>>
  doProduto(id: ProdutoId, deslocamento: number, limite: number): Promise<Result<FatiaDeAvaliacoes, ErroDeAvaliacoes>>
}
```

## Telas

Faixa de avaliações (Home, políticas, hub de lojas), seção de avaliações da página de produto.
Não aparece na listagem, no Comparar nem na página de loja.

## Dúvida em aberto

D4 do PRD: a API entrega as avaliações ou o frontend embute o widget da Trustvox? O adaptador isola
a escolha.
