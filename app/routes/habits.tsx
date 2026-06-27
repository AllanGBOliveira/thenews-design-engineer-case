import { useTranslation } from 'react-i18next'

export function meta() {
  return [{ title: 'Hábitos — the news' }]
}

export default function Habits() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      <h1 className="text-2xl font-bold">{t('habits.title')}</h1>
    </div>
  )
}
