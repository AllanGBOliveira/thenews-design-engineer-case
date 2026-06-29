import { useState, useEffect } from 'react'
import { useNavigate, useRevalidator } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  IoArrowBack,
  IoPhonePortrait,
  IoLanguage,
  IoSunny,
  IoMoon,
  IoEye,
  IoPulse,
  IoBan,
  IoShieldCheckmark,
  IoLogOut,
  IoTrash,
  IoCheckmarkCircle,
  IoChevronForward,
  IoShareSocial,
  IoCamera,
  IoPencil,
  IoLogoInstagram,
  IoLogoTiktok,
  IoLogoLinkedin,
  IoBusiness,
  IoHeart,
  IoNotifications,
  IoCheckmark,
  IoBook,
} from 'react-icons/io5'
import { FaXTwitter } from 'react-icons/fa6'
import { useTheme, type Theme } from '~/components/theme-provider'
import { useUser } from '~/context/user-context'
import { cn } from '~/lib/utils'

export function meta() {
  return [{ title: 'Profile — the news' }]
}

/* ─── Centered modal dialog ──────────────────────────────────────────── */

function Modal({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 bg-card rounded-2xl shadow-xl w-full max-w-xs overflow-hidden">
        <h2 className="text-center text-[16px] font-bold text-foreground px-4 pt-5 pb-3">{title}</h2>
        {children}
        <div className="h-4" />
      </div>
    </div>
  )
}

/* ─── Theme dialog ───────────────────────────────────────────────────── */

const FLAG_API = 'https://flagsapi.com'
type LocaleDef = { code: string; label: string; countryCode: string }
const LOCALES: LocaleDef[] = [
  { code: 'pt-BR', label: 'Português', countryCode: 'BR' },
  { code: 'en-US', label: 'English',   countryCode: 'US' },
  { code: 'es-ES', label: 'Español',   countryCode: 'ES' },
  { code: 'ar-SA', label: 'العربية',  countryCode: 'SA' },
]

type ThemeOption = {
  value: Theme
  icon: React.ComponentType<{ size?: number; className?: string }>
  labelKey: string
  descKey?: string
}
const THEME_OPTIONS: ThemeOption[] = [
  { value: 'system', icon: IoPhonePortrait, labelKey: 'settings.themeDialog.system.label', descKey: 'settings.themeDialog.system.description' },
  { value: 'light',  icon: IoSunny,         labelKey: 'settings.themeDialog.light.label' },
  { value: 'dark',   icon: IoMoon,          labelKey: 'settings.themeDialog.dark.label' },
]

function ThemeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  return (
    <Modal open={open} onClose={onClose} title={t('settings.themeDialog.title')}>
      <ul className="list-none m-0 px-3 space-y-1" role="list">
        {THEME_OPTIONS.map(({ value, icon: Icon, labelKey, descKey }) => {
          const isSelected = theme === value
          return (
            <li key={value}>
              <button
                type="button"
                onClick={() => { setTheme(value); onClose() }}
                aria-pressed={isSelected}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-3 rounded-xl text-left transition-colors',
                  isSelected ? 'bg-brand/10' : 'hover:bg-muted',
                )}
              >
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 bg-muted"
                  aria-hidden="true"
                >
                  <Icon size={20} className={isSelected ? 'text-brand' : 'text-muted-foreground'} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={cn('block text-[14px] font-semibold leading-snug', isSelected ? 'text-brand' : 'text-foreground')}>
                    {t(labelKey)}
                  </span>
                  {descKey && (
                    <span className="block text-[12px] text-muted-foreground leading-snug">{t(descKey)}</span>
                  )}
                </span>
                {isSelected && <IoCheckmarkCircle size={20} className="shrink-0 text-brand" aria-hidden="true" />}
              </button>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}

/* ─── Language dialog ────────────────────────────────────────────────── */

function LanguageModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const { revalidate } = useRevalidator()
  async function selectLocale(code: string) {
    onClose()
    if (code === i18n.language) return
    await i18n.changeLanguage(code)
    revalidate()
  }
  return (
    <Modal open={open} onClose={onClose} title={t('settings.languageDialog.title')}>
      <ul className="list-none m-0 px-3 space-y-1" role="list">
        {LOCALES.map((locale) => {
          const isSelected = locale.code === i18n.language
          return (
            <li key={locale.code}>
              <button
                type="button"
                onClick={() => selectLocale(locale.code)}
                aria-pressed={isSelected}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-3 rounded-xl text-left transition-colors',
                  isSelected ? 'bg-brand/10' : 'hover:bg-muted',
                )}
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 overflow-hidden bg-muted" aria-hidden="true">
                  <img
                    src={`${FLAG_API}/${locale.countryCode}/flat/64.png`}
                    alt=""
                    width={36}
                    height={36}
                    className="w-9 h-9 object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                </span>
                <span className={cn('flex-1 text-[14px] font-semibold', isSelected ? 'text-brand' : 'text-foreground')}>
                  {locale.label}
                </span>
                {isSelected && <IoCheckmarkCircle size={20} className="shrink-0 text-brand" aria-hidden="true" />}
              </button>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}

/* ─── Activity grid ──────────────────────────────────────────────────── */

const WEEK_COUNT = 13
const DAY_LABELS = ['seg', '', 'qua', '', 'sex', '', '']

function ActivityGrid({ activeDays }: { activeDays: number }) {
  const total = WEEK_COUNT * 7
  const activeCells = new Set<number>()
  activeCells.add(total - 5)
  for (let i = 1; i < activeDays && i < total; i++) {
    activeCells.add(total - 5 - i * 3)
  }

  const cols: boolean[][] = []
  for (let w = 0; w < WEEK_COUNT; w++) {
    const col: boolean[] = []
    for (let d = 0; d < 7; d++) {
      col.push(activeCells.has(w * 7 + d))
    }
    cols.push(col)
  }

  return (
    <div className="flex gap-0.5">
      <div className="flex flex-col gap-0.5 mr-1 justify-between">
        {DAY_LABELS.map((label, i) => (
          <span key={i} className="text-[9px] text-muted-foreground leading-none h-3 flex items-center">
            {label}
          </span>
        ))}
      </div>
      {cols.map((col, w) => (
        <div key={w} className="flex flex-col gap-0.5">
          {col.map((active, d) => (
            <div
              key={d}
              className={cn('w-3 h-3 rounded-[2px]', active ? 'bg-brand' : 'bg-muted')}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/* ─── Settings row ───────────────────────────────────────────────────── */

type RowVariant = 'icon-bg' | 'icon-plain'

type RowProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconVariant?: RowVariant
  iconColor?: string
  iconBg?: string
  label: string
  value?: string
  onClick?: () => void
  type?: 'chevron' | 'toggle'
  toggleOn?: boolean
  danger?: boolean
}

function SettingsRow({
  icon: Icon,
  iconVariant = 'icon-bg',
  iconColor,
  iconBg,
  label,
  value,
  onClick,
  type = 'chevron',
  toggleOn,
  danger,
}: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-[15px] text-left transition-colors',
        'focus-visible:outline-none focus-visible:bg-muted',
        'hover:bg-muted/50',
        danger && 'hover:bg-destructive/5',
      )}
    >
      {iconVariant === 'icon-bg' ? (
        <span
          className={cn('flex items-center justify-center w-9 h-9 rounded-xl shrink-0', iconBg ?? 'bg-muted')}
          aria-hidden="true"
        >
          <Icon size={18} className={iconColor ?? 'text-brand'} />
        </span>
      ) : (
        <span className="w-9 h-9 flex items-center justify-center shrink-0" aria-hidden="true">
          <Icon size={20} className={danger ? 'text-destructive' : 'text-muted-foreground'} />
        </span>
      )}

      <span className={cn('flex-1 text-[14px] font-medium leading-snug', danger ? 'text-destructive' : 'text-foreground')}>
        {label}
      </span>

      {type === 'chevron' && value && (
        <span className="text-[13px] text-muted-foreground">{value}</span>
      )}

      {type === 'toggle' && (
        <span
          className={cn(
            'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
            toggleOn ? 'bg-brand' : 'bg-muted-foreground/40',
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 self-center',
              toggleOn ? 'translate-x-5.5' : 'translate-x-0.5',
            )}
          />
        </span>
      )}

      {type === 'chevron' && (
        <IoChevronForward size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
      )}
    </button>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function Settings() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const user = useUser()
  const [themeOpen, setThemeOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const themeValue = t(`settings.themeValues.${theme}`)
  const currentLocale = LOCALES.find(l => l.code === i18n.language) ?? LOCALES[0]

  return (
    <div className="flex flex-col min-h-full bg-background text-foreground">
      {/* Sticky page header */}
      <header className="sticky top-0 z-[9999] flex items-center h-14 px-2 bg-background border-b border-border shrink-0">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('common.a11y.back')}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <IoArrowBack size={20} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-bold text-foreground">
          {t('settings.title')}
        </h1>
      </header>

      {/* ── Profile card ── */}
      <div className="mx-4 mt-4 bg-card rounded-2xl overflow-hidden border border-border">
        <div className="flex flex-col items-center pt-6 pb-5 px-4">
          {/* Avatar */}
          <div className="relative mb-3">
            <img
              src={user.avatarUrl}
              alt={user.name}
              width={88}
              height={88}
              className="w-22 h-22 rounded-full object-cover border-[3px] border-brand"
            />
            <span
              className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-brand flex items-center justify-center"
              aria-hidden="true"
            >
              <IoCamera size={14} className="text-background" />
            </span>
          </div>

          {/* Name */}
          <div className="flex items-center gap-1.5">
            <span className="text-foreground font-bold text-[18px] leading-tight">{user.name}</span>
            <IoPencil size={14} className="text-brand" aria-hidden="true" />
          </div>

          {/* Username */}
          <button type="button" className="mt-0.5 text-brand text-[13px] font-medium focus-visible:outline-none">
            {user.username ?? t('settings.profile.defineUsername')}
          </button>

          {/* Join date */}
          <p className="mt-0.5 text-muted-foreground text-[12px]">
            {t('settings.profile.memberSince', { date: user.joinedAt })}
          </p>

          {/* Social links */}
          <div className="flex items-center gap-3 mt-4 px-4 py-2.5 rounded-full border border-border">
            <IoLogoInstagram size={18} className="text-muted-foreground" aria-hidden="true" />
            <FaXTwitter size={16} className="text-muted-foreground" aria-hidden="true" />
            <IoLogoTiktok size={18} className="text-muted-foreground" aria-hidden="true" />
            <IoLogoLinkedin size={18} className="text-muted-foreground" aria-hidden="true" />
            <span className="text-brand text-[13px] font-semibold ml-1">
              {t('settings.profile.addSocials')}
            </span>
          </div>

          {/* Followers / following */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-foreground font-bold text-[17px]">{user.followers}</span>
              <span className="text-muted-foreground text-[11px]">{t('settings.profile.followers')}</span>
            </div>
            <div className="w-px h-8 bg-border" aria-hidden="true" />
            <div className="flex flex-col items-center">
              <span className="text-foreground font-bold text-[17px]">{user.following}</span>
              <span className="text-muted-foreground text-[11px]">{t('settings.profile.following')}</span>
            </div>
          </div>

          {/* Share profile */}
          <button
            type="button"
            className="flex items-center gap-2 mt-4 text-muted-foreground text-[13px] font-medium hover:text-foreground transition-colors focus-visible:outline-none"
          >
            <IoShareSocial size={16} aria-hidden="true" />
            {t('settings.profile.share')}
          </button>
        </div>
      </div>

      {/* ── Atividade Recente ── */}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-brand" aria-hidden="true">〜</span>
          <h2 className="text-foreground font-bold text-[15px]">{t('settings.recentActivity.title')}</h2>
        </div>

        <div className="relative pl-4">
          <div className="absolute left-5 top-2 bottom-2 w-px bg-border" aria-hidden="true" />
          <ul className="space-y-0 list-none m-0 p-0">
            {user.recentActivity.map((item, i) => (
              <li key={i} className="flex items-start gap-3 py-2.5 relative">
                <span
                  className={cn(
                    'shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 relative',
                    item.type === 'habit_complete' ? 'bg-green-600' : 'bg-[#4C3AB5]',
                  )}
                  aria-hidden="true"
                >
                  {item.type === 'habit_complete'
                    ? <IoCheckmark size={16} className="text-white" />
                    : <IoBook size={14} className="text-white" />
                  }
                </span>
                <div className="pt-1 min-w-0">
                  <p className="text-foreground text-[13px] font-medium leading-snug">
                    {item.type === 'habit_complete'
                      ? t('settings.recentActivity.habitComplete', { name: item.name })
                      : t('settings.recentActivity.editionRead', { name: item.name })
                    }
                  </p>
                  <p className="text-muted-foreground text-[11px] mt-0.5">{item.timeAgo}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Selo de Verificado ── */}
      <div className="px-4 pt-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-400 text-[16px]" aria-hidden="true">🔵</span>
          <h2 className="text-foreground font-bold text-[15px]">{t('settings.verification.title')}</h2>
        </div>
        <p className="text-muted-foreground text-[12px] mb-4">{t('settings.verification.subtitle')}</p>

        <div className="space-y-4">
          {user.verificationCriteria.map((c, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{c.emoji}</span>
                  <span className="text-foreground text-[13px] font-medium">{t(c.labelKey)}</span>
                </div>
                <span className="text-muted-foreground text-[12px]">
                  {c.current} / {c.goalDisplay}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.max(c.progress, c.progress > 0 ? 4 : 0)}%` }}
                />
              </div>
              <p className="text-right text-muted-foreground text-[10px] mt-0.5">{c.progress}%</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-muted-foreground text-[13px]">{t('settings.verification.totalProgress')}</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand text-background text-[13px] font-bold focus-visible:outline-none"
            >
              <IoShareSocial size={14} aria-hidden="true" />
              {t('settings.verification.invite')}
            </button>
            <span className="text-brand font-bold text-[14px]">{user.verificationProgress}%</span>
          </div>
        </div>
      </div>

      {/* ── Sua Performance ── */}
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-foreground font-bold text-[15px]">{t('settings.performance.title')}</h2>
          <span className="text-muted-foreground text-[13px]" aria-hidden="true">ⓘ</span>
        </div>
        <p className="text-muted-foreground text-[12px] mb-4">{t('settings.performance.subtitle')}</p>

        <div className="flex divide-x divide-border bg-card rounded-xl border border-border">
          <div className="flex-1 flex flex-col items-center gap-1 py-4">
            <span className="text-[22px]" aria-hidden="true">🔥</span>
            <span className="text-foreground font-bold text-[18px]">{user.performanceStreak}</span>
            <span className="text-muted-foreground text-[11px]">{t('settings.performance.streak')}</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 py-4">
            <span className="text-[22px]" aria-hidden="true">📚</span>
            <span className="text-foreground font-bold text-[18px]">{user.performanceBooks}</span>
            <span className="text-muted-foreground text-[11px]">{t('settings.performance.books')}</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 py-4">
            <span className="text-[22px]" aria-hidden="true">✅</span>
            <span className="text-foreground font-bold text-[18px]">{user.performanceHabitsPercent}%</span>
            <span className="text-muted-foreground text-[11px]">{t('settings.performance.habits')}</span>
          </div>
        </div>
      </div>

      {/* ── Hábitos de Hoje ── */}
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-foreground font-bold text-[15px]">{t('settings.habitsToday.title')}</h2>
          <span className="text-muted-foreground text-[13px]" aria-hidden="true">ⓘ</span>
        </div>
        <div className="flex gap-3">
          {user.todayHabits.map((h, i) => (
            <div key={i} className="relative">
              <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-[22px]">
                {h.emoji}
              </div>
              {h.badge !== undefined && (
                <span
                  className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-badge-red text-white text-[9px] font-bold flex items-center justify-center"
                  aria-hidden="true"
                >
                  {h.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Sua Atividade ── */}
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-foreground font-bold text-[15px]">{t('settings.activityGrid.title')}</h2>
          <span className="text-muted-foreground text-[13px]" aria-hidden="true">ⓘ</span>
        </div>

        <div className="overflow-x-auto pb-1">
          <ActivityGrid activeDays={user.activityDaysCount} />
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-muted-foreground text-[11px]">
            {t('settings.activityGrid.days', { count: user.activityDaysCount })}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground text-[10px]">{t('settings.activityGrid.less')}</span>
            <div className="w-3 h-3 rounded-[2px] bg-muted border border-border" aria-hidden="true" />
            <div className="w-3 h-3 rounded-[2px] bg-brand" aria-hidden="true" />
            <span className="text-muted-foreground text-[10px]">{t('settings.activityGrid.more')}</span>
          </div>
        </div>
      </div>

      {/* ── Minha Estante ── */}
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <IoBook size={18} className="text-[#8B5CF6]" aria-hidden="true" />
          <h2 className="text-foreground font-bold text-[15px]">
            {t('settings.bookshelf.title', { count: user.books.length })}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {user.books.map((book, i) => (
            <div key={i} className="bg-card rounded-xl overflow-hidden h-24 flex items-center gap-3 p-3 border border-border">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  width={40}
                  height={60}
                  className="h-16 w-10 object-cover rounded-md shrink-0"
                />
              ) : (
                <div className="h-16 w-10 rounded-md bg-muted shrink-0 flex items-center justify-center">
                  <IoBook size={16} className="text-muted-foreground" aria-hidden="true" />
                </div>
              )}
              <span className="text-foreground text-[12px] font-medium leading-tight line-clamp-3">{book.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Engajamento ── */}
      <div className="px-4 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-foreground font-bold text-[15px]">{t('settings.engagement.title')}</h2>
          <span className="text-muted-foreground text-[13px]" aria-hidden="true">ⓘ</span>
        </div>

        <div className="flex divide-x divide-border bg-card rounded-xl border border-border">
          <div className="flex-1 flex flex-col items-center gap-1 py-4">
            <span className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mb-1" aria-hidden="true">
              <IoBusiness size={18} className="text-white" />
            </span>
            <span className="text-foreground font-bold text-[22px]">{user.engagementPoints}</span>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1 py-4">
            <span className="w-10 h-10 rounded-full bg-amber-700 flex items-center justify-center mb-1" aria-hidden="true">
              <span className="text-[18px]">🏆</span>
            </span>
            <span className="text-foreground font-bold text-[22px]">{user.engagementTrophies}</span>
          </div>
        </div>
      </div>

      {/* ── conta (settings) ── */}
      <div className="mt-6">
        <h2 className="px-4 pb-2 text-foreground text-[14px] font-semibold">
          {t('settings.sections.account')}
        </h2>

        <div className="divide-y divide-border">
          <SettingsRow
            icon={IoLanguage}
            iconVariant="icon-bg"
            iconBg="bg-brand/15"
            iconColor="text-brand"
            label={t('settings.rows.language')}
            value={currentLocale.label}
            type="chevron"
            onClick={() => setLangOpen(true)}
          />
          <SettingsRow
            icon={IoPhonePortrait}
            iconVariant="icon-bg"
            iconBg="bg-brand/15"
            iconColor="text-brand"
            label={t('settings.rows.theme')}
            value={themeValue}
            type="chevron"
            onClick={() => setThemeOpen(true)}
          />
          <SettingsRow
            icon={IoPhonePortrait}
            iconVariant="icon-bg"
            iconBg="bg-brand/15"
            iconColor="text-brand"
            label={t('settings.rows.vibration')}
            type="toggle"
            toggleOn
          />
          <SettingsRow
            icon={IoEye}
            iconVariant="icon-bg"
            iconBg="bg-teal-500/15"
            iconColor="text-teal-500"
            label={t('settings.rows.publicProfile')}
            type="toggle"
            toggleOn
          />
          <SettingsRow
            icon={IoPulse}
            iconVariant="icon-bg"
            iconBg="bg-muted"
            iconColor="text-muted-foreground"
            label={t('settings.rows.shareHabits')}
            type="toggle"
            toggleOn={false}
          />
          <SettingsRow
            icon={IoHeart}
            iconVariant="icon-plain"
            label={t('settings.rows.likedEditions')}
            type="chevron"
          />
          <SettingsRow
            icon={IoNotifications}
            iconVariant="icon-plain"
            label={t('settings.rows.notificationPrefs')}
            type="chevron"
          />
          <SettingsRow
            icon={IoBan}
            iconVariant="icon-plain"
            label={t('settings.rows.blockedUsers')}
            type="chevron"
          />
          <SettingsRow
            icon={IoShieldCheckmark}
            iconVariant="icon-plain"
            label={t('settings.rows.privacy')}
            type="chevron"
          />
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="px-4 mt-6 mb-6 space-y-3">
        <button
          type="button"
          aria-label={t('settings.signOutAria')}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-[14px] font-semibold hover:bg-destructive/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
        >
          <IoLogOut size={18} aria-hidden="true" />
          {t('settings.signOut')}
        </button>
        <button
          type="button"
          aria-label={t('settings.deleteAccountAria')}
          className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive/60 text-[14px] font-semibold hover:bg-destructive/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
        >
          <IoTrash size={18} aria-hidden="true" />
          {t('settings.deleteAccount')}
        </button>
      </div>

      {/* Modals */}
      <ThemeModal open={themeOpen} onClose={() => setThemeOpen(false)} />
      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} />
    </div>
  )
}
