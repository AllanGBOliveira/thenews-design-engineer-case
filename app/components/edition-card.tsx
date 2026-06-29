import { Link } from 'react-router'
import { IoEye, IoHeart, IoFlash } from 'react-icons/io5'
import { FaCrown } from 'react-icons/fa6'
import { cn } from '~/lib/utils'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent } from '~/components/ui/card'
import { categorySlugFromCaderno, type Edition } from '~/data/api'
import { getCategory } from '~/data/editions'

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatDate(publishDate: string): string {
  const d = new Date(publishDate + 'T12:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

/* ─── Category pill ──────────────────────────────────────────────────────── */

function CategoryPill({ cadernoId }: { cadernoId: string }) {
  const slug = categorySlugFromCaderno(cadernoId)
  const cat = getCategory(slug)
  if (!cat) return null
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white leading-none shrink-0"
      style={{ backgroundColor: cat.dotColor }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" aria-hidden="true" />
      {cat.label}
    </span>
  )
}

/* ─── Thumbnail ──────────────────────────────────────────────────────────── */

function Thumbnail({
  src,
  alt,
  cadernoId,
  className,
}: {
  src: string | null
  alt: string
  cadernoId: string
  className?: string
}) {
  const slug = categorySlugFromCaderno(cadernoId)
  const cat = getCategory(slug)
  const color = cat?.dotColor ?? '#F97316'

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn('object-cover w-full h-full', className)}
      />
    )
  }

  return (
    <div
      className={cn('w-full h-full flex items-center justify-center', className)}
      style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)` }}
      aria-hidden="true"
    >
      <span
        className="font-black text-[28px] leading-none select-none"
        style={{ color }}
      >
        tn
      </span>
    </div>
  )
}

/* ─── Stats row ──────────────────────────────────────────────────────────── */

function StatsRow({ edition }: { edition: Edition }) {
  return (
    <div className="flex items-center gap-3 text-chrome-muted text-[11px]">
      {edition.viewsCount > 0 && (
        <span className="flex items-center gap-1">
          <IoEye size={12} aria-hidden="true" />
          {formatCount(edition.viewsCount)}
        </span>
      )}
      {edition.likesCount > 0 && (
        <span className="flex items-center gap-1">
          <IoHeart size={12} aria-hidden="true" />
          {formatCount(edition.likesCount)}
        </span>
      )}
    </div>
  )
}

/* ─── Featured card (hero — first edition, full width) ──────────────────── */

export function EditionCardFeatured({ edition }: { edition: Edition }) {
  return (
    <Link
      to={`/editions/${edition.slug}`}
      state={{ edition }}
      className="block group focus-visible:outline-none"
    >
      <Card className="overflow-hidden border-chrome-divider bg-chrome-surface rounded-2xl hover:border-chrome-muted transition-colors duration-200 group-focus-visible:ring-2 group-focus-visible:ring-brand">
        {/* Image */}
        <div className="relative w-full aspect-[16/7] overflow-hidden">
          <Thumbnail
            src={edition.thumbnailUrl}
            alt={edition.subjectLine}
            cadernoId={edition.cadernoId}
          />
          {/* Badges overlay */}
          <div className="absolute top-3 start-3 flex flex-wrap gap-1.5">
            <CategoryPill cadernoId={edition.cadernoId} />
            {edition.isCurrentEdition && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand text-[#0A0A0F] leading-none">
                <IoFlash size={9} aria-hidden="true" /> Hoje
              </span>
            )}
            {edition.audience === 'premium' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-[#0A0A0F] leading-none">
                <FaCrown size={9} aria-hidden="true" /> Premium
              </span>
            )}
          </div>
        </div>

        <CardContent className="p-4">
          <p className="text-chrome-text font-bold text-[17px] leading-snug mb-1.5 line-clamp-2 group-hover:text-brand transition-colors">
            {edition.subjectLine}
          </p>
          {edition.previewText && (
            <p className="text-chrome-muted text-[13px] leading-relaxed line-clamp-2 mb-3">
              {edition.previewText}
            </p>
          )}
          <div className="flex items-center justify-between">
            {edition.publishDate && (
              <time
                dateTime={edition.publishDate}
                className="text-chrome-muted text-[12px]"
              >
                {formatDate(edition.publishDate)}
              </time>
            )}
            <StatsRow edition={edition} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

/* ─── Compact grid card ──────────────────────────────────────────────────── */

export function EditionCard({ edition }: { edition: Edition }) {
  return (
    <Link
      to={`/editions/${edition.slug}`}
      state={{ edition }}
      className="block group focus-visible:outline-none"
    >
      <Card className="overflow-hidden border-chrome-divider bg-chrome-surface rounded-xl hover:border-chrome-muted transition-colors duration-200 h-full group-focus-visible:ring-2 group-focus-visible:ring-brand">
        {/* Thumbnail */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Thumbnail
            src={edition.thumbnailUrl}
            alt={edition.subjectLine}
            cadernoId={edition.cadernoId}
          />
          {edition.isCurrentEdition && (
            <span className="absolute top-2 start-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-brand text-[#0A0A0F] leading-none">
              <IoFlash size={8} aria-hidden="true" /> Hoje
            </span>
          )}
        </div>

        <CardContent className="p-3 flex flex-col gap-1.5">
          <CategoryPill cadernoId={edition.cadernoId} />
          <p className="text-chrome-text font-bold text-[14px] leading-snug line-clamp-2 group-hover:text-brand transition-colors flex-1">
            {edition.subjectLine}
          </p>
          <div className="flex items-center justify-between mt-auto pt-1">
            {edition.publishDate && (
              <time
                dateTime={edition.publishDate}
                className="text-chrome-muted text-[11px]"
              >
                {formatDate(edition.publishDate)}
              </time>
            )}
            <StatsRow edition={edition} />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function Bone({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-lg bg-chrome-divider', className)} />
}

export function EditionCardFeaturedSkeleton() {
  return (
    <Card className="overflow-hidden border-chrome-divider bg-chrome-surface rounded-2xl">
      <Bone className="w-full aspect-[16/7] rounded-none" />
      <CardContent className="p-4 space-y-2">
        <Bone className="h-5 w-3/4" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-2/3" />
        <div className="flex justify-between pt-1">
          <Bone className="h-3 w-20" />
          <Bone className="h-3 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

export function EditionCardSkeleton() {
  return (
    <Card className="overflow-hidden border-chrome-divider bg-chrome-surface rounded-xl">
      <Bone className="w-full aspect-[4/3] rounded-none" />
      <CardContent className="p-3 space-y-2">
        <Bone className="h-4 w-16 rounded-full" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-3/4" />
        <div className="flex justify-between pt-1">
          <Bone className="h-3 w-12" />
          <Bone className="h-3 w-10" />
        </div>
      </CardContent>
    </Card>
  )
}
