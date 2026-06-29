import { useState, useRef, useMemo, useCallback } from 'react'
import { useLoaderData, useSearchParams } from 'react-router'
import { IoOptions, IoClose, IoChevronBack, IoChevronForward, IoSearch } from 'react-icons/io5'
import type { Route } from './+types/home'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { EditionCard, EditionCardSkeleton } from '~/components/edition-card'
import { InterestsPicker, PERIOD_LABELS } from '~/components/interests-picker'
import { fetchEditionsList, categorySlugFromCaderno, parseEditionTags, PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE, type PageSize } from '~/data/api'
import { getCategory } from '~/data/editions'

/* ─── Meta ───────────────────────────────────────────────────────────────── */

export function meta() {
  return [
    { title: 'Feed — the news' },
    { name: 'description', content: 'Todas as edições do the news — seu feed personalizado' },
  ]
}

/* ─── Loader — reads only API params (q, page) ───────────────────────────── */

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1)
  const q = url.searchParams.get('q') ?? ''
  const limitParam = parseInt(url.searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10)
  const limit = (PAGE_SIZE_OPTIONS.includes(limitParam as PageSize) ? limitParam : DEFAULT_PAGE_SIZE) as PageSize
  const { editions, pagination } = await fetchEditionsList({ page, search: q.trim(), limit })
  return { editions, pagination, page, q, limit }
}

/* ─── Sort options ───────────────────────────────────────────────────────── */

type SortKey = 'newest' | 'views' | 'likes' | 'comments'

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Mais recentes',
  views: 'Mais lidos',
  likes: 'Mais curtidos',
  comments: 'Mais comentados',
}

/* ─── URL state helpers (following ao.dev pattern) ───────────────────────── */

function useUrlFilters() {
  const [params, setParams] = useSearchParams()

  const q = params.get('q') ?? ''
  const sort = (params.get('sort') ?? 'newest') as SortKey
  const activeTags = (params.get('tags') ?? '').split(',').filter(Boolean)
  const activeInterests = (params.get('interests') ?? '').split(',').filter(Boolean)
  const activePeriod = params.get('period') ?? undefined
  const activeAudience = params.get('audience') ?? undefined
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1)

  // Single filter change — replace history (don't pollute stack)
  const setFilter = useCallback(
    (key: string, value: string | undefined) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (value) next.set(key, value)
          else next.delete(key)
          next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  // Multiple filter changes in one atomic URL update (avoids race on double setParams)
  const setFilters = useCallback(
    (patch: Record<string, string | undefined>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(patch)) {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          next.delete('page')
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const limit = (PAGE_SIZE_OPTIONS.includes(
    parseInt(params.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10) as PageSize,
  )
    ? parseInt(params.get('limit') ?? String(DEFAULT_PAGE_SIZE), 10)
    : DEFAULT_PAGE_SIZE) as PageSize

  // Page changes — push history (enables browser back)
  const goToPage = useCallback(
    (n: number) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (n > 1) next.set('page', String(n))
        else next.delete('page')
        return next
      })
      document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'instant' })
    },
    [setParams],
  )

  // Limit change resets to page 1
  const setLimit = useCallback(
    (n: PageSize) => {
      setParams((prev) => {
        const next = new URLSearchParams(prev)
        if (n !== DEFAULT_PAGE_SIZE) next.set('limit', String(n))
        else next.delete('limit')
        next.delete('page')
        return next
      }, { replace: true })
    },
    [setParams],
  )

  const clearFilters = useCallback(() => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('q')
      next.delete('sort')
      next.delete('tags')
      next.delete('interests')
      next.delete('period')
      next.delete('audience')
      next.delete('page')
      // limit is intentionally preserved — it's a display preference, not a filter
      return next
    }, { replace: true })
  }, [setParams])

  const hasClientFilters =
    activeTags.length > 0 || activeInterests.length > 0 || !!activePeriod || !!activeAudience

  return { q, sort, activeTags, activeInterests, activePeriod, activeAudience, page, limit, setFilter, setFilters, setLimit, goToPage, clearFilters, hasClientFilters }
}

/* ─── Search input (debounced URL update) ────────────────────────────────── */

