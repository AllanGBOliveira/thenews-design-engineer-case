import { useTranslation } from 'react-i18next'
import { useRevalidator } from 'react-router'
import { MdWbSunny, MdNightlight } from 'react-icons/md'
import { Button } from '~/components/ui/button'
import { useTheme } from '~/components/theme-provider'

export function meta() {
  return [
    { title: 'the news' },
    { name: 'description', content: 'the news — design engineer case' },
  ]
}

// Locale codes follow the language-REGION pattern (same as pt-BR and en-US).
// es-ES covers all Spanish variants (es-MX, es-AR, etc.) via convertDetectedLanguage.
// ar-SA covers all Arabic variants (ar-EG, ar-MA, etc.) via convertDetectedLanguage.
const SUPPORTED_LANGS = ['pt-BR', 'en-US', 'es-ES', 'ar-SA'] as const
const LANG_LABEL: Record<string, string> = {
  'pt-BR': 'PT',
  'en-US': 'EN',
  'es-ES': 'ES',
  'ar-SA': 'AR',
}

export default function Home() {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()
  const { revalidate } = useRevalidator()

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const toggleLang = async () => {
    const currentIdx = SUPPORTED_LANGS.indexOf(
      i18n.language as typeof SUPPORTED_LANGS[number]
    )
    const next = SUPPORTED_LANGS[(currentIdx + 1) % SUPPORTED_LANGS.length]
    await i18n.changeLanguage(next)
    // i18next LanguageDetector wrote the locale cookie; revalidate so the root
    // loader re-reads it and Layout gets the correct lang + dir attributes.
    revalidate()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-bold text-lg tracking-tight">the news</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLang}
            className="text-xs font-medium"
          >
            {LANG_LABEL[i18n.language] ?? i18n.language.toUpperCase().slice(0, 2)}
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <MdWbSunny size={18} /> : <MdNightlight size={18} />}
          </Button>
        </div>
      </header>

      <main className="p-4 pb-20 space-y-6">
        <section>
          <h1 className="text-2xl font-bold">{t('home.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('home.today')}</p>
        </section>

        <section>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'business', 'tech', 'culture', 'world'] as const).map(cat => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-sm border border-border bg-secondary text-secondary-foreground"
              >
                {t(`home.categories.${cat}`)}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            {t('home.edition.latest')}
          </h2>
          <div className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="h-40 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
              cover
            </div>
            <p className="font-semibold">{t('home.edition.readMore')}</p>
          </div>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border flex">
        {(['home', 'habits', 'books', 'profile'] as const).map(item => (
          <button
            key={item}
            className="flex-1 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {t(`common.nav.${item}`)}
          </button>
        ))}
      </nav>
    </div>
  )
}
