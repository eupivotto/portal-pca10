import { useState } from 'react'
import type { Opcao, Questao } from '../types'
import { getAllQuestions } from '../data/loadQuestions'
import { SIMULADOS_FIXOS, type SimuladoFixo } from '../data/simuladosFixos'
import { recordAnswer, getMarked, toggleMarked } from '../lib/storage'
import QuestionCard from '../components/QuestionCard'

function montarQuestoes(fixo: SimuladoFixo): Questao[] {
  const todas = getAllQuestions()
  const porId = new Map(todas.map((q) => [q.id, q]))
  return fixo.questionIds.map((id) => porId.get(id)).filter((q): q is Questao => q != null)
}

export default function SimuladosExtras() {
  const [ativo, setAtivo] = useState<SimuladoFixo | null>(null)
  const [questoes, setQuestoes] = useState<Questao[] | null>(null)
  const [indice, setIndice] = useState(0)
  const [respostas, setRespostas] = useState<Record<number, Opcao>>({})
  const [marcadas, setMarcadas] = useState<number[]>(getMarked())

  function iniciar(fixo: SimuladoFixo) {
    setAtivo(fixo)
    setQuestoes(montarQuestoes(fixo))
    setIndice(0)
    setRespostas({})
  }

  function responder(questao: Questao, opcao: Opcao) {
    if (respostas[questao.id] != null) return
    recordAnswer(questao, opcao)
    setRespostas((prev) => ({ ...prev, [questao.id]: opcao }))
  }

  if (!ativo || !questoes) {
    return (
      <div className="flex flex-col gap-4">
        <div className="rounded-lg border border-rule bg-paper p-5 shadow-sm">
          <h1 className="font-serif text-xl font-semibold">Simulados extras</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Blocos curtos e temáticos, com nomes e valores diferentes dos simulados completos já feitos —
            mesma base de conhecimento, para praticar sem decorar gabarito.
          </p>
        </div>
        {SIMULADOS_FIXOS.map((fixo) => (
          <div key={fixo.slug} className="rounded-lg border border-rule bg-paper p-5 shadow-sm">
            <h2 className="font-serif text-lg font-semibold">{fixo.nome}</h2>
            <p className="mt-1 text-sm text-ink-soft">{fixo.descricao}</p>
            <p className="mt-2 text-xs font-medium text-accent-ink">{fixo.questionIds.length} questões</p>
            <button
              onClick={() => iniciar(fixo)}
              className="mt-3 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-hover"
            >
              Iniciar
            </button>
          </div>
        ))}
      </div>
    )
  }

  const questaoAtual = questoes[indice]

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-rule bg-paper px-4 py-2 text-sm font-semibold text-ink-soft">
        {ativo.nome}
      </div>
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
          <p className="mb-4 font-medium">{ativo.nome} concluído!</p>
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
            onClick={() => {
              setAtivo(null)
              setQuestoes(null)
            }}
            className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper"
          >
            Voltar para os simulados extras
          </button>
        </div>
      )}
    </div>
  )
}