function SearchInput({ q, setFilter }: { q: string; setFilter: (k: string, v: string | undefined) => void }) {
  const [value, setValue] = useState(q)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync when URL changes externally (e.g. clearFilters)
  const prevQ = useRef(q)
  if (prevQ.current !== q && value !== q) {
    prevQ.current = q
    setValue(q)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setValue(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setFilter('q', v.trim() || undefined)
    }, 400)
  }

  function handleClear() {
    setValue('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setFilter('q', undefined)
  }

  return (
    <div className="relative flex-1 min-w-0">
      <IoSearch
        size={15}
        className="absolute start-3 top-1/2 -translate-y-1/2 text-chrome-muted pointer-events-none"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder="Buscar edições..."
        value={value}
        onChange={handleChange}
        className="h-9 ps-8 pe-8 text-[14px] bg-chrome-surface border-chrome-divider text-chrome-text placeholder:text-chrome-muted focus-visible:ring-brand rounded-xl"
        aria-label="Buscar edições"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Limpar busca"
          className="absolute end-2 top-1/2 -translate-y-1/2 text-chrome-muted hover:text-chrome-text"
        >
          <IoClose size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

/* ─── Toolbar ────────────────────────────────────────────────────────────── */

const AUDIENCE_LABELS: Record<string, string> = {
  free: 'Gratuito',
  premium: 'Premium',
}

function Toolbar({
  q,
  sort,
  activeTags,
  activeInterests,
  activePeriod,
  activeAudience,
  limit,
  setFilter,
  setFilters,
  setLimit,
  onOpenPicker,
}: {
  q: string
  sort: SortKey
  activeTags: string[]
  activeInterests: string[]
  activePeriod: string | undefined
  activeAudience: string | undefined
  limit: PageSize
  setFilter: (k: string, v: string | undefined) => void
  setFilters: (patch: Record<string, string | undefined>) => void
  setLimit: (n: PageSize) => void
  onOpenPicker: () => void
}) {
  const totalActive =
    activeTags.length + activeInterests.length + (activePeriod ? 1 : 0) + (activeAudience ? 1 : 0)

  function removeTag(tag: string) {
    const next = activeTags.filter((t) => t !== tag)
    setFilter('tags', next.length ? next.join(',') : undefined)
  }

  function removeInterest(slug: string) {
    const next = activeInterests.filter((s) => s !== slug)
    setFilter('interests', next.length ? next.join(',') : undefined)
  }

  function clearAll() {
    setFilters({ interests: undefined, tags: undefined, period: undefined, audience: undefined })
  }

  return (
    <div className="sticky top-0 z-10 bg-chrome-bg border-b border-chrome-divider">
      {/* Main row: search → per-page → sort → filter */}
      <div className="flex items-center gap-2 px-3 py-2">
        <SearchInput q={q} setFilter={setFilter} />

        <PerPageSelect limit={limit} setLimit={setLimit} />

        <Select
          value={sort}
          onValueChange={(v) => setFilter('sort', v === 'newest' ? undefined : v)}
        >
          <SelectTrigger
            className="h-9 w-auto min-w-[108px] shrink-0 text-[12px] bg-chrome-surface border-chrome-divider text-chrome-text rounded-xl gap-1 focus:ring-brand"
            aria-label="Ordenar edições"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-chrome-surface border-chrome-divider text-chrome-text">
            {(Object.entries(SORT_LABELS) as [SortKey, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-[13px] focus:bg-brand/10">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={onOpenPicker}
          aria-label={totalActive ? `${totalActive} filtros ativos` : 'Filtrar feed'}
          className="relative flex items-center justify-center w-9 h-9 shrink-0 rounded-xl bg-chrome-surface border border-chrome-divider text-chrome-text hover:border-chrome-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <IoOptions size={18} aria-hidden="true" />
          {totalActive > 0 && (
            <span
              className="absolute -top-1 -end-1 flex items-center justify-center w-4 h-4 rounded-full bg-brand text-[#0A0A0F] font-bold text-[9px] leading-none"
              aria-hidden="true"
            >
              {totalActive}
            </span>
          )}
        </button>
      </div>

      {/* Active filters strip — shown only when something is active */}
      {totalActive > 0 && (
        <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-none" aria-label="Filtros ativos">
          {activeInterests.map((slug) => {
            const cat = getCategory(slug)
            if (!cat) return null
            return (
              <button
                key={slug}
                type="button"
                onClick={() => removeInterest(slug)}
                aria-label={`Remover newsletter ${cat.label}`}
                className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold text-white leading-none hover:opacity-80 transition-opacity"
                style={{ backgroundColor: cat.dotColor }}
              >
                {cat.label} <IoClose size={9} aria-hidden="true" />
              </button>
            )
          })}
          {activeTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remover categoria ${tag}`}
              className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold leading-none hover:opacity-80 transition-opacity text-white"
              style={{ backgroundColor: '#475569' }}
            >
              {tag} <IoClose size={9} aria-hidden="true" />
            </button>
          ))}
          {activePeriod && (
            <button
              type="button"
              onClick={() => setFilter('period', undefined)}
              aria-label={`Remover filtro de período: ${PERIOD_LABELS[activePeriod]}`}
              className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium leading-none hover:opacity-80 transition-opacity text-white"
              style={{ backgroundColor: '#6366F1' }}
            >
              {PERIOD_LABELS[activePeriod] ?? activePeriod} <IoClose size={9} aria-hidden="true" />
            </button>
          )}
          {activeAudience && (
            <button
              type="button"
              onClick={() => setFilter('audience', undefined)}
              aria-label={`Remover filtro de acesso: ${AUDIENCE_LABELS[activeAudience]}`}
              className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium leading-none hover:opacity-80 transition-opacity text-white"
              style={{ backgroundColor: '#0891B2' }}
            >
              {AUDIENCE_LABELS[activeAudience] ?? activeAudience} <IoClose size={9} aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-chrome-muted hover:text-chrome-text transition-colors shrink-0"
          >
            <IoClose size={10} aria-hidden="true" /> limpar tudo
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Per-page selector ──────────────────────────────────────────────────── */

function PerPageSelect({ limit, setLimit }: { limit: PageSize; setLimit: (n: PageSize) => void }) {
  return (
    <Select
      value={String(limit)}
      onValueChange={(v) => setLimit(Number(v) as PageSize)}
    >
      <SelectTrigger
        className="h-9 w-[68px] shrink-0 text-[12px] bg-chrome-surface border-chrome-divider text-chrome-text rounded-xl gap-1 focus:ring-brand"
        aria-label="Itens por página"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-chrome-surface border-chrome-divider text-chrome-text">
        {PAGE_SIZE_OPTIONS.map((n) => (
          <SelectItem key={n} value={String(n)} className="text-[13px] focus:bg-brand/10">
            {n} / pág
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/* ─── Empty state ────────────────────────────────────────────────────────── */

function EmptyState({
  q,
  hasFilters,
  onClear,
}: {
  q: string
  hasFilters: boolean
  onClear: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-8 text-center gap-4">
      <span className="text-5xl" aria-hidden="true">🔍</span>
      <p className="text-chrome-text font-bold text-[17px]">
        {q ? `Nenhum resultado para "${q}"` : 'Nenhuma edição encontrada'}
      </p>
      <p className="text-chrome-muted text-[14px]">
        {q ? 'Tente palavras-chave diferentes' : 'Ajuste os filtros e tente novamente'}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="px-5 py-2.5 rounded-xl border border-chrome-divider bg-chrome-surface text-chrome-text text-[14px] font-medium hover:border-chrome-muted transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}

/* ─── Pagination ─────────────────────────────────────────────────────────── */

function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (n: number) => void }) {
  if (totalPages <= 1) return null

  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, start + 4)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  function btnCls(active: boolean) {
    return [
      'flex items-center justify-center w-9 h-9 rounded-xl text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
      active
        ? 'bg-brand text-[#0A0A0F] border border-brand'
        : 'border border-chrome-divider bg-chrome-surface text-chrome-text hover:border-chrome-muted',
    ].join(' ')
  }

  return (
    <nav className="flex items-center justify-center gap-1 px-4 py-6" aria-label="Paginação">
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className={btnCls(false) + ' disabled:opacity-40 disabled:cursor-not-allowed'}
      >
        <IoChevronBack size={15} aria-hidden="true" />
      </button>

      {start > 1 && (
        <>
          <button type="button" onClick={() => onPage(1)} className={btnCls(false)}>1</button>
          {start > 2 && <span className="text-chrome-muted text-[13px] px-0.5">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPage(p)}
          aria-current={p === page ? 'page' : undefined}
          className={btnCls(p === page)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-chrome-muted text-[13px] px-0.5">…</span>}
          <button type="button" onClick={() => onPage(totalPages)} className={btnCls(false)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Próxima página"
        className={btnCls(false) + ' disabled:opacity-40 disabled:cursor-not-allowed'}
      >
        <IoChevronForward size={15} aria-hidden="true" />
      </button>
    </nav>
  )
}

/* ─── Home ───────────────────────────────────────────────────────────────── */

/* ─── Period date cutoff ─────────────────────────────────────────────────── */

function getPeriodCutoff(period: string): Date | null {
  const now = new Date()
  switch (period) {
    case 'today':   return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    case 'week':    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case 'month':   return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case '3months': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case 'year':    return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    default:        return null
  }
}

/* ─── Home ───────────────────────────────────────────────────────────────── */

export default function Home() {
  const { editions, pagination } = useLoaderData<typeof loader>()
  const { q, sort, activeTags, activeInterests, activePeriod, activeAudience, page, limit, setFilter, setFilters, setLimit, goToPage, clearFilters, hasClientFilters } =
    useUrlFilters()

  const [pickerOpen, setPickerOpen] = useState(false)

  // Client-side sort + filter applied to current API page
  const displayed = useMemo(() => {
    let list = editions

    if (activeInterests.length > 0) {
      const set = new Set(activeInterests)
      list = list.filter((e) => set.has(categorySlugFromCaderno(e.cadernoId)))
    }

    if (activeTags.length > 0) {
      const set = new Set(activeTags)
      list = list.filter((e) => parseEditionTags(e.contentTags).some((t) => set.has(t)))
    }

    if (activePeriod) {
      const cutoff = getPeriodCutoff(activePeriod)
      if (cutoff) {
        list = list.filter((e) => {
          if (!e.publishDate) return true
          return new Date(e.publishDate + 'T12:00:00') >= cutoff
        })
      }
    }

    if (activeAudience === 'free' || activeAudience === 'premium') {
      list = list.filter((e) => e.audience === activeAudience)
    }

    if (sort === 'views') return [...list].sort((a, b) => b.viewsCount - a.viewsCount)
    if (sort === 'likes') return [...list].sort((a, b) => b.likesCount - a.likesCount)
    if (sort === 'comments') return [...list].sort((a, b) => b.commentsCount - a.commentsCount)
    return list
  }, [editions, activeInterests, activeTags, activePeriod, activeAudience, sort])

  const hasAnyFilter = !!(q || hasClientFilters)

  return (
    <>
      {/* Filter picker (newsletters + period + content categories) */}
      <InterestsPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={(interests, tags, period, audience) =>
          setFilters({
            interests: interests.length ? interests.join(',') : undefined,
            tags: tags.length ? tags.join(',') : undefined,
            period: period ?? undefined,
            audience: audience ?? undefined,
          })
        }
        initialInterests={activeInterests}
        initialTags={activeTags}
        initialPeriod={activePeriod}
        initialAudience={activeAudience}
      />

      {/* Sticky toolbar */}
      <Toolbar
        q={q}
        sort={sort}
        activeTags={activeTags}
        activeInterests={activeInterests}
        activePeriod={activePeriod}
        activeAudience={activeAudience}
        limit={limit}
        setFilter={setFilter}
        setFilters={setFilters}
        setLimit={setLimit}
        onOpenPicker={() => setPickerOpen(true)}
      />

      {/* Feed */}
      <div className="px-3 sm:px-4 pb-4">
        {/* Page heading */}
        <div className="py-4 pb-3">
          <h1 className="text-chrome-text font-black text-[22px] leading-none">seu feed</h1>
          <p className="text-chrome-muted text-[13px] mt-1">
            {hasClientFilters
              ? `${displayed.length} de ${editions.length} nesta página`
              : pagination.total > 0
                ? `${pagination.total.toLocaleString('pt-BR')} edições`
                : q
                  ? 'nenhum resultado'
                  : '…'}
            {activeInterests.length > 0 &&
              ` · ${activeInterests.length} newsletter${activeInterests.length > 1 ? 's' : ''}`}
            {activeTags.length > 0 && ` · ${activeTags.length} tag${activeTags.length > 1 ? 's' : ''}`}
            {activePeriod && ` · ${PERIOD_LABELS[activePeriod] ?? activePeriod}`}
            {activeAudience && ` · ${AUDIENCE_LABELS[activeAudience] ?? activeAudience}`}
          </p>
        </div>

        {displayed.length === 0 ? (
          <EmptyState q={q} hasFilters={hasAnyFilter} onClear={clearFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayed.map((edition, idx) => (
                <EditionCard
                  key={edition.id}
                  edition={edition}
                  // displayed is newest-first: lower idx = newer (next), higher = older (prev)
                  nextEdition={idx > 0 ? displayed[idx - 1] : null}
                  prevEdition={idx < displayed.length - 1 ? displayed[idx + 1] : null}
                  onTagClick={(tag) => {
                    const next = activeTags.includes(tag)
                      ? activeTags.filter((t) => t !== tag)
                      : [...activeTags, tag]
                    setFilter('tags', next.length ? next.join(',') : undefined)
                  }}
                  activeTags={activeTags}
                />
              ))}
            </div>

            {/* Pagination */}
            {!hasClientFilters ? (
              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                onPage={goToPage}
              />
            ) : (
              pagination.totalPages > 1 && (
                <p className="text-center text-chrome-muted text-[12px] py-6">
                  Filtros aplicados à pág. {page} · use a busca{' '}
                  <button
                    type="button"
                    className="underline hover:text-chrome-text transition-colors"
                    onClick={clearFilters}
                  >
                    ou limpe os filtros
                  </button>{' '}
                  para ver todas as {pagination.totalPages} páginas
                </p>
              )
            )}
          </>
        )}
      </div>
    </>
  )
}
