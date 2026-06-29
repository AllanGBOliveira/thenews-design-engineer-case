import { useState, useRef, useEffect } from 'react'
import { Link, useLoaderData, useLocation, useNavigate } from 'react-router'
import { IoArrowBack, IoFlash, IoGlobeOutline, IoChevronBack, IoChevronForward } from 'react-icons/io5'
import type { Route } from './+types/editions.$slug'
import { ReadingProgress } from '~/components/reading-progress'
import { XpToast } from '~/components/xp-toast'
import { RatingSheet, ContinueSheet } from '~/components/rating-sheet'
import { QuizScreen } from '~/components/quiz-screen'
import { EditionHtml } from '~/components/edition-html'
import { Badge } from '~/components/ui/badge'
import {
  fetchEditionWithNeighbors,
  categorySlugFromCaderno,
  parseEditionTags,
  type Edition,
} from '~/data/api'
import { getCategory, getQuiz } from '~/data/editions'

/* ─── Loader ─────────────────────────────────────────────────────────────── */

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const slug = params.slug ?? ''
  const { edition, prev, next } = await fetchEditionWithNeighbors(slug)
  return { edition, prev, next }
}

export function meta({ loaderData }: Route.MetaArgs) {
  const edition = loaderData?.edition
  return [
    { title: edition ? `${edition.subjectLine} — the news` : 'Edição — the news' },
    { name: 'description', content: edition?.previewText ?? 'the news — edição diária' },
  ]
}

/* ─── Newsletter header ──────────────────────────────────────────────────── */

