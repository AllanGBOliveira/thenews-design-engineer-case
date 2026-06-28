import type { ComponentType, ReactNode } from 'react'
import { Image } from '@unpic/react'
import { VideoDialog, InAppLink } from '~/components/video-dialog'

/* ─── Prop types for MDC custom blocks ─────────────────────────── */

type WithChildren = { children?: ReactNode }

/* ─── edition-banner ────────────────────────────────────────────── */
/* ::edition-banner{name="the news" subtitle="SUNDAY'S" color="#F97316"} */

function EditionBanner({ name, subtitle, color }: { name: string; subtitle?: string; color?: string }) {
  const accent = color ?? '#F97316'
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 py-8 px-4 text-center"
      style={{ borderBottom: `3px solid ${accent}` }}
    >
      {subtitle && (
        <span className="text-[11px] font-bold tracking-[0.2em] text-chrome-muted uppercase">
          {subtitle}
        </span>
      )}
      <span
        className="text-[28px] font-black tracking-tight leading-none"
        style={{ color: accent }}
      >
        {name}
      </span>
    </div>
  )
}

/* ─── sponsor ───────────────────────────────────────────────────── */
/* ::sponsor{label="POWERED BY" brand="wellhub"} */

function Sponsor({ label, brand }: { label: string; brand: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 border-y border-chrome-divider my-4">
      <span className="text-[10px] font-bold tracking-[0.18em] text-chrome-muted uppercase">{label}</span>
      <span className="text-[13px] font-bold text-chrome-text uppercase">{brand}</span>
    </div>
  )
}

/* ─── intro-card ────────────────────────────────────────────────── */
/* ::intro-card\n...\n:: */

function IntroCard({ children }: WithChildren) {
  return (
    <div className="border-l-4 border-brand bg-brand/5 rounded-r-xl px-4 py-3 my-4 space-y-2 text-[15px] leading-relaxed text-chrome-text">
      {children}
    </div>
  )
}

/* ─── streak-cta ─────────────────────────────────────────────────── */
/* ::streak-cta\n...\n:: */

function StreakCta({ children }: WithChildren) {
  return (
    <button
      type="button"
      className="w-full text-center py-3 px-4 my-3 bg-brand/10 border border-brand/30 rounded-xl text-brand font-bold text-[12px] tracking-[0.1em] uppercase leading-snug hover:bg-brand/15 transition-colors"
    >
      {children}
    </button>
  )
}

/* ─── section-label ──────────────────────────────────────────────── */
/* ::section-label{label="BIG STORY"} */

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-3 my-2">
      <div className="h-px flex-1 bg-chrome-divider" />
      <span className="text-[10px] font-bold tracking-[0.2em] text-chrome-muted uppercase shrink-0">
        {label}
      </span>
      <div className="h-px flex-1 bg-chrome-divider" />
    </div>
  )
}

/* ─── article-image ──────────────────────────────────────────────── */
/* ::article-image{src alt caption} */

