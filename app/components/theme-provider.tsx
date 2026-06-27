import { createContext, use, useEffect, useState } from "react"
import { config } from "~/config"

export type Theme = "dark" | "light"

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "light",
  setTheme: () => null,
})

const COOKIE_MAX_AGE = 365 * 24 * 60 * 60

function writeCookie(theme: Theme) {
  document.cookie = `${config.themeCookieKey}=${theme}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function ThemeProvider({
  children,
  serverTheme,
  themeIsExplicit,
}: {
  children: React.ReactNode
  serverTheme: Theme
  themeIsExplicit: boolean
}) {
  const [theme, setTheme] = useState<Theme>(serverTheme)

  // On mount: if no explicit cookie was set, detect system preference and persist it.
  // After this runs once, every subsequent visit has a cookie and the server
  // renders the correct class — zero flash from that point on.
  useEffect(() => {
    if (!themeIsExplicit) {
      const system: Theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      if (system !== serverTheme) {
        // eslint-disable-next-line react-hooks/set-state-in-effect, @eslint-react/set-state-in-effect -- syncing to prefers-color-scheme on mount; SSR-safe: server+client both render serverTheme first, then this corrects to system on first paint
        setTheme(system)
      }
      writeCookie(system)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps -- mount-only; re-running on dep change would fight the persisted cookie
  }, [])

  // Keep <html> classList in sync with state on every change.
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  const handleSetTheme = (next: Theme) => {
    setTheme(next)
    writeCookie(next)
  }

  return (
    <ThemeProviderContext value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeProviderContext>
  )
}

export const useTheme = () => use(ThemeProviderContext)
