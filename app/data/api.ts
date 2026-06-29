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

export function cacheEditions(editions: Edition[]): void {
  for (const e of editions) {
    _cache.set(e.slug, e)
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
    cacheEditions(editions)

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
  // older edition (published before this one)
  prev: Edition | null
  // newer edition (published after this one)
  next: Edition | null
}

// Returns the edition plus its immediate neighbors in the feed (newest-first API order).
// Fetches the neighboring page when the edition lands at a page boundary.
export async function fetchEditionWithNeighbors(slug: string): Promise<EditionWithNeighbors> {
  for (let page = 1; page <= 5; page++) {
    try {
      const { editions, pagination } = await fetchEditionsList({ page })
      const idx = editions.findIndex((e) => e.slug === slug)

      if (idx === -1) {
        if (page >= pagination.totalPages || editions.length < pagination.limit) break
        continue
      }

      // API is newest-first: lower index = newer, higher index = older
      let next: Edition | null = idx > 0 ? editions[idx - 1] : null
      let prev: Edition | null = idx < editions.length - 1 ? editions[idx + 1] : null

      // Edge of page — fetch the neighboring page to fill the gap
      if (!next && page > 1) {
        const prevPage = await fetchEditionsList({ page: page - 1 })
        next = prevPage.editions[prevPage.editions.length - 1] ?? null
      }
      if (!prev && page < pagination.totalPages) {
        const nextPage = await fetchEditionsList({ page: page + 1 })
        prev = nextPage.editions[0] ?? null
      }

      return { edition: editions[idx], prev, next }
    } catch {
      break
    }
  }

  // Fell through: edition not in recent pages but may still be in slug cache
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
