import { Imagem } from '#layers/shared'
import type { Aro, Departamento, Navegacao } from '../navegacao'

// T-0201 (docs/testing.md, "Fábricas"): uma Navegacao válida, com os mesmos departamentos e a
// mesma contagem de aros de docs/api/examples/navegacao.json (59 aros), para quem usa a fábrica
// testar `totalDeLinksDeAro` sem copiar o fixture inteiro.
function aro(valor: string): Aro {
  return { aro: valor, href: `https://www.tireshop.com.br/1/0/aro-${valor}` }
}

const DEPARTAMENTOS_PADRAO: readonly Departamento[] = [
  {
    slug: 'carros',
    nome: 'Carros',
    icone: 'carro',
    href: '/c/pneus-para-carros',
    resumoAros: 'Aros 10 a 24',
    aros: ['10', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'].map(
      aro,
    ),
  },
  {
    slug: 'pick-ups-e-suvs',
    nome: 'Pick-ups e SUVs',
    icone: 'suv',
    href: '/c/pick-ups-e-suvs',
    resumoAros: 'Aros 15 a 24',
    aros: ['15', '16', '17', '18', '19', '20', '21', '22', '23', '24'].map(aro),
  },
  {
    slug: 'vans',
    nome: 'Vans',
    icone: 'van',
    href: '/c/vans',
    resumoAros: 'Aros 14, 15 e 16',
    aros: ['14', '15', '16'].map(aro),
  },
  {
    slug: 'caminhoes',
    nome: 'Caminhões',
    icone: 'caminhao',
    href: '/c/caminhoes',
    resumoAros: 'Aros 17,5, 22,5 e 24',
    aros: ['17,5', '22,5', '24'].map(aro),
  },
  {
    slug: 'agricola',
    nome: 'Agrícola',
    icone: 'agricola',
    href: '/c/agricola',
    resumoAros: 'Aros 15 a 48',
    aros: [
      '15',
      '15,5',
      '16',
      '17',
      '18',
      '20',
      '24',
      '25',
      '26',
      '26,5',
      '28',
      '30',
      '30,5',
      '32',
      '34',
      '38',
      '42',
      '44',
      '46',
      '48',
    ].map(aro),
  },
  {
    slug: 'competicao',
    nome: 'Competição',
    icone: 'competicao',
    href: '/c/competicao',
    resumoAros: 'Aros 13 a 18',
    aros: ['13', '14', '15', '17', '18'].map(aro),
  },
  {
    slug: 'utv',
    nome: 'UTV',
    icone: 'utv',
    href: '/c/utv',
    resumoAros: 'Aro 15',
    aros: ['15'].map(aro),
  },
  {
    slug: 'otr',
    nome: 'OTR',
    icone: 'otr',
    href: '/c/otr',
    resumoAros: 'Aros 25, 33 e 35',
    aros: ['25', '33', '35'].map(aro),
  },
]

function umaImagem(): Imagem {
  const resultado = Imagem.de({
    src: '/img/marcas-web/pirelli.webp',
    largura: 149,
    altura: 32,
    alt: 'Pirelli',
  })
  if (!resultado.ok) throw new Error(`umaNavegacao: ${resultado.erro.motivo}`)
  return resultado.valor
}

export function umaNavegacao(sobrescritas: Partial<Navegacao> = {}): Navegacao {
  return {
    contato: {
      telefone: '(41) 3317-2251',
      whatsapp: '554133172251',
      email: 'contato@tireshop.com.br',
      atendimento: 'Segunda a sexta, das 8h às 17h45',
      razaoSocial: 'TireShop Comércio de Pneus e Rodas LTDA',
      cnpj: '80.171.671/0001-54',
    },
    redes: [
      { id: 'instagram', nome: 'Instagram', href: 'https://www.instagram.com/tireshop.com.br/' },
    ],
    menu: [
      { rotulo: 'Lojas Físicas', href: '/lojas' },
      { rotulo: 'Marcas', href: '/#marcas' },
    ],
    departamentos: DEPARTAMENTOS_PADRAO,
    ajuda: [
      { rotulo: 'Como Comprar', href: '/ajuda/como-comprar' },
      { rotulo: 'Todos os aros', href: null },
    ],
    extras: [
      { rotulo: 'Capotas Marítimas', href: 'https://www.tireshop.com.br/0/17/Capotas-Maritimas' },
    ],
    marcas: [{ slug: 'pirelli', nome: 'Pirelli', logo: umaImagem(), href: null }],
    rodape: {
      colunas: [
        {
          titulo: 'Comprar',
          links: [
            { rotulo: 'Departamentos', href: '/#departamentos' },
            { rotulo: 'Aros', href: null },
          ],
        },
      ],
      textoFiscal: '© Todos os direitos reservados.',
    },
    ...sobrescritas,
  }
}
