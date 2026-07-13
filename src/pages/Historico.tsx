import { MODULOS, MODULO_LABEL } from '../types'
import { getSimuladoHistory, type SimuladoResultado } from '../lib/storage'

function formatarData(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function ResultadoCard({ resultado, indice }: { resultado: SimuladoResultado; indice: number }) {
  return (
    <div className="rounded-lg border border-rule bg-paper p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-ink-soft">
            Simulado #{indice + 1} · {formatarData(resultado.data)}
            {resultado.modoTreino && ' · modo treino'}
          </p>
          <p className={`mt-1 text-2xl font-bold ${resultado.aprovado ? 'text-accent' : 'text-danger'}`}>
            {resultado.pontuacaoGeral.toFixed(1)}% — {resultado.aprovado ? 'Aprovado' : 'Reprovado'}
          </p>
        </div>
      </div>
      {resultado.moduloZerado && (
        <p className="mt-1 text-sm font-medium text-danger">
          ⚠️ Módulo {MODULO_LABEL[resultado.moduloZerado]} zerou (0 acertos) — reprovação automática.
        </p>
      )}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MODULOS.map(({ modulo }) => {
          const m = resultado.porModulo[modulo]
          const pct = m.total > 0 ? Math.round((m.acertos / m.total) * 100) : 0
          const zerado = m.total > 0 && m.acertos === 0
          return (
            <div key={modulo} className={`rounded-md p-2.5 ${zerado ? 'bg-danger-soft' : 'bg-canvas'}`}>
              <p className="text-xs font-medium text-ink-soft">{MODULO_LABEL[modulo]}</p>
              <p className={`text-base font-bold ${zerado ? 'text-danger-ink' : ''}`}>{pct}%</p>
              <p className="text-xs text-ink-soft">
                {m.acertos}/{m.total} · {m.pontos.toFixed(1)}/{m.pontosMax.toFixed(1)} pts
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GraficoEvolucao({ historico }: { historico: SimuladoResultado[] }) {
  if (historico.length < 2) return null
  const w = 600
  const h = 140
  const padX = 12
  const padY = 16
  const max = 100
  const pontos = historico.map((r, i) => {
    const x = padX + (i / (historico.length - 1)) * (w - padX * 2)
    const y = h - padY - (Math.min(r.pontuacaoGeral, max) / max) * (h - padY * 2)
    return { x, y, r }
  })
  const path = pontos.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const metaY = h - padY - (70 / max) * (h - padY * 2)

  return (
    <div className="rounded-lg border border-rule bg-paper p-5 shadow-sm">
      <h2 className="mb-3 font-serif text-lg font-semibold">Evolução da pontuação geral</h2>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full min-w-[420px]" role="img" aria-label="Gráfico de evolução das notas dos simulados">
          <line x1={padX} y1={metaY} x2={w - padX} y2={metaY} stroke="var(--warn)" strokeDasharray="4 4" strokeWidth="1" />
          <text x={w - padX} y={metaY - 4} textAnchor="end" fontSize="10" fill="var(--warn-ink)">
            meta 70%
          </text>
          <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
          {pontos.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={p.r.aprovado ? 'var(--accent)' : 'var(--danger)'}
              stroke="var(--paper)"
              strokeWidth="1.5"
            />
          ))}
        </svg>
      </div>
      <p className="mt-1 text-xs text-ink-soft">
        Cada ponto é um simulado, na ordem em que foi feito. Verde = aprovado, vermelho = reprovado.
      </p>
    </div>
  )
}

export default function Historico() {
  const historico = getSimuladoHistory()

  if (historico.length === 0) {
    return (
      <div className="rounded-lg border border-rule bg-paper p-6 text-center text-ink-soft shadow-sm">
        Você ainda não finalizou nenhum Simulado Completo. Assim que terminar um, o resultado aparece
        aqui automaticamente — não precisa fazer nada além de responder o simulado.
      </div>
    )
  }

  const ordenado = [...historico].reverse()
  const media = historico.reduce((s, r) => s + r.pontuacaoGeral, 0) / historico.length
  const aprovacoes = historico.filter((r) => r.aprovado).length

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-rule bg-paper p-5 shadow-sm">
        <h1 className="font-serif text-xl font-semibold">Histórico de simulados</h1>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs font-medium text-ink-soft">Simulados feitos</p>
            <p className="text-2xl font-bold">{historico.length}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-soft">Média geral</p>
            <p className="text-2xl font-bold">{media.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs font-medium text-ink-soft">Aprovações</p>
            <p className="text-2xl font-bold">
              {aprovacoes}/{historico.length}
            </p>
          </div>
        </div>
      </div>

      <GraficoEvolucao historico={historico} />

      <div className="flex flex-col gap-4">
        {ordenado.map((r, i) => (
          <ResultadoCard key={r.id} resultado={r} indice={historico.length - 1 - i} />
        ))}
      </div>
    </div>
  )
}
