import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteLoaderData,
  type LoaderFunctionArgs,
} from "react-router"
import { type ReactNode } from "react"

import type { Route } from "./+types/root"
import "./tailwind.css"
import "./app.scss"
import "./i18n"
import i18n from "./i18n"
import { config } from "./config"
import { ThemeProvider, type Theme } from "./components/theme-provider"

// ─── i18n / locale ──────────────────────────────────────────────────────────

export type SupportedLocale = 'pt-BR' | 'en-US' | 'es-ES' | 'ar-SA'

function parseCookie(cookieHeader: string, key: string) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const match = cookieHeader.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

// Mirror what i18next-browser-languagedetector reads from navigator.language.
// Both server and client resolve the same locale on first visit → no flash.
function parseAcceptLanguage(header: string | null): SupportedLocale {
  if (!header) return 'pt-BR'
  const langs = header.split(',').map(l => l.split(';')[0].trim().toLowerCase())
  for (const lang of langs) {
    if (lang.startsWith('ar')) return 'ar-SA'
    if (lang.startsWith('es')) return 'es-ES'
    if (lang.startsWith('en')) return 'en-US'
    if (lang.startsWith('pt')) return 'pt-BR'
  }
  return 'pt-BR'
}

// ─── Links ──────────────────────────────────────────────────────────────────

export const links: Route.LinksFunction = () => [
  { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  { rel: "shortcut icon", href: "/favicon.ico" },
  { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
  { rel: "manifest", href: "/manifest.webmanifest" },
]

// ─── Loader ─────────────────────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie") ?? ""

  const rawTheme = parseCookie(cookieHeader, config.themeCookieKey)
  const themeIsExplicit = rawTheme !== undefined
  const theme = (rawTheme === 'dark' ? 'dark' : 'light') as Theme

  // Cookie wins; fall back to Accept-Language (mirrors navigator.language detection on client)
  const locale = (
    parseCookie(cookieHeader, config.i18nCookieKey) ??
    parseAcceptLanguage(request.headers.get("Accept-Language"))
  ) as SupportedLocale

  if (i18n.language !== locale) {
    await i18n.changeLanguage(locale)
  }

  return { theme, themeIsExplicit, locale }
}

// ─── Layout ─────────────────────────────────────────────────────────────────

// BCP 47 lang attribute per locale (html[lang] must be a valid BCP 47 code)
const LANG_ATTR: Record<SupportedLocale, string> = {
  'pt-BR': 'pt-BR',
  'en-US': 'en',
  'es-ES': 'es',
  'ar-SA': 'ar',
}

// Inline script injected into <head> before any paint.
// Reads the theme cookie; falls back to prefers-color-scheme.
// Runs synchronously so there is zero flash for both returning users AND
// first-time visitors with a dark OS — before React hydrates.
// suppressHydrationWarning on <html> because this script mutates class before
// React touches the DOM, so server HTML and hydrated DOM may differ on className.
const themeScript = (cookieKey: string) =>
  `(function(){try{var m=document.cookie.match(new RegExp('(?:^|; )${cookieKey}=([^;]*)'));var t=m?decodeURIComponent(m[1]):(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.classList.add(t)}catch(e){}})();`

export function Layout({ children }: { children: ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root")
  const locale = (data?.locale ?? 'pt-BR') as SupportedLocale
  const dir = locale === 'ar-SA' ? 'rtl' : 'ltr'

  return (
    // suppressHydrationWarning: the inline script adds a class before React
    // hydrates, so className in the DOM may differ from the server-rendered HTML.
    <html lang={LANG_ATTR[locale] ?? locale} dir={dir} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-title" content={config.siteShortName} />
        {/* eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- flash-prevention script; no user input, no XSS surface */}
        <script dangerouslySetInnerHTML={{ __html: themeScript(config.themeCookieKey) }} />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  const { theme, themeIsExplicit } = useLoaderData<typeof loader>()

  return (
    <ThemeProvider serverTheme={theme} themeIsExplicit={themeIsExplicit}>
      <Outlet />
    </ThemeProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
