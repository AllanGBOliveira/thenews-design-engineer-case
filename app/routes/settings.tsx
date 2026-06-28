import { useState, useEffect, useRef } from 'react'
import { useNavigate, useRevalidator } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  IoArrowBack,
  IoPhonePortrait,
  IoSunny,
  IoMoon,
  IoNotifications,
  IoBan,
  IoShieldCheckmark,
  IoLogOut,
  IoCheckmarkCircle,
  IoChevronForward,
  IoFlame,
  IoNewspaper,
} from 'react-icons/io5'
import { useTheme, type Theme } from '~/components/theme-provider'
import { useUser } from '~/context/user-context'
import { cn } from '~/lib/utils'

export function meta() {
  return [{ title: 'Profile — the news' }]
}

/* ─── Types ──────────────────────────────────────────────────────────── */

const FLAG_API = 'https://flagsapi.com'

type LocaleDef = {
  code: string
  label: string
  countryCode: string
}

const LOCALES: LocaleDef[] = [
  { code: 'pt-BR', label: 'Português', countryCode: 'BR' },
  { code: 'en-US', label: 'English',   countryCode: 'US' },
  { code: 'es-ES', label: 'Español',   countryCode: 'ES' },
  { code: 'ar-SA', label: 'العربية',  countryCode: 'SA' },
]

function flagSrc(countryCode: string) {
  return `${FLAG_API}/${countryCode}/flat/64.png`
}

/* ─── Bottom sheet overlay ───────────────────────────────────────────── */

