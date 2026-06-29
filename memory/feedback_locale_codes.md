---
name: feedback-locale-codes
description: All locale codes must use language-REGION pattern (pt-BR, en-US, es-ES, ar-SA) — no bare language codes
metadata:
  type: feedback
---

All locale codes must follow the `language-REGION` BCP 47 pattern consistently. Never use bare codes like `es` or `ar`.

Supported locales: `pt-BR`, `en-US`, `es-ES`, `ar-SA`.

**Why:** The user explicitly required that Spanish and Arabic follow the same naming pattern as `pt-BR` and `en-US`. Mixed styles (`pt-BR` + `en-US` + `es` + `ar`) are inconsistent and confusing.

**How to apply:** When adding any new supported locale, always use `language-REGION` format. Use `convertDetectedLanguage` in i18next detection config to normalize browser variants (`es-MX` → `es-ES`, `ar-EG` → `ar-SA`). Mirror the same normalization in `parseAcceptLanguage()` on the server.
