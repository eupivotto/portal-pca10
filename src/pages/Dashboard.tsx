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
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Contagem regressiva para a prova</h1>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {diasRestantes >= 0 ? `${diasRestantes} dia${diasRestantes === 1 ? '' : 's'}` : 'data já passou'}
            </p>
          </div>
          <label className="flex flex-col text-sm text-slate-600">
            Data da prova
            <input
              type="date"
              value={examDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="mt-1 rounded-md border border-slate-300 px-2 py-1"
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
            <div key={modulo} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-slate-500">{MODULO_LABEL[modulo]}</p>
              <p className="mt-1 text-2xl font-bold">{p.pct}%</p>
              <p className="text-xs text-slate-400">{p.respondidas} respondidas</p>
              <p className={`mt-2 text-xs ${pouco ? 'text-amber-600' : 'text-slate-400'}`}>
                banco: {disponivel} questões {pouco && '· pouca variedade'}
              </p>
            </div>
          )
        })}
      </section>

      <section className="flex flex-col gap-3">
        <Link
          to="/simulado"
          className="rounded-lg bg-slate-900 px-5 py-4 text-center text-lg font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
        >
          Simulado Completo (50 questões, cronometrado)
        </Link>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            to="/treino"
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center font-medium shadow-sm hover:bg-slate-50"
          >
            Treino por módulo
          </Link>
          <Link
            to="/revisao"
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center font-medium shadow-sm hover:bg-slate-50"
          >
            Revisão teórica
          </Link>
          <Link
            to="/erros"
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-center font-medium shadow-sm hover:bg-slate-50"
          >
            Questões que mais erro
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <button
          onClick={() => setMostrarImport((v) => !v)}
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          {mostrarImport ? '▾' : '▸'} Adicionar material (fase 2)
        </button>
        {mostrarImport && (
          <div className="mt-3 text-sm text-slate-600">
            <p className="mb-2">
              Para incluir novas questões, rode o parser no terminal (usa a API da Claude, não expõe
              chave no navegador) e depois recarregue esta página:
            </p>
            <pre className="overflow-x-auto rounded-md bg-slate-900 px-3 py-2 text-xs text-slate-100">
              python parser.py raw/arquivo.pdf
            </pre>
          </div>
        )}
      </section>
    </div>
  )
}
