---
name: project-architecture
description: Core architectural decisions for the thenews design engineer case project
metadata:
  type: project
---

# Project Architecture

**Framework:** React Router v7 + Vite, SPA mode (no SSR/SSG). Deadline: 2026-06-29 (Monday).

**Screens:** Home/Feed + Habits (core). Books is stretch goal.

**Styling:** Tailwind v4 + SCSS. Tokens as CSS custom properties only — [[feedback_scss_tokens]].

**Fonts:** Plus Jakarta Sans (400/500/700) — substitute for proprietary Helvetica Now Display.

**Icons:** react-icons (`md`, `io5`, `fa6` families).

**Component library:** shadcn/ui v4 (preset: nova, base: radix). `cn()` helper at `app/lib/utils.ts`. Path alias `~/` → `./app/*`.

**Dark/light theme:** Class-based via `@custom-variant dark (&:is(.dark *))` in Tailwind v4. `.dark` applied to `<html>` by `useTheme` hook (`app/hooks/useTheme.ts`). Persisted to cookie `${appSlug}-theme`. No external lib needed.

**i18n:** react-i18next. Locales: pt-BR (default) and en-US (`/en-us/` prefix). Cookie key `${appSlug}-i18n`. URL is the authority; `_app.tsx` layout detects locale from pathname.

**Env vars:** All client vars `VITE_` prefixed. `app/config.ts` derives `appSlug` from `VITE_SITE_NAME` and composes cookie keys dynamically (same pattern as ao.dev).

**Why:** SPA mirrors React Native app behavior. CSS custom properties keep tokens framework-agnostic. shadcn provides accessible primitives without extra JS libraries for dark mode.
