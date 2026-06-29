import { useState, useRef, useEffect } from 'react'
import { Link, useLoaderData, useLocation } from 'react-router'
import { IoArrowBack, IoFlash, IoGlobeOutline } from 'react-icons/io5'
import type { Route } from './+types/editions.$slug'
import { ReadingProgress } from '~/components/reading-progress'
import { XpToast } from '~/components/xp-toast'
import { RatingSheet, ContinueSheet } from '~/components/rating-sheet'
import { QuizScreen } from '~/components/quiz-screen'
import { EditionHtml } from '~/components/edition-html'
import { Badge } from '~/components/ui/badge'
import {
  fetchEditionBySlug,
  categorySlugFromCaderno,
  type Edition,
} from '~/data/api'
import { getCategory, getQuiz } from '~/data/editions'

/* ─── Loader ─────────────────────────────────────────────────────────────── */

export async function loader({ params }: Route.LoaderArgs) {
  const slug = params.slug ?? ''
  const edition = await fetchEditionBySlug(slug)
  return { edition }
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
  const catSlug = categorySlugFromCaderno(edition.cadernoId)
  const category = getCategory(catSlug)
  const date = edition.publishDate
    ? new Date(edition.publishDate + 'T12:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit', month: 'short', year: 'numeric',
      })
    : null

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-chrome-divider bg-chrome-bg">
      <Link
        to="/"
        aria-label="Voltar para o feed"
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-chrome-text/10 transition-colors shrink-0 text-chrome-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <IoArrowBack size={18} aria-hidden="true" />
      </Link>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
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
        {date && (
          <p className="text-[12px] text-chrome-muted mt-0.5 truncate">{date}</p>
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

  // Client nav passes full edition via Link state (avoids re-fetch + cache miss)
  const stateEdition = (location.state as { edition?: Edition } | null)?.edition
  const edition = stateEdition ?? loaderData.edition

  const catSlug = edition ? categorySlugFromCaderno(edition.cadernoId) : 'the-news'
  const category = getCategory(catSlug)
  const hasProgress = category?.hasReadingProgress ?? false
  const quiz = getQuiz(catSlug) ?? getQuiz('the-news')

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

      <EditionHeader edition={edition} />

      {hasProgress && (
        <ReadingProgress
          contentRef={contentRef}
          onComplete={handleReadingComplete}
          storageKey={edition.id}
        />
      )}

      {!hasProgress && quiz && (
        <FloatingQuizButton onClick={() => setQuizOpen(true)} />
      )}

      <article
        ref={contentRef}
        aria-label={`Edição: ${edition.subjectLine}`}
        className="bg-chrome-bg min-h-screen"
      >
        <EditionHtml
          html={edition.htmlContent}
          primaryColor={category?.dotColor ?? '#F97316'}
          className="pb-8"
        />
      </article>

      <RatingSheet
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        onSubmit={handleRatingSubmit}
      />
      <ContinueSheet
        open={continueOpen}
        onClose={() => setContinueOpen(false)}
        onQuiz={handleQuizOpen}
      />
      <QuizScreen
        quiz={quiz}
        open={quizOpen}
        onClose={() => setQuizOpen(false)}
      />
    </>
  )
}
