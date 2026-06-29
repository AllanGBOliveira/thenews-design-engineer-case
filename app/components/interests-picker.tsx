import { useState, useCallback, useEffect } from 'react'
import { IoNewspaper, IoClose, IoCheckmark, IoPricetag, IoCalendarOutline, IoLockOpenOutline } from 'react-icons/io5'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '~/components/ui/sheet'
import { cn } from '~/lib/utils'
import { CATEGORIES } from '~/data/editions'

/* ─── Period options (single-select date range presets) ──────────────────── */

export const PERIOD_OPTIONS = [
  { value: 'today',   label: 'Hoje' },
  { value: 'week',    label: 'Esta semana' },
  { value: 'month',   label: 'Este mês' },
  { value: '3months', label: 'Últimos 3 meses' },
  { value: 'year',    label: 'Este ano' },
] as const

export type PeriodValue = (typeof PERIOD_OPTIONS)[number]['value']

export const PERIOD_LABELS: Record<string, string> = Object.fromEntries(
  PERIOD_OPTIONS.map((o) => [o.value, o.label]),
)

/* ─── Known content tag groups ───────────────────────────────────────────────
   Derived from observed API responses. Tags are editorial — inconsistently
   applied by editors, but the known ones cluster into these themes.
──────────────────────────────────────────────────────────────────────────── */

export const CONTENT_TAGS = [
  'música',
  'leitura',
  'cinema',
  'cultura',
  'poesia',
  'economia real',
  'commodities',
  'at night',
] as const

/* ─── Generic chip ───────────────────────────────────────────────────────── */

function Chip({
  label,
  selected,
  color,
  onToggle,
}: {
  label: string
  selected: boolean
  color?: string
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold border transition-all duration-150 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-chrome-bg',
        selected
          ? 'text-white border-transparent'
          : 'text-chrome-text border-chrome-divider bg-chrome-surface hover:border-chrome-muted',
      )}
      style={
        selected
          ? { backgroundColor: color ?? 'var(--brand)', borderColor: color ?? 'var(--brand)' }
          : undefined
      }
    >
      {selected && <IoCheckmark size={12} aria-hidden="true" />}
      {label}
    </button>
  )
}

/* ─── Section header ─────────────────────────────────────────────────────── */

function SectionHead({ icon, title, count, total, onSelectAll, onClearAll }: {
  icon: React.ReactNode
  title: string
  count: number
  total: number
  onSelectAll: () => void
  onClearAll: () => void
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-chrome-muted" aria-hidden="true">{icon}</span>
      <span className="text-chrome-text font-bold text-[14px] flex-1">{title}</span>
      <span className="text-chrome-muted text-[12px]">{count}/{total}</span>
      <button
        type="button"
        onClick={count === total ? onClearAll : onSelectAll}
        className="text-[12px] font-semibold text-brand hover:text-brand-dim transition-colors focus-visible:outline-none focus-visible:underline"
      >
        {count === total ? 'limpar' : 'todos'}
      </button>
    </div>
  )
}

/* ─── Interests picker sheet ─────────────────────────────────────────────── */

type InterestsPickerProps = {
  open: boolean
  onClose: () => void
  onSave: (interests: string[], tags: string[], period: string | undefined, audience: string | undefined) => void
  initialInterests?: string[]
  initialTags?: string[]
  initialPeriod?: string
  initialAudience?: string
}

