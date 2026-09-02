export interface SimuladoFixo {
  slug: string
  nome: string
  descricao: string
  questionIds: number[]
}

export const SIMULADOS_FIXOS: SimuladoFixo[] = [
  {
    slug: 'simulado-05-formulas-credito',
    nome: 'Simulado 05 — Fórmulas de Crédito e Amortização',
    descricao:
      'CAT, PMT, TX%/FR% sobre o crédito, saldo devedor e mudança de faixa de crédito. 10 questões, nomes e valores diferentes dos simulados anteriores.',
    questionIds: [110, 111, 112, 113, 114, 115, 116, 117, 118, 119],
  },
  {
    slug: 'simulado-06-exclusao-cota-cet',
    nome: 'Simulado 06 — Exclusão, Cota Vaga e Custo Efetivo',
    descricao:
      'Crédito parcial na exclusão (Art. 33, Res. BCB 285/2023), amortização de cota vaga e CET. 10 questões, foco nas fórmulas mais recentes.',
    questionIds: [120, 121, 122, 123, 124, 125, 126, 127, 128, 129],
  },
  {
    slug: 'simulado-07-conkey',
    nome: 'Simulado 07 — Conkey',
    descricao:
      'As 50 questões extraídas do simulado Google Forms da Conkey. Gabarito revisado e a maioria confirmada contra a Lei 11.795/2008 e a Resolução BCB 285/2023 — veja a explicação de cada questão para a fonte e o nível de confiança.',
    questionIds: [
      161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182,
      183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204,
      205, 206, 207, 208, 209, 210,
    ],
  },
]
