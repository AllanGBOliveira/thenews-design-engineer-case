import { Outlet, useLocation } from 'react-router'
import { AppHeader } from '~/components/app-header'
import { BottomNav } from '~/components/bottom-nav'
import { cn } from '~/lib/utils'

export default function AppLayout() {
  const { pathname } = useLocation()
  const hideHeader = pathname === '/more'

  return (
    <div className="relative min-h-svh bg-background text-foreground">
      {!hideHeader && <AppHeader />}

      <main
        id="main-content"
        className={cn('pb-16 min-h-svh', hideHeader ? 'pt-0' : 'pt-14')}
        tabIndex={-1}
      >
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
