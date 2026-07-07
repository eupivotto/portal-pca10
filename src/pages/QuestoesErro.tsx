import { useMemo, useState } from 'react'
import type { Opcao, Questao } from '../types'
import { getAllQuestions } from '../data/loadQuestions'
import { getStats, recordAnswer, getMarked, toggleMarked } from '../lib/storage'
import QuestionCard from '../components/QuestionCard'

function useQuestoesOrdenadasPorErro(): Questao[] {
  return useMemo(() => {
    const stats = getStats()
    return getAllQuestions()
      .filter((q) => (stats[q.id]?.vezes_respondida ?? 0) > 0)
      .sort((a, b) => {
        const ta = stats[a.id]
        const tb = stats[b.id]
        const ra = ta.vezes_correta / ta.vezes_respondida
        const rb = tb.vezes_correta / tb.vezes_respondida
        return ra - rb
      })
  }, [])
}

export default function QuestoesErro() {
  const questoes = useQuestoesOrdenadasPorErro()
  const [indice, setIndice] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, Opcao>>({})
  const [marcadas, setMarcadas] = useState<number[]>(getMarked())

  if (questoes.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600 shadow-sm">
        Ainda não há histórico de respostas suficiente. Responda alguns treinos ou simulados
        primeiro — essa tela prioriza as questões em que você mais erra.
      </div>
    )
  }

  const questaoAtual = questoes[indice]
  const stats = getStats()

  function responder(opcao: Opcao) {
    if (respostas[questaoAtual.id] != null) return
    recordAnswer(questaoAtual, opcao)
    setRespostas((prev) => ({ ...prev, [questaoAtual.id]: opcao }))
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Ordenado pelas questões com pior taxa de acerto histórico primeiro ({questoes.length} no total).
      </p>
      <QuestionCard
        questao={questaoAtual}
        numero={indice + 1}
        total={questoes.length}
        respostaSelecionada={respostas[questaoAtual.id]}
        respostaConfirmada={respostas[questaoAtual.id] != null}
        onResponder={responder}
        marcada={marcadas.includes(questaoAtual.id)}
        onToggleMarcada={() => setMarcadas(toggleMarked(questaoAtual.id))}
      />
      <p className="text-xs text-slate-400">
        Taxa de acerto histórico: {Math.round((stats[questaoAtual.id].vezes_correta / stats[questaoAtual.id].vezes_respondida) * 100)}%
        ({stats[questaoAtual.id].vezes_correta}/{stats[questaoAtual.id].vezes_respondida})
      </p>
      <div className="flex justify-between">
        <button
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          onClick={() => setIndice((i) => Math.min(questoes.length - 1, i + 1))}
          disabled={indice === questoes.length - 1}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          Próxima
        </button>
      </div>
    </div>
  )
}
