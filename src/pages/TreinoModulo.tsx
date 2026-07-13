import { useState } from 'react'
import { MODULOS, MODULO_LABEL, type Modulo, type Opcao, type Questao } from '../types'
import { countByModulo, getQuestionsByModulo } from '../data/loadQuestions'
import { shuffle } from '../lib/sampling'
import { recordAnswer, getMarked, toggleMarked, getStats } from '../lib/storage'
import QuestionCard from '../components/QuestionCard'

export default function TreinoModulo() {
  const [modulo, setModulo] = useState<Modulo>('legislacao')
  const [qtd, setQtd] = useState(10)
  const [priorizarErros, setPriorizarErros] = useState(false)
  const [questoes, setQuestoes] = useState<Questao[] | null>(null)
  const [indice, setIndice] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, Opcao>>({})
  const [marcadas, setMarcadas] = useState<number[]>(getMarked())

  const banco = countByModulo()

  function iniciar() {
    const disponiveis = getQuestionsByModulo(modulo)
    if (priorizarErros) {
      const stats = getStats()
      const jaRespondidas = disponiveis
        .filter((q) => stats[q.id].vezes_respondida > 0)
        .sort((a, b) => stats[a.id].vezes_correta / stats[a.id].vezes_respondida - stats[b.id].vezes_correta / stats[b.id].vezes_respondida)
      const nuncaRespondidas = shuffle(disponiveis.filter((q) => stats[q.id].vezes_respondida === 0))
      const ordenadas = [...jaRespondidas, ...nuncaRespondidas]
      setQuestoes(ordenadas.slice(0, Math.min(qtd, ordenadas.length)))
    } else {
      setQuestoes(shuffle(disponiveis).slice(0, Math.min(qtd, disponiveis.length)))
    }
    setIndice(0)
    setRespostas({})
  }

  function responder(questao: Questao, opcao: Opcao) {
    if (respostas[questao.id] != null) return
    recordAnswer(questao, opcao)
    setRespostas((prev) => ({ ...prev, [questao.id]: opcao }))
  }

  if (!questoes) {
    return (
      <div className="mx-auto max-w-lg rounded-lg border border-rule bg-paper p-6 shadow-sm">
        <h1 className="mb-4 font-serif text-xl font-semibold">Treino por módulo</h1>
        <label className="mb-3 block text-sm font-medium">
          Módulo
          <select
            value={modulo}
            onChange={(e) => setModulo(e.target.value as Modulo)}
            className="mt-1 w-full rounded-md border border-rule-strong bg-paper px-2 py-1.5"
          >
            {MODULOS.map((m) => (
              <option key={m.modulo} value={m.modulo}>
                {MODULO_LABEL[m.modulo]} ({banco[m.modulo]} no banco)
              </option>
            ))}
          </select>
        </label>
        <label className="mb-4 block text-sm font-medium">
          Quantidade de questões
          <input
            type="number"
            min={1}
            max={banco[modulo]}
            value={qtd}
            onChange={(e) => setQtd(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-rule-strong bg-paper px-2 py-1.5"
          />
        </label>
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={priorizarErros} onChange={(e) => setPriorizarErros(e.target.checked)} />
          Priorizar revisão dos erros (questões com pior taxa de acerto primeiro)
        </label>
        <button
          onClick={iniciar}
          className="w-full rounded-md bg-ink px-4 py-2.5 font-semibold text-paper hover:bg-ink-hover"
        >
          Começar treino
        </button>
      </div>
    )
  }

  const questaoAtual = questoes[indice]

  return (
    <div className="flex flex-col gap-4">
      {questaoAtual ? (
        <>
          <QuestionCard
            questao={questaoAtual}
            numero={indice + 1}
            total={questoes.length}
            respostaSelecionada={respostas[questaoAtual.id]}
            respostaConfirmada={respostas[questaoAtual.id] != null}
            onResponder={(op) => responder(questaoAtual, op)}
            marcada={marcadas.includes(questaoAtual.id)}
            onToggleMarcada={() => setMarcadas(toggleMarked(questaoAtual.id))}
          />
          <div className="flex justify-between">
            <button
              onClick={() => setIndice((i) => Math.max(0, i - 1))}
              disabled={indice === 0}
              className="rounded-md border border-rule-strong px-4 py-2 text-sm font-medium disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setIndice((i) => i + 1)}
              disabled={respostas[questaoAtual.id] == null}
              className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-40"
            >
              {indice === questoes.length - 1 ? 'Concluir' : 'Próxima'}
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-rule bg-paper p-6 text-center shadow-sm">
          <p className="mb-4 font-medium">Treino concluído!</p>
          {(() => {
            const acertos = questoes.filter((q) => respostas[q.id] === q.gabarito).length
            const erros = questoes.length - acertos
            const pct = Math.round((acertos / questoes.length) * 100)
            return (
              <div className="mb-4 flex justify-center gap-6 text-sm">
                <span className="text-accent-ink">
                  <span className="text-2xl font-bold">{acertos}</span> acertos
                </span>
                <span className="text-danger-ink">
                  <span className="text-2xl font-bold">{erros}</span> erros
                </span>
                <span className="text-ink-soft">
                  <span className="text-2xl font-bold">{pct}%</span> de aproveitamento
                </span>
              </div>
            )
          })()}
          <button
            onClick={() => setQuestoes(null)}
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper"
          >
            Novo treino
          </button>
        </div>
      )}
    </div>
  )
}