function EditionHeader({ edition }: { edition: Edition }) {
  const navigate = useNavigate()
  const catSlug = categorySlugFromCaderno(edition.cadernoId)
  const category = getCategory(catSlug)
  const tags = parseEditionTags(edition.contentTags)
  const date = edition.publishDate
    ? new Date(edition.publishDate + 'T12:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null

  function handleBack(e: React.MouseEvent) {
    // Prefer history.back() to preserve listing search params.
    // Falls through to <Link to="/"> href if history is unavailable (direct URL access).
    if (typeof window !== 'undefined' && window.history.length > 1) {
      e.preventDefault()
      navigate(-1)
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-chrome-divider bg-chrome-bg">
      <Link
        to="/"
        onClick={handleBack}
        aria-label="Voltar para o feed"
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-chrome-text/10 transition-colors shrink-0 text-chrome-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <IoArrowBack size={18} aria-hidden="true" />
      </Link>

      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Newsletter + status badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold text-white leading-none"
            style={{ backgroundColor: category?.dotColor ?? '#F97316' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" aria-hidden="true" />
            {category?.label ?? 'the news'}
          </span>
          {edition.audience === 'premium' && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 h-auto">
              Premium
            </Badge>
          )}
          {edition.isCurrentEdition && (
            <Badge className="text-[10px] px-1.5 py-0.5 h-auto bg-brand text-[#0A0A0F] border-none">
              Hoje
            </Badge>
          )}
        </div>

        {/* Date + content tag chips */}
        {(date || tags.length > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {date && (
              <time dateTime={edition.publishDate ?? undefined} className="text-[11px] text-chrome-muted shrink-0">
                {date}
              </time>
            )}
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-none bg-chrome-divider text-chrome-muted whitespace-nowrap"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <a
        href={edition.webUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Ler no site"
        className="flex items-center justify-center w-8 h-8 rounded-full text-chrome-muted hover:bg-chrome-text/10 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <IoGlobeOutline size={18} aria-hidden="true" />
      </a>
    </div>
  )
}

/* ─── Floating quiz button ───────────────────────────────────────────────── */

function FloatingQuizButton({ onClick }: { onClick: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const main = document.getElementById('main-content')
    const target: EventTarget = main ?? window
    function check() {
      const scrollTop = main ? main.scrollTop : window.scrollY
      setVisible(scrollTop > 200)
    }
    target.addEventListener('scroll', check, { passive: true })
    return () => target.removeEventListener('scroll', check)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Fazer o quiz da edição"
      className="fixed z-30 right-4 bottom-[88px] flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand text-[#0A0A0F] font-bold text-[13px] shadow-lg hover:bg-brand-dim transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <IoFlash size={14} aria-hidden="true" />
      Quiz
    </button>
  )
}

/* ─── Edition navigation (prev / next) ──────────────────────────────────── */

function NavCard({
  edition,
  direction,
  currentEdition,
}: {
  edition: Edition
  direction: 'prev' | 'next'
  currentEdition: Edition
}) {
  const catSlug = categorySlugFromCaderno(edition.cadernoId)
  const category = getCategory(catSlug)
  const isNext = direction === 'next'
  const date = edition.publishDate
    ? new Date(edition.publishDate + 'T12:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
      })
    : null

  // Pass the current edition as the known neighbor in state so the target page
  // renders the correct adjacent link instantly — without waiting for the loader.
  const linkState = isNext
    ? { edition, prev: currentEdition }   // target's "prev" (older) = us
    : { edition, next: currentEdition }   // target's "next" (newer) = us

  return (
    <Link
      to={`/${edition.slug}`}
      state={linkState}
      className={[
        'flex flex-col gap-2 p-4 rounded-xl border border-chrome-divider bg-chrome-surface',
        'hover:border-chrome-muted transition-colors group',
        isNext ? 'items-end text-right' : 'items-start text-left',
      ].join(' ')}
    >
      <span className="flex items-center gap-1 text-chrome-muted text-[11px] font-medium">
        {!isNext && <IoChevronBack size={11} aria-hidden="true" />}
        {isNext ? 'Próximo post' : 'Post anterior'}
        {isNext && <IoChevronForward size={11} aria-hidden="true" />}
      </span>

      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white leading-none"
        style={{ backgroundColor: category?.dotColor ?? '#F97316' }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" aria-hidden="true" />
        {category?.label ?? 'the news'}
      </span>

      <p className="text-chrome-text font-semibold text-[13px] leading-snug line-clamp-2 group-hover:text-brand transition-colors">
        {edition.subjectLine}
      </p>

      {date && (
        <time dateTime={edition.publishDate ?? undefined} className="text-chrome-muted text-[11px]">
          {date}
        </time>
      )}
    </Link>
  )
}

function EditionNav({
  prev,
  next,
  current,
}: {
  prev: Edition | null
  next: Edition | null
  current: Edition
}) {
  if (!prev && !next) return null

  return (
    <nav aria-label="Navegação entre posts" className="border-t border-chrome-divider px-4 py-6">
      <p className="text-chrome-muted text-[11px] font-semibold uppercase tracking-widest mb-4">
        Continue lendo
      </p>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {prev ? (
          <NavCard edition={prev} direction="prev" currentEdition={current} />
        ) : (
          <div aria-hidden="true" />
        )}
        {next && <NavCard edition={next} direction="next" currentEdition={current} />}
      </div>
    </nav>
  )
}

/* ─── Not found ──────────────────────────────────────────────────────────── */

function EditionNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center gap-4">
      <span className="text-5xl" aria-hidden="true">📰</span>
      <p className="text-chrome-text font-bold text-[17px]">Edição não encontrada</p>
      <p className="text-chrome-muted text-[14px]">
        Essa edição pode não estar mais disponível na API pública.
      </p>
      <Link
        to="/"
        className="mt-2 px-6 py-3 rounded-xl bg-brand text-[#0A0A0F] font-bold text-[15px] hover:bg-brand-dim transition-colors"
      >
        Ver todas as edições
      </Link>
    </div>
  )
}

/* ─── Edition view ───────────────────────────────────────────────────────── */

export default function EditionDetail() {
  const loaderData = useLoaderData<typeof loader>()
  const location = useLocation()

  // Client nav passes edition (and optionally known neighbors) via Link state for
  // instant display — avoids a loader round-trip for data we already have.
  const stateData = location.state as {
    edition?: Edition
    prev?: Edition | null
    next?: Edition | null
  } | null
  const edition = stateData?.edition ?? loaderData.edition

  // loaderData.prev/next are only reliable when the loader has completed for
  // THIS slug. During a pending navigation loaderData still holds the previous
  // post's values — comparing slugs detects the stale-data window.
  const currentSlug = location.pathname.replace(/^\//, '')
  const loaderIsFresh = loaderData.edition?.slug === currentSlug

  // Known side → state (instant). Unknown side → loaderData only when fresh
  // (loader finished for this slug); otherwise null to avoid showing stale data.
  const prev = stateData && 'prev' in stateData
    ? stateData.prev
    : loaderIsFresh ? loaderData.prev : null
  const next = stateData && 'next' in stateData
    ? stateData.next
    : loaderIsFresh ? loaderData.next : null

  const catSlug = edition ? categorySlugFromCaderno(edition.cadernoId) : 'the-news'
  const category = getCategory(catSlug)
  const hasProgress = category?.hasReadingProgress ?? false
  const quiz = getQuiz(edition?.slug ?? '')

  const contentRef = useRef<HTMLElement>(null)
  const [xpVisible, setXpVisible] = useState(false)
  const [ratingOpen, setRatingOpen] = useState(false)
  const [continueOpen, setContinueOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [readingDone, setReadingDone] = useState(false)

  function handleReadingComplete() {
    if (readingDone) return
    setReadingDone(true)
    setXpVisible(true)
    setTimeout(() => setRatingOpen(true), 3200)
  }

  function handleRatingSubmit() {
    setRatingOpen(false)
    setTimeout(() => setContinueOpen(true), 300)
  }

  function handleQuizOpen() {
    setContinueOpen(false)
    setTimeout(() => setQuizOpen(true), 300)
  }

  if (!edition) return <EditionNotFound />

  return (
    <>
      <XpToast show={xpVisible} />

      {/* Sticky wrapper — keeps back button + reading progress bar glued to the top of
          the scroll container as a single unit, eliminating any gap between them. */}
      <div className="sticky top-0 z-10">
        <EditionHeader edition={edition} />

        {hasProgress && (
          <ReadingProgress
            contentRef={contentRef}
            onComplete={handleReadingComplete}
            editionId={edition.id}
            slug={edition.slug}
          />
        )}
      </div>

      {!hasProgress && quiz && (
        <FloatingQuizButton onClick={() => setQuizOpen(true)} />
      )}

      <article
        ref={contentRef}
        aria-label={`Edição: ${edition.subjectLine}`}
        className="bg-chrome-bg"
      >
        <EditionHtml
          html={edition.htmlContent}
          primaryColor={category?.dotColor ?? '#F97316'}
          className="pb-8"
        />
      </article>

      {edition && <EditionNav prev={prev ?? null} next={next ?? null} current={edition} />}

      <RatingSheet
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        onSubmit={handleRatingSubmit}
      />
      <ContinueSheet
        open={continueOpen}
        onClose={() => setContinueOpen(false)}
        onQuiz={handleQuizOpen}
        hasQuiz={!!quiz}
      />
      <QuizScreen
        quiz={quiz}
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
      />
    </>
  )
}
