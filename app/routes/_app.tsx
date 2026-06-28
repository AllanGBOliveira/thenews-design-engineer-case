import { Outlet, useLocation } from 'react-router'
import { AppHeader } from '~/components/app-header'
import { BottomNav } from '~/components/bottom-nav'
import { UserProvider } from '~/context/user-context'
import { cn } from '~/lib/utils'

const HEADER_HIDDEN_ROUTES = ['/more', '/settings']

export default function AppLayout() {
  const { pathname } = useLocation()
  const hideHeader = HEADER_HIDDEN_ROUTES.includes(pathname)

  return (
    <UserProvider>
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
    </UserProvider>
  )
}
