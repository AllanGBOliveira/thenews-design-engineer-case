import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  IoNewspaper,
  IoFlame,
  IoFootball,
  IoBook,
  IoReorderThree,
} from 'react-icons/io5'
import { cn } from '~/lib/utils'

type NavItemDef = {
  to: string
  labelKey: string
  ariaLabelKey: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

const NAV_CONFIG: NavItemDef[] = [
  { to: '/',       labelKey: 'common.nav.edition', ariaLabelKey: 'common.nav.editionAria', icon: IoNewspaper },
  { to: '/habits', labelKey: 'common.nav.habits',  ariaLabelKey: 'common.nav.habitsAria',  icon: IoFlame },
  { to: '/cup',    labelKey: 'common.nav.cup',     ariaLabelKey: 'common.nav.cupAria',     icon: IoFootball },
  { to: '/books',  labelKey: 'common.nav.books',   ariaLabelKey: 'common.nav.booksAria',   icon: IoBook },
  { to: '/more',   labelKey: 'common.nav.more',    ariaLabelKey: 'common.nav.moreAria',    icon: IoReorderThree },
]

function NavItemButton({
  to,
  label,
  ariaLabel,
  icon: Icon,
}: { to: string; label: string; ariaLabel: string; icon: NavItemDef['icon'] }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      aria-label={ariaLabel}
      className="flex flex-col items-center justify-center gap-0.5 w-full h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset"
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'flex items-center justify-center w-14 h-8 rounded-full transition-colors duration-150',
              isActive ? 'bg-brand' : 'bg-transparent',
            )}
            aria-hidden="true"
          >
            <Icon
              size={22}
              className={cn(
                'transition-colors duration-150',
                isActive ? 'text-[#0A0A0F]' : 'text-chrome-muted',
              )}
            />
          </span>
          <span
            className={cn(
              'text-[10px] font-medium leading-none transition-colors duration-150',
              isActive ? 'text-brand' : 'text-chrome-muted',
            )}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}

export function BottomNav() {
  const { t } = useTranslation()

  return (
    <nav
      aria-label={t('common.a11y.nav')}
      className="shrink-0 h-16 bg-chrome-bg border-t border-chrome-divider"
    >
      <ul className="flex items-stretch h-full list-none m-0 p-0" role="list">
        {NAV_CONFIG.map((item) => (
          <li key={item.to} className="flex-1 flex">
            <NavItemButton
              to={item.to}
              label={t(item.labelKey)}
              ariaLabel={t(item.ariaLabelKey)}
              icon={item.icon}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}
