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

type FetchListParams = {
  page?: number
  search?: string
}

export async function fetchEditionsList({
  page = 1,
  search = '',
}: FetchListParams = {}): Promise<EditionListResult> {
  const cacheKey = `${page}:${search}`
  const hit = _listCache.get(cacheKey)
  if (hit && Date.now() - hit.ts < 30_000) return hit.result

  try {
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('search', search)

    const res = await fetch(`${MOBILE_API}/editions?${params}`)
    if (!res.ok) return emptyResult(page)

    const json = await res.json() as {
      success: boolean
      data: Edition[]
      pagination: PaginationMeta
    }

    const editions = (Array.isArray(json.data) ? json.data : []).filter((e) => !e.hiddenFromFeed)
    cacheEditions(editions)

    const result: EditionListResult = {
      editions,
      pagination: json.pagination ?? { page, limit: 10, total: 0, totalPages: 0 },
    }
    _listCache.set(cacheKey, { result, ts: Date.now() })
    return result
  } catch {
    return emptyResult(page)
  }
}

function emptyResult(page: number): EditionListResult {
  return { editions: [], pagination: { page, limit: 10, total: 0, totalPages: 0 } }
}

// For edition detail: check cache first, then paginate through recent pages.
// Searches up to 5 pages (50 most recent editions) before giving up.
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
