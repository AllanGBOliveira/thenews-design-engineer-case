import { Link } from 'react-router'
import { IoEye, IoHeart, IoChatbubble, IoFlash } from 'react-icons/io5'
import { cn } from '~/lib/utils'
import { categorySlugFromCaderno, parseEditionTags, parseEditionAuthors, type Edition } from '~/data/api'
import { getCategory } from '~/data/editions'

/* ─── Helpers ────────────────────────────────────────────────────────────── */

export function formatDate(publishDate: string): string {
  const d = new Date(publishDate + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/* ─── Newsletter badge ───────────────────────────────────────────────────── */

function NewsletterBadge({ cadernoId }: { cadernoId: string }) {
  const slug = categorySlugFromCaderno(cadernoId)
  const cat = getCategory(slug)
  if (!cat) return null
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white leading-none whitespace-nowrap"
      style={{ backgroundColor: cat.dotColor }}
    >
      <span className="w-1 h-1 rounded-full bg-white/70 shrink-0" aria-hidden="true" />
      {cat.label}
    </span>
  )
}

/* ─── Content tag chip (clickable for filter) ────────────────────────────── */

export function TagChip({
  tag,
  active,
  onClick,
}: {
  tag: string
  active?: boolean
  onClick?: (tag: string) => void
}) {
  const base =
    'inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-none whitespace-nowrap transition-colors'
  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(tag)}
        className={cn(
          base,
          active
            ? 'bg-brand text-[#0A0A0F]'
            : 'bg-chrome-divider text-chrome-muted hover:bg-chrome-text/20 hover:text-chrome-text',
        )}
      >
        {tag}
      </button>
    )
  }
  return (
    <span
      className={cn(base, 'bg-chrome-divider text-chrome-muted')}
    >
      {tag}
    </span>
  )
}

/* ─── Thumbnail ──────────────────────────────────────────────────────────── */

function Thumbnail({ src, alt, cadernoId }: { src: string | null; alt: string; cadernoId: string }) {
  const slug = categorySlugFromCaderno(cadernoId)
  const color = getCategory(slug)?.dotColor ?? '#F97316'

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
    )
  }

  return (
    <div
      className="absolute inset-0 w-full h-full flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${color}1a 0%, ${color}33 100%)` }}
      aria-hidden="true"
    >
      <span className="font-black text-[22px] leading-none select-none" style={{ color }}>
        tn
      </span>
    </div>
  )
}

/* ─── Edition card ───────────────────────────────────────────────────────── */

type EditionCardProps = {
  edition: Edition
  onTagClick?: (tag: string) => void
  activeTags?: string[]
  // Adjacent editions passed as state so the detail page renders nav instantly.
  prevEdition?: Edition | null
  nextEdition?: Edition | null
}

export function EditionCard({ edition, onTagClick, activeTags = [], prevEdition, nextEdition }: EditionCardProps) {
  const tags = parseEditionTags(edition.contentTags)
  const authors = parseEditionAuthors(edition.authors)

  return (
    <Link
      to={`/${edition.slug}`}
      state={{ edition, prev: prevEdition ?? null, next: nextEdition ?? null }}
      className="group flex flex-col h-full overflow-hidden rounded-xl border border-chrome-divider bg-chrome-surface hover:border-chrome-muted transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {/* Thumbnail — flush, no top padding */}
      <div className="relative w-full aspect-video shrink-0 overflow-hidden rounded-t-xl bg-chrome-divider">
        <Thumbnail src={edition.thumbnailUrl} alt={edition.subjectLine} cadernoId={edition.cadernoId} />
        {edition.isCurrentEdition && (
          <span className="absolute top-2 start-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-brand text-[#0A0A0F] leading-none">
            <IoFlash size={8} aria-hidden="true" /> Hoje
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 gap-2 p-3">
        {/* Newsletter + authors badges row */}
        <div className="flex flex-wrap gap-1">
          <NewsletterBadge cadernoId={edition.cadernoId} />
          {authors.map((a) => (
            <span
              key={a}
              className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium leading-none whitespace-nowrap bg-chrome-divider text-chrome-muted"
            >
              {a}
            </span>
          ))}
        </div>

        {/* Title */}
        <p className="text-chrome-text font-bold text-[13px] leading-snug line-clamp-2 group-hover:text-brand transition-colors">
          {edition.subjectLine}
        </p>

        {/* Description */}
        {edition.previewText && (
          <p className="text-chrome-muted text-[12px] leading-relaxed line-clamp-4 flex-1">
            {edition.previewText}
          </p>
        )}

        {/* Content tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1" onClick={(e) => e.preventDefault()}>
            {tags.map((tag) => (
              <TagChip
                key={tag}
                tag={tag}
                active={activeTags.includes(tag)}
                onClick={onTagClick}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          {edition.publishDate && (
            <time dateTime={edition.publishDate} className="text-chrome-muted text-[11px] shrink-0">
              {formatDate(edition.publishDate)}
            </time>
          )}
          <div className="flex items-center gap-2 text-chrome-muted text-[11px]">
            {edition.viewsCount > 0 && (
              <span className="flex items-center gap-0.5">
                <IoEye size={11} aria-hidden="true" /> {formatCount(edition.viewsCount)}
              </span>
            )}
            {edition.likesCount > 0 && (
              <span className="flex items-center gap-0.5">
                <IoHeart size={11} aria-hidden="true" /> {formatCount(edition.likesCount)}
              </span>
            )}
            {edition.commentsCount > 0 && (
              <span className="flex items-center gap-0.5">
                <IoChatbubble size={11} aria-hidden="true" /> {formatCount(edition.commentsCount)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-chrome-divider', className)} />
}

export function EditionCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-chrome-divider bg-chrome-surface">
      <Bone className="w-full aspect-video rounded-t-xl rounded-b-none" />
      <div className="p-3 space-y-2">
        <Bone className="h-4 w-20 rounded-md" />
        <Bone className="h-3.5 w-full" />
        <Bone className="h-3.5 w-4/5" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-3/4" />
        <div className="flex justify-between pt-1">
          <Bone className="h-3 w-14" />
          <Bone className="h-3 w-12" />
        </div>
      </div>
    </div>
  )
}
