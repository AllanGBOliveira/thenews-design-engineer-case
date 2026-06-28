import { useEffect, useState } from 'react'
import { Outlet } from 'react-router'
import { AppHeader } from '~/components/app-header'
import { BottomNav } from '~/components/bottom-nav'
import { NavDrawer } from '~/components/nav-drawer'

export default function AppLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  /* Prevent body scroll while drawer is open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  return (
    <div className="relative min-h-svh bg-background text-foreground">
      <AppHeader />

      {/* Main content — padded for fixed header (h-14) and bottom nav (h-16) */}
      <main
        id="main-content"
        className="pt-14 pb-16 min-h-svh"
        tabIndex={-1}
      >
        <Outlet />
      </main>

      <BottomNav
        onMoreClick={() => setDrawerOpen(true)}
        isMoreOpen={drawerOpen}
      />

      <NavDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}