export function InterestsPicker({
  open,
  onClose,
  onSave,
  initialInterests = [],
  initialTags = [],
  initialPeriod,
  initialAudience,
}: InterestsPickerProps) {
  const [interests, setInterests] = useState<Set<string>>(new Set(initialInterests))
  const [tags, setTags] = useState<Set<string>>(new Set(initialTags))
  const [period, setPeriod] = useState<string | undefined>(initialPeriod)
  const [audience, setAudience] = useState<string | undefined>(initialAudience)

  useEffect(() => {
    if (open) {
      setInterests(new Set(initialInterests))
      setTags(new Set(initialTags))
      setPeriod(initialPeriod)
      setAudience(initialAudience)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const toggleInterest = useCallback((slug: string) => {
    setInterests((prev) => {
      const next = new Set(prev)
      next.has(slug) ? next.delete(slug) : next.add(slug)
      return next
    })
  }, [])

  const toggleTag = useCallback((tag: string) => {
    setTags((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }, [])

  function handleSave() {
    onSave(Array.from(interests), Array.from(tags), period, audience)
    onClose()
  }

  function handleClearAll() {
    setInterests(new Set())
    setTags(new Set())
    setPeriod(undefined)
    setAudience(undefined)
  }

  const totalSelected = interests.size + tags.size + (period ? 1 : 0) + (audience ? 1 : 0)

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="bg-chrome-bg border-t border-chrome-divider rounded-t-2xl px-0 pb-8 max-h-[92dvh] flex flex-col"
        aria-describedby="picker-desc"
      >
        {/* Header */}
        <div className="flex items-start gap-3 px-4 pt-5 pb-2 shrink-0">
          <div className="flex-1">
            <SheetTitle className="text-chrome-text font-bold text-[17px] leading-tight">
              Filtrar feed
            </SheetTitle>
            <SheetDescription id="picker-desc" className="text-chrome-muted text-[13px] mt-0.5">
              Escolha newsletters e categorias de interesse
            </SheetDescription>
          </div>
          <div className="flex items-center gap-2">
            {totalSelected > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[13px] text-chrome-muted hover:text-chrome-text transition-colors"
              >
                limpar tudo
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="flex items-center justify-center w-8 h-8 rounded-full text-chrome-muted hover:bg-chrome-text/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <IoClose size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-5">
          {/* ── Newsletters ──────────────────────────────────────────────── */}
          <section aria-label="Filtrar por newsletter">
            <SectionHead
              icon={<IoNewspaper size={15} />}
              title="Newsletters"
              count={interests.size}
              total={CATEGORIES.length}
              onSelectAll={() => setInterests(new Set(CATEGORIES.map((c) => c.slug)))}
              onClearAll={() => setInterests(new Set())}
            />
            <div className="flex flex-wrap gap-2" role="group" aria-label="Newsletters">
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat.slug}
                  label={cat.label}
                  selected={interests.has(cat.slug)}
                  color={cat.dotColor}
                  onToggle={() => toggleInterest(cat.slug)}
                />
              ))}
            </div>
          </section>

          {/* ── Period (single-select date range) ────────────────────────── */}
          <section aria-label="Filtrar por período">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-chrome-muted" aria-hidden="true">
                <IoCalendarOutline size={15} />
              </span>
              <span className="text-chrome-text font-bold text-[14px] flex-1">Período</span>
              {period && (
                <button
                  type="button"
                  onClick={() => setPeriod(undefined)}
                  className="text-[12px] font-semibold text-brand hover:text-brand-dim transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  limpar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Período">
              {PERIOD_OPTIONS.map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={period === opt.value}
                  color="#6366F1"
                  onToggle={() => setPeriod((prev) => (prev === opt.value ? undefined : opt.value))}
                />
              ))}
            </div>
          </section>

          {/* ── Audience (single-select: free / premium) ──────────────────── */}
          <section aria-label="Filtrar por acesso">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-chrome-muted" aria-hidden="true">
                <IoLockOpenOutline size={15} />
              </span>
              <span className="text-chrome-text font-bold text-[14px] flex-1">Acesso</span>
              {audience && (
                <button
                  type="button"
                  onClick={() => setAudience(undefined)}
                  className="text-[12px] font-semibold text-brand hover:text-brand-dim transition-colors focus-visible:outline-none focus-visible:underline"
                >
                  limpar
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Acesso">
              <Chip
                label="Gratuito"
                selected={audience === 'free'}
                color="#16A34A"
                onToggle={() => setAudience((prev) => (prev === 'free' ? undefined : 'free'))}
              />
              <Chip
                label="Premium"
                selected={audience === 'premium'}
                color="#0891B2"
                onToggle={() => setAudience((prev) => (prev === 'premium' ? undefined : 'premium'))}
              />
            </div>
          </section>

          {/* ── Content categories (tags) ──────────────────────────────── */}
          <section aria-label="Filtrar por categoria">
            <SectionHead
              icon={<IoPricetag size={15} />}
              title="Categorias"
              count={tags.size}
              total={CONTENT_TAGS.length}
              onSelectAll={() => setTags(new Set(CONTENT_TAGS))}
              onClearAll={() => setTags(new Set())}
            />
            <p className="text-chrome-muted text-[11px] mb-2 leading-relaxed">
              Tags editoriais dos posts — nem todas as edições têm categorias definidas.
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Categorias">
              {CONTENT_TAGS.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={tags.has(tag)}
                  color="#475569"
                  onToggle={() => toggleTag(tag)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-4 pt-3 shrink-0 border-t border-chrome-divider">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl bg-brand text-[#0A0A0F] font-bold text-[15px] hover:bg-brand-dim transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {totalSelected === 0
              ? 'Ver todas as edições'
              : `Aplicar ${totalSelected} filtro${totalSelected > 1 ? 's' : ''}`}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