function Overlay({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative z-10 bg-[#1E1E28] rounded-t-2xl pb-8 max-h-[80dvh] overflow-y-auto"
      >
        <div className="flex items-center justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" aria-hidden="true" />
        </div>
        <h2 className="text-center text-[16px] font-bold text-chrome-text px-4 pt-3 pb-4">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}

/* ─── Theme dialog ───────────────────────────────────────────────────── */

type ThemeOption = {
  value: Theme
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconBg: string
  labelKey: string
  descKey?: string
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'system', icon: IoPhonePortrait, iconBg: '#92400E', labelKey: 'settings.themeDialog.system.label', descKey: 'settings.themeDialog.system.description' },
  { value: 'light',  icon: IoSunny,         iconBg: '#374151', labelKey: 'settings.themeDialog.light.label' },
  { value: 'dark',   icon: IoMoon,          iconBg: '#1F2937', labelKey: 'settings.themeDialog.dark.label' },
]

function ThemeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()

  return (
    <Overlay open={open} onClose={onClose} title={t('settings.themeDialog.title')}>
      <ul className="list-none m-0 px-4 pb-2 space-y-1" role="list">
        {THEME_OPTIONS.map(({ value, icon: Icon, iconBg, labelKey, descKey }) => {
          const isSelected = theme === value
          return (
            <li key={value}>
              <button
                type="button"
                onClick={() => { setTheme(value); onClose() }}
                aria-pressed={isSelected}
                className={cn(
                  'flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-left transition-colors',
                  isSelected ? 'bg-brand/10' : 'hover:bg-white/5 active:bg-white/8',
                )}
              >
                <span
                  className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
                  style={{ backgroundColor: iconBg }}
                  aria-hidden="true"
                >
                  <Icon size={22} className="text-white" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={cn(
                    'block text-[15px] font-semibold leading-snug',
                    isSelected ? 'text-brand' : 'text-chrome-text',
                  )}>
                    {t(labelKey)}
                  </span>
                  {descKey && (
                    <span className="block text-[12px] text-chrome-muted leading-snug">
                      {t(descKey)}
                    </span>
                  )}
                </span>
                {isSelected && (
                  <IoCheckmarkCircle
                    size={22}
                    className="shrink-0 text-brand"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </Overlay>
  )
}

/* ─── Language dialog ────────────────────────────────────────────────── */

function LanguageDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const { revalidate } = useRevalidator()

  async function selectLocale(code: string) {
    onClose()
    if (code === i18n.language) return
    await i18n.changeLanguage(code)
    revalidate()
  }

  return (
    <Overlay open={open} onClose={onClose} title={t('settings.languageDialog.title')}>
      <ul className="list-none m-0 px-4 pb-2 space-y-1" role="list">
        {LOCALES.map((locale) => {
          const isSelected = locale.code === i18n.language
          return (
            <li key={locale.code}>
              <button
                type="button"
                onClick={() => selectLocale(locale.code)}
                aria-pressed={isSelected}
                className={cn(
                  'flex items-center gap-4 w-full px-4 py-3.5 rounded-xl text-left transition-colors',
                  isSelected ? 'bg-brand/10' : 'hover:bg-white/5 active:bg-white/8',
                )}
              >
                <span
                  className="flex items-center justify-center w-11 h-11 rounded-xl shrink-0 overflow-hidden bg-[#374151]"
                  aria-hidden="true"
                >
                  <img
                    src={flagSrc(locale.countryCode)}
                    alt=""
                    width={40}
                    height={40}
                    className="w-10 h-10 object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                </span>
                <span className={cn(
                  'flex-1 text-[15px] font-semibold leading-snug',
                  isSelected ? 'text-brand' : 'text-chrome-text',
                )}>
                  {locale.label}
                </span>
                {isSelected && (
                  <IoCheckmarkCircle
                    size={22}
                    className="shrink-0 text-brand"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </Overlay>
  )
}

/* ─── Settings row ───────────────────────────────────────────────────── */

type RowProps = {
  icon: React.ComponentType<{ size?: number; className?: string }>
  iconBg?: string
  label: string
  value?: string
  onClick?: () => void
  type?: 'chevron' | 'toggle' | 'plain'
  toggleOn?: boolean
  danger?: boolean
}

function SettingsRow({ icon: Icon, iconBg, label, value, onClick, type = 'chevron', toggleOn, danger }: RowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'flex items-center gap-3 w-full px-4 py-4 text-left transition-colors',
        'focus-visible:outline-none focus-visible:bg-white/5',
        onClick && 'hover:bg-white/5 active:bg-white/8',
        danger && 'hover:bg-red-500/5',
      )}
    >
      {iconBg ? (
        <span
          className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
          style={{ backgroundColor: iconBg }}
          aria-hidden="true"
        >
          <Icon size={18} className="text-white" />
        </span>
      ) : (
        <span aria-hidden="true">
          <Icon size={20} className={cn('shrink-0', danger ? 'text-red-400' : 'text-chrome-muted')} />
        </span>
      )}

      <span className={cn(
        'flex-1 text-[14px] font-medium leading-snug',
        danger ? 'text-red-400' : 'text-chrome-text',
      )}>
        {label}
      </span>

      {type === 'chevron' && value && (
        <span className="text-[13px] text-chrome-muted">{value}</span>
      )}

      {type === 'toggle' && (
        <span
          className={cn(
            'relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors duration-200',
            toggleOn ? 'bg-brand' : 'bg-chrome-muted/40',
          )}
          aria-hidden="true"
        >
          <span className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 self-center',
            toggleOn ? 'translate-x-4.5' : 'translate-x-0.5',
          )} />
        </span>
      )}

      {type === 'chevron' && (
        <IoChevronForward size={16} className="shrink-0 text-chrome-muted" aria-hidden="true" />
      )}
    </button>
  )
}

/* ─── Profile card ───────────────────────────────────────────────────── */

function ProfileCard() {
  const { t } = useTranslation()
  const user = useUser()

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center gap-4">
        <img
          src={user.avatarUrl}
          alt={user.name}
          width={72}
          height={72}
          className="w-18 h-18 rounded-full object-cover border-2 border-brand/30 shrink-0"
        />
        <div className="min-w-0">
          <p className="text-chrome-text font-bold text-[17px] leading-tight truncate">
            {user.name}
          </p>
          <p className="text-chrome-muted text-[13px] leading-snug mt-0.5">
            {user.email}
          </p>
          {user.plan === 'premium' && (
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-brand text-chrome-bg text-[10px] font-bold leading-none">
              PREMIUM
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mt-5">
        <div className="flex-1 bg-chrome-surface rounded-xl p-3 flex flex-col items-center gap-1">
          <IoFlame size={18} className="text-brand" aria-hidden="true" />
          <span className="text-chrome-text font-bold text-[18px] leading-none">{user.streakCurrent}</span>
          <span className="text-chrome-muted text-[10px] leading-none">{t('settings.profile.streak')}</span>
        </div>
        <div className="flex-1 bg-chrome-surface rounded-xl p-3 flex flex-col items-center gap-1">
          <IoNewspaper size={18} className="text-brand" aria-hidden="true" />
          <span className="text-chrome-text font-bold text-[18px] leading-none">{user.editionsRead}</span>
          <span className="text-chrome-muted text-[10px] leading-none">{t('settings.profile.editions')}</span>
        </div>
        <div className="flex-1 bg-chrome-surface rounded-xl p-3 flex flex-col items-center gap-1">
          <IoFlame size={18} className="text-chrome-muted" aria-hidden="true" />
          <span className="text-chrome-text font-bold text-[18px] leading-none">{user.streakLongest}</span>
          <span className="text-chrome-muted text-[10px] leading-none">{t('settings.profile.bestStreak')}</span>
        </div>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────── */

export default function Settings() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const [themeOpen, setThemeOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const currentLocale = LOCALES.find(l => l.code === i18n.language) ?? LOCALES[0]

  const themeValue = t(`settings.themeValues.${theme}`)

  return (
    <div className="min-h-full bg-chrome-bg">
      {/* Page header */}
      <header className="sticky top-0 z-10 flex items-center h-14 px-2 bg-chrome-bg border-b border-chrome-divider">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label={t('common.a11y.back')}
          className="flex items-center justify-center w-10 h-10 rounded-full text-chrome-text hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors"
        >
          <IoArrowBack size={22} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[16px] font-bold text-chrome-text">
          {t('settings.title')}
        </h1>
      </header>

      {/* Profile card */}
      <ProfileCard />

      {/* Divider */}
      <div className="h-px bg-chrome-divider mx-0" />

      {/* Account section */}
      <section className="mt-5">
        <h2 className="px-4 mb-1 text-chrome-text font-bold text-[13px] uppercase tracking-wider leading-snug">
          {t('settings.sections.account')}
        </h2>

        <div className="bg-chrome-surface divide-y divide-chrome-divider">
          <SettingsRow
            icon={IoPhonePortrait}
            iconBg="#92400E"
            label={t('settings.rows.theme')}
            value={themeValue}
            type="chevron"
            onClick={() => setThemeOpen(true)}
          />
          <SettingsRow
            icon={IoSunny}
            iconBg="#374151"
            label={t('settings.rows.language')}
            value={currentLocale.label}
            type="chevron"
            onClick={() => setLangOpen(true)}
          />
          <SettingsRow
            icon={IoNotifications}
            iconBg="#1D4ED8"
            label={t('settings.rows.vibration')}
            type="toggle"
            toggleOn
          />
        </div>
      </section>

      {/* Other rows */}
      <div className="mt-5 bg-chrome-surface divide-y divide-chrome-divider">
        <SettingsRow
          icon={IoBan}
          label={t('settings.rows.blockedUsers')}
          type="chevron"
        />
        <SettingsRow
          icon={IoShieldCheckmark}
          label={t('settings.rows.privacy')}
          type="chevron"
        />
      </div>

      {/* Sign out */}
      <div className="px-4 mt-8 mb-4">
        <button
          type="button"
          className={cn(
            'flex items-center justify-center gap-2 w-full py-4 rounded-xl',
            'bg-red-700/15 border border-red-800/30',
            'text-red-400 text-[14px] font-semibold',
            'hover:bg-red-700/20 active:bg-red-700/25 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50',
          )}
          aria-label={t('settings.signOutAria')}
        >
          <IoLogOut size={18} aria-hidden="true" />
          {t('settings.signOut')}
        </button>
      </div>

      {/* Dialogs */}
      <ThemeDialog open={themeOpen} onClose={() => setThemeOpen(false)} />
      <LanguageDialog open={langOpen} onClose={() => setLangOpen(false)} />
    </div>
  )
}
