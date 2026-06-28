import { useState } from 'react'
import { IoClose, IoArrowBack } from 'react-icons/io5'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '~/components/ui/dialog'
import { cn } from '~/lib/utils'
import type { Quiz, QuizQuestion } from '~/data/editions'

/* ─── Intro screen ─────────────────────────────────────────────── */

function QuizIntro({ quiz, onStart }: { quiz: Quiz; onStart: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
      <span className="text-5xl" aria-hidden="true">✦✦</span>
      <div>
        <h2 className="text-chrome-text font-bold text-[18px] leading-snug mb-2">
          {quiz.title}
        </h2>
        <p className="text-chrome-muted text-[14px]">
          teste seus conhecimentos sobre a edição de hoje do the news!
        </p>
      </div>
      <span className="px-4 py-2 rounded-full bg-chrome-surface border border-chrome-divider text-chrome-muted text-[13px]">
        {quiz.questions.length} perguntas
      </span>
      <button
        type="button"
        onClick={onStart}
        className="w-full py-3.5 rounded-xl bg-brand text-[#0A0A0F] font-bold text-[16px] hover:bg-brand-dim transition-colors"
      >
        Começar
      </button>
    </div>
  )
}

/* ─── Question screen ──────────────────────────────────────────── */

function QuizQuestion({ question, index, total, onNext, onBack, isLast }: {
  question: QuizQuestion
  index: number
  total: number
  onNext: (selected: number) => void
  onBack: () => void
  isLast: boolean
}) {
  const [selected, setSelected] = useState<number | null>(null)
  const progress = ((index) / total) * 100

  return (
    <div className="flex-1 flex flex-col gap-6 px-4 py-2">
      {/* Progress */}
      <div>
        <div className="h-1 w-full rounded-full bg-chrome-divider mb-2">
          <div
            className="h-1 bg-brand rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-chrome-muted text-[13px]">Pergunta {index + 1} de {total}</p>
      </div>

      {/* Question */}
      <p className="text-chrome-text font-bold text-[17px] leading-snug flex-none">
        {question.question}
      </p>

      {/* Options */}
      <div className="space-y-2 flex-1" role="radiogroup" aria-label={question.question}>
        {question.options.map((opt, i) => {
          const isSelected = selected === i
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(i)}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-3.5 rounded-xl border text-left transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                isSelected
                  ? 'bg-brand border-brand text-[#0A0A0F]'
                  : 'bg-chrome-surface border-chrome-divider text-chrome-text hover:border-chrome-muted',
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0',
                  isSelected ? 'border-white bg-white' : 'border-chrome-muted',
                )}
                aria-hidden="true"
              >
                {isSelected && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand block" />
                )}
              </span>
              <span className="text-[15px] font-medium">{opt}</span>
            </button>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pb-2">
        {index > 0 && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 flex-1 py-3 rounded-xl border border-chrome-divider bg-chrome-bg text-chrome-text font-bold text-[15px] hover:border-chrome-muted transition-colors"
          >
            <IoArrowBack size={16} aria-hidden="true" /> Voltar
          </button>
        )}
        <button
          type="button"
          onClick={() => selected !== null && onNext(selected)}
          disabled={selected === null}
          className={cn(
            'flex-1 py-3 rounded-xl font-bold text-[15px] transition-colors duration-150',
            selected !== null
              ? 'bg-brand text-[#0A0A0F] hover:bg-brand-dim'
              : 'bg-chrome-divider text-chrome-muted cursor-not-allowed',
          )}
        >
          {isLast ? 'Enviar respostas' : 'Próxima'}
        </button>
      </div>
    </div>
  )
}

/* ─── Result screen ────────────────────────────────────────────── */

function QuizResult({ correct, total, onClose }: { correct: number; total: number; onClose: () => void }) {
  const pct = Math.round((correct / total) * 100)
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
      <span className="text-6xl" aria-hidden="true">
        {pct >= 80 ? '🏆' : pct >= 50 ? '⭐' : '📚'}
      </span>
      <div>
        <h2 className="text-chrome-text font-black text-[28px] mb-2">
          {correct}/{total}
        </h2>
        <p className="text-chrome-muted text-[15px]">
          {pct >= 80 ? 'Parabéns! Você arrasou no quiz!' : pct >= 50 ? 'Bom resultado!' : 'Continue lendo o the news!'}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-full py-3.5 rounded-xl bg-brand text-[#0A0A0F] font-bold text-[16px] hover:bg-brand-dim transition-colors"
      >
        Concluir
      </button>
    </div>
  )
}

/* ─── Main quiz dialog ─────────────────────────────────────────── */

type QuizScreenProps = {
  quiz: Quiz | undefined
  open: boolean
  onClose: () => void
}

type QuizStep = 'intro' | 'question' | 'result'

export function QuizScreen({ quiz, open, onClose }: QuizScreenProps) {
  const [step, setStep] = useState<QuizStep>('intro')
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])

  function reset() {
    setStep('intro')
    setQuestionIndex(0)
    setAnswers([])
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleNext(selected: number) {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = selected
    setAnswers(newAnswers)
    if (!quiz) return
    if (questionIndex < quiz.questions.length - 1) {
      setQuestionIndex((i) => i + 1)
    } else {
      setStep('result')
    }
  }

  function handleBack() {
    setQuestionIndex((i) => i - 1)
  }

  const correctCount = quiz
    ? answers.filter((a, i) => a === quiz.questions[i]?.correctIndex).length
    : 0

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        className="p-0 gap-0 max-w-none w-full h-[100dvh] sm:h-auto sm:max-w-md bg-chrome-bg border-none rounded-none sm:rounded-2xl flex flex-col"
        aria-describedby="quiz-desc"
      >
        {/* Top bar */}
        <div className="flex items-center justify-end px-4 pt-4 pb-2 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Fechar quiz"
            className="flex items-center justify-center w-9 h-9 rounded-full text-chrome-muted hover:bg-chrome-text/10 transition-colors"
          >
            <IoClose size={22} aria-hidden="true" />
          </button>
        </div>

        <DialogTitle className="sr-only">{quiz?.title ?? 'Quiz'}</DialogTitle>
        <DialogDescription id="quiz-desc" className="sr-only">
          Quiz interativo sobre a edição de hoje
        </DialogDescription>

        {!quiz ? (
          <div className="flex-1 flex items-center justify-center text-chrome-muted p-8 text-center">
            Quiz não disponível para esta edição.
          </div>
        ) : step === 'intro' ? (
          <QuizIntro quiz={quiz} onStart={() => setStep('question')} />
        ) : step === 'question' ? (
          <QuizQuestion
            key={questionIndex}
            question={quiz.questions[questionIndex]}
            index={questionIndex}
            total={quiz.questions.length}
            onNext={handleNext}
            onBack={handleBack}
            isLast={questionIndex === quiz.questions.length - 1}
          />
        ) : (
          <QuizResult correct={correctCount} total={quiz.questions.length} onClose={handleClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}
