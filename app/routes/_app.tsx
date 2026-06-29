import { Outlet, useLocation } from 'react-router'
import { AppHeader } from '~/components/app-header'
import { BottomNav } from '~/components/bottom-nav'
import { UserProvider } from '~/context/user-context'

const HEADER_HIDDEN_ROUTES = ['/more', '/settings']

export default function AppLayout() {
  const { pathname } = useLocation()
  const hideHeader = HEADER_HIDDEN_ROUTES.includes(pathname)

  return (
    <UserProvider>
      <div className="flex flex-col h-svh overflow-hidden bg-background text-foreground">
        {!hideHeader && <AppHeader />}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto"
          tabIndex={-1}
        >
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </UserProvider>
  )
}
