interface Formula {
  numero: number
  titulo: string
  linhas: string[]
  nota?: string
  exemploLabel?: string
  exemplo?: string
  armadilha?: string
}

const FORMULAS: Formula[] = [
  {
    numero: 1,
    titulo: 'Valor de Categoria',
    linhas: ['CAT = CC + TX + FR'],
    nota: 'CC = Crédito (valor do bem/carta) · TX = Taxa de Administração em R$ · FR = Fundo de Reserva em R$.',
  },
  {
    numero: 2,
    titulo: 'Parcela mensal (PMT)',
    linhas: ['PMT = (CC + TX + FR) / PZ', 'PMT = CAT / PZ'],
    nota: 'PZ = prazo total em meses. Some Seguro Prestamista (SP) depois, por fora, se houver.',
    exemploLabel: 'Exemplo',
    exemplo: 'CAT = 100.000 · PZ = 80 → PMT = 100.000 / 80 = R$ 1.250,00/mês',
  },
  {
    numero: 3,
    titulo: 'Saldo devedor (SD) / valor da quitação',
    linhas: ['SD = CAT − (PMT × parcelas pagas) − % do lance'],
    nota: 'Trabalha com a Categoria/parcela cheia — não precisa separar TX/FR aqui.',
    exemploLabel: 'Exemplo — Bianca',
    exemplo: 'CAT = 1.380 × 60 = 82.800 · pago = 1.380 × 36 = 49.680 → SD = 82.800 − 49.680 = R$ 33.120,00',
    armadilha: 'TX% e FR% aparecem no enunciado mas não entram nessa conta — a parcela já os inclui por dentro.',
  },
  {
    numero: 4,
    titulo: 'Percentual mensal (fundo comum)',
    linhas: ['% mensal = 1 / PZ'],
    nota: 'Não depende de parcelas pagas nem de atraso — só do prazo total.',
    exemploLabel: 'Exemplo — Mariana',
    exemplo: 'PZ = 60 → % mensal = 1 / 60 = 1,67% ao mês',
  },
  {
    numero: 5,
    titulo: 'TX% e FR% — sempre sobre o Crédito (CC)',
    linhas: ['TX (R$) = TX% × CC        TX% = TX (R$) / CC', 'FR (R$) = FR% × CC        FR% = FR (R$) / CC'],
    nota: 'Nunca calcule TX%/FR% sobre a Categoria — o percentual é sempre fração do Crédito.',
    exemploLabel: 'Exemplo — Daniel',
    exemplo: 'CC = 180.000, TX = 21.000 → TX% = 21.000 / 180.000 = 11,67%',
  },
  {
    numero: 6,
    titulo: 'Achar o Crédito (CC) a partir da parcela',
    linhas: ['CAT = PMT × PZ', 'CC = CAT / (1 + TX% + FR%)'],
    exemploLabel: 'Exemplo — moto',
    exemplo: 'CAT = 400 × 36 = 14.400 · fator = 1 + 0,10 + 0,10 = 1,2 → CC = 14.400 / 1,2 = R$ 12.000,00',
    armadilha: 'É divisão pelo fator (1,2), não multiplicação por 0,8 — os percentuais somam sobre o crédito, não descontam da categoria.',
  },
  {
    numero: 7,
    titulo: 'Custo Efetivo Total (CET)',
    linhas: ['Custo = Σ PMTs pagas − Valor Emprestado (CC recebido)'],
    nota: 'Σ = somatório de todas as parcelas já pagas.',
  },
  {
    numero: 8,
    titulo: 'Crédito parcial na exclusão (Art. 33, Res. BCB 285/2023)',
    linhas: ['Crédito parcial = % amortizado do fundo comum × Valor ATUALIZADO do bem'],
    nota: 'Vale para contemplado excluído do grupo: o direito é proporcional ao que foi amortizado, aplicado sobre o valor do bem na data da exclusão.',
    exemploLabel: 'Exemplo — Marcos',
    exemplo: 'Amortizado = 40% · Valor atualizado do imóvel = 330.000 → Crédito parcial = 0,40 × 330.000 = R$ 132.000,00',
    armadilha: 'Usa o valor ATUALIZADO do bem na data da exclusão, não o valor original do crédito contratado (300.000 é uma pegadinha).',
  },
]

