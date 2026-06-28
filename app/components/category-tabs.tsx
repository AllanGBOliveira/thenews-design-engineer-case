import { useRef, useEffect, forwardRef } from 'react'
import { cn } from '~/lib/utils'
import { CATEGORIES, type Category } from '~/data/editions'

type CategoryTabsProps = {
  activeSlug: string
  onSelect: (slug: string) => void
}

const CategoryPill = forwardRef<HTMLButtonElement, {
  category: Category
  isActive: boolean
  onClick: () => void
}>(function CategoryPill({ category, isActive, onClick }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={category.label}
      className={cn(
        'flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full',
        'text-[13px] font-medium leading-none whitespace-nowrap',
        'transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        isActive
          ? 'text-[#0A0A0F]'
          : 'bg-transparent text-chrome-muted hover:text-chrome-text',
      )}
      style={isActive ? { backgroundColor: category.dotColor } : undefined}
    >
      <span
        aria-hidden="true"
        className={cn('w-2 h-2 rounded-full shrink-0', isActive ? 'bg-white/70' : '')}
        style={!isActive ? { backgroundColor: category.dotColor } : undefined}
      />
      {category.label}
    </button>
  )
})

export function CategoryTabs({ activeSlug, onSelect }: CategoryTabsProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const track = trackRef.current
    const active = activeRef.current
    if (!track || !active) return
    const trackRect = track.getBoundingClientRect()
    const btnRect = active.getBoundingClientRect()
    const scrollTarget = btnRect.left - trackRect.left + track.scrollLeft - 16
    track.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' })
  }, [activeSlug])

  return (
    <nav
      aria-label="Categorias de newsletter"
      className="sticky z-20 bg-chrome-bg border-b border-chrome-divider"
      style={{ top: 56 }}
    >
      <div
        ref={trackRef}
        role="list"
        className="flex items-center gap-1 py-2 px-4 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {CATEGORIES.map((cat) => {
          const isActive = cat.slug === activeSlug
          return (
            <div key={cat.slug} role="listitem">
              <CategoryPill
                ref={isActive ? activeRef : null}
                category={cat}
                isActive={isActive}
                onClick={() => onSelect(cat.slug)}
              />
            </div>
          )
        })}
      </div>
    </nav>
  )
}
