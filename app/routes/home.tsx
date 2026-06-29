import { useState, useRef, useEffect } from 'react'
import { useLoaderData } from 'react-router'
import { IoFlash } from 'react-icons/io5'
import { CategoryTabs } from '~/components/category-tabs'
import { ReadingProgress } from '~/components/reading-progress'
import { XpToast } from '~/components/xp-toast'
import { RatingSheet, ContinueSheet } from '~/components/rating-sheet'
import { QuizScreen } from '~/components/quiz-screen'
import { EditionHtml } from '~/components/edition-html'
import { fetchEditions, buildEditionMap, type EditionMap } from '~/data/api'
import { getCategory, getQuiz } from '~/data/editions'

export function meta() {
  return [
    { title: 'Edição — the news' },
    { name: 'description', content: 'the news — edição diária' },
  ]
}

/* ─── Loader ─────────────────────────────────────────────────────────
   Runs server-side in SSR, client-side in SPA. Fetches the public
   /api/mobile/editions endpoint (no auth required) and maps each
   edition to its category slug via cadernoId.
──────────────────────────────────────────────────────────────────────── */

export async function loader() {
  const editions = await fetchEditions()
  const editionMap = buildEditionMap(editions)
  return { editionMap }
}

/* ─── Date + link header (non-main categories) ───────────────────── */

function DateHeader({ subtitle, webUrl }: { subtitle: string | null; webUrl: string }) {
  if (!subtitle) return null
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-l-4 border-brand bg-brand/5 mx-0 my-4">
      <span className="text-[13px] font-medium text-chrome-text">{subtitle}</span>
      <a
        href={webUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[12px] text-brand font-bold shrink-0"
      >
        Leia Online ↗
      </a>
    </div>
  )
}

/* ─── Edition content ────────────────────────────────────────────── */

function EmptyEdition() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center gap-4">
      <span className="text-5xl" aria-hidden="true">📰</span>
      <p className="text-chrome-muted text-[15px]">
        Nenhuma edição disponível hoje para esta categoria.
      </p>
    </div>
  )
}

function EditionContent({
  editionMap,
  activeSlug,
  isMain,
}: {
  editionMap: EditionMap
  activeSlug: string
  isMain: boolean
}) {
  const edition = editionMap[activeSlug]
  const category = getCategory(activeSlug)
  const primaryColor = category?.dotColor ?? '#F97316'

  if (!edition) return <EmptyEdition />

  return (
    <>
      {!isMain && (
        <DateHeader subtitle={edition.subtitle} webUrl={edition.webUrl} />
      )}
      <EditionHtml
        html={edition.htmlContent}
        primaryColor={primaryColor}
        className="pb-8"
      />
    </>
  )
}

/* ─── Floating quiz button ───────────────────────────────────────── */

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

/* ─── Home page ──────────────────────────────────────────────────── */

export default function Home() {
  const { editionMap } = useLoaderData<typeof loader>()
  const [activeSlug, setActiveSlug] = useState('the-news')
  const contentRef = useRef<HTMLElement>(null)

  const [xpVisible, setXpVisible] = useState(false)
  const [ratingOpen, setRatingOpen] = useState(false)
  const [continueOpen, setContinueOpen] = useState(false)
  const [quizOpen, setQuizOpen] = useState(false)
  const [readingDone, setReadingDone] = useState(false)

  const activeCategory = getCategory(activeSlug)
  const quiz = getQuiz(activeSlug) ?? getQuiz('the-news')
  const isMainCategory = activeCategory?.hasReadingProgress ?? false

  function handleCategorySelect(slug: string) {
    if (slug === activeSlug) return
    setActiveSlug(slug)
    setReadingDone(false)
    setXpVisible(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

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

  return (
    <>
      <XpToast show={xpVisible} />

      <CategoryTabs activeSlug={activeSlug} onSelect={handleCategorySelect} />

      {isMainCategory && (
        <ReadingProgress
          contentRef={contentRef}
          onComplete={handleReadingComplete}
          storageKey={editionMap['the-news']?.id}
        />
      )}

      {!isMainCategory && quiz && (
        <FloatingQuizButton onClick={() => setQuizOpen(true)} />
      )}

      <article
        ref={contentRef}
        aria-label="Edição do the news"
        className="bg-chrome-bg min-h-screen"
      >
        <EditionContent
          editionMap={editionMap}
          activeSlug={activeSlug}
          isMain={isMainCategory}
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
