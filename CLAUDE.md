# CLAUDE.md

This file documents the project context, architectural decisions, and development conventions for AI-assisted engineering on this codebase.

---

## Project Context

This is the bonus deliverable for the **the news** (thenewscc.com.br) selection process for the **Dev Front-end & Design** role.

The challenge requires redesigning at least 2 screens of the app and optionally implementing them in React with responsive mobile layout, deployed to a public URL.

**Primary screens (core deliverable):**
- **Home / Feed** — edition listing with category filtering, replacing the current flow that drops the user directly into a post slug with no content discovery layer
- **Habits** — calendar + streak gamification system, expanded with multiple habit types beyond reading

**Stretch screen (if time allows):**
- **Books** — natural extension of the expanded Habits screen; mentioned as a next step in the design decisions document but not a committed deliverable

The Home and Habits screens were selected because they attack the two core product metrics of a media startup: content engagement (Home/discovery) and daily retention (Habits/streak). Books is documented as the logical product evolution, not a fallback.

---

## Architecture Decisions

### Framework: React Router v7 (not Next.js)
The deliverable simulates a mobile app interface. Next.js adds SSR complexity that is irrelevant here — native and hybrid apps (like the news's likely React Native stack) run entirely client-side. React Router v7 + Vite keeps the project surgical: clean `components/`, clear styling tokens, zero SSR noise for the evaluator.

### Rendering modes: SSR / SPA / SSG (switchable via RENDER_MODE)

All three rendering modes are supported from a single codebase. The active mode is controlled by the `RENDER_MODE` shell env var set at build time — no source code changes needed.

| Mode | `RENDER_MODE` | Build script | Serve |
|------|--------------|-------------|-------|
| SSR | `ssr` (default) | `npm run build:ssr` | `npm start` (Node.js) |
| SPA | `spa` | `npm run build:spa` | Static server / CDN |
| SSG | `ssg` | `npm run build:ssg` | Static server / CDN |

**How it works:**
- `react-router.config.ts` reads `process.env.RENDER_MODE` → sets `ssr: false` for SPA, enables `prerender` for SSG.
- `vite.config.ts` reads `process.env.RENDER_MODE` → sets Workbox `navigateFallback: null` for SSR (navigation hits the server), `navigateFallback: '/index.html'` for SPA/SSG (SW handles navigation offline).

**Deploy scripts (like Nuxt's generate/build):**
- `npm run deploy` → lint:fix + styles:fix + pwa:generate + typecheck + SSR build
- `npm run deploy:spa` → same pipeline + SPA build
- `npm run deploy:ssg` → same pipeline + SSG build
- `npm run preview` → `serve build/client -s` for local SPA/SSG preview

**SSG routes (`react-router.config.ts`):** `prerender` returns `['/', '/habits']` in SSG mode — update this list when new routes are added.

**RENDER_MODE is NOT in `.env`** — it's a shell-level build variable, not a runtime config. Setting it in `.env` would expose it to Vite's client bundle.

### Styling: Tailwind CSS + SCSS with CSS custom properties
SCSS is used for its syntax benefits (nesting, partials, `@use`). Design tokens are always defined as **CSS custom properties** (`--token-name`), never as SCSS variables (`$var`). This keeps tokens consumable by any part of the stack — JavaScript, Tailwind, third-party components — without being locked to the SCSS preprocessor.

### Typography: Plus Jakarta Sans
The news app ships **Helvetica Now Display** (proprietary, Monotype). The closest free equivalent with the same geometric, modern personality is **Plus Jakarta Sans** (`@fontsource/plus-jakarta-sans`). Weights used: 400 (Regular), 500 (Medium), 700 (Bold) — mirroring the three weights found in the APK.

### Icons: react-icons
The app uses `@expo/vector-icons` with primarily **MaterialCommunityIcons** and **Ionicons**. On web, `react-icons` covers both families:
- `react-icons/md` → Material Design Icons (equivalent to MaterialCommunityIcons)
- `react-icons/io5` → Ionicons 5
- `react-icons/fa6` → FontAwesome 6 (used sparingly in the app)

### Components: interaction states over static screens
Each view must demonstrate at least one interaction state beyond the default. Specific redesign decisions are TBD once visual research and benchmarking are complete.

### i18n: react-i18next with cookie + browser language detection (SSR-aligned)
Internationalization uses `react-i18next` + `i18next` + `i18next-browser-languagedetector`.

**Supported languages:** `pt-BR` (Portuguese), `en-US` (English), `es-ES` (Spanish), `ar-SA` (Arabic — RTL).

**Locale code convention — `language-REGION` pattern:**
All four supported locales follow the `language-REGION` BCP 47 format consistently:
- `pt-BR` — Brazilian Portuguese (distinct from `pt-PT`)
- `en-US` — American English (distinct from `en-GB`)
- `es-ES` — Spanish (covers all variants: `es-MX`, `es-AR`, etc. via `convertDetectedLanguage`)
- `ar-SA` — Arabic (covers all variants: `ar-EG`, `ar-MA`, etc. via `convertDetectedLanguage`)

Using a consistent code style avoids mixing bare language codes (`es`, `ar`) with region-qualified codes (`pt-BR`, `en-US`). The `convertDetectedLanguage` function in the detection config normalizes any browser locale to the four supported codes — `es-MX` becomes `es-ES`, `ar-EG` becomes `ar-SA`, etc. This makes regional variant mapping explicit and centralized.

**Detection order:** cookie first, then browser language (`navigator`). No URL prefix — simpler routing, no SSR complications.

**`convertDetectedLanguage`:** Normalizes any browser locale to one of the four supported codes (applied client-side by `i18next-browser-languagedetector`, mirrored on the server by `parseAcceptLanguage`):
```ts
convertDetectedLanguage: (lng: string) => {
  const l = lng.toLowerCase()
  if (l.startsWith('ar')) return 'ar-SA'
  if (l.startsWith('es')) return 'es-ES'
  if (l.startsWith('en')) return 'en-US'
  if (l.startsWith('pt')) return 'pt-BR'
  return 'pt-BR'
}
```

**SSR alignment — the critical fix:** i18n runs as a shared singleton on the server. Two fixes prevent hydration mismatches:

1. **Singleton alignment:** root `loader` reads the locale cookie and calls `await i18n.changeLanguage(locale)` before render.
2. **First-visit alignment:** root `loader` parses the `Accept-Language` HTTP header via `parseAcceptLanguage()` when no cookie is set — this mirrors exactly what `convertDetectedLanguage` resolves from `navigator.language` on the client.

**`<html>` attributes:** The root `Layout` sets both `lang` (BCP 47) and `dir` from the loader data:
- `lang`: BCP 47 code per locale (`pt-BR`, `en`, `es`, `ar`)
- `dir`: `rtl` when locale is `ar-SA`, `ltr` for all others

**Locale files:** `app/i18n/locales/{pt-BR,en-US,es-ES,ar-SA}.json`

**Why no URL prefix:** The URL prefix approach requires duplicate route definitions in React Router v7 and adds routing complexity with no tangible benefit for a client-side app that mimics native/hybrid behavior.

### Environment variables: ao.dev naming pattern
All client-side env vars are prefixed `VITE_`. A `config.ts` module imports them, applies fallbacks, and derives `appSlug` from `VITE_SITE_NAME`:

```ts
export const appSlug = siteName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
```

Dynamic names like cookie keys are composed from `appSlug` — renaming the app in `.env` cascades everywhere automatically. The `vite.config.ts` uses Vite's `loadEnv()` to read env vars at build/dev time so the PWA manifest is also dynamically generated from env vars.

| Variable | Default | Purpose |
|---|---|---|
| `VITE_SITE_NAME` | `thenews` | Derives `appSlug`; used in PWA manifest `name` |
| `VITE_SITE_URL` | `https://thenewscc.com.br` | Canonical URL for SEO |
| `VITE_SITE_SHORT_NAME` | `thenews` | PWA homescreen short name |
| `VITE_SITE_DESCRIPTION` | `the news — design engineer case` | Meta description + PWA description |
| `VITE_THEME_COLOR` | `#000000` | Browser bar / PWA theme color |
| `VITE_BG_COLOR` | `#ffffff` | PWA background color |
| `VITE_I18N_COOKIE_KEY` | `${appSlug}-i18n` | i18next cookie name (optional override) |
| `VITE_THEME_COOKIE_KEY` | `${appSlug}-theme` | theme cookie name (optional override) |

All types are declared in `env.d.ts` (`ImportMetaEnv` interface).

**Hex color values must be quoted in `.env`:** dotenv treats `#` as an inline comment character. `VITE_THEME_COLOR=#000000` is parsed as an empty string. Always quote hex values: `VITE_THEME_COLOR="#000000"`. Use `||` (not `??`) as fallback in `vite.config.ts` — `??` does not catch empty strings, only `null`/`undefined`.

### Dark/light theme: ThemeProvider (shadcn pattern) + cookie

Theme follows the shadcn/ui component pattern: a `ThemeProvider` component in `app/components/theme-provider.tsx` with a `useTheme()` hook. Persistence uses **`document.cookie`** — not `localStorage` (no SSR access) and not a server action (incompatible with SPA/SSG render modes).

**Why `document.cookie` over a server `Set-Cookie` action:**
React Router v7 SPA mode forbids `action` exports on route files — there is no server to handle them. SSG mode builds pass but the action 404s at runtime (static files, no server). `document.cookie` writes land in HTTP headers on every subsequent request, so the SSR server reads the cookie correctly too. It works identically across all three render modes.

**Architecture:**
1. Root `loader` reads the theme cookie via `parseCookie()` → returns `{ theme, themeIsExplicit, locale }`.
   - `themeIsExplicit = true` when the cookie is present (returning user).
   - `themeIsExplicit = false` on first visit (no cookie yet).
2. `Layout` sets `<html suppressHydrationWarning>` and injects a flash-prevention inline `<script>` in `<head>` — runs synchronously before React hydrates, reads the cookie or `prefers-color-scheme`, and adds the correct class to `<html>`. Zero flash for both returning users and first-time dark-OS visitors.
3. `App` (default export in `root.tsx`) wraps `<Outlet>` with `<ThemeProvider serverTheme={theme} themeIsExplicit={themeIsExplicit}>`.
4. `ThemeProvider` initializes `useState(serverTheme)` — matches the server-rendered HTML (no hydration mismatch). On mount, if `themeIsExplicit` is false, detects `prefers-color-scheme` and writes the cookie so subsequent server renders get the correct class without a flash.
5. `ThemeProvider`'s `useEffect` syncs `document.documentElement.classList` on every state change.
6. `handleSetTheme(next)` from `useTheme()` updates state immediately AND writes `document.cookie` — one call, all render modes.

**Cookie write (ThemeProvider):**
```ts
document.cookie = `${config.themeCookieKey}=${theme}; Path=/; Max-Age=${365 * 24 * 60 * 60}; SameSite=Lax`
```

**Cookie key:** `config.themeCookieKey` → `${appSlug}-theme` (e.g. `thenews-theme`). Overridable via `VITE_THEME_COOKIE_KEY` env var.

**`app/cookies.server.ts`:** Utility kept for future server-side cookie needs (e.g. i18n, auth). Not used for theme persistence since switching to `document.cookie`.

**RTL direction:** `Layout` also reads `locale` from the loader and sets `<html dir="rtl">` when `locale === 'ar-SA'`. When the user switches language client-side (via `i18n.changeLanguage()`), calling `revalidate()` from `useRevalidator()` tells React Router to re-run the loaders — the root loader reads the new i18n cookie and returns the updated locale, so `<html lang>` and `<html dir>` update in the same navigation cycle.

**CSS split architecture (prevents dark mode token issues):** All Tailwind-specific directives must live in a pure CSS file — not in SCSS. Dart Sass passes unknown at-rules through, but `@tailwindcss/vite` does not reliably resolve `@apply` and `@theme inline` in SCSS output.
- `app/tailwind.css` — pure CSS: `@import "tailwindcss"`, `tw-animate-css`, `shadcn/tailwind.css`, `@custom-variant dark (&:is(.dark *))`, `@theme` (font tokens), `@theme inline` (color token mappings: `--color-background: var(--background)`, etc.), `@layer base` (`@apply bg-background text-foreground`). All Tailwind directives live here.
- `app/app.scss` — font imports (`@fontsource/...`) + `:root` and `.dark` CSS custom property declarations only. No Tailwind directives.
- `root.tsx` imports `./tailwind.css` first, then `./app.scss`.

### PWA: vite-plugin-pwa (SSR-aware)

PWA is implemented via `vite-plugin-pwa` + `@vite-pwa/assets-generator`:

**Manifest:** Generated dynamically from env vars at build/dev time via `loadEnv()` in `vite.config.ts`. The manifest file is `manifest.webmanifest` (served at `/manifest.webmanifest`). Referenced in `root.links()`.

**Service worker strategy:**
- `outDir: 'build/client'` — **must be set explicitly.** React Router v7 uses the Vite Environment API, which configures a separate outDir per environment (`build/client`, `build/server`). vite-plugin-pwa does not pick up per-environment outDirs and falls back to Vite's root default (`dist/`), generating `dist/sw.js` instead of `build/client/sw.js`. The explicit `outDir` overrides this.
- `registerType: 'autoUpdate'` — SW updates automatically in background.
- `injectRegister: null` — no automatic HTML injection (incompatible with React Router v7's SSR-generated HTML). Instead, `app/entry.client.tsx` calls `registerSW({ immediate: false })` from `virtual:pwa-register`, guarded by `import.meta.env.PROD`.
- `devOptions: { enabled: false }` — **service workers must never run in development.** In dev mode there is no build output, so Workbox glob patterns match nothing (causes "Couldn't find configuration for precaching or runtime caching" error) and the SW would intercept HMR traffic.
- `globDirectory: 'build/client/'` — React Router v7 puts client assets here; must be explicit so Workbox finds the files.
- Workbox precaches all static assets (`js`, `css`, `ico`, `png`, `svg`, `woff`, `woff2`).
- `navigateFallback: null` in SSR mode — HTML is always fetched from the server. Change to `navigateFallback: '/index.html'` for SPA/SSG mode.
- `skipWaiting: true` + `clientsClaim: true` — new SW takes control immediately after `autoUpdate`.

**`dist/` in `.gitignore` and ESLint ignores:** Even with `outDir: 'build/client'`, Workbox's internal log line still says "files generated: dist/sw.js" (its own temp path). The `dist/` folder must be in both `.gitignore` and the `ignores` array in `eslint.config.js` to prevent ESLint from linting service worker bundles.

**Icon generation:** `pwa-assets.config.ts` configures `@vite-pwa/assets-generator` with `minimal2023Preset`. Run `npm run pwa:generate` to regenerate all icons from `public/favicon.svg`. After regenerating, update icon references in `vite.config.ts` (manifest.icons) and `app/root.tsx` (links function).

**`entry.client.tsx`:** Custom client entry file (overrides React Router v7's default). Calls `registerSW({ immediate: false })` guarded by `import.meta.env.PROD` — SW registration is production-only.

**TypeScript:** `env.d.ts` includes `/// <reference types="vite-plugin-pwa/client" />` to expose `virtual:pwa-register` and `virtual:pwa-info` module types.

**Platform-specific rolldown bindings:** `vite-plugin-pwa` depends on `rolldown` which has optional platform-specific native bindings (`@rolldown/binding-linux-x64-gnu` for glibc, `@rolldown/binding-linux-x64-musl` for Alpine/musl). Both are listed in `optionalDependencies` in `package.json` — npm installs whichever matches the current platform and silently skips the other. The Docker container uses `--legacy-peer-deps` to resolve them on Alpine.

**Docker node_modules isolation:** `docker-compose.yml` mounts a named volume (`thenews_node_modules`) at `/app/node_modules`. This shadows the bind-mounted project directory's `node_modules` inside the container — the container has its own musl binaries, and the host has its own glibc binaries; they never overwrite each other.

**If typecheck fails locally with "Cannot find native binding":** the container likely ran `npm install` without the named volume in place (old setup). Fix: `npm install @rolldown/binding-linux-x64-gnu@1.1.3 --legacy-peer-deps` on the host. After the docker-compose volume fix is in place, this should never happen again.

### CI/CD and commit quality
- **GitHub Actions** (`.github/workflows/ci.yml`): runs `commitlint`, `lint`, `lint:styles`, `typecheck`, and `test` on every push and PR.
- **Husky** (`.husky/commit-msg`): runs `commitlint` locally before every commit, enforcing Conventional Commits format.
- **typecheck script:** `react-router typegen && tsc` — generates React Router types then type-checks the whole project.

### Blog posts: comark.dev (possible future use)
If blog posts are added to this project, [comark.dev](https://comark.dev) is a candidate — it is React-compatible and offers MDX-like authoring without being tied to the Vue/Nuxt ecosystem (unlike `remark-mdc`). No decision made yet; this is noted as a future option only.

---

## What Is Out of Scope

- Full onboarding flow
- Authentication screens
- Settings screens
- Books screen (stretch goal — implemented only if time allows after Home and Habits are polished)
- Google Calendar integration (documented as a "next steps" proposal in the design decisions document, not implemented)
- AI chat feature (mentioned as a future product evolution idea, not part of the deliverable)

These are intentionally left as written proposals in the design decisions document to show product thinking without blowing the deadline.

---

## Git Conventions

### Commit messages — Conventional Commits

```
<type>(<scope>): <short description in imperative mood>
```

| Type | When to use |
|---|---|
| `feat` | A new component, screen, or feature |
| `fix` | A bug fix |
| `style` | Visual / CSS changes with no logic change |
| `refactor` | Code restructuring with no behavior change |
| `chore` | Config, deps, tooling, Docker, env files |
| `docs` | README, CLAUDE.md, comments |
| `perf` | Performance improvement |
| `build` | Build system or Vite config changes |

**Examples:**
```
feat(habits): add monthly calendar component with streak markers
feat(books): implement reading progress card with expanded state
style(habits): apply brand yellow token to completed day circles
refactor(components): extract bottom-sheet into reusable component
chore(docker): add volume mount and dev command to compose
docs(readme): add docker compose section
fix(habits): prevent calendar from marking future days as complete
```

### Branch naming

```
<type>/<short-kebab-description>
```

| Prefix | When to use |
|---|---|
| `feature/` | New screen or component work |
| `fix/` | Bug fixes |
| `style/` | UI-only visual changes |
| `refactor/` | Code restructuring |
| `chore/` | Config, tooling, infra |
| `docs/` | Documentation only |

**Examples:**
```
feature/habits-screen
feature/books-screen
feature/bottom-sheet-component
style/brand-token-setup
chore/docker-compose-setup
docs/claude-md
fix/calendar-future-day-state
```

---

## The news public API

Base URL: `https://api.thenews.com.br/api/mobile`

All endpoints are **unauthenticated** unless noted. No `Authorization` header required for the endpoints below.

### `GET /editions`

Paginated list of editions (newsletter posts) across all newsletters.

**Confirmed working params:**

| Param | Type | Description |
|---|---|---|
| `page` | integer ≥ 1 | Page number. Default: 1. |
| `search` | string | Full-text search on `subjectLine` + `previewText`. Returns matching editions across all newsletters and pages. |

**Params that do NOT work (ignored by API):**
- `sort`, `order`, `orderBy`, `direction` — no server-side sorting; the API always returns newest-first.
- `cadernoId` — category filter without auth; returns same results as no filter.
- `tags` — no tag filtering via API.

**Response shape:**

```json
{
  "success": true,
  "data": [ /* Edition[] */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1409,
    "totalPages": 141
  }
}
```

**Edition object fields:**

| Field | Type | Notes |
|---|---|---|
| `id` | string | Internal ID, e.g. `"id_z0da1awuumqyy6gan"` |
| `beehiivPostId` | string | Beehiiv post UUID |
| `publicationId` | string | Same as `cadernoId` (newsletter identifier) |
| `title` | string | Usually the date string e.g. `"29/06/2026"` — NOT the headline |
| `subjectLine` | string | **The email subject / headline** — use this as the card title |
| `previewText` | string | **Email preview text / subtitle** — use this as the card description (4-line clamp) |
| `slug` | string | URL slug, e.g. `"sunday-s-edition-28-06"`. Used in `/editions/:slug` route. |
| `thumbnailUrl` | string \| null | Cover image URL from Beehiiv S3. Many editions have no thumbnail. |
| `webUrl` | string | Public URL on the newsletter's domain, e.g. `"https://health.thenews.com.br/p/29-06-2026"` |
| `audience` | `"free"` \| `"premium"` | Premium posts require subscription |
| `platform` | string | `"both"`, `"web"`, `"email"` |
| `publishDate` | string | ISO date `"2026-06-29"` — use for display, NOT `publishedAt` |
| `publishedAt` | string \| null | Full ISO datetime (often null) |
| `isCurrentEdition` | boolean | True for today's edition — show "Hoje" badge |
| `hiddenFromFeed` | boolean | Should be filtered out from listing if true |
| `viewsCount` | integer | Page view count (zero for many non-the-news newsletters) |
| `likesCount` | integer | Heart/like count |
| `commentsCount` | integer | Comment count |
| `cadernoId` | string | Newsletter identifier. Maps to category slug via `categorySlugFromCaderno()`. |
| `contentTags` | string | **JSON string** e.g. `'["música","leitura","cinema"]'` or `'[]'`. Parse with `parseEditionTags()`. |
| `authors` | string | **JSON string** e.g. `'["tempo de copa ⚽"]'` or `'[]'`. Parse with `parseEditionAuthors()`. |
| `htmlContent` | string | Full sanitized HTML of the newsletter. Beehiiv email format — needs sanitization via `EditionHtml`. |
| `beehiivCreatedAt` | integer | Unix timestamp |
| `displayedDate` | null | Always null in observed responses |
| `status` | string | `"confirmed"` etc. |
| `fetchedAt` / `createdAt` / `updatedAt` | string | Internal DB timestamps |

**`cadernoId` → category slug mapping** (in `app/data/api.ts`):

| `cadernoId` suffix | Category slug | Newsletter name |
|---|---|---|
| `...bc12` | `the-news` | the news (daily, main newsletter) |
| `...bc12_night` | `night` | at night edition |
| `...925c_copa` | `tempo-de-copa` | tempo de copa (World Cup special) |
| `...434aa` | `money` | money |
| `...96c9` | `health` | health |
| `...adc8` | `cult` | cult |
| `...6285` | `travel` | travel |
| `...353c` | `better-work` | better work |
| `...0e680` | `business` | business |
| `...6e3` | `around` | around |
| `...8b94` | `rising` | rising |

**`contentTags` observed values:**
- `"[]"` — most editions have no tags
- `'["at night"]'` — the AT NIGHT weekly
- `'["música","leitura","cinema","cultura","poesia"]'` — cult newsletter
- Tags come from Beehiiv's tagging system; not filterable via API without auth

**`authors` observed values:**
- `"[]"` — most editions
- `'["tempo de copa ⚽"]'` — tempo de copa editions
- `'["the news 🌖"]'` — night editions

### `GET /editions/:id` or `GET /editions?search=slug`

There is no dedicated `/editions/:slug` endpoint. To fetch a single edition by slug:
1. Check the module-level `_cache` (populated on list fetches)
2. Paginate through `GET /editions?page=N` until the slug is found (max 5 pages checked)
- `?search=slug` does NOT work — search is text-based, not slug-based

### Other mobile API endpoints (untested, require auth)

Based on app network inspection:
- `GET /user/profile` — user profile (auth required)
- `GET /user/habits` — habit tracking data (auth required)
- `GET /editions?cadernoId=<id>` — category filter (auth required; returns unfiltered without auth)
- `POST /editions/:id/like` — like an edition (auth required)
- `POST /editions/:id/view` — record a view (auth required)

### Client-side-only operations

Due to auth requirement, these must be done client-side from the current page's API results:
- **Sort by views/likes** — sort the current page's `data[]` array
- **Filter by newsletter (interests)** — filter by `categorySlugFromCaderno(edition.cadernoId)`
- **Filter by content tag** — parse `edition.contentTags` JSON and filter

### URL state convention

All filter/sort/search state lives in URL params (shareable links):

| Param | Where used | Example |
|---|---|---|
| `?q=` | API search param | `?q=copa+do+mundo` |
| `?page=` | API pagination | `?page=3` (omit for page 1) |
| `?sort=` | Client-side sort | `?sort=likes` (omit for default `newest`) |
| `?tags=` | Client-side tag filter | `?tags=música,cinema` |
| `?interests=` | Client-side newsletter filter | `?interests=the-news,health` |

Filter changes use `{ replace: true }` (don't pollute browser history).
Page changes use default push (support browser back).

---

## AI-Assisted Engineering

This project is developed with Claude Code as a development copilot. The developer makes all architectural, design, and product decisions. AI accelerates implementation of repetitive UI patterns and tooling setup.

This is transparent and intentional — using AI tooling efficiently is a core engineering skill in 2026.
