import { useState, useCallback, useEffect } from 'react'
import { IoSparkles, IoClose, IoCheckmark } from 'react-icons/io5'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { cn } from '~/lib/utils'
import { CATEGORIES } from '~/data/editions'

/* ─── Storage keys ───────────────────────────────────────────────────────── */

const INTERESTS_KEY = 'tnws-interests'
const INTERESTS_SET_KEY = 'tnws-interests-set'

/* ─── Persistence helpers ────────────────────────────────────────────────── */

export function loadInterests(): string[] {
  try {
    const raw = localStorage.getItem(INTERESTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveInterests(slugs: string[]): void {
  try {
    localStorage.setItem(INTERESTS_KEY, JSON.stringify(slugs))
    localStorage.setItem(INTERESTS_SET_KEY, '1')
  } catch {
    // storage unavailable — silently ignore
  }
}

export function hasSetInterests(): boolean {
  try {
    return Boolean(localStorage.getItem(INTERESTS_SET_KEY))
  } catch {
    return false
  }
}

/* ─── Category chip ──────────────────────────────────────────────────────── */

function CategoryChip({
  slug,
  label,
  dotColor,
  selected,
  onToggle,
}: {
  slug: string
  label: string
  dotColor: string
  selected: boolean
  onToggle: (slug: string) => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      aria-label={`${selected ? 'Remover' : 'Adicionar'} ${label}`}
      onClick={() => onToggle(slug)}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-[14px] font-semibold border transition-all duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-chrome-bg',
        selected
          ? 'text-white border-transparent shadow-sm'
          : 'text-chrome-text border-chrome-divider bg-chrome-surface hover:border-chrome-muted',
      )}
      style={selected ? { backgroundColor: dotColor, borderColor: dotColor } : undefined}
    >
      <span
        className={cn('w-2 h-2 rounded-full shrink-0', selected ? 'bg-white/70' : 'border border-chrome-muted')}
        style={!selected ? { backgroundColor: dotColor + '33', borderColor: dotColor } : undefined}
        aria-hidden="true"
      />
      {label}
      {selected && <IoCheckmark size={14} aria-hidden="true" />}
    </button>
  )
}

/* ─── Interests picker sheet ─────────────────────────────────────────────── */

type InterestsPickerProps = {
  open: boolean
  onClose: () => void
  onSave: (slugs: string[]) => void
  initialSlugs?: string[]
}

export function InterestsPicker({ open, onClose, onSave, initialSlugs = [] }: InterestsPickerProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSlugs))

  // Sync when sheet re-opens (user may have changed interests elsewhere)
  useEffect(() => {
    if (open) setSelected(new Set(initialSlugs))
  }, [open, initialSlugs.join(',')])

  const toggle = useCallback((slug: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      return next
    })
  }, [])

  function handleSelectAll() {
    setSelected(new Set(CATEGORIES.map((c) => c.slug)))
  }

  function handleClearAll() {
    setSelected(new Set())
  }

  function handleSave() {
    const slugs = Array.from(selected)
    saveInterests(slugs)
    onSave(slugs)
    onClose()
  }

  const allSelected = selected.size === CATEGORIES.length
  const noneSelected = selected.size === 0

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="bg-chrome-bg border-t border-chrome-divider rounded-t-2xl px-0 pb-8 max-h-[90dvh] flex flex-col"
        aria-describedby="interests-desc"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-4 pt-5 pb-3 shrink-0">
          <span
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand/20 shrink-0"
            aria-hidden="true"
          >
            <IoSparkles size={20} className="text-brand" />
          </span>
          <div className="flex-1">
            <SheetTitle className="text-chrome-text font-bold text-[17px] leading-tight">
              O que você gosta de ler?
            </SheetTitle>
            <SheetDescription id="interests-desc" className="text-chrome-muted text-[13px] mt-0.5">
              Escolha seus temas favoritos para filtrar o feed
            </SheetDescription>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex items-center justify-center w-8 h-8 rounded-full text-chrome-muted hover:bg-chrome-text/10 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <IoClose size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Select/clear all */}
        <div className="flex items-center gap-3 px-4 pb-3 shrink-0">
          <button
            type="button"
            onClick={allSelected ? handleClearAll : handleSelectAll}
            className="text-[13px] font-semibold text-brand hover:text-brand-dim transition-colors focus-visible:outline-none focus-visible:underline"
          >
            {allSelected ? 'Limpar tudo' : 'Selecionar tudo'}
          </button>
          <span className="text-chrome-muted text-[13px]" aria-live="polite">
            {selected.size} de {CATEGORIES.length} selecionados
          </span>
        </div>

        {/* Chips grid */}
        <div
          className="flex-1 overflow-y-auto px-4 pb-4"
          role="group"
          aria-label="Categorias de interesse"
        >
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <CategoryChip
                key={cat.slug}
                slug={cat.slug}
                label={cat.label}
                dotColor={cat.dotColor}
                selected={selected.has(cat.slug)}
                onToggle={toggle}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pt-3 shrink-0 border-t border-chrome-divider">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl bg-brand text-[#0A0A0F] font-bold text-[15px] hover:bg-brand-dim transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {noneSelected ? 'Ver todas as edições' : `Ver feed personalizado (${selected.size})`}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
