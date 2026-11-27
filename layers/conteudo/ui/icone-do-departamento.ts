// T-0207 · REQ-02-05: `Departamento.icone` (domínio, docs/api/examples/navegacao.json) usa nomes
// curtos ("carro", "suv"…); o sprite (T-0007) guarda os MDI com o prefixo "i-mdi-" e nomes
// próprios do pacote de ícones. Mapa fixo — os 8 departamentos do contrato não mudam sem task
// nova (contrato de API, AGENTS.md seção 5).
const ICONES_POR_DEPARTAMENTO: Readonly<Record<string, string>> = {
  carro: 'mdi-car-side',
  suv: 'mdi-car-pickup',
  van: 'mdi-van-utility',
  caminhao: 'mdi-truck',
  agricola: 'mdi-tractor',
  competicao: 'mdi-flag-checkered',
  utv: 'mdi-atv',
  otr: 'mdi-bulldozer',
}

export function iconeDoDepartamento(icone: string): string {
  return ICONES_POR_DEPARTAMENTO[icone] ?? icone
}
