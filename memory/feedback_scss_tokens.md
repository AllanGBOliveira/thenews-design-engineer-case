---
name: feedback-scss-tokens
description: SCSS for syntax, CSS custom properties for all tokens — never SCSS variables for design values
metadata:
  type: feedback
---

Use SCSS for its structural benefits (nesting, partials, @use), but always define design tokens as CSS custom properties (`--token-name`), never as SCSS variables (`$var`).

**Why:** CSS custom properties are framework-agnostic — they work in JavaScript, Tailwind, and any third-party component without being locked to the SCSS preprocessor.

**How to apply:** Any time a color, spacing, font size, or other design value needs to be stored, use `--token-name: value` in a `:root {}` block (or `@theme {}` for Tailwind v4). Never write `$color-primary: #FFD60A`.
