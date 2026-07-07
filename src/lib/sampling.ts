import type { Questao } from '../types'

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export interface DrawResult {
  questoes: Questao[]
  repetidas: boolean
}

/** Sorteia `qtd` questões de `banco` sem repetição; se o banco não tiver
 * questões suficientes, completa repetindo (embaralhado) e sinaliza `repetidas`. */
export function drawQuestions(banco: Questao[], qtd: number): DrawResult {
  const embaralhado = shuffle(banco)
  if (banco.length >= qtd) {
    return { questoes: embaralhado.slice(0, qtd), repetidas: false }
  }
  const questoes: Questao[] = [...embaralhado]
  while (questoes.length < qtd) {
    const extra = shuffle(banco)
    questoes.push(...extra.slice(0, qtd - questoes.length))
  }
  return { questoes, repetidas: true }
}
