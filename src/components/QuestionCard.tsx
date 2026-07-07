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
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
        <span>
          Questão {numero} de {total} · <span className="font-medium">{MODULO_LABEL[questao.modulo]}</span>
        </span>
        {onToggleMarcada && (
          <button
            onClick={onToggleMarcada}
            className={`rounded px-2 py-1 text-xs font-medium ${
              marcada ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:bg-slate-100'
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
          let classes = 'border-slate-200 hover:border-slate-400'
          if (respostaConfirmada) {
            if (isCorrect) classes = 'border-green-500 bg-green-50'
            else if (isSelected) classes = 'border-red-500 bg-red-50'
          } else if (isSelected) {
            classes = 'border-slate-900 bg-slate-100'
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
        <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
          <p className="mb-1 font-medium">
            {respostaSelecionada === questao.gabarito ? '✅ Correto' : '❌ Incorreto'} — gabarito: {questao.gabarito.toUpperCase()}
          </p>
          <p>{questao.explicacao}</p>
        </div>
      )}
    </div>
  )
}
