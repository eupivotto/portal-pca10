export type Modulo = 'etica' | 'legislacao' | 'processos' | 'calculos'

export type Opcao = 'a' | 'b' | 'c' | 'd'

export interface Questao {
  id: number
  modulo: Modulo
  enunciado: string
  opcoes: Record<Opcao, string>
  gabarito: Opcao
  explicacao: string
  fonte_arquivo: string
  vezes_respondida: number
  vezes_correta: number
}

export interface QuestionsFile {
  meta: {
    certificacao: string
    total_questoes: number
    modulos: Modulo[]
    fonte: string
    gerado_em: string
  }
  questions: Questao[]
}

export interface ModuloConfig {
  modulo: Modulo
  nomeOficial: string
  qtdProva: number
  pontosPorQuestao: number
}

export const MODULOS: ModuloConfig[] = [
  { modulo: 'legislacao', nomeOficial: 'Objetivos e Legislação', qtdProva: 15, pontosPorQuestao: 1.6 },
  { modulo: 'processos', nomeOficial: 'Funcionamento e Processos', qtdProva: 20, pontosPorQuestao: 1.3 },
  { modulo: 'calculos', nomeOficial: 'Cálculos Financeiros', qtdProva: 10, pontosPorQuestao: 2.5 },
  { modulo: 'etica', nomeOficial: 'Ética e Melhores Práticas', qtdProva: 5, pontosPorQuestao: 5.0 },
]

export const MODULO_LABEL: Record<Modulo, string> = {
  etica: 'Ética',
  legislacao: 'Legislação',
  processos: 'Processos',
  calculos: 'Cálculos',
}

export const TEMPO_PROVA_MINUTOS = 120
export const TOTAL_QUESTOES_PROVA = 50
export const NOTA_APROVACAO_PCT = 70
