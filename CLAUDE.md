# CLAUDE.md

This file documents the project context, architectural decisions, and development conventions for AI-assisted engineering on this codebase.

---

## Project Context

This is the bonus deliverable for the **the news** (thenewscc.com.br) selection process for the **Dev Front-end & Design** role.

The challenge requires redesigning at least 2 screens of the app and optionally implementing them in React with responsive mobile layout, deployed to a public URL.

**Chosen screens:**
- **Habits** — calendar + streak gamification system (retention focus)
- **Books** — reading library and progress tracking (engagement focus)

These two were selected because they directly attack the two core product metrics of a media startup: daily retention (Habits/streak) and content engagement (Books).

---

## Architecture Decisions

### Framework: React Router v7 (not Next.js)
The deliverable simulates a mobile app interface. Next.js adds SSR complexity that is irrelevant here — native and hybrid apps (like the news's likely React Native stack) run entirely client-side. React Router v7 + Vite keeps the project surgical: clean `components/`, clear styling tokens, zero SSR noise for the evaluator.

### Rendering: SPA (not SSG)
The Habits and Books screens are highly dynamic — the calendar marks days in real time, streak counters update on interaction, book progress is user-specific. SSG pre-renders at build time and cannot predict per-user state. SPA with client-side rendering mirrors how a React Native app actually behaves.

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

---

## What Is Out of Scope

- Full onboarding flow
- Authentication screens
- Settings screens
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

## AI-Assisted Engineering

This project is developed with Claude Code as a development copilot. The developer makes all architectural, design, and product decisions. AI accelerates implementation of repetitive UI patterns and tooling setup.

This is transparent and intentional — using AI tooling efficiently is a core engineering skill in 2026.
