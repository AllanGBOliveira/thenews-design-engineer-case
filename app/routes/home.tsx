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
import { InterestsPicker } from '~/components/interests-picker'
import { fetchEditionsList, categorySlugFromCaderno, parseEditionTags } from '~/data/api'
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
  const { editions, pagination } = await fetchEditionsList({ page, search: q.trim() })
  return { editions, pagination, page, q }
}

/* ─── Sort options ───────────────────────────────────────────────────────── */

type SortKey = 'newest' | 'views' | 'likes'

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Mais recentes',
  views: 'Mais lidos',
  likes: 'Mais curtidos',
}

/* ─── URL state helpers (following ao.dev pattern) ───────────────────────── */

function useUrlFilters() {
  const [params, setParams] = useSearchParams()

  const q = params.get('q') ?? ''
  const sort = (params.get('sort') ?? 'newest') as SortKey
  const activeTags = (params.get('tags') ?? '').split(',').filter(Boolean)
  const activeInterests = (params.get('interests') ?? '').split(',').filter(Boolean)
  const page = Math.max(1, parseInt(params.get('page') ?? '1', 10) || 1)

  // Filter changes — replace history (don't pollute stack)
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

  const clearFilters = useCallback(() => {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('q')
      next.delete('sort')
      next.delete('tags')
      next.delete('interests')
      next.delete('page')
      return next
    }, { replace: true })
  }, [setParams])

  const hasClientFilters = activeTags.length > 0 || activeInterests.length > 0

  return { q, sort, activeTags, activeInterests, page, setFilter, goToPage, clearFilters, hasClientFilters }
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

function Toolbar({
  q,
  sort,
  activeTags,
  activeInterests,
  setFilter,
  onOpenPicker,
}: {
  q: string
  sort: SortKey
  activeTags: string[]
  activeInterests: string[]
  setFilter: (k: string, v: string | undefined) => void
  onOpenPicker: () => void
}) {
  const totalActive = activeTags.length + activeInterests.length

  function removeTag(tag: string) {
    const next = activeTags.filter((t) => t !== tag)
    setFilter('tags', next.length ? next.join(',') : undefined)
  }

  function removeInterest(slug: string) {
    const next = activeInterests.filter((s) => s !== slug)
    setFilter('interests', next.length ? next.join(',') : undefined)
  }

  return (
    <div className="sticky top-0 z-10 bg-chrome-bg border-b border-chrome-divider">
      {/* Main row */}
      <div className="flex items-center gap-2 px-3 py-2">
        <SearchInput q={q} setFilter={setFilter} />

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
              className="inline-flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-md text-[10px] font-medium bg-chrome-divider text-chrome-text hover:bg-chrome-text/20 transition-colors leading-none"
            >
              {tag} <IoClose size={9} aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={() => { setFilter('interests', undefined); setFilter('tags', undefined) }}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-chrome-muted hover:text-chrome-text transition-colors shrink-0"
          >
            <IoClose size={10} aria-hidden="true" /> limpar tudo
          </button>
        </div>
      )}
    </div>
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

export default function Home() {
  const { editions, pagination } = useLoaderData<typeof loader>()
  const { q, sort, activeTags, activeInterests, page, setFilter, goToPage, clearFilters, hasClientFilters } =
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

    if (sort === 'views') return [...list].sort((a, b) => b.viewsCount - a.viewsCount)
    if (sort === 'likes') return [...list].sort((a, b) => b.likesCount - a.likesCount)
    return list
  }, [editions, activeInterests, activeTags, sort])

  const hasAnyFilter = !!(q || hasClientFilters)

  return (
    <>
      {/* Filter picker (newsletters + content categories) */}
      <InterestsPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={(interests, tags) => {
          setFilter('interests', interests.length ? interests.join(',') : undefined)
          setFilter('tags', tags.length ? tags.join(',') : undefined)
        }}
        initialInterests={activeInterests}
        initialTags={activeTags}
      />

      {/* Sticky toolbar */}
      <Toolbar
        q={q}
        sort={sort}
        activeTags={activeTags}
        activeInterests={activeInterests}
        setFilter={setFilter}
        onOpenPicker={() => setPickerOpen(true)}
      />

      {/* Feed */}
      <div className="px-3 sm:px-4 pb-4">
        {/* Page heading */}
        <div className="py-4 pb-3">
          <h1 className="text-chrome-text font-black text-[22px] leading-none">seu feed</h1>
          <p className="text-chrome-muted text-[13px] mt-1">
            {pagination.total > 0
              ? `${pagination.total.toLocaleString('pt-BR')} edições`
              : '…'}
            {activeInterests.length > 0 &&
              ` · ${activeInterests.length} newsletter${activeInterests.length > 1 ? 's' : ''}`}
            {activeTags.length > 0 && ` · ${activeTags.length} tag${activeTags.length > 1 ? 's' : ''}`}
          </p>
        </div>

        {displayed.length === 0 ? (
          <EmptyState q={q} hasFilters={hasAnyFilter} onClear={clearFilters} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayed.map((edition) => (
                <EditionCard
                  key={edition.id}
                  edition={edition}
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

            {/* Pagination — API-level only; hide when client-side filter narrows results */}
            {!hasClientFilters && (
              <Pagination
                page={page}
                totalPages={pagination.totalPages}
                onPage={goToPage}
              />
            )}

            {hasClientFilters && pagination.totalPages > 1 && (
              <p className="text-center text-chrome-muted text-[12px] py-4">
                Filtros ativos nesta página · use a busca para pesquisar em todas as {pagination.totalPages} páginas
              </p>
            )}
          </>
        )}
      </div>
    </>
  )
}
