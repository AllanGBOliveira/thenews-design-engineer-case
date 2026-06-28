/* ─── Category definitions ─────────────────────────────────────── */

export type Category = {
  slug: string
  label: string
  dotColor: string
  hasReadingProgress: boolean
}

export const CATEGORIES: Category[] = [
  { slug: 'the-news',      label: 'the news',     dotColor: '#F97316', hasReadingProgress: true  },
  { slug: 'night',         label: 'night',         dotColor: '#1E3A5F', hasReadingProgress: false },
  { slug: 'tempo-de-copa', label: 'tempo de copa', dotColor: '#16A34A', hasReadingProgress: false },
  { slug: 'money',         label: 'money',         dotColor: '#0891B2', hasReadingProgress: false },
  { slug: 'health',        label: 'health',        dotColor: '#2563EB', hasReadingProgress: false },
  { slug: 'business',      label: 'business',      dotColor: '#9333EA', hasReadingProgress: false },
  { slug: 'trends',        label: 'trends',        dotColor: '#EF4444', hasReadingProgress: false },
  { slug: 'around',        label: 'around',        dotColor: '#78716C', hasReadingProgress: false },
  { slug: 'travel',        label: 'travel',        dotColor: '#94A3B8', hasReadingProgress: false },
  { slug: 'cult',          label: 'cult',          dotColor: '#DC2626', hasReadingProgress: false },
  { slug: 'better-work',   label: 'better work',   dotColor: '#3B82F6', hasReadingProgress: false },
  { slug: 'rising',        label: 'rising',        dotColor: '#C4B5FD', hasReadingProgress: false },
]

/* ─── Quiz data ────────────────────────────────────────────────── */

export type QuizQuestion = {
  question: string
  options: string[]
  correctIndex: number
}

export type Quiz = {
  categorySlug: string
  title: string
  questions: QuizQuestion[]
}

export const QUIZZES: Quiz[] = [
  {
    categorySlug: 'the-news',
    title: "quiz do dia - sunday's edition (28/06)",
    questions: [
      {
        question: 'qual restaurante californiano com estrela Michelin lançou um moletom que virou raridade?',
        options: ["Trader Joe's", "Max & Helen's", "Bell's", 'CazéTV'],
        correctIndex: 2,
      },
      {
        question: 'qual é o número de países africanos que avançaram de fase nesta Copa do Mundo?',
        options: ['7', '8', '9', '10'],
        correctIndex: 2,
      },
      {
        question: 'qual emissora está lucrando com comerciais durante as pausas de hidratação?',
        options: ['NBC', 'Fox', 'ABC', 'ESPN'],
        correctIndex: 1,
      },
      {
        question: 'qual empresa fez de Luana Lopes Lara a mais jovem bilionária self-made do mundo?',
        options: ['Meta', 'Amazon', 'SpaceX', 'Kalshi'],
        correctIndex: 3,
      },
      {
        question: 'quanto o Rei Charles III declarou de imposto em 2024-2025?',
        options: ['£8,5 milhões', '£10,2 milhões', '£12,9 milhões', '£15,4 milhões'],
        correctIndex: 2,
      },
    ],
  },
]

/* ─── Helpers ──────────────────────────────────────────────────── */

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function getQuiz(slug: string): Quiz | undefined {
  return QUIZZES.find((q) => q.categorySlug === slug)
}