const COMPARATIVO = [
  { pergunta: 'Valor do crédito (CC) isolado', usaPercentual: 'Sim', formula: 'CC = CAT / (1 + TX% + FR%)' },
  { pergunta: 'TX ou FR em R$, a partir de CC', usaPercentual: 'Sim', formula: 'TX = TX% × CC' },
  { pergunta: 'Saldo devedor / quitação antecipada', usaPercentual: 'Não', formula: 'SD = CAT − (PMT × pagas)' },
  { pergunta: 'Percentual mensal do fundo comum', usaPercentual: 'Não', formula: '1 / PZ' },
]

function FormulaCard({ f }: { f: Formula }) {
  return (
    <section className="rounded-lg border border-rule bg-paper p-5 shadow-sm">
      <h2 className="mb-3 flex items-baseline gap-2 font-serif text-lg font-semibold">
        <span className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-xs font-medium text-accent-ink">
          {f.numero}
        </span>
        {f.titulo}
      </h2>
      <div className="mb-2 overflow-x-auto rounded-md border border-rule-strong border-l-4 border-l-accent bg-canvas px-4 py-3 font-mono text-sm">
        {f.linhas.map((linha, i) => (
          <div key={i} className={i > 0 ? 'mt-1 whitespace-pre text-ink-soft' : 'whitespace-pre'}>
            {linha}
          </div>
        ))}
      </div>
      {f.nota && <p className="text-sm text-ink-soft">{f.nota}</p>}
      {f.exemplo && (
        <div className="mt-3 rounded-md bg-accent-soft px-3 py-2 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent-ink">{f.exemploLabel}</p>
          <code className="font-mono text-ink">{f.exemplo}</code>
        </div>
      )}
      {f.armadilha && (
        <div className="mt-3 flex gap-2 rounded-md bg-warn-soft px-3 py-2 text-sm text-warn-ink">
          <span className="flex-shrink-0 font-serif font-bold">!</span>
          <span>{f.armadilha}</span>
        </div>
      )}
    </section>
  )
}

export default function Formulas() {
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-rule bg-paper p-5 shadow-sm">
        <p className="mb-1 font-mono text-xs uppercase tracking-wide text-accent-ink">PCA-10 · Certificação ABAC</p>
        <h1 className="font-serif text-2xl font-bold">Formulário de Cálculos de Consórcio</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Folha de referência rápida para fixar as fórmulas antes da prova. Use{' '}
          <kbd className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-xs text-accent-ink">Ctrl</kbd> +{' '}
          <kbd className="rounded bg-accent-soft px-1.5 py-0.5 font-mono text-xs text-accent-ink">P</kbd> para
          exportar esta página em PDF.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {FORMULAS.map((f) => (
          <FormulaCard key={f.numero} f={f} />
        ))}
      </div>

      <section className="rounded-lg border border-rule bg-paper p-5 shadow-sm">
        <h2 className="mb-3 font-serif text-lg font-semibold">Quando decompor por TX%/FR%, quando não</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-rule-strong bg-accent-soft px-3 py-2 text-left font-semibold text-accent-ink">
                  A pergunta pede
                </th>
                <th className="border border-rule-strong bg-accent-soft px-3 py-2 text-left font-semibold text-accent-ink">
                  Usa TX%/FR%?
                </th>
                <th className="border border-rule-strong bg-accent-soft px-3 py-2 text-left font-semibold text-accent-ink">
                  Fórmula
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARATIVO.map((row) => (
                <tr key={row.pergunta}>
                  <td className="border border-rule-strong px-3 py-2">{row.pergunta}</td>
                  <td className="border border-rule-strong px-3 py-2">{row.usaPercentual}</td>
                  <td className="border border-rule-strong px-3 py-2 font-mono">{row.formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
