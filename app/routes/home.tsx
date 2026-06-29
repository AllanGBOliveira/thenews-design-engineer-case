import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useLoaderData, useNavigate } from 'react-router'
import { IoOptions, IoClose, IoChevronBack, IoChevronForward } from 'react-icons/io5'
import type { Route } from './+types/home'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  EditionCard,
  EditionCardFeatured,
  EditionCardSkeleton,
  EditionCardFeaturedSkeleton,
} from '~/components/edition-card'
import {
  InterestsPicker,
  loadInterests,
  hasSetInterests,
} from '~/components/interests-picker'
import { fetchEditionsList, categorySlugFromCaderno } from '~/data/api'
import { getCategory } from '~/data/editions'

/* ─── Meta ───────────────────────────────────────────────────────────────── */

export function meta() {
  return [
    { title: 'Feed — the news' },
    { name: 'description', content: 'Todas as edições do the news — seu feed personalizado' },
  ]
}

/* ─── Loader ─────────────────────────────────────────────────────────────── */

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1)
  const search = url.searchParams.get('search') ?? ''
  const { editions, pagination } = await fetchEditionsList({ page, search: search.trim() })
  return { editions, pagination, page, search }
}

/* ─── Sort types ─────────────────────────────────────────────────────────── */

type SortKey = 'newest' | 'views' | 'likes'

/* ─── Sticky search bar ──────────────────────────────────────────────────── */

