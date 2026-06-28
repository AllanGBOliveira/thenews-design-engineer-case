import { IoFlame } from 'react-icons/io5'
import { cn } from '~/lib/utils'
import { VideoDialog, InAppLink } from '~/components/video-dialog'
import type { ContentBlock, InlineNode } from '~/data/editions'

/* ─── Inline nodes renderer ────────────────────────────────────── */

function renderInline(nodes: InlineNode[], key?: string): React.ReactNode {
  return nodes.map((node, i) => {
    const k = `${key ?? 'n'}-${i}`
    switch (node.type) {
      case 'text':
        return <span key={k}>{node.text}</span>
      case 'bold':
        return <strong key={k} className="font-bold">{node.text}</strong>
      case 'italic':
        return <em key={k} className="italic">{node.text}</em>
      case 'bold-italic':
        return <strong key={k}><em>{node.text}</em></strong>
      case 'link':
        return (
          <InAppLink key={k} url={node.href}>
            <span className="underline underline-offset-2 text-brand-dim cursor-pointer">
              {node.text}
            </span>
          </InAppLink>
        )
    }
  })
}

/* ─── TNS footer logo ──────────────────────────────────────────── */

const TNS_COLORS = [
  { label: 'MORNING',  color: '#F97316' },
  { label: 'NIGHT',   color: '#1E3A5F' },
  { label: 'BUSINESS',color: '#9333EA' },
  { label: 'CULT',    color: '#DC2626' },
  { label: 'SPORTS',  color: '#16A34A' },
  { label: 'MONEY',   color: '#0891B2' },
  { label: 'TRAVEL',  color: '#94A3B8' },
  { label: 'HEALTH',  color: '#2563EB' },
  { label: 'AROUND',  color: '#78716C' },
  { label: 'TRENDS',  color: '#EF4444' },
]

