import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRevalidator } from 'react-router'
import { cn } from '~/lib/utils'

/* ─── Data ───────────────────────────────────────────────────────── */

const FLAG_API = 'https://flagsapi.com'

type LocaleDef = {
  code: string
  label: string          // native language name
  countryCode: string    // ISO 3166-1 alpha-2 for flagsapi.com
}

const LOCALES: LocaleDef[] = [
  { code: 'pt-BR', label: 'Português',  countryCode: 'BR' },
  { code: 'en-US', label: 'English',    countryCode: 'US' },
  { code: 'es-ES', label: 'Español',    countryCode: 'ES' },
  { code: 'ar-SA', label: 'العربية',   countryCode: 'SA' },
]

function flagSrc(countryCode: string) {
  return `${FLAG_API}/${countryCode}/flat/32.png`
}

/* ─── Component ──────────────────────────────────────────────────── */

export function LanguageSelect() {
  const { i18n } = useTranslation()
  const { revalidate } = useRevalidator()
  const [open, setOpen] = useState(false)
  const [focusedIdx, setFocusedIdx] = useState(0)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])

  const currentLocale = LOCALES.find(l => l.code === i18n.language) ?? LOCALES[0]
  const currentIdx = LOCALES.findIndex(l => l.code === i18n.language)

  /* Open → move focus to selected option */
  useEffect(() => {
    if (open) {
      const startIdx = currentIdx >= 0 ? currentIdx : 0
      setFocusedIdx(startIdx)
      // defer one tick so the list is in the DOM
      requestAnimationFrame(() => optionRefs.current[startIdx]?.focus())
    }
  }, [open, currentIdx])

  /* Close on outside click */
  useEffect(() => {
    if (!open) return
    function handlePointer(e: PointerEvent) {
      const target = e.target as Node
      if (
        !triggerRef.current?.contains(target) &&
        !listboxRef.current?.contains(target)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointer)
    return () => document.removeEventListener('pointerdown', handlePointer)
  }, [open])

  /* Escape closes and returns focus to trigger */
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  const selectLocale = useCallback(async (code: string) => {
    setOpen(false)
    triggerRef.current?.focus()
    if (code === i18n.language) return
    await i18n.changeLanguage(code)
    revalidate()
  }, [i18n, revalidate])

  /* Arrow-key navigation inside listbox */
  function handleListKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (focusedIdx + 1) % LOCALES.length
      setFocusedIdx(next)
      optionRefs.current[next]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = (focusedIdx - 1 + LOCALES.length) % LOCALES.length
      setFocusedIdx(prev)
      optionRefs.current[prev]?.focus()
    } else if (e.key === 'Home') {
      e.preventDefault()
      setFocusedIdx(0)
      optionRefs.current[0]?.focus()
    } else if (e.key === 'End') {
      e.preventDefault()
      const last = LOCALES.length - 1
      setFocusedIdx(last)
      optionRefs.current[last]?.focus()
    }
  }

  const listboxId = 'language-listbox'

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        id="language-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={`Idioma: ${currentLocale.label}. Alterar idioma`}
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-full transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          open
            ? 'bg-brand/15 ring-1 ring-brand/40'
            : 'hover:bg-white/5',
        )}
      >
        <img
          src={flagSrc(currentLocale.countryCode)}
          alt={currentLocale.label}
          width={20}
          height={20}
          className="w-5 h-5 rounded-sm object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
        />
      </button>

      {/* Dropdown listbox */}
      {open && (
        <ul
          ref={listboxRef}
          id={listboxId}
          role="listbox"
          aria-label="Selecionar idioma"
          aria-labelledby="language-trigger"
          aria-activedescendant={`lang-opt-${LOCALES[focusedIdx]?.code}`}
          onKeyDown={handleListKeyDown}
          className={cn(
            'absolute top-full right-0 mt-2 z-50 min-w-[160px]',
            'bg-chrome-surface border border-chrome-border rounded-xl overflow-hidden shadow-lg',
            'list-none m-0 p-1',
          )}
        >
          {LOCALES.map((locale, idx) => {
            const isSelected = locale.code === i18n.language
            const isFocused = idx === focusedIdx
            return (
              <li
                key={locale.code}
                id={`lang-opt-${locale.code}`}
                ref={el => { optionRefs.current[idx] = el }}
                role="option"
                aria-selected={isSelected}
                tabIndex={isFocused ? 0 : -1}
                onClick={() => selectLocale(locale.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    selectLocale(locale.code)
                  }
                }}
                onFocus={() => setFocusedIdx(idx)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer',
                  'transition-colors duration-100',
                  'focus-visible:outline-none',
                  isSelected
                    ? 'bg-brand/15 text-brand'
                    : 'text-chrome-text hover:bg-white/5 focus:bg-white/5',
                )}
              >
                <img
                  src={flagSrc(locale.countryCode)}
                  alt=""
                  aria-hidden="true"
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-sm object-cover shrink-0"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <span className="text-[13px] font-medium leading-none">
                  {locale.label}
                </span>
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand shrink-0"
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
