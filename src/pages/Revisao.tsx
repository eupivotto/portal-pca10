import { useMemo, useState } from 'react'
import glossarioRaw from '../../data/glossario.md?raw'
import regulamentacaoRaw from '../../data/regulamentacao_atualizada.md?raw'
import { parseSecoes, palavrasChave, type Secao } from '../lib/glossario'
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

interface AbaConteudoProps {
  secoes: Secao[]
  questoes: Questao[]
}

function AbaConteudo({ secoes, questoes }: AbaConteudoProps) {
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
                ativo === s.slug ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-accent-soft hover:text-accent-ink'
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
            <section key={s.slug} id={s.slug} className="scroll-mt-4 rounded-lg border border-rule bg-paper p-5 shadow-sm">
              <h2 className="mb-2 font-serif text-lg font-semibold">{s.titulo}</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{s.corpo.trim()}</p>
              {relacionadas.length > 0 && (
                <div className="mt-4 border-t border-rule pt-3">
                  <p className="mb-2 text-xs font-medium uppercase text-ink-soft">Questões relacionadas no banco</p>
                  <ul className="flex flex-col gap-1">
                    {relacionadas.map((q) => (
                      <li key={q.id} className="text-xs text-ink-soft">
                        <span className="mr-1 rounded bg-accent-soft px-1.5 py-0.5 font-medium text-accent-ink">
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

type Aba = 'glossario' | 'regulatorio'

export default function Revisao() {
  const [aba, setAba] = useState<Aba>('glossario')
  const secoesGlossario = useMemo(() => parseSecoes(glossarioRaw), [])
  const secoesRegulatorio = useMemo(() => parseSecoes(regulamentacaoRaw), [])
  const questoes = useMemo(() => getAllQuestions(), [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 border-b border-rule">
        <button
          onClick={() => setAba('glossario')}
          className={`rounded-t-md px-4 py-2 text-sm font-medium ${
            aba === 'glossario' ? 'border-b-2 border-ink text-ink' : 'text-ink-soft hover:text-ink'
          }`}
        >
          Glossário
        </button>
        <button
          onClick={() => setAba('regulatorio')}
          className={`rounded-t-md px-4 py-2 text-sm font-medium ${
            aba === 'regulatorio' ? 'border-b-2 border-ink text-ink' : 'text-ink-soft hover:text-ink'
          }`}
        >
          Atualizações Regulatórias (2023)
        </button>
      </div>

      {aba === 'regulatorio' && (
        <div className="rounded-md border border-warn/40 bg-warn-soft p-4 text-sm text-warn-ink">
          <p className="font-medium">⚠️ Leia com cautela</p>
          <p className="mt-1">
            A existência e o texto das normas abaixo (Res. BCB 285/2023, 216/2023 e 155/2021) foram
            verificados em fontes oficiais. Já a hipótese de que elas caem especificamente nesta prova
            é especulação baseada em relato informal de terceiro — trate como material de reforço, não
            como garantia do que será cobrado.
          </p>
        </div>
      )}

      {aba === 'glossario' ? (
        <AbaConteudo secoes={secoesGlossario} questoes={questoes} />
      ) : (
        <AbaConteudo secoes={secoesRegulatorio} questoes={questoes} />
      )}
    </div>
  )
}