function SearchBar({
  searchInput,
  onSearch,
  sort,
  onSort,
  interests,
  onOpenPicker,
}: {
  searchInput: string
  onSearch: (v: string) => void
  sort: SortKey
  onSort: (v: SortKey) => void
  interests: string[]
  onOpenPicker: () => void
}) {
  return (
    <div className="sticky top-0 z-10 bg-chrome-bg border-b border-chrome-divider">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <Input
          type="search"
          placeholder="Buscar edições..."
          value={searchInput}
          onChange={(e) => onSearch(e.target.value)}
          className="flex-1 h-9 text-[14px] bg-chrome-surface border-chrome-divider text-chrome-text placeholder:text-chrome-muted focus-visible:ring-brand rounded-xl"
          aria-label="Buscar edições"
        />

        <Select value={sort} onValueChange={(v) => onSort(v as SortKey)}>
          <SelectTrigger
            className="h-9 w-auto min-w-[110px] text-[13px] bg-chrome-surface border-chrome-divider text-chrome-text rounded-xl gap-1 focus:ring-brand"
            aria-label="Ordenar edições"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-chrome-surface border-chrome-divider text-chrome-text">
            <SelectItem value="newest" className="text-[13px] focus:bg-brand/10">Mais recentes</SelectItem>
            <SelectItem value="views"  className="text-[13px] focus:bg-brand/10">Mais lidos</SelectItem>
            <SelectItem value="likes"  className="text-[13px] focus:bg-brand/10">Mais curtidos</SelectItem>
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={onOpenPicker}
          aria-label={interests.length ? `Interesses ativos: ${interests.length}` : 'Filtrar por interesses'}
          className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-chrome-surface border border-chrome-divider text-chrome-text hover:border-chrome-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shrink-0"
        >
          <IoOptions size={18} aria-hidden="true" />
          {interests.length > 0 && (
            <span
              className="absolute -top-1 -end-1 flex items-center justify-center w-4 h-4 rounded-full bg-brand text-[#0A0A0F] font-bold text-[9px] leading-none"
              aria-hidden="true"
            >
              {interests.length}
            </span>
          )}
        </button>
      </div>

      {/* Active interests strip */}
      {interests.length > 0 && (
        <div
          className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-none"
          aria-label="Interesses ativos"
        >
          {interests.map((slug) => {
            const cat = getCategory(slug)
            if (!cat) return null
            return (
              <span
                key={slug}
                className="inline-flex items-center shrink-0 gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white leading-none"
                style={{ backgroundColor: cat.dotColor }}
              >
                {cat.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Empty state ────────────────────────────────────────────────────────── */

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-8 text-center gap-4">
      <span className="text-5xl" aria-hidden="true">🔍</span>
      <p className="text-chrome-text font-bold text-[17px]">
        {search ? `Nenhum resultado para "${search}"` : 'Nenhuma edição disponível'}
      </p>
      <p className="text-chrome-muted text-[14px]">
        {search
          ? 'Tente palavras-chave diferentes ou remova os filtros'
          : 'Verifique sua conexão e tente novamente'}
      </p>
    </div>
  )
}

/* ─── Pagination ─────────────────────────────────────────────────────────── */

function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number
  totalPages: number
  onPage: (n: number) => void
}) {
  if (totalPages <= 1) return null

  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, start + 4)
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i)

  return (
    <nav
      className="flex items-center justify-center gap-1.5 px-4 py-6"
      aria-label="Paginação"
    >
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-chrome-divider bg-chrome-surface text-chrome-text disabled:opacity-40 disabled:cursor-not-allowed hover:border-chrome-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <IoChevronBack size={16} aria-hidden="true" />
      </button>

      {start > 1 && (
        <>
          <button type="button" onClick={() => onPage(1)} className={pageBtn(false)}>1</button>
          {start > 2 && <span className="text-chrome-muted text-[13px] px-1">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPage(p)}
          aria-current={p === page ? 'page' : undefined}
          aria-label={`Página ${p}`}
          className={pageBtn(p === page)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-chrome-muted text-[13px] px-1">…</span>}
          <button type="button" onClick={() => onPage(totalPages)} className={pageBtn(false)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Próxima página"
        className="flex items-center justify-center w-9 h-9 rounded-xl border border-chrome-divider bg-chrome-surface text-chrome-text disabled:opacity-40 disabled:cursor-not-allowed hover:border-chrome-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <IoChevronForward size={16} aria-hidden="true" />
      </button>
    </nav>
  )
}

function pageBtn(active: boolean) {
  return [
    'flex items-center justify-center w-9 h-9 rounded-xl text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
    active
      ? 'bg-brand text-[#0A0A0F] border border-brand'
      : 'border border-chrome-divider bg-chrome-surface text-chrome-text hover:border-chrome-muted',
  ].join(' ')
}

/* ─── Home ───────────────────────────────────────────────────────────────── */

export default function Home() {
  const { editions, pagination, page, search } = useLoaderData<typeof loader>()
  const navigate = useNavigate()

  // Interests — client-only (localStorage); null = not hydrated yet (SSR / first render)
  const [interests, setInterests] = useState<string[] | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    const saved = loadInterests()
    setInterests(saved)
    if (!hasSetInterests()) {
      // Small delay so the sheet doesn't flash on initial load
      const t = setTimeout(() => setPickerOpen(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  // Sort (client-only)
  const [sort, setSort] = useState<SortKey>('newest')

  // Search input (controlled; debounced navigation)
  const [searchInput, setSearchInput] = useState(search)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearch = useCallback((value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      navigate(`/?search=${encodeURIComponent(value.trim())}&page=1`)
    }, 450)
  }, [navigate])

  function goToPage(n: number) {
    navigate(`/?page=${n}&search=${encodeURIComponent(search)}`)
    document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'instant' })
  }

  // Client-side filter + sort (interests filter matches server list to user prefs)
  const displayed = useMemo(() => {
    let list = editions
    if (interests && interests.length > 0) {
      const set = new Set(interests)
      list = list.filter((e) => set.has(categorySlugFromCaderno(e.cadernoId)))
    }
    if (sort === 'views') return [...list].sort((a, b) => b.viewsCount - a.viewsCount)
    if (sort === 'likes') return [...list].sort((a, b) => b.likesCount - a.likesCount)
    return list
  }, [editions, interests, sort])

  const [featured, ...rest] = displayed

  return (
    <>
      {/* Interests picker */}
      <InterestsPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSave={(slugs) => setInterests(slugs)}
        initialSlugs={interests ?? []}
      />

      {/* Search / sort / filter bar */}
      <SearchBar
        searchInput={searchInput}
        onSearch={handleSearch}
        sort={sort}
        onSort={setSort}
        interests={interests ?? []}
        onOpenPicker={() => setPickerOpen(true)}
      />

      {/* Content */}
      <div className="px-3 sm:px-4 pb-4">
        {/* Page heading */}
        <div className="py-4 pb-3">
          <h1 className="text-chrome-text font-black text-[22px] leading-none">
            seu feed
          </h1>
          <p className="text-chrome-muted text-[13px] mt-1">
            {pagination.total > 0
              ? `${pagination.total.toLocaleString('pt-BR')} edições`
              : 'carregando…'}
            {interests && interests.length > 0
              ? ` · ${interests.length} interesse${interests.length > 1 ? 's' : ''} ativo${interests.length > 1 ? 's' : ''}`
              : ''}
          </p>
        </div>

        {displayed.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <div className="space-y-4">
            {/* Featured hero card */}
            {featured && (
              <EditionCardFeatured edition={featured} />
            )}

            {/* Grid */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {rest.map((edition) => (
                  <EditionCard key={edition.id} edition={edition} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {displayed.length > 0 && (
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPage={goToPage}
          />
        )}
      </div>
    </>
  )
}
