import { parseFrontmatter } from 'comark'

/* Vite eager glob — all .md files bundled at build time (SSR/SSG/SPA safe) */
const rawFiles = import.meta.glob<string>(
  '../content/editions/**/*.md',
  { eager: true, query: '?raw', import: 'default' },
)

type LocaleMap = Record<string, string>
const rawMap: Record<string, LocaleMap> = {}

for (const [path, content] of Object.entries(rawFiles)) {
  const match = path.match(/editions\/([^/]+)\/([^/]+)\.md$/)
  if (!match) continue
  const [, slug, locale] = match
  rawMap[slug] ??= {}
  rawMap[slug][locale] = content
}

const FALLBACK_LOCALE = 'pt-BR'

export type EditionFrontmatter = {
  date?: string
  readOnlineUrl?: string
}

export function getRawEdition(slug: string, locale: string): string | null {
  return rawMap[slug]?.[locale] ?? rawMap[slug]?.[FALLBACK_LOCALE] ?? null
}

export function parseEdition(raw: string): { frontmatter: EditionFrontmatter; content: string } {
  const { data, content } = parseFrontmatter(raw)
  return { frontmatter: data as EditionFrontmatter, content }
}
