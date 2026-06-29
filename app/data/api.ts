const MOBILE_API = 'https://api.thenews.com.br/api/mobile'

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type Edition = {
  id: string
  beehiivPostId: string
  publicationId: string
  title: string
  subtitle: string | null
  subjectLine: string
  previewText: string
  slug: string
  thumbnailUrl: string | null
  webUrl: string
  audience: 'free' | 'premium'
  platform: string
  publishDate: string
  publishedAt: string | null
  status: string
  isCurrentEdition: boolean
  hiddenFromFeed: boolean
  viewsCount: number
  likesCount: number
  commentsCount: number
  cadernoId: string
  contentTags: string
  authors: string
  htmlContent: string
}

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type EditionListResult = {
  editions: Edition[]
  pagination: PaginationMeta
}

/* ─── cadernoId → category slug ─────────────────────────────────────────── */

const CADERNO_TO_SLUG: Record<string, string> = {
  'pub_ce78b549-5923-439b-be24-3f24c454bc12':       'the-news',
  'pub_ce78b549-5923-439b-be24-3f24c454bc12_night': 'night',
  'pub_72a981c0-3a09-4a7c-b374-dbea5b69925c_copa':  'tempo-de-copa',
  'pub_87b5253f-5fac-42d9-bb03-d100f7d434aa':       'money',
  'pub_f11d861b-9b39-428b-a381-af3f07ef96c9':       'health',
  'pub_e6f2edcf-0484-47ad-b6f2-89a866ccadc8':       'cult',
  'pub_3f18517c-9a0b-487e-b1c3-804c71fa6285':       'travel',
  'pub_f41c4c52-beb8-4cc0-b8c0-02bb6ac2353c':       'better-work',
  'pub_b0f0dc48-5946-40a5-b2b6-b245a1a0e680':       'business',
  'pub_89324c54-1b5f-4200-85e7-e199d56c76e3':       'around',
  'pub_98577126-2994-4111-bc86-f60974108b94':       'rising',
}

export function categorySlugFromCaderno(cadernoId: string): string {
  return CADERNO_TO_SLUG[cadernoId] ?? 'the-news'
}

/* ─── Tag / author parsers ───────────────────────────────────────────────
   The API returns contentTags and authors as JSON strings (e.g. '["música"]').
   Parse on demand — never mutate the Edition object itself.
──────────────────────────────────────────────────────────────────────────── */

export function parseEditionTags(raw: string): string[] {
  if (!raw || raw === '[]') return []
  try { return JSON.parse(raw) } catch { return [] }
}

export function parseEditionAuthors(raw: string): string[] {
  if (!raw || raw === '[]') return []
  try { return JSON.parse(raw) } catch { return [] }
}

/* ─── Module-level caches ────────────────────────────────────────────────
   Edition detail cache: shared across SSR requests (Node module singleton)
   and SPA navigations. Bounded at 200 entries.
   List result cache: 30-second TTL avoids redundant API calls when URL
   params change for client-side filters (sort/tags/interests).
──────────────────────────────────────────────────────────────────────────── */

const _cache = new Map<string, Edition>()
const _listCache = new Map<string, { result: EditionListResult; ts: number }>()

// Tracks the page/index position of every edition that has appeared in a list
// fetch. Used by fetchEditionWithNeighbors for O(1) page targeting instead of
// a linear page-by-page search.
const _positionMap = new Map<string, { page: number; idx: number; limit: number }>()

export function cacheEditions(editions: Edition[], page?: number, limit?: number): void {
  for (let i = 0; i < editions.length; i++) {
    const e = editions[i]
    _cache.set(e.slug, e)
    if (page !== undefined && limit !== undefined) {
      _positionMap.set(e.slug, { page, idx: i, limit })
    }
  }
  if (_cache.size > 200) {
    let excess = _cache.size - 200
    for (const key of _cache.keys()) {
      _cache.delete(key)
      if (--excess <= 0) break
    }
  }
}

export function getCachedEdition(slug: string): Edition | undefined {
  return _cache.get(slug)
}

/* ─── API calls ──────────────────────────────────────────────────────────── */

export const PAGE_SIZE_OPTIONS = [5, 10, 15, 20] as const
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]
export const DEFAULT_PAGE_SIZE: PageSize = 20

type FetchListParams = {
  page?: number
  search?: string
  limit?: number
}

