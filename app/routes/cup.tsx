import { useTranslation } from 'react-i18next'

export function meta() {
  return [{ title: 'Copa — the news' }]
}

export default function Cup() {
  const { t } = useTranslation()

  return (
    <div className="px-4 py-6">
      <p className="text-muted-foreground text-sm text-center mt-8">
        {t('cup.placeholder')}
      </p>
    </div>
  )
}
