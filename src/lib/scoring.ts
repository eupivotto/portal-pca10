import { MODULOS, type Modulo, type Opcao, type Questao } from '../types'
import type { ModuloResultado, SimuladoResultado } from './storage'

export interface SimuladoItem {
  questao: Questao
  resposta: Opcao | null
}

export function scoreSimulado(itens: SimuladoItem[], modoTreino: boolean): SimuladoResultado {
  const porModulo: Record<Modulo, ModuloResultado> = {
    etica: { acertos: 0, total: 0, pontos: 0, pontosMax: 0 },
    legislacao: { acertos: 0, total: 0, pontos: 0, pontosMax: 0 },
    processos: { acertos: 0, total: 0, pontos: 0, pontosMax: 0 },
    calculos: { acertos: 0, total: 0, pontos: 0, pontosMax: 0 },
  }

  for (const { questao, resposta } of itens) {
    const cfg = MODULOS.find((m) => m.modulo === questao.modulo)!
    const r = porModulo[questao.modulo]
    r.total += 1
    r.pontosMax += cfg.pontosPorQuestao
    if (resposta === questao.gabarito) {
      r.acertos += 1
      r.pontos += cfg.pontosPorQuestao
    }
  }

  const pontosTotais = Object.values(porModulo).reduce((s, m) => s + m.pontos, 0)
  const pontosMaxTotais = Object.values(porModulo).reduce((s, m) => s + m.pontosMax, 0)
  const pontuacaoGeral = pontosMaxTotais > 0 ? (pontosTotais / pontosMaxTotais) * 100 : 0

  const moduloZerado =
    (Object.keys(porModulo) as Modulo[]).find((m) => porModulo[m].total > 0 && porModulo[m].acertos === 0) ?? null

  const aprovado = pontuacaoGeral >= 70 && !moduloZerado

  return {
    id: crypto.randomUUID(),
    data: new Date().toISOString(),
    modoTreino,
    pontuacaoGeral,
    porModulo,
    aprovado,
    moduloZerado,
  }
}
