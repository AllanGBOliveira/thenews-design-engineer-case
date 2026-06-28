import { useState } from 'react'
import { IoNewspaper, IoClose, IoArrowForward, IoChatbubble } from 'react-icons/io5'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { cn } from '~/lib/utils'

const STAR_LABELS: Record<number, string> = {
  1: 'Ruim',
  2: 'Regular',
  3: 'Boa',
  4: 'Ótima',
  5: 'Excelente',
  6: 'Perfeita',
}

const IMPARTIALITY_OPTIONS = [
  { id: 'impartial', icon: '✔', label: 'Sim, foi imparcial' },
  { id: 'right',     icon: '→', label: 'Não, foi parcial para a direita' },
  { id: 'left',      icon: '←', label: 'Não, foi parcial para a esquerda' },
]

type RatingSheetProps = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
}

export function RatingSheet({ open, onClose, onSubmit }: RatingSheetProps) {
  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [impartiality, setImpartiality] = useState<string | null>(null)

  const canSubmit = stars > 0

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit()
  }

  const displayStars = hovered > 0 ? hovered : stars

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-chrome-surface border-t border-chrome-divider rounded-t-2xl px-0 pb-8 max-h-[85dvh] overflow-y-auto"
        aria-describedby="rating-desc"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/20 shrink-0">
            <IoNewspaper size={20} className="text-brand" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <SheetTitle className="text-chrome-text font-bold text-[16px] leading-tight">
              Parabéns pela leitura!
            </SheetTitle>
            <SheetDescription id="rating-desc" className="text-chrome-muted text-[13px] leading-snug mt-0.5">
              Sua opinião nos ajuda a melhorar
            </SheetDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex items-center justify-center w-8 h-8 rounded-full text-chrome-muted hover:bg-chrome-text/10 transition-colors shrink-0"
          >
            <IoClose size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Question */}
        <p className="text-center text-chrome-text font-medium text-[15px] px-4 py-2">
          O que você achou da edição?
        </p>

        {/* Stars */}
        <div
          className="flex items-center justify-center gap-2 px-4 py-2"
          role="radiogroup"
          aria-label="Avaliação em estrelas"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={stars === n}
              aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
              onClick={() => setStars(n)}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              className="text-[32px] leading-none transition-transform duration-100 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-sm"
            >
              {n <= displayStars ? '★' : '☆'}
            </button>
          ))}
        </div>

        {displayStars > 0 && (
          <p className="text-center text-brand font-bold text-[14px] pb-1 transition-opacity duration-150">
            {STAR_LABELS[displayStars]}
          </p>
        )}

        {/* Impartiality */}
        <p className="text-center text-chrome-text font-medium text-[15px] px-4 pt-4 pb-2">
          A edição de hoje foi imparcial?
        </p>
        <div className="px-4 space-y-2" role="radiogroup" aria-label="Imparcialidade">
          {IMPARTIALITY_OPTIONS.map((opt) => {
            const selected = impartiality === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setImpartiality(opt.id)}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                  selected
                    ? 'border-[#16A34A] bg-[#16A34A]/10 text-[#16A34A]'
                    : 'border-chrome-divider bg-chrome-bg text-chrome-text hover:border-chrome-muted',
                )}
              >
                <span
                  className={cn(
                    'flex items-center justify-center w-6 h-6 rounded-full border-2 shrink-0 text-[12px] font-bold',
                    selected ? 'border-[#16A34A] bg-[#16A34A] text-white' : 'border-chrome-divider text-chrome-muted',
                  )}
                  aria-hidden="true"
                >
                  {selected ? '✓' : opt.icon}
                </span>
                <span className="text-[14px] font-medium">{opt.label}</span>
                {selected && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#16A34A]" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-4 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="text-chrome-muted text-[14px] font-medium hover:text-chrome-text transition-colors shrink-0"
          >
            Pular
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-[15px] transition-colors duration-150',
              canSubmit
                ? 'bg-brand text-[#0A0A0F] hover:bg-brand-dim'
                : 'bg-chrome-divider text-chrome-muted cursor-not-allowed',
            )}
          >
            {canSubmit ? (
              <>Enviar <IoArrowForward size={16} aria-hidden="true" /></>
            ) : (
              <>Selecione ★</>
            )}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/* ─── Continue sheet (post-rating) ────────────────────────────── */

type ContinueSheetProps = {
  open: boolean
  onClose: () => void
  onQuiz: () => void
}

export function ContinueSheet({ open, onClose, onQuiz }: ContinueSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="bg-chrome-surface border-t border-chrome-divider rounded-t-2xl px-0 pb-8"
        aria-describedby="continue-desc"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/20 shrink-0">
            <IoNewspaper size={20} className="text-brand" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <SheetTitle className="text-chrome-text font-bold text-[16px] leading-tight">
              Continue a conversa
            </SheetTitle>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex items-center justify-center w-8 h-8 rounded-full text-chrome-muted hover:bg-chrome-text/10 transition-colors shrink-0"
          >
            <IoClose size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-6 text-center">
          <span className="text-5xl mb-4 block" aria-hidden="true">💬</span>
          <p className="text-chrome-text font-bold text-[17px] mb-2">
            Que tal testar seus conhecimentos no quiz de hoje?
          </p>
          <SheetDescription id="continue-desc" className="text-chrome-muted text-[14px]">
            Ou clique para comentar o que você achou da edição
          </SheetDescription>
        </div>

        {/* Actions */}
        <div className="px-4 space-y-2">
          <button
            type="button"
            onClick={onQuiz}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-[#0A0A0F] font-bold text-[15px] hover:bg-brand-dim transition-colors"
          >
            <span aria-hidden="true">✦</span> Fazer o quiz
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-chrome-bg border border-chrome-divider text-chrome-muted text-[14px] font-medium hover:border-chrome-muted transition-colors"
            >
              Agora não
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-chrome-bg border border-chrome-divider text-chrome-text text-[14px] font-medium hover:border-chrome-muted transition-colors"
            >
              <IoChatbubble size={16} aria-hidden="true" /> Ver discussões
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
