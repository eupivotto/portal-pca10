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
]
