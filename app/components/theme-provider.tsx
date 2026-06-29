import { createContext, use, useEffect, useState } from "react"
import { config } from "~/config"

export type Theme = "dark" | "light" | "system"

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState>({
  theme: "system",
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

  // First visit: no explicit cookie — write "system" so subsequent server renders
  // recognise the preference and the settings page shows "Automatic" as selected.
  useEffect(() => {
    if (!themeIsExplicit) {
      writeCookie('system')
      // eslint-disable-next-line react-hooks/set-state-in-effect, @eslint-react/set-state-in-effect -- sync to "system" on mount so ThemeDialog reflects the correct selection
      setTheme('system')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps -- mount-only
  }, [])

  // Keep <html> classList in sync with state. "system" resolves to OS preference.
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    const effective = theme === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : theme
    root.classList.add(effective)
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
