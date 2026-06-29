---
name: feedback-theme-architecture
description: Theme state must live in Layout (not in a useTheme hook with DOM effects) to avoid revalidation flash
metadata:
  type: feedback
---

Theme state must live in the `Layout` component (`useState<Theme>`), which drives `<html className>` directly. Route components consume it via `useTheme()` context from `~/root`.

**Why:** Putting theme state in a hook that uses `classList.toggle` (imperative DOM) fights with React's reconciliation. During `useFetcher` revalidation, `useRouteLoaderData` returns stale data, causing Layout to re-render with old `className`, which React then applies to the DOM — clearing the class the DOM effect just added. The user sees the first click as doing nothing (needs two clicks).

**How to apply:** Any future theme-related work should read/write from `useTheme()` context only. Never add a DOM effect to toggle the dark class independently.