function TNSLogo() {
  return (
    <div className="mx-4 mt-6 mb-2 rounded-xl bg-white dark:bg-chrome-surface border border-chrome-divider p-4 flex items-center gap-3">
      <span className="text-[22px] font-black text-[#0A0A0F] tracking-tight leading-none">
        <span className="text-brand">-</span>tns
      </span>
      <div className="flex flex-wrap gap-x-2 gap-y-1">
        {TNS_COLORS.map(({ label, color }) => (
          <span key={label} style={{ color }} className="text-[9px] font-bold leading-none">
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─── Block renderers ──────────────────────────────────────────── */

function EditionBanner({ newsletterName, subtitle, accentColor }: {
  newsletterName: string
  subtitle?: string
  accentColor?: string
}) {
  const isRising = newsletterName === 'rising'

  if (isRising) {
    return (
      <div className="mx-4 mt-4 mb-2 rounded-xl overflow-hidden bg-chrome-surface border border-chrome-divider p-6 flex items-center justify-center">
        <span
          className="text-4xl font-black italic tracking-tight"
          style={{ color: accentColor ?? '#C4B5FD' }}
        >
          rising
        </span>
      </div>
    )
  }

  return (
    <div
      className="mx-4 mt-4 mb-2 rounded-xl overflow-hidden flex items-center justify-center py-6 px-4"
      style={{ backgroundColor: accentColor ? `${accentColor}15` : 'rgba(249,115,22,0.1)', borderLeft: `3px solid ${accentColor ?? '#F97316'}` }}
    >
      <div className="text-center">
        <p className="text-chrome-text font-black text-2xl leading-tight tracking-tight">
          <span className="text-chrome-muted font-normal text-[13px] block mb-1">the news</span>
          {subtitle ?? newsletterName.toUpperCase()}
        </p>
      </div>
    </div>
  )
}

function SponsorBlock({ label, brandName }: { label: string; brandName: string }) {
  return (
    <div className="flex flex-col items-center gap-1 my-6 px-4">
      <p className="text-chrome-muted text-[10px] font-bold tracking-widest uppercase">{label}</p>
      <div className="rounded-lg border border-chrome-divider px-4 py-2 bg-chrome-bg">
        <span className="text-chrome-text font-bold text-[15px]">{brandName}</span>
      </div>
    </div>
  )
}

function IntroCard({ nodes }: { nodes: InlineNode[][] }) {
  return (
    <div className="mx-4 my-3 rounded-xl bg-chrome-surface dark:bg-chrome-surface p-4">
      {nodes.map((line, i) => (
        <p key={i} className="text-chrome-text text-[15px] leading-relaxed mb-2 last:mb-0">
          {renderInline(line, `intro-${i}`)}
        </p>
      ))}
    </div>
  )
}

function StreakCTA({ text }: { text: string }) {
  return (
    <div className="mx-4 my-4 rounded-xl bg-[#92400E]/20 border border-[#92400E]/30 px-4 py-3 flex items-center gap-3">
      <IoFlame size={22} className="text-[#F97316] shrink-0" aria-hidden="true" />
      <p className="text-[13px] font-bold text-[#F97316] leading-snug uppercase tracking-wide flex-1">
        {text}
      </p>
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-4 pt-6 pb-1 text-[11px] font-bold tracking-widest text-chrome-muted uppercase">
      {label}
    </p>
  )
}

function Heading({ nodes }: { nodes: InlineNode[] }) {
  return (
    <h2 className="px-4 text-[22px] font-black leading-tight text-chrome-text mb-3">
      {renderInline(nodes, 'h')}
    </h2>
  )
}

function Paragraph({ nodes }: { nodes: InlineNode[] }) {
  return (
    <p className="px-4 text-[16px] leading-relaxed text-chrome-text mb-4">
      {renderInline(nodes, 'p')}
    </p>
  )
}

function Blockquote({ nodes }: { nodes: InlineNode[] }) {
  return (
    <blockquote className="mx-4 my-4 pl-4 border-l-[3px] border-brand rounded-r-lg bg-chrome-surface dark:bg-[#1E1E28] py-3 pr-4">
      <p className="text-chrome-text text-[15px] leading-relaxed">
        {renderInline(nodes, 'bq')}
      </p>
    </blockquote>
  )
}

function ArticleImage({ src, alt, caption, width, height }: {
  src: string; alt: string; caption: string; width?: number; height?: number
}) {
  return (
    <figure className="mx-4 my-4">
      <img
        src={src}
        alt={alt}
        width={width ?? 720}
        height={height ?? 480}
        loading="lazy"
        className="w-full rounded-xl object-cover"
      />
      {caption && (
        <figcaption className="text-center text-[12px] text-chrome-muted mt-2 leading-snug">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function PhotoGrid({ images, caption }: {
  images: { src: string; alt: string }[]
  caption: string
}) {
  return (
    <figure className="mx-4 my-4">
      <div className={cn('grid gap-1 rounded-xl overflow-hidden', images.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
        {images.map((img, i) => (
          <div key={i} className="relative aspect-[3/4]">
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      {caption && (
        <figcaption className="text-center text-[12px] text-chrome-muted mt-2 leading-snug">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function InfoCard({ items }: { items: { emoji: string; nodes: InlineNode[] }[] }) {
  return (
    <div className="mx-4 my-4 rounded-xl bg-chrome-surface dark:bg-[#1E1E28] p-4">
      {items.map((item, i) => (
        <p key={i} className="text-[15px] leading-relaxed text-chrome-text mb-2 last:mb-0">
          <span aria-hidden="true">{item.emoji} </span>
          {renderInline(item.nodes, `ic-${i}`)}
        </p>
      ))}
    </div>
  )
}

function BulletList({ items }: { items: InlineNode[][] }) {
  return (
    <ul className="px-4 my-3 space-y-2 list-none">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-[15px] leading-relaxed text-chrome-text">
          <span aria-hidden="true" className="text-brand shrink-0 mt-1">•</span>
          <span>{renderInline(item, `ul-${i}`)}</span>
        </li>
      ))}
    </ul>
  )
}

function NumberedList({ items }: { items: InlineNode[][] }) {
  return (
    <ol className="px-4 my-3 space-y-2 list-none">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-chrome-text">
          <span className="text-brand font-bold shrink-0 tabular-nums">{i + 1}.</span>
          <span>{renderInline(item, `ol-${i}`)}</span>
        </li>
      ))}
    </ol>
  )
}

function BigQuote({ quote, attribution }: { quote: string; attribution: string }) {
  return (
    <div className="mx-4 my-6 text-center">
      <p className="text-brand text-[40px] font-black leading-none mb-2" aria-hidden="true">"</p>
      <blockquote>
        <p className="text-chrome-text text-[17px] italic leading-relaxed font-medium mb-4">
          {quote}
        </p>
        <footer className="text-chrome-muted text-[13px] leading-snug">
          <cite>{attribution}</cite>
        </footer>
      </blockquote>
    </div>
  )
}

function NewspaperCover({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="mx-4 mt-4 mb-2">
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full rounded-xl object-cover"
      />
    </figure>
  )
}

function AgendaCard({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="mx-4 my-4">
      <div className="rounded-xl overflow-hidden border border-chrome-divider">
        <p className="px-4 pt-3 pb-1 text-chrome-text font-bold text-[11px] tracking-widest uppercase bg-chrome-surface">
          AGENDA DO DIA
        </p>
        <img src={src} alt={alt} loading="lazy" className="w-full object-cover" />
      </div>
    </figure>
  )
}

function FooterDesc({ title, nodes }: { title: string; nodes: InlineNode[][] }) {
  return (
    <div className="mx-4 mt-8 pt-6 border-t border-chrome-divider">
      <p className="text-[11px] font-bold tracking-widest text-chrome-muted uppercase mb-2">RODAPÉ</p>
      <h3 className="text-chrome-text font-black text-[22px] mb-4">{title}</h3>
      {nodes.map((line, i) => (
        <p key={i} className="text-chrome-text text-[15px] leading-relaxed mb-3">
          {renderInline(line, `fd-${i}`)}
        </p>
      ))}
      {/* Standard footer links */}
      <div className="mt-6 space-y-2">
        {[
          { emoji: '🆘', text: 'Precisa de ajuda com algum problema? ', link: 'Clique para falar com o nosso suporte.' },
          { emoji: '📢', text: 'Quer anunciar conosco? ', link: 'É só clicar aqui.' },
        ].map((item, i) => (
          <p key={i} className="text-[14px] text-chrome-text leading-relaxed">
            <span aria-hidden="true">{item.emoji} </span>
            <strong>{item.text}</strong>
            <InAppLink url="#">
              <span className="underline underline-offset-2 text-brand-dim cursor-pointer">{item.link}</span>
            </InAppLink>
          </p>
        ))}
      </div>
      {/* Legal */}
      <div className="mt-8 pb-4 text-center space-y-1">
        <p className="text-chrome-muted text-[11px]">© 2026 Grupo tns</p>
        <p className="text-chrome-muted text-[11px]">228 Park Ave S, #29976, New York, NY 10003</p>
        <InAppLink url="#">
          <span className="text-[11px] underline text-chrome-muted cursor-pointer">Terms of Service</span>
        </InAppLink>
      </div>
    </div>
  )
}

function SectionDivider() {
  return <hr className="mx-4 my-6 border-t border-chrome-divider" />
}

/* ─── Date header (non-the-news categories) ─────────────────────── */

function DateHeader({ date, readOnlineUrl }: { date: string; readOnlineUrl?: string }) {
  return (
    <div className="mx-4 mt-4 mb-2 flex items-center gap-3 text-[13px]">
      <div className="flex-1 border-l-2 border-brand pl-3 py-1">
        <span className="text-chrome-muted">{date}</span>
      </div>
      {readOnlineUrl && (
        <InAppLink url={readOnlineUrl}>
          <span className="text-brand font-medium underline underline-offset-2 cursor-pointer shrink-0">
            Leia Online
          </span>
        </InAppLink>
      )}
    </div>
  )
}

/* ─── Main component ───────────────────────────────────────────── */

type ArticleContentProps = {
  blocks: ContentBlock[]
  date?: string
  readOnlineUrl?: string
  showDateHeader?: boolean
}

export function ArticleContent({ blocks, date, readOnlineUrl, showDateHeader }: ArticleContentProps) {
  return (
    <div className="pb-8">
      {showDateHeader && date && (
        <DateHeader date={date} readOnlineUrl={readOnlineUrl} />
      )}

      {blocks.map((block, idx) => {
        const key = `${block.type}-${idx}`
        switch (block.type) {
          case 'edition-banner':
            return <EditionBanner key={key} {...block} />
          case 'sponsor':
            return <SponsorBlock key={key} {...block} />
          case 'intro-card':
            return <IntroCard key={key} {...block} />
          case 'streak-cta':
            return <StreakCTA key={key} {...block} />
          case 'section-label':
            return <SectionLabel key={key} {...block} />
          case 'heading':
            return <Heading key={key} {...block} />
          case 'paragraph':
            return <Paragraph key={key} {...block} />
          case 'blockquote':
            return <Blockquote key={key} {...block} />
          case 'image':
            return <ArticleImage key={key} {...block} />
          case 'photo-grid':
            return <PhotoGrid key={key} {...block} />
          case 'info-card':
            return <InfoCard key={key} {...block} />
          case 'bullet-list':
            return <BulletList key={key} {...block} />
          case 'numbered-list':
            return <NumberedList key={key} {...block} />
          case 'video':
            return (
              <div key={key} className="mx-4 my-4">
                <VideoDialog {...block} />
              </div>
            )
          case 'big-quote':
            return <BigQuote key={key} {...block} />
          case 'newspaper-cover':
            return <NewspaperCover key={key} {...block} />
          case 'agenda-card':
            return <AgendaCard key={key} {...block} />
          case 'footer-desc':
            return <FooterDesc key={key} {...block} />
          case 'tns-logo':
            return <TNSLogo key={key} />
          case 'section-divider':
            return <SectionDivider key={key} />
          default:
            return null
        }
      })}
    </div>
  )
}
