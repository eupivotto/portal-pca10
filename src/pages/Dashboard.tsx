import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MODULOS, MODULO_LABEL } from '../types'
import { countByModulo } from '../data/loadQuestions'
import { getExamDate, progressByModulo, setExamDate } from '../lib/storage'

function useCountdown(examDateIso: string) {
  return useMemo(() => {
    const now = new Date()
    const alvo = new Date(`${examDateIso}T23:59:59`)
    const diffMs = alvo.getTime() - now.getTime()
    const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return dias
  }, [examDateIso])
}

export default function Dashboard() {
  const [examDate, setExamDateState] = useState(getExamDate())
  const [mostrarImport, setMostrarImport] = useState(false)
  const diasRestantes = useCountdown(examDate)
  const progresso = progressByModulo()
  const banco = countByModulo()

  function handleDateChange(value: string) {
    setExamDate(value)
    setExamDateState(value)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-rule bg-paper p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-lg font-semibold">Contagem regressiva para a prova</h1>
            <p className="mt-1 text-3xl font-bold text-ink">
              {diasRestantes >= 0 ? `${diasRestantes} dia${diasRestantes === 1 ? '' : 's'}` : 'data já passou'}
            </p>
          </div>
          <label className="flex flex-col text-sm text-ink-soft">
            Data da prova
            <input
              type="date"
              value={examDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="mt-1 rounded-md border border-rule-strong bg-paper px-2 py-1 text-ink"
            />
          </label>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {MODULOS.map(({ modulo, qtdProva }) => {
          const p = progresso[modulo]
          const disponivel = banco[modulo]
          const pouco = disponivel < qtdProva * 2
          return (
            <div key={modulo} className="rounded-lg border border-rule bg-paper p-4 shadow-sm">
              <p className="text-sm font-medium text-ink-soft">{MODULO_LABEL[modulo]}</p>
              <p className="mt-1 text-2xl font-bold">{p.pct}%</p>
              <p className="text-xs text-ink-soft">{p.respondidas} respondidas</p>
              <p className={`mt-2 text-xs ${pouco ? 'text-warn' : 'text-ink-soft'}`}>
                banco: {disponivel} questões {pouco && '· pouca variedade'}
              </p>
            </div>
          )
        })}
      </section>

      <section className="flex flex-col gap-3">
        <Link
          to="/simulado"
          className="rounded-lg bg-ink px-5 py-4 text-center text-lg font-semibold text-paper shadow-sm transition-colors hover:bg-ink-hover"
        >
          Simulado Completo (50 questões, cronometrado)
        </Link>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/treino"
            className="rounded-lg border border-rule bg-paper px-4 py-3 text-center font-medium shadow-sm hover:bg-accent-soft"
          >
            Treino por módulo
          </Link>
          <Link
            to="/revisao"
            className="rounded-lg border border-rule bg-paper px-4 py-3 text-center font-medium shadow-sm hover:bg-accent-soft"
          >
            Revisão teórica
          </Link>
          <Link
            to="/erros"
            className="rounded-lg border border-rule bg-paper px-4 py-3 text-center font-medium shadow-sm hover:bg-accent-soft"
          >
            Questões que mais erro
          </Link>
          <Link
            to="/historico"
            className="rounded-lg border border-rule bg-paper px-4 py-3 text-center font-medium shadow-sm hover:bg-accent-soft"
          >
            Histórico de simulados
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-rule bg-paper p-4 shadow-sm">
        <button
          onClick={() => setMostrarImport((v) => !v)}
          className="text-sm font-medium text-ink-soft hover:text-ink"
        >
          {mostrarImport ? '▾' : '▸'} Adicionar material (fase 2)
        </button>
        {mostrarImport && (
          <div className="mt-3 text-sm text-ink-soft">
            <p className="mb-2">
              Para incluir novas questões, rode o parser no terminal (usa a API da Claude, não expõe
              chave no navegador) e depois recarregue esta página:
            </p>
            <pre className="overflow-x-auto rounded-md bg-ink px-3 py-2 text-xs text-paper">
              python parser.py raw/arquivo.pdf
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}
