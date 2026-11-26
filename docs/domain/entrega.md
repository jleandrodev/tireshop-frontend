# Contexto: Entrega (suporte)

Dizer quando e por quanto o pedido chega a um CEP.

**Dentro:** simulação de prazo e frete na página de produto, opção de oficina conveniada.
**Fora:** frete no carrinho e no checkout (fora do escopo), rastreio.

## Modelo

| VO | Campos | Invariantes |
|---|---|---|
| `Cep` | `valor: string` (8 dígitos) | Só dígitos, exatamente 8. `formatado` = `00000-000`. **Nunca persistido** (RT22, RNF-08). |
| `TipoDeEntrega` | `'endereco' \| 'oficina'` | Oficina conveniada não é ponto de retirada (RT68). |
| `PrazoEntrega` | `minimoDiasUteis`, `maximoDiasUteis` | mínimo ≤ máximo, ambos ≥ 0. Texto: "Chega em x a y dias úteis". |
| `SimulacaoDeFrete` | `prazo`, `frete: Dinheiro \| 'gratis' \| 'a_calcular'`, `tipo`, `mensagem?` | |

Erros: `CepInvalido` · `CepNaoAtendido` · `ErroDeRede` · `ErroDeContrato`.

## Caso de uso

| Caso de uso | Entrada | Saída |
|---|---|---|
| `simularFrete` | `Cep`, itens (`ProdutoId` + quantidade), `TipoDeEntrega` | `SimulacaoDeFrete` |

Regras: CEP incompleto não chega à API (erro de validação local, com a mensagem "Digite o CEP completo,
com 8 números."); o resultado é anunciado a leitores de tela (`role="status"`).

## Porta

```ts
interface FreteGateway {
  simular(e: EntradaSimulacao): Promise<Result<SimulacaoDeFrete, ErroDeEntrega>>
}
```

Hoje o mock simula por faixa de CEP (ilustrativo); o real vem do TI.

## Tela

Bloco "Prazo e frete pelo CEP" da página de produto. Não aparece em produto sem estoque.
