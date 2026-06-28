import { NavLink } from 'react-router'
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
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  ariaLabel: string
}

const NAV_ITEMS: NavItemDef[] = [
  {
    to: '/',
    label: 'edição',
    icon: IoNewspaper,
    ariaLabel: 'Edição — ler a edição do dia',
  },
  {
    to: '/habits',
    label: 'hábitos',
    icon: IoFlame,
    ariaLabel: 'Hábitos — streak e gamificação de leitura',
  },
  {
    to: '/copa',
    label: 'copa',
    icon: IoFootball,
    ariaLabel: 'Copa — bolão e jogos da temporada',
  },
  {
    to: '/livros',
    label: 'livros',
    icon: IoBook,
    ariaLabel: 'Livros — sua biblioteca de leitura',
  },
]

type BottomNavProps = {
  onMoreClick: () => void
  isMoreOpen: boolean
}

function NavItemButton({
  to,
  label,
  icon: Icon,
  ariaLabel,
}: NavItemDef) {
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
                isActive ? 'text-chrome-bg' : 'text-chrome-muted',
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

export function BottomNav({ onMoreClick, isMoreOpen }: BottomNavProps) {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed bottom-0 inset-x-0 z-40 h-16 bg-chrome-bg border-t border-chrome-divider"
    >
      <ul className="flex items-stretch h-full list-none m-0 p-0" role="list">
        {NAV_ITEMS.map((item) => (
          <li key={item.to} className="flex-1 flex">
            <NavItemButton {...item} />
          </li>
        ))}

        {/* "Mais" — triggers the full-screen drawer (not a route) */}
        <li className="flex-1 flex">
          <button
            type="button"
            onClick={onMoreClick}
            aria-label={isMoreOpen ? 'Fechar menu de funcionalidades' : 'Mais — abrir menu de funcionalidades'}
            aria-expanded={isMoreOpen}
            aria-controls="nav-drawer"
            aria-haspopup="dialog"
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-inset',
              isMoreOpen ? 'text-brand' : 'text-chrome-muted',
            )}
          >
            <span
              className={cn(
                'flex items-center justify-center w-14 h-8 rounded-full transition-colors duration-150',
                isMoreOpen ? 'bg-brand' : 'bg-transparent',
              )}
              aria-hidden="true"
            >
              <IoReorderThree
                size={22}
                className={cn(
                  'transition-colors duration-150',
                  isMoreOpen ? 'text-chrome-bg' : 'text-chrome-muted',
                )}
              />
            </span>
            <span className="text-[10px] font-medium leading-none">mais</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
