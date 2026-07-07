import raw from '../../data/questions.json'
import type { QuestionsFile, Questao, Modulo } from '../types'

const questionsFile = raw as unknown as QuestionsFile

export function getAllQuestions(): Questao[] {
  return questionsFile.questions
}

export function getMeta() {
  return questionsFile.meta
}

export function getQuestionsByModulo(modulo: Modulo): Questao[] {
  return questionsFile.questions.filter((q) => q.modulo === modulo)
}

export function countByModulo(): Record<Modulo, number> {
  const counts: Record<Modulo, number> = { etica: 0, legislacao: 0, processos: 0, calculos: 0 }
  for (const q of questionsFile.questions) counts[q.modulo]++
  return counts
}