export async function fetchEditionsList({
  page = 1,
  search = '',
  limit = DEFAULT_PAGE_SIZE,
}: FetchListParams = {}): Promise<EditionListResult> {
  const safeLimit = Math.min(20, Math.max(1, limit))
  const cacheKey = `${page}:${search}:${safeLimit}`
  const hit = _listCache.get(cacheKey)
  if (hit && Date.now() - hit.ts < 30_000) return hit.result

  try {
    const params = new URLSearchParams({ page: String(page), limit: String(safeLimit) })
    if (search) params.set('search', search)

    const res = await fetch(`${MOBILE_API}/editions?${params}`)
    if (!res.ok) return emptyResult(page, safeLimit)

    const json = await res.json() as {
      success: boolean
      data: Edition[]
      pagination: PaginationMeta
    }

    const editions = (Array.isArray(json.data) ? json.data : []).filter((e) => !e.hiddenFromFeed)
    cacheEditions(editions, page, safeLimit)

    const result: EditionListResult = {
      editions,
      pagination: json.pagination ?? { page, limit: safeLimit, total: 0, totalPages: 0 },
    }
    _listCache.set(cacheKey, { result, ts: Date.now() })
    return result
  } catch {
    return emptyResult(page, safeLimit)
  }
}

function emptyResult(page: number, limit: number = DEFAULT_PAGE_SIZE): EditionListResult {
  return { editions: [], pagination: { page, limit, total: 0, totalPages: 0 } }
}

// For edition detail: check cache first, then paginate through recent pages.
// Searches up to 5 pages (100 most recent editions at limit=20) before giving up.
export async function fetchEditionBySlug(slug: string): Promise<Edition | null> {
  const cached = getCachedEdition(slug)
  if (cached) return cached

  for (let page = 1; page <= 5; page++) {
    try {
      const { editions, pagination } = await fetchEditionsList({ page })
      const found = editions.find((e) => e.slug === slug)
      if (found) return found
      if (page >= pagination.totalPages || editions.length < pagination.limit) break
    } catch {
      break
    }
  }

  return null
}

export type EditionWithNeighbors = {
  edition: Edition | null
  // older edition (published before this one in time)
  prev: Edition | null
  // newer edition (published after this one in time)
  next: Edition | null
}

// Resolve neighbors for a given page+index, fetching boundary pages separately.
async function resolveNeighbors(
  editions: Edition[],
  idx: number,
  page: number,
  totalPages: number,
  limit: number,
): Promise<{ prev: Edition | null; next: Edition | null }> {
  // API returns newest-first: lower index = newer (next), higher index = older (prev)
  let next: Edition | null = idx > 0 ? editions[idx - 1] : null
  let prev: Edition | null = idx < editions.length - 1 ? editions[idx + 1] : null

  if (!next && page > 1) {
    try {
      const p = await fetchEditionsList({ page: page - 1, limit: limit as PageSize })
      next = p.editions[p.editions.length - 1] ?? null
    } catch { /* no newer neighbor available */ }
  }
  if (!prev && page < totalPages) {
    try {
      const p = await fetchEditionsList({ page: page + 1, limit: limit as PageSize })
      prev = p.editions[0] ?? null
    } catch { /* no older neighbor available */ }
  }
  return { prev, next }
}

// Returns the edition plus its immediate neighbors in the feed (newest-first API
// order). Uses _positionMap for O(1) page targeting when available; falls back
// to a linear page-by-page search for direct URL accesses.
export async function fetchEditionWithNeighbors(slug: string): Promise<EditionWithNeighbors> {
  // Fast path: known position from a prior list fetch
  const pos = _positionMap.get(slug)
  if (pos) {
    try {
      const { editions, pagination } = await fetchEditionsList({ page: pos.page, limit: pos.limit as PageSize })
      const idx = editions.findIndex((e) => e.slug === slug)
      if (idx !== -1) {
        const { prev, next } = await resolveNeighbors(editions, idx, pos.page, pagination.totalPages, pos.limit)
        return { edition: editions[idx], prev, next }
      }
      // Position was stale (list refreshed) — fall through to linear search
    } catch { /* fall through */ }
  }

  // Slow path: search up to 5 pages (covers 100 most recent editions at limit=20)
  for (let page = 1; page <= 5; page++) {
    let editions: Edition[]
    let pagination: PaginationMeta
    try {
      ;({ editions, pagination } = await fetchEditionsList({ page }))
    } catch {
      break
    }

    const idx = editions.findIndex((e) => e.slug === slug)
    if (idx === -1) {
      if (page >= pagination.totalPages || editions.length < pagination.limit) break
      continue
    }

    const { prev, next } = await resolveNeighbors(editions, idx, page, pagination.totalPages, DEFAULT_PAGE_SIZE)
    return { edition: editions[idx], prev, next }
  }

  // Last resort: return cached edition without neighbors
  const cached = getCachedEdition(slug)
  return { edition: cached ?? null, prev: null, next: null }
}

/* ─── Backward-compat exports (used by existing home.tsx / edition detail) ─ */

export async function fetchEditions(): Promise<Edition[]> {
  const { editions } = await fetchEditionsList({ page: 1 })
  return editions
}

export type EditionMap = Record<string, Edition>

export function buildEditionMap(editions: Edition[]): EditionMap {
  const map: EditionMap = {}
  for (const edition of editions) {
    const slug = categorySlugFromCaderno(edition.cadernoId)
    if (!map[slug]) map[slug] = edition
  }
  return map
}
