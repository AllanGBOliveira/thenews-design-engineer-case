import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  IoHeadset,
  IoHeart,
  IoChatbubble,
  IoThermometer,
  IoSettings,
} from 'react-icons/io5'

type HeaderAction = {
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>
  ariaLabelKey: string
  badge?: number
}

const HEADER_ACTIONS: HeaderAction[] = [
  { icon: IoHeadset,     ariaLabelKey: 'common.header.podcasts' },
  { icon: IoHeart,       ariaLabelKey: 'common.header.favorites' },
  { icon: IoChatbubble,  ariaLabelKey: 'common.header.messages', badge: 9 },
  { icon: IoThermometer, ariaLabelKey: 'common.header.thermometer' },
  { icon: IoSettings,    ariaLabelKey: 'common.header.settings' },
]

export function AppHeader() {
  const { t } = useTranslation()

  return (
    <header
      role="banner"
      className="shrink-0 flex items-center justify-between h-14 px-4 bg-chrome-bg border-b border-chrome-border"
    >
      {/* Brand logo */}
      <NavLink
        to="/"
        aria-label={t('common.a11y.goHome')}
        className="flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-md"
      >
        <img
          src="/favicon.svg"
          alt=""
          aria-hidden="true"
          className="w-7 h-7 rounded-full shrink-0 object-cover"
        />
        <span className="text-chrome-text font-bold text-[15px] leading-none tracking-tight select-none">
          the news
        </span>
      </NavLink>

      {/* Action buttons */}
      <nav aria-label={t('common.a11y.quickActions')}>
        <ul className="flex items-center gap-0.5 list-none m-0 p-0" role="list">
          {HEADER_ACTIONS.map(({ icon: Icon, ariaLabelKey, badge }) => {
            const label = t(ariaLabelKey)
            const fullLabel = badge
              ? `${label}, ${t('common.a11y.unread', { count: badge })}`
              : label
            return (
              <li key={ariaLabelKey}>
                <div className="relative">
                  <button
                    type="button"
                    aria-label={fullLabel}
                    className="flex items-center justify-center w-9 h-9 rounded-full text-chrome-text/70 hover:text-chrome-text hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <Icon size={20} aria-hidden="true" />
                  </button>
                  {badge !== undefined && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-4 px-0.5 rounded-full bg-badge-red text-white text-[9px] font-bold leading-none"
                    >
                      {badge}
                    </span>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </nav>
    </header>
  )
}