function ArticleImage({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="my-4 -mx-4">
      <Image
        src={src}
        alt={alt}
        layout="fullWidth"
        className="w-full"
      />
      {caption && (
        <figcaption className="text-[11px] text-chrome-muted text-center mt-1 px-4 leading-snug">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

/* ─── photo-grid ─────────────────────────────────────────────────── */
/* ::photo-grid{caption src1 alt1 src2 alt2 src3 alt3} */

function PhotoGrid({
  caption, src1, alt1, src2, alt2, src3, alt3,
}: {
  caption?: string
  src1: string; alt1: string
  src2?: string; alt2?: string
  src3?: string; alt3?: string
}) {
  const imgs = [
    { src: src1, alt: alt1 },
    src2 ? { src: src2, alt: alt2 ?? '' } : null,
    src3 ? { src: src3, alt: alt3 ?? '' } : null,
  ].filter(Boolean) as { src: string; alt: string }[]

  return (
    <figure className="my-4">
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${imgs.length}, 1fr)` }}>
        {imgs.map((img, i) => (
          <Image
            key={i}
            src={img.src}
            alt={img.alt}
            layout="constrained"
            width={300}
            height={300}
            className="w-full aspect-square object-cover rounded-sm"
          />
        ))}
      </div>
      {caption && (
        <figcaption className="text-[11px] text-chrome-muted text-center mt-1 leading-snug">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

/* ─── info-card ──────────────────────────────────────────────────── */
/* ::info-card\n- 👨‍🍳 item\n:: */

function InfoCard({ children }: WithChildren) {
  return (
    <div className="my-4 border border-brand/30 bg-brand/5 rounded-xl px-4 py-3 [&_ul]:space-y-2 [&_ul]:list-none [&_ul]:p-0 [&_li]:flex [&_li]:gap-2 [&_li]:text-[14px] [&_li]:leading-snug [&_li]:text-chrome-text">
      {children}
    </div>
  )
}

/* ─── video-embed ────────────────────────────────────────────────── */
/* ::video-embed{videoId title} */

function VideoEmbed({ videoId, title }: { videoId: string; title: string }) {
  return <div className="my-4"><VideoDialog videoId={videoId} title={title} /></div>
}

/* ─── big-quote ──────────────────────────────────────────────────── */
/* ::big-quote{attribution="..."}\nquote text\n:: */

function BigQuote({ attribution, children }: { attribution: string } & WithChildren) {
  return (
    <figure className="my-6 px-4 py-5 border-l-4 border-brand bg-chrome-surface rounded-r-xl">
      <blockquote className="text-[16px] italic font-medium text-chrome-text leading-relaxed mb-3">
        {children}
      </blockquote>
      <figcaption className="text-[12px] text-chrome-muted leading-snug">
        — {attribution}
      </figcaption>
    </figure>
  )
}

/* ─── newspaper-cover ────────────────────────────────────────────── */
/* ::newspaper-cover{src alt} */

function NewspaperCover({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="my-4 -mx-4">
      <Image src={src} alt={alt} layout="fullWidth" className="w-full" />
    </div>
  )
}

/* ─── agenda-card ────────────────────────────────────────────────── */
/* ::agenda-card{src alt} */

function AgendaCard({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-chrome-divider">
      <Image src={src} alt={alt} layout="fullWidth" className="w-full" />
    </div>
  )
}

/* ─── footer-desc ────────────────────────────────────────────────── */
/* ::footer-desc{title="SUNDAY'S (the news)"}\n...\n:: */

function FooterDesc({ title, children }: { title: string } & WithChildren) {
  return (
    <div className="mt-8 pt-6 border-t border-chrome-divider">
      <p className="text-[11px] font-bold tracking-[0.18em] text-chrome-muted uppercase mb-3">
        {title}
      </p>
      <div className="text-[14px] text-chrome-muted leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  )
}

/* ─── tns-logo ───────────────────────────────────────────────────── */
/* ::tns-logo */

const NEWSLETTERS = [
  { slug: 'the-news',    label: 'the news',    color: '#F97316' },
  { slug: 'night',       label: 'night',        color: '#1E3A5F' },
  { slug: 'money',       label: 'money',        color: '#0891B2' },
  { slug: 'health',      label: 'health',       color: '#2563EB' },
  { slug: 'business',    label: 'business',     color: '#9333EA' },
  { slug: 'trends',      label: 'trends',       color: '#EF4444' },
  { slug: 'around',      label: 'around',       color: '#78716C' },
  { slug: 'travel',      label: 'travel',       color: '#94A3B8' },
  { slug: 'cult',        label: 'cult',         color: '#DC2626' },
  { slug: 'better-work', label: 'better work',  color: '#3B82F6' },
  { slug: 'rising',      label: 'rising',       color: '#C4B5FD' },
]

function TnsLogo() {
  return (
    <div className="mt-8 mb-4 flex flex-col items-center gap-3">
      <div className="flex items-baseline gap-0.5 select-none" aria-label="the news">
        {['t', 'n', 's'].map((letter, i) => (
          <span
            key={i}
            className="text-[36px] font-black leading-none"
            style={{ color: NEWSLETTERS[i]?.color ?? '#F97316' }}
          >
            {letter}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
        {NEWSLETTERS.map((n) => (
          <span
            key={n.slug}
            className="text-[10px] font-bold tracking-wide"
            style={{ color: n.color }}
          >
            {n.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Standard element overrides ────────────────────────────────── */

function ProseAnchor({ href, children }: { href?: string; children?: ReactNode }) {
  if (!href || href === '#') {
    return (
      <InAppLink url="https://thenewscc.com.br">
        <span className="text-brand underline underline-offset-2 cursor-pointer">{children}</span>
      </InAppLink>
    )
  }
  return (
    <InAppLink url={href}>
      <span className="text-brand underline underline-offset-2 cursor-pointer">{children}</span>
    </InAppLink>
  )
}

function ProseImg({ src, alt }: { src?: string; alt?: string }) {
  if (!src) return null
  return (
    <Image
      src={src}
      alt={alt ?? ''}
      layout="fullWidth"
      className="w-full rounded-lg my-2"
    />
  )
}

function ProseBlockquote({ children }: WithChildren) {
  return (
    <blockquote className="border-l-4 border-brand pl-4 py-1 my-4 text-[15px] italic text-chrome-text leading-relaxed">
      {children}
    </blockquote>
  )
}

function ProseParagraph({ children }: WithChildren) {
  return <p className="text-[15px] leading-relaxed text-chrome-text my-3">{children}</p>
}

function ProseH1({ children }: WithChildren) {
  return <h1 className="text-[22px] font-black text-chrome-text leading-tight mt-6 mb-3">{children}</h1>
}

function ProseH2({ children }: WithChildren) {
  return <h2 className="text-[20px] font-bold text-chrome-text leading-tight mt-5 mb-2">{children}</h2>
}

function ProseH3({ children }: WithChildren) {
  return <h3 className="text-[17px] font-bold text-chrome-text leading-snug mt-4 mb-2">{children}</h3>
}

function ProseUl({ children }: WithChildren) {
  return <ul className="my-3 space-y-2 pl-0 list-none">{children}</ul>
}

function ProseOl({ children }: WithChildren) {
  return <ol className="my-3 space-y-2 pl-5 list-decimal marker:text-chrome-muted">{children}</ol>
}

function ProseLi({ children }: WithChildren) {
  return <li className="text-[14px] leading-snug text-chrome-text pl-1">{children}</li>
}

function ProseHr() {
  return <hr className="my-6 border-chrome-divider" />
}

function ProseStrong({ children }: WithChildren) {
  return <strong className="font-bold text-chrome-text">{children}</strong>
}

function ProseEm({ children }: WithChildren) {
  return <em className="italic text-chrome-muted">{children}</em>
}

/* ─── Components map (passed to ComarkClient) ───────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const editionComponents: Record<string, ComponentType<any>> = {
  /* MDC custom blocks */
  'edition-banner':  EditionBanner,
  'sponsor':         Sponsor,
  'intro-card':      IntroCard,
  'streak-cta':      StreakCta,
  'section-label':   SectionLabel,
  'article-image':   ArticleImage,
  'photo-grid':      PhotoGrid,
  'info-card':       InfoCard,
  'video-embed':     VideoEmbed,
  'big-quote':       BigQuote,
  'newspaper-cover': NewspaperCover,
  'agenda-card':     AgendaCard,
  'footer-desc':     FooterDesc,
  'tns-logo':        TnsLogo,

  /* Standard element overrides */
  a:          ProseAnchor,
  img:        ProseImg,
  blockquote: ProseBlockquote,
  p:          ProseParagraph,
  h1:         ProseH1,
  h2:         ProseH2,
  h3:         ProseH3,
  ul:         ProseUl,
  ol:         ProseOl,
  li:         ProseLi,
  hr:         ProseHr,
  strong:     ProseStrong,
  em:         ProseEm,
}
