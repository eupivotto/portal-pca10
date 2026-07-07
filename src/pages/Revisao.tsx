import { useMemo, useState } from 'react'
import glossarioRaw from '../../data/glossario.md?raw'
import { parseSecoes, palavrasChave } from '../lib/glossario'
import { getAllQuestions } from '../data/loadQuestions'
import { MODULO_LABEL } from '../types'
import type { Questao } from '../types'

function questoesRelacionadas(tituloSecao: string, corpo: string, questoes: Questao[]): Questao[] {
  const chaves = new Set([...palavrasChave(tituloSecao), ...palavrasChave(corpo)])
  const pontuadas = questoes.map((q) => {
    const textoQuestao = (q.enunciado + ' ' + Object.values(q.opcoes).join(' ')).toLowerCase()
    let pontos = 0
    for (const chave of chaves) {
      if (textoQuestao.includes(chave)) pontos++
    }
    return { q, pontos }
  })
  return pontuadas
    .filter((p) => p.pontos >= 2)
    .sort((a, b) => b.pontos - a.pontos)
    .slice(0, 4)
    .map((p) => p.q)
}

export default function Revisao() {
  const secoes = useMemo(() => parseSecoes(glossarioRaw), [])
  const questoes = useMemo(() => getAllQuestions(), [])
  const [ativo, setAtivo] = useState(secoes[0]?.slug ?? '')

  return (
    <div className="flex gap-6">
      <aside className="hidden w-56 shrink-0 md:block">
        <nav className="sticky top-4 flex flex-col gap-0.5 text-sm">
          {secoes.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              onClick={() => setAtivo(s.slug)}
              className={`rounded px-2 py-1 ${
                ativo === s.slug ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s.titulo}
            </a>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-8">
        {secoes.map((s) => {
          const relacionadas = questoesRelacionadas(s.titulo, s.corpo, questoes)
          return (
            <section key={s.slug} id={s.slug} className="scroll-mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold">{s.titulo}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{s.corpo.trim()}</p>
              {relacionadas.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="mb-2 text-xs font-medium uppercase text-slate-400">Questões relacionadas no banco</p>
                  <ul className="flex flex-col gap-1">
                    {relacionadas.map((q) => (
                      <li key={q.id} className="text-xs text-slate-600">
                        <span className="mr-1 rounded bg-slate-100 px-1.5 py-0.5 font-medium">
                          {MODULO_LABEL[q.modulo]}
                        </span>
                        {q.enunciado.slice(0, 90)}
                        {q.enunciado.length > 90 ? '…' : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
