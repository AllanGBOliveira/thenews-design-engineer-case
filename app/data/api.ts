const MOBILE_API = 'https://api.thenews.com.br/api/mobile'

export type Edition = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  subjectLine: string
  previewText: string
  thumbnailUrl: string | null
  webUrl: string
  audience: 'free' | 'premium'
  isCurrentEdition: boolean
  publishedAt: string | null
  cadernoId: string
  viewsCount: number
  likesCount: number
  commentsCount: number
  htmlContent: string
}

// beehiiv publication ID (+ optional _suffix) → category slug
// Confirmed from API responses (webUrl) and APK bundle reverse engineering
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

export async function fetchEditions(): Promise<Edition[]> {
  try {
    const res = await fetch(`${MOBILE_API}/editions`)
    if (!res.ok) return []
    const json = await res.json() as { success: boolean; data: Edition[] }
    return Array.isArray(json.data) ? json.data : []
  } catch {
    return []
  }
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
