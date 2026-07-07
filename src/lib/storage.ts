import type { Modulo, Opcao, Questao } from '../types'
import { getAllQuestions } from '../data/loadQuestions'

const KEYS = {
  stats: 'pca10:questionStats',
  history: 'pca10:simuladoHistory',
  marked: 'pca10:markedForReview',
  examDate: 'pca10:examDate',
} as const

export interface QuestionStat {
  vezes_respondida: number
  vezes_correta: number
}

export type StatsMap = Record<number, QuestionStat>

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function getStats(): StatsMap {
  const stored = readJson<StatsMap>(KEYS.stats, {})
  const merged: StatsMap = {}
  for (const q of getAllQuestions()) {
    merged[q.id] = stored[q.id] ?? {
      vezes_respondida: q.vezes_respondida,
      vezes_correta: q.vezes_correta,
    }
  }
  return merged
}

export function recordAnswer(questao: Questao, resposta: Opcao) {
  const stats = getStats()
  const acertou = resposta === questao.gabarito
  const current = stats[questao.id] ?? { vezes_respondida: 0, vezes_correta: 0 }
  stats[questao.id] = {
    vezes_respondida: current.vezes_respondida + 1,
    vezes_correta: current.vezes_correta + (acertou ? 1 : 0),
  }
  writeJson(KEYS.stats, stats)
  return acertou
}

export interface ModuloResultado {
  acertos: number
  total: number
  pontos: number
  pontosMax: number
}

export interface SimuladoResultado {
  id: string
  data: string
  modoTreino: boolean
  pontuacaoGeral: number
  porModulo: Record<Modulo, ModuloResultado>
  aprovado: boolean
  moduloZerado: Modulo | null
}

export function saveSimuladoResult(resultado: SimuladoResultado) {
  const history = readJson<SimuladoResultado[]>(KEYS.history, [])
  history.push(resultado)
  writeJson(KEYS.history, history)
}

export function getSimuladoHistory(): SimuladoResultado[] {
  return readJson<SimuladoResultado[]>(KEYS.history, [])
}

export function getMarked(): number[] {
  return readJson<number[]>(KEYS.marked, [])
}

export function toggleMarked(id: number) {
  const marked = getMarked()
  const next = marked.includes(id) ? marked.filter((m) => m !== id) : [...marked, id]
  writeJson(KEYS.marked, next)
  return next
}

export function getExamDate(): string {
  const stored = localStorage.getItem(KEYS.examDate)
  if (stored) return stored
  const def = new Date()
  def.setDate(def.getDate() + 2)
  const iso = def.toISOString().slice(0, 10)
  localStorage.setItem(KEYS.examDate, iso)
  return iso
}

export function setExamDate(iso: string) {
  localStorage.setItem(KEYS.examDate, iso)
}

/** % de acerto histórico por módulo, calculado a partir dos stats por questão. */
export function progressByModulo(): Record<Modulo, { acertos: number; respondidas: number; pct: number }> {
  const stats = getStats()
  const result: Record<Modulo, { acertos: number; respondidas: number; pct: number }> = {
    etica: { acertos: 0, respondidas: 0, pct: 0 },
    legislacao: { acertos: 0, respondidas: 0, pct: 0 },
    processos: { acertos: 0, respondidas: 0, pct: 0 },
    calculos: { acertos: 0, respondidas: 0, pct: 0 },
  }
  for (const q of getAllQuestions()) {
    const s = stats[q.id]
    if (!s) continue
    result[q.modulo].acertos += s.vezes_correta
    result[q.modulo].respondidas += s.vezes_respondida
  }
  for (const modulo of Object.keys(result) as Modulo[]) {
    const r = result[modulo]
    r.pct = r.respondidas > 0 ? Math.round((r.acertos / r.respondidas) * 100) : 0
  }
  return result
}
