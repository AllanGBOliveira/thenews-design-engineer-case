# the news — Design Engineer Case

A fully functional React implementation of two redesigned screens from the **[the news](https://thenewscc.com.br)** app — built as a bonus deliverable for the Dev Front-end & Design selection process.

The implementation uses the real public API to render live newsletter data, demonstrates SSR/SPA/SSG rendering modes from a single codebase, and ships as an installable PWA.

**[Live demo →](https://thenews-design-engineer-case.vercel.app)**

---

## Screens implemented

### Home / Feed (`/`)
Discovery screen redesigned with real filtering and sorting on top of live API data.

- Full-text search (server-side, cross-page via `?q=`)
- Newsletter filter (the news, cult, health, money, travel, better work, business, around, rising, at night, tempo de copa)
- Period filter: today / last week / last month
- Audience filter: free / premium
- Content tag filter (music, cinema, culture, sports, …)
- Sort by: newest · most views · most likes · most comments
- Per-page selector: 5 / 10 / 15 / 20 items
- Reactive subtitle: shows API total when unfiltered; `"X of Y on this page"` when filters are active
- Pagination hidden while filters are active — with an inline callout explaining the client-side scope limitation

### Edition detail (`/:slug`)
Full newsletter reading experience with post-read engagement flow.

- Full HTML content rendered from the API (`htmlContent` field)
- Sticky reading progress bar — tracked in real time via IntersectionObserver, persisted to IndexedDB
- Prev / next post navigation — optimistic (instant from link state) + async (filled by loader)
- Post-read flow: rating sheet → quiz → continue reading
- Per-edition quiz keyed by `edition.slug`
- Premium / free badge, author chip, content tags, webUrl "read on site" link

---

## Tech stack

| Tool | Role | Docs |
|---|---|---|
| [React 19](https://react.dev) | UI library | https://react.dev |
| [React Router v7](https://reactrouter.com) | Framework — SSR, routing, loaders | https://reactrouter.com |
| [Vite 8](https://vite.dev) | Build tool and dev server | https://vite.dev |
| [TypeScript 5](https://www.typescriptlang.org) | Type safety across the whole project | https://www.typescriptlang.org |
| [Tailwind CSS v4](https://tailwindcss.com) | Utility-first styling | https://tailwindcss.com |
| [Sass / SCSS](https://sass-lang.com) | CSS preprocessing (font imports + CSS custom properties) | https://sass-lang.com |
| [shadcn/ui](https://ui.shadcn.com) | Accessible component primitives (Radix UI based) | https://ui.shadcn.com |
| [Radix UI](https://www.radix-ui.com) | Headless UI primitives (Sheet, Select, Dialog, …) | https://www.radix-ui.com |
| [react-icons](https://react-icons.github.io/react-icons/) | Icon sets (Ionicons 5, Material Design Icons) | https://react-icons.github.io/react-icons/ |
| [react-i18next](https://react.i18next.com) | Internationalization (PT-BR, EN-US, ES-ES, AR-SA) | https://react.i18next.com |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app) | PWA manifest + Workbox service worker | https://vite-pwa-org.netlify.app |
| [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | Typography — geometric substitute for Helvetica Now Display | https://fontsource.org/fonts/plus-jakarta-sans |
| [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) | Client-side persistence for reading progress | https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API |
| [Vitest](https://vitest.dev) | Unit testing | https://vitest.dev |
| [ESLint 10](https://eslint.org) | Linting (`@eslint-react`, `eslint-plugin-react-hooks`, `typescript-eslint`) | https://eslint.org |
| [Stylelint](https://stylelint.io) | SCSS linting | https://stylelint.io |
| [Husky](https://typicode.github.io/husky/) | Git hooks (commitlint on commit-msg) | https://typicode.github.io/husky/ |
| [commitlint](https://commitlint.js.org) | Conventional Commits enforcement | https://commitlint.js.org |
| [GitHub Actions](https://docs.github.com/en/actions) | CI: commitlint + lint + typecheck + test on every push/PR | https://docs.github.com/en/actions |

---

## Architecture

### Rendering modes (SSR / SPA / SSG)

All three rendering modes are supported from a single codebase. The active mode is controlled by the `RENDER_MODE` shell variable at build time — no source code changes needed.

| Mode | `RENDER_MODE` | Build command | Serve |
|---|---|---|---|
| SSR (default) | `ssr` | `npm run build:ssr` | `npm start` (Node.js) |
| SPA | `spa` | `npm run build:spa` | Any static file server / CDN |
| SSG | `ssg` | `npm run build:ssg` | Any static file server / CDN |

`react-router.config.ts` reads `RENDER_MODE` at build time:
- SPA → `ssr: false` (no server bundle, client-side routing only)
- SSG → enables `prerender` for all app routes
- SSR (default) → standard React Router v7 server-side rendering

`vite.config.ts` reads `RENDER_MODE` to configure the Workbox `navigateFallback`:
- SSR → `null` (HTML is always fetched from the Node.js server)
- SPA/SSG → `'/index.html'` (service worker handles navigation offline)

### CSS architecture

Tailwind CSS and SCSS coexist with a strict separation of concerns:

- **`app/tailwind.css`** — pure CSS only. All Tailwind directives live here (`@import "tailwindcss"`, `@theme`, `@theme inline`, `@custom-variant dark`, `@layer base`). Tailwind's Vite plugin does not reliably resolve `@apply` in SCSS output, so Tailwind directives must never be in `.scss` files.
- **`app/app.scss`** — font imports (`@fontsource/...`) and `:root` / `.dark` CSS custom property declarations only. No Tailwind directives.

Design tokens are always defined as CSS custom properties (`--token-name`), never as SCSS variables. This keeps tokens consumable by JavaScript, Tailwind, and any third-party component without being locked to the preprocessor.

### Dark / light mode

`ThemeProvider` follows the shadcn/ui pattern with one key addition: **cookie persistence** instead of `localStorage`.

`localStorage` is inaccessible during SSR. A server `Set-Cookie` action is incompatible with SPA/SSG render modes. `document.cookie` works identically across all three modes — the value rides HTTP headers on every request, so the SSR server reads it correctly too.

On first visit (no cookie), an inline `<script>` in `<head>` reads `prefers-color-scheme` synchronously before React hydrates — zero flash for dark-OS users.

### Client-side data persistence (IndexedDB)

All app state beyond theme and locale goes in IndexedDB. Cookies handle only SSR-critical state.

`app/lib/db.ts` — versioned schema manager with a `MIGRATIONS` record (bump `DB_VERSION` + add migration entry to run only the delta). Generic typed CRUD helpers: `dbGet`, `dbPut`, `dbDelete`, `dbGetAll`.

Current schema (v1):

| Store | keyPath | Purpose |
|---|---|---|
| `readingProgress` | `editionId` | Scroll progress (0–100) + completed flag per edition |

### i18n

Four supported locales: `pt-BR` · `en-US` · `es-ES` · `ar-SA` (RTL). Detection order: cookie → browser language (`navigator.language`). No URL prefix.

The root `loader` reads the i18n cookie and the `Accept-Language` header on the server, mirroring exactly what `convertDetectedLanguage` resolves on the client — no hydration mismatch.

`<html lang>` and `<html dir>` are set from loader data. Arabic triggers `dir="rtl"` automatically.

### PWA

`vite-plugin-pwa` + `@vite-pwa/assets-generator` with `minimal2023Preset`. The manifest is generated from env vars at build time. Service worker uses Workbox with `autoUpdate` strategy.

SW registration is production-only (guarded by `import.meta.env.PROD` in `entry.client.tsx`) — service workers are never active in development.

---

## Project structure

```
app/
├── components/
│   ├── ui/                  # shadcn/ui primitives (Sheet, Select, Dialog, …)
│   ├── app-header.tsx       # Top bar with nav drawer trigger
│   ├── bottom-nav.tsx       # Mobile bottom navigation bar
│   ├── category-tabs.tsx    # Newsletter category tabs
│   ├── edition-card.tsx     # Feed card (default + featured + skeleton)
│   ├── edition-html.tsx     # Sanitized HTML renderer for newsletter content
│   ├── interests-picker.tsx # Full-screen filter sheet (newsletter + period + audience + tags)
│   ├── nav-drawer.tsx       # Slide-in navigation drawer
│   ├── quiz-screen.tsx      # Post-read quiz component
│   ├── rating-sheet.tsx     # Post-read rating bottom sheet
│   ├── reading-progress.tsx # Sticky progress bar + completion tracking
│   ├── theme-provider.tsx   # Dark/light mode context + cookie persistence
│   ├── video-dialog.tsx     # Embedded YouTube video dialog
│   └── xp-toast.tsx        # Gamification XP toast notification
│
├── data/
│   ├── api.ts              # API client — fetchEditionsList, fetchEditionWithNeighbors,
│   │                       #   cacheEditions, _positionMap, categorySlugFromCaderno,
│   │                       #   parseEditionTags, PAGE_SIZE_OPTIONS
│   ├── editions.ts         # Static data — CATEGORIES, QUIZZES (keyed by edition.slug)
│   └── user.ts             # Static user profile data
│
├── hooks/
│   └── use-reading-progress.ts  # IndexedDB-backed progress hook with debounced writes
│
├── i18n/
│   └── locales/
│       ├── pt-BR.json
│       ├── en-US.json
│       ├── es-ES.json
│       └── ar-SA.json
│
├── lib/
│   ├── db.ts               # IndexedDB versioned schema + CRUD helpers
│   └── utils.ts            # cn() utility (clsx + tailwind-merge)
│
├── routes/
│   ├── _app.tsx            # Root layout shell (bottom nav, header, theme)
│   ├── home.tsx            # Feed — search, filters, sort, pagination
│   ├── editions.$slug.tsx  # Edition detail — full HTML, progress, quiz, nav
│   ├── habits.tsx          # Habits screen (illustrative — API requires auth)
│   ├── books.tsx           # Books screen (illustrative — static)
│   ├── cup.tsx             # World Cup screen (illustrative — static)
│   ├── settings.tsx        # Settings screen (illustrative — no backend)
│   └── more.tsx            # More screen (illustrative — static)
│
├── app.scss                # Font imports + CSS custom property declarations
├── tailwind.css            # All Tailwind directives (must stay pure CSS)
├── root.tsx                # Root route — loader (theme/locale), Layout, App
├── entry.client.tsx        # Client entry — hydration + PWA SW registration
└── entry.server.tsx        # Server entry — SSR request handler
```

---

## The news public API

Base URL: `https://api.thenews.com.br/api/mobile`

All endpoints used in this project are **unauthenticated**. No API key or token required.

### `GET /editions`

Paginated list of editions across all newsletters.

**Supported params (verified by testing):**

| Param | Type | Notes |
|---|---|---|
| `page` | integer ≥ 1 | Page number. Default: 1 |
| `limit` | integer 1–20 | Items per page. Silently capped at 20. Default: 10 |
| `search` | string | Full-text search on `subjectLine` + `previewText`. Server-side, cross-page |

**Params that do NOT work without auth** (silently ignored by the API):

`sort`, `order`, `cadernoId`, `audience`, `tags`, `perPage` — all tested, all ignored.

**Response:**
```json
{
  "success": true,
  "data": [ /* Edition[] */ ],
  "pagination": { "page": 1, "limit": 20, "total": 1411, "totalPages": 71 }
}
```

### How the app works around API limitations

Since filtering, sorting and newsletter selection are not available without auth, the app applies a **client-side filter pipeline** on the current page's results:

1. Newsletter / interest filter — derived from `edition.cadernoId` via `categorySlugFromCaderno()`
2. Content tag filter — parsed from `edition.contentTags` (JSON string) via `parseEditionTags()`
3. Period filter — `edition.publishDate` compared against `getPeriodCutoff(period)`
4. Audience filter — `edition.audience === 'free' | 'premium'`
5. Sort — `viewsCount | likesCount | commentsCount` descending, or default (API order = newest)

When filters are active, the pagination UI is hidden and a callout appears explaining the single-page scope. `?q=` search remains available as the cross-page discovery path.

### Fetching a single edition by slug

There is no `/editions/:slug` endpoint. The app maintains a module-level `_positionMap` (populated on every list fetch) that maps `slug → { page, idx, limit }` for O(1) lookup. On a cold cache (direct URL access), it falls back to a linear search of up to 5 pages.

```
fetchEditionWithNeighbors(slug)
  → check _positionMap  (O(1), warm cache)
  → linear search up to 5 pages (cold cache / direct URL)
  → return { edition, prev, next }
```

### Key edition fields

| Field | Type | Used for |
|---|---|---|
| `id` | string | IndexedDB key for reading progress |
| `slug` | string | Route param (`/:slug`), quiz keying |
| `subjectLine` | string | Card title, detail page headline |
| `previewText` | string | Card body (4-line clamp) |
| `htmlContent` | string | Full newsletter HTML — rendered in edition detail |
| `thumbnailUrl` | string \| null | Card image; null → category gradient fallback |
| `cadernoId` | string | Maps to newsletter slug via `categorySlugFromCaderno()` |
| `contentTags` | string | JSON string, e.g. `'["música","cinema"]'` — parsed by `parseEditionTags()` |
| `authors` | string | JSON string — parsed for author badge |
| `audience` | `"free"` \| `"premium"` | Audience badge + client-side filter |
| `publishDate` | string | ISO date — period filter + display |
| `viewsCount` | integer | Card footer + sort |
| `likesCount` | integer | Card footer + sort |
| `commentsCount` | integer | Card footer + sort |
| `isCurrentEdition` | boolean | "Today" badge |
| `hiddenFromFeed` | boolean | Filtered out before display |
| `webUrl` | string | "Read on site" link in edition header |

---

## Running locally

### Prerequisites

- Node.js 24+
- npm 10+

### Without Docker

```bash
# 1. Clone the repository
git clone https://github.com/AllanGBOliveira/thenews-design-engineer-case.git
cd thenews-design-engineer-case

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Copy the environment file
cp .env.example .env

# 4. Start the development server (SSR mode, HMR)
npm run dev
```

App is available at `http://localhost:5173`.

### With Docker (recommended for parity with CI)

Docker Compose mounts the project directory into the container and uses a named volume for `node_modules` — this keeps Alpine/musl container binaries isolated from the host's glibc binaries.

```bash
# Start the dev server in a container
docker compose up
```

App is available at `http://localhost:5173` (or the `PORT` in your `.env`).

The container installs dependencies on startup and streams HMR through the mounted volume. Your local editor gets full type checking from the host's `node_modules`.

---

## Building for production

### SSR (default — requires a Node.js server)

```bash
npm run build          # or npm run build:ssr
npm start              # serves from build/server/index.js
```

Output:
```
build/
├── client/   # static assets (JS, CSS, images, icons, sw.js)
└── server/   # Node.js SSR handler
```

### SPA (no server — deploy to any CDN)

```bash
npm run build:spa
npx serve build/client -s   # or npm run preview
```

### SSG (pre-rendered static HTML — deploy to any CDN)

```bash
npm run build:ssg
npx serve build/client -s
```

Pre-rendered routes are listed in `react-router.config.ts` under `config.prerender`.

### Full deploy pipeline (lint + typecheck + build)

```bash
npm run deploy        # SSR
npm run deploy:spa    # SPA
npm run deploy:ssg    # SSG
```

These run `lint:fix → lint:styles:fix → pwa:generate → typecheck → build` in sequence.

### Docker production build

The root `Dockerfile` uses a multi-stage build:
1. Install all dependencies (dev + prod)
2. Install production-only dependencies
3. Build the app
4. Copy only the production artifacts into the final image

```bash
docker build -t thenews .
docker run -p 3000:3000 thenews
```

---

## Environment variables

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `5173` | Dev server / Docker port |
| `VITE_SITE_NAME` | `thenews` | Derives `appSlug` — used in cookie keys and PWA manifest |
| `VITE_SITE_URL` | `https://thenewscc.com.br` | Canonical URL for SEO meta tags |
| `VITE_SITE_SHORT_NAME` | `thenews` | PWA homescreen name |
| `VITE_SITE_DESCRIPTION` | `the news — design engineer case` | Meta description + PWA description |
| `VITE_THEME_COLOR` | `"#000000"` | Browser bar color + PWA theme color (must be quoted — `#` is a comment char in dotenv) |
| `VITE_BG_COLOR` | `"#ffffff"` | PWA background color |
| `VITE_I18N_COOKIE_KEY` | `${appSlug}-i18n` | Override the i18n cookie name |
| `VITE_THEME_COOKIE_KEY` | `${appSlug}-theme` | Override the theme cookie name |
| `RENDER_MODE` | `ssr` | Set via shell at build time, never in `.env` — values: `ssr` \| `spa` \| `ssg` |

> **Note:** `RENDER_MODE` must be set as a shell variable, not in `.env`. Storing it in `.env` would expose it to Vite's client bundle via the `VITE_` mechanism.

---

## CI/CD

GitHub Actions runs on every push and pull request to any branch.

| Job | What it checks |
|---|---|
| `commitlint` | Conventional Commits format on all commits in the push/PR |
| `lint` | ESLint (`@eslint-react`, `react-hooks`, `typescript-eslint`) + Stylelint (SCSS) |
| `typecheck` | `react-router typegen && tsc` — React Router type generation then full TypeScript check |
| `test` | Vitest unit tests |

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org): `type(scope): description`.

Valid types: `feat` · `fix` · `style` · `refactor` · `chore` · `docs` · `perf` · `build`

Husky enforces the same `commitlint` check locally on every `git commit`.

---

## What's functional vs. illustrative

### Fully functional (live API data)

- Feed listing with real newsletter editions
- Full-text search (server-side)
- Client-side filtering: newsletter, period, audience, content tags
- Sort by views / likes / comments
- Per-page selector and pagination
- Edition full HTML content
- Reading progress tracked by scroll + persisted in IndexedDB
- Prev / next post navigation (O(1) position map + async fallback)
- Post-read quiz (logic functional, content hardcoded per edition)
- Dark / light mode with cookie persistence
- i18n across 4 locales (PT-BR, EN-US, ES-ES, AR-SA with RTL)
- PWA — installable, offline-capable

### Functional UI, no backend write

- Rating sheet — full star animation UI, no persistence
- Like / comment counts — read from API; writing requires auth
- ContinueSheet post-read flow — navigation functional, engagement write calls no-op

### Illustrative (UX preserved, no data)

- Settings screen — full UI, no backend
- Habits, Books, Cup, More screens — placeholder layouts demonstrating navigation shell

---

## License

This project is a selection process deliverable and is not intended for redistribution.
