import type { Opcao, Questao } from '../types'
import { MODULO_LABEL } from '../types'

interface Props {
  questao: Questao
  numero: number
  total: number
  respostaSelecionada?: Opcao
  respostaConfirmada?: boolean
  onResponder: (opcao: Opcao) => void
  marcada?: boolean
  onToggleMarcada?: () => void
}

const LETRAS: Opcao[] = ['a', 'b', 'c', 'd']

export default function QuestionCard({
  questao,
  numero,
  total,
  respostaSelecionada,
  respostaConfirmada,
  onResponder,
  marcada,
  onToggleMarcada,
}: Props) {
  return (
    <div className="rounded-lg border border-rule bg-paper p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between text-sm text-ink-soft">
        <span className="flex items-center gap-2">
          Questão {numero} de {total} · <span className="font-medium">{MODULO_LABEL[questao.modulo]}</span>
          {questao.tipo === 'questao_original_ia' && (
            <span
              title="Questão de prática gerada por IA, baseada em lei vigente — não extraída de prova ou curso real"
              className="rounded bg-accent-soft px-1.5 py-0.5 text-xs font-medium text-accent-ink"
            >
              prática extra · IA
            </span>
          )}
        </span>
        {onToggleMarcada && (
          <button
            onClick={onToggleMarcada}
            className={`rounded px-2 py-1 text-xs font-medium ${
              marcada ? 'bg-warn-soft text-warn-ink' : 'text-ink-soft hover:bg-accent-soft hover:text-accent-ink'
            }`}
          >
            {marcada ? '★ Marcada' : '☆ Marcar p/ revisão'}
          </button>
        )}
      </div>
      <p className="mb-4 text-base leading-relaxed">{questao.enunciado}</p>
      <div className="flex flex-col gap-2">
        {LETRAS.map((letra) => {
          const isSelected = respostaSelecionada === letra
          const isCorrect = questao.gabarito === letra
          let classes = 'border-rule hover:border-rule-strong'
          if (respostaConfirmada) {
            if (isCorrect) classes = 'border-accent bg-accent-soft'
            else if (isSelected) classes = 'border-danger bg-danger-soft'
          } else if (isSelected) {
            classes = 'border-ink bg-accent-soft'
          }
          return (
            <button
              key={letra}
              disabled={respostaConfirmada}
              onClick={() => onResponder(letra)}
              className={`flex items-start gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors disabled:cursor-default ${classes}`}
            >
              <span className="font-semibold uppercase">{letra}</span>
              <span>{questao.opcoes[letra]}</span>
            </button>
          )
        })}
      </div>
      {respostaConfirmada && (
        <div className="mt-4 rounded-md bg-canvas p-3 text-sm text-ink-soft">
          <p className="mb-1 font-medium">
            {respostaSelecionada === questao.gabarito ? '✅ Correto' : '❌ Incorreto'} — gabarito: {questao.gabarito.toUpperCase()}
          </p>
          <p>{questao.explicacao}</p>
        </div>
      )}
    </div>
  )
}
