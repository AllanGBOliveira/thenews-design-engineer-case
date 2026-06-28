import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ComarkClient } from '@comark/react'
import { IoFlash } from 'react-icons/io5'
import { CategoryTabs } from '~/components/category-tabs'
import { ReadingProgress } from '~/components/reading-progress'
import { XpToast } from '~/components/xp-toast'
import { RatingSheet, ContinueSheet } from '~/components/rating-sheet'
import { QuizScreen } from '~/components/quiz-screen'
import { editionComponents } from '~/components/edition-components'
import { getRawEdition, parseEdition } from '~/data/content-loader'
import { getCategory, getQuiz } from '~/data/editions'

export function meta() {
  return [
    { title: 'Edição — the news' },
    { name: 'description', content: 'the news — edição diária' },
  ]
}

/* ─── Date header (non-main categories) ────────────────────────── */

function DateHeader({ date, readOnlineUrl }: { date?: string; readOnlineUrl?: string }) {
  if (!date) return null
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-l-4 border-brand bg-brand/5 mx-0 my-4">
      <span className="text-[13px] font-medium text-chrome-text">{date}</span>
      {readOnlineUrl && readOnlineUrl !== '#' && (
        <a
          href={readOnlineUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-brand font-bold shrink-0"
        >
          Leia Online ↗
        </a>
      )}
    </div>
  )
}

/* ─── Edition content (comark MDC renderer) ─────────────────────── */

function EditionContent({ slug, isMain }: { slug: string; isMain: boolean }) {
  const { i18n } = useTranslation()
  const raw = getRawEdition(slug, i18n.language)

  if (!raw) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center gap-4">
        <span className="text-5xl" aria-hidden="true">📰</span>
        <p className="text-chrome-muted text-[15px]">
          Edição não disponível para esta categoria.
        </p>
      </div>
    )
  }

  const { frontmatter, content } = parseEdition(raw)

  return (
    <>
      {!isMain && <DateHeader date={frontmatter.date} readOnlineUrl={frontmatter.readOnlineUrl} />}
      <ComarkClient
        markdown={content}
        components={editionComponents}
        className="px-4 pb-8"
      />
    </>
  )
}

/* ─── Floating quiz button (non-main categories) ───────────────── */

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

/* ─── Home page ────────────────────────────────────────────────── */

export default function Home() {
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
        <EditionContent slug={activeSlug} isMain={isMainCategory} />
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
