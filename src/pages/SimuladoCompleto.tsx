import { useRef, useState } from 'react'
import { MODULOS, MODULO_LABEL, TEMPO_PROVA_MINUTOS, type Opcao, type Questao } from '../types'
import { countByModulo, getQuestionsByModulo } from '../data/loadQuestions'
import { drawQuestions, shuffle } from '../lib/sampling'
import { formatMMSS, useCountdownTimer } from '../lib/useCountdownTimer'
import { scoreSimulado, type SimuladoItem } from '../lib/scoring'
import { recordAnswer, saveSimuladoResult } from '../lib/storage'
import QuestionCard from '../components/QuestionCard'

type Fase = 'config' | 'rodando' | 'finalizado'

function montarProva(): { questoes: Questao[]; repetidasPorModulo: string[] } {
  const repetidasPorModulo: string[] = []
  const blocos = MODULOS.map(({ modulo, qtdProva }) => {
    const banco = getQuestionsByModulo(modulo)
    const { questoes, repetidas } = drawQuestions(banco, qtdProva)
    if (repetidas) repetidasPorModulo.push(MODULO_LABEL[modulo])
    return questoes
  })
  return { questoes: shuffle(blocos.flat()), repetidasPorModulo }
}

export default function SimuladoCompleto() {
  const [fase, setFase] = useState<Fase>('config')
  const [modoTreino, setModoTreino] = useState(false)
  const provaRef = useRef<{ questoes: Questao[]; repetidasPorModulo: string[] } | null>(null)
  const [respostas, setRespostas] = useState<(Opcao | null)[]>([])
  const [indiceAtual, setIndiceAtual] = useState(0)
  const [resultado, setResultado] = useState<ReturnType<typeof scoreSimulado> | null>(null)

  const questoes = provaRef.current?.questoes ?? []

  const banco = countByModulo()
  const avisosBanco = MODULOS.filter((m) => banco[m.modulo] < m.qtdProva).map(
    (m) => `banco tem ${banco[m.modulo]} questões de ${MODULO_LABEL[m.modulo]}, prova pede ${m.qtdProva} — questões serão repetidas`,
  )

  const secondsLeft = useCountdownTimer(TEMPO_PROVA_MINUTOS * 60, fase === 'rodando', () => finalizar())

  function iniciar() {
    provaRef.current = montarProva()
    setRespostas(new Array(provaRef.current.questoes.length).fill(null))
    setIndiceAtual(0)
    setFase('rodando')
  }

  function responder(opcao: Opcao) {
    setRespostas((prev) => {
      const next = [...prev]
      next[indiceAtual] = opcao
      return next
    })
  }

  function proxima() {
    if (indiceAtual < questoes.length - 1) setIndiceAtual((i) => i + 1)
    else finalizar()
  }

  function anterior() {
    if (modoTreino && indiceAtual > 0) setIndiceAtual((i) => i - 1)
  }

  function finalizar() {
    const atuais = provaRef.current?.questoes ?? []
    const itens: SimuladoItem[] = atuais.map((questao, i) => ({ questao, resposta: respostas[i] ?? null }))
    const res = scoreSimulado(itens, modoTreino)
    for (const { questao, resposta } of itens) {
      if (resposta) recordAnswer(questao, resposta)
    }
    saveSimuladoResult(res)
    setResultado(res)
    setFase('finalizado')
  }

  const tempoAcabando = secondsLeft <= 10 * 60

  if (fase === 'config') {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold">Simulado Completo</h1>
        <p className="mb-4 text-sm text-slate-600">
          50 questões (15 Legislação, 20 Processos, 10 Cálculos, 5 Ética), pontuação ponderada idêntica à
          prova real, 120 minutos.
        </p>
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={modoTreino} onChange={(e) => setModoTreino(e.target.checked)} />
          Modo treino (permite voltar questões respondidas, sem a pressão da regra real)
        </label>
        {avisosBanco.length > 0 && (
          <ul className="mb-4 list-disc rounded-md bg-amber-50 px-4 py-2 pl-8 text-xs text-amber-700">
            {avisosBanco.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        )}
        <button
          onClick={iniciar}
          className="w-full rounded-md bg-slate-900 px-4 py-2.5 font-semibold text-white hover:bg-slate-800"
        >
          Iniciar simulado
        </button>
      </div>
    )
  }

  if (fase === 'finalizado' && resultado) {
    return (
      <div className="flex flex-col gap-6">
        <ResultadoResumo resultado={resultado} />
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Revisão das questões</h2>
          {questoes.map((questao, i) => (
            <QuestionCard
              key={questao.id + '-' + i}
              questao={questao}
              numero={i + 1}
              total={questoes.length}
              respostaSelecionada={respostas[i] ?? undefined}
              respostaConfirmada
              onResponder={() => {}}
            />
          ))}
        </div>
      </div>
    )
  }

  const questaoAtual = questoes[indiceAtual]
  if (!questaoAtual) return null

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`sticky top-0 z-10 flex items-center justify-between rounded-md border px-4 py-2 text-sm font-semibold ${
          tempoAcabando ? 'border-red-300 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-700'
        }`}
      >
        <span>Tempo restante: {formatMMSS(secondsLeft)}</span>
        {tempoAcabando && <span>⚠️ Últimos minutos!</span>}
        {modoTreino && <span className="text-slate-400">modo treino</span>}
      </div>
      <QuestionCard
        questao={questaoAtual}
        numero={indiceAtual + 1}
        total={questoes.length}
        respostaSelecionada={respostas[indiceAtual] ?? undefined}
        onResponder={responder}
      />
      <div className="flex justify-between">
        <button
          onClick={anterior}
          disabled={!modoTreino || indiceAtual === 0}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium disabled:opacity-40"
        >
          Anterior
        </button>
        <button
          onClick={proxima}
          disabled={respostas[indiceAtual] == null}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          {indiceAtual === questoes.length - 1 ? 'Finalizar' : 'Próxima'}
        </button>
      </div>
    </div>
  )
}

function ResultadoResumo({ resultado }: { resultado: ReturnType<typeof scoreSimulado> }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold">Resultado do simulado</h1>
      <p className={`mt-2 text-3xl font-bold ${resultado.aprovado ? 'text-green-600' : 'text-red-600'}`}>
        {resultado.pontuacaoGeral.toFixed(1)}% — {resultado.aprovado ? 'Aprovado' : 'Reprovado'}
      </p>
      {resultado.moduloZerado && (
        <p className="mt-1 text-sm font-medium text-red-600">
          ⚠️ Módulo {MODULO_LABEL[resultado.moduloZerado]} zerou (0 acertos) — reprovação automática, mesmo com
          média geral ≥70%.
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MODULOS.map(({ modulo }) => {
          const m = resultado.porModulo[modulo]
          const pct = m.total > 0 ? Math.round((m.acertos / m.total) * 100) : 0
          return (
            <div key={modulo} className="rounded-md bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">{MODULO_LABEL[modulo]}</p>
              <p className="text-lg font-bold">{pct}%</p>
              <p className="text-xs text-slate-400">
                {m.acertos}/{m.total} · {m.pontos.toFixed(1)}/{m.pontosMax.toFixed(1)} pts
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
