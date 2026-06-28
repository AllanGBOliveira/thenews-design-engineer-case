import { NavLink } from 'react-router'
import {
  IoHeadset,
  IoHeart,
  IoChatbubble,
  IoThermometer,
  IoSettings,
} from 'react-icons/io5'
import { LanguageSelect } from '~/components/language-select'

type HeaderAction = {
  icon: React.ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' | 'false' }>
  ariaLabel: string
  badge?: number
}

const HEADER_ACTIONS: HeaderAction[] = [
  { icon: IoHeadset, ariaLabel: 'Podcasts' },
  { icon: IoHeart, ariaLabel: 'Curtidas e favoritos' },
  { icon: IoChatbubble, ariaLabel: 'Conversas e mensagens', badge: 9 },
  { icon: IoThermometer, ariaLabel: 'Termômetro de imparcialidade da edição' },
  { icon: IoSettings, ariaLabel: 'Configurações da conta' },
]

export function AppHeader() {
  return (
    <header
      role="banner"
      className="fixed top-0 inset-x-0 z-40 flex items-center justify-between h-14 px-4 bg-chrome-bg border-b border-chrome-border"
    >
      {/* Brand logo */}
      <NavLink
        to="/"
        aria-label="the news — ir para a página inicial"
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

      {/* Language selector */}
      <LanguageSelect />

      {/* Action buttons */}
      <nav aria-label="Ações rápidas do cabeçalho">
        <ul className="flex items-center gap-0.5 list-none m-0 p-0" role="list">
          {HEADER_ACTIONS.map(({ icon: Icon, ariaLabel, badge }) => (
            <li key={ariaLabel}>
              <div className="relative">
                <button
                  type="button"
                  aria-label={badge ? `${ariaLabel}, ${badge} não lidas` : ariaLabel}
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
          ))}
        </ul>
      </nav>
    </header>
  )
}
