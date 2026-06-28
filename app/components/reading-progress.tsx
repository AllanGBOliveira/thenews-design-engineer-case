import { useState, useEffect, useCallback } from 'react'
import { IoDocumentText, IoTime, IoChevronUp, IoChevronDown, IoCheckmarkCircle } from 'react-icons/io5'
import { cn } from '~/lib/utils'

type ReadingProgressProps = {
  contentRef: React.RefObject<HTMLElement | null>
  onComplete?: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

function getScrollContainer(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null
  const parent = el.parentElement
  if (!parent) return null
  const style = getComputedStyle(parent)
  if (/(auto|scroll)/.test(style.overflow + style.overflowY)) return parent
  return getScrollContainer(parent)
}

export function ReadingProgress({ contentRef, onComplete }: ReadingProgressProps) {
  const [percent, setPercent] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const [completed, setCompleted] = useState(false)

  /* Scroll-based percentage — tracks nearest scrollable ancestor */
  const handleScroll = useCallback(() => {
    const content = contentRef.current
    if (!content) return
    const container = getScrollContainer(content)
    const scrollTop = container ? container.scrollTop : window.scrollY
    const scrollHeight = container
      ? container.scrollHeight - container.clientHeight
      : document.documentElement.scrollHeight - window.innerHeight
    if (scrollHeight <= 0) return
    const pct = Math.round((Math.min(scrollTop, scrollHeight) / scrollHeight) * 100)
    setPercent(pct)
    if (pct >= 100 && !completed) {
      setCompleted(true)
      onComplete?.()
    }
  }, [contentRef, completed, onComplete])

  useEffect(() => {
    const content = contentRef.current
    const container = content ? getScrollContainer(content) : null
    const target = container ?? window
    target.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => target.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  /* Reading timer */
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((s) => s + 1)
    }, 1000)

    const handleVisibility = () => {
      if (document.hidden) clearInterval(id)
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const dotPosition = `${Math.min(percent, 100)}%`

  return (
    <div
      className="sticky z-10 bg-chrome-bg border-b border-chrome-divider"
      style={{ top: 56 + 44 }}
      aria-label={`Progresso de leitura: ${percent}%`}
      role="status"
      aria-live="off"
    >
      {collapsed ? (
        /* Collapsed state — thin track only */
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="relative flex-1 h-1 bg-chrome-divider rounded-full overflow-visible">
            <div
              className="absolute top-0 left-0 h-1 bg-brand rounded-full transition-all duration-300"
              style={{ width: dotPosition }}
            />
            {/* Dot / checkmark */}
            {completed ? (
              <IoCheckmarkCircle
                size={14}
                className="absolute -top-[6px] text-[#16A34A] transition-all duration-300"
                style={{ left: `calc(${dotPosition} - 7px)` }}
                aria-hidden="true"
              />
            ) : (
              <span
                className="absolute -top-[4px] w-3 h-3 bg-brand rounded-full border-2 border-chrome-bg transition-all duration-300"
                style={{ left: `calc(${dotPosition} - 6px)` }}
                aria-hidden="true"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expandir barra de progresso"
            className="shrink-0 text-chrome-muted hover:text-chrome-text focus-visible:outline-none"
          >
            <IoChevronDown size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        /* Expanded state */
        <div className="flex items-center gap-2 px-4 py-2">
          {/* Leitura % */}
          <span className="flex items-center gap-1 shrink-0 text-[12px] text-chrome-muted">
            <IoDocumentText size={14} aria-hidden="true" />
            <span className="font-medium text-chrome-text">Leitura</span>
            <span className="font-bold text-chrome-text">{percent}%</span>
          </span>

          <span className="text-chrome-divider text-[12px] shrink-0">|</span>

          {/* Tempo */}
          <span className="flex items-center gap-1 shrink-0 text-[12px] text-chrome-muted">
            <IoTime size={14} aria-hidden="true" />
            <span className="font-medium text-chrome-text">Tempo</span>
            <span className="font-bold text-chrome-text">{formatTime(elapsed)}</span>
          </span>

          {/* Progress track */}
          <div className="relative flex-1 h-1 bg-chrome-divider rounded-full overflow-visible mx-1">
            <div
              className="absolute top-0 left-0 h-1 bg-brand rounded-full transition-all duration-300"
              style={{ width: dotPosition }}
            />
            {completed ? (
              <IoCheckmarkCircle
                size={14}
                className="absolute -top-[6px] text-[#16A34A] transition-all duration-300"
                style={{ left: `calc(${dotPosition} - 7px)` }}
                aria-hidden="true"
              />
            ) : (
              <span
                className="absolute -top-[4px] w-3 h-3 bg-brand rounded-full border-2 border-chrome-bg transition-all duration-300"
                style={{ left: `calc(${dotPosition} - 6px)` }}
                aria-hidden="true"
              />
            )}
          </div>

          {/* Collapse button */}
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Recolher barra de progresso"
            className={cn(
              'shrink-0 text-chrome-muted hover:text-chrome-text focus-visible:outline-none',
            )}
          >
            <IoChevronUp size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
