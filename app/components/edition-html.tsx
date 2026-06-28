import { useMemo } from 'react'

/* ─── Scope ──────────────────────────────────────────────────────────
   All CSS rules are prefixed with SCOPE so the injected <style> tag
   (which lands in the document body via dangerouslySetInnerHTML) cannot
   bleed into the app shell. The email's inline style="color:#000000"
   and style="background-color:#ffffff" are overridden by !important.
   Dark/light mode is handled via CSS custom properties from app.scss —
   no runtime JS needed.
──────────────────────────────────────────────────────────────────────── */
const SCOPE = 'tnws-edition'

/* This is built once and never changes — primary color is set via CSS
   custom property on the wrapper div, not in the <style> tag. */
const OVERRIDE_CSS = (() => {
  const s = `.${SCOPE}`
  return `
    ${s} { display:block; overflow-x:hidden; max-width:100%; padding:0 0 32px; }

    /* strip all email backgrounds */
    ${s} * { background-color:transparent !important; }

    /* restore semantic backgrounds */
    ${s} blockquote { background-color:var(--chrome-surface) !important; }

    /* fluid tables — mirrors APK injection */
    ${s} table,${s} tbody,${s} thead,${s} tr {
      width:100% !important; min-width:0 !important; table-layout:auto !important;
    }
    ${s} td,${s} th { max-width:100% !important; }

    /* images — mirrors APK: border-radius:12px, height:auto */
    ${s} img {
      max-width:100% !important; height:auto !important;
      border-radius:12px !important; margin:4px 0 !important;
      display:block !important;
    }

    /* typography base */
    ${s},
    ${s} p,${s} li,${s} td,${s} th,${s} div,${s} span {
      color:var(--chrome-text) !important;
      font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,
                  'Segoe UI',Roboto,Helvetica,Arial,sans-serif !important;
      font-size:16px !important;
      line-height:1.6 !important;
    }

    /* headings */
    ${s} h1,${s} h2,${s} h3,${s} h4,${s} h5 {
      color:var(--chrome-text) !important;
      font-family:'Plus Jakarta Sans',-apple-system,sans-serif !important;
    }
    /* h6 = section labels in beehiiv (BIG STORY, COPA DO MUNDO…) */
    ${s} h6 {
      color:var(--edition-primary, #F97316) !important;
      font-size:11px !important; font-weight:700 !important;
      letter-spacing:0.18em !important; text-transform:uppercase !important;
      margin:24px 0 4px !important;
    }

    ${s} strong,${s} b { color:var(--chrome-text) !important; font-weight:700 !important; }
    ${s} em,${s} i { color:var(--chrome-muted) !important; }

    /* links */
    ${s} a,${s} a * { color:var(--brand) !important; text-decoration:underline !important; word-break:break-word !important; }

    /* blockquote / highlighted callout */
    ${s} blockquote {
      border-left:4px solid var(--edition-primary,#F97316) !important;
      padding:12px 16px !important; margin:12px 0 !important;
      border-radius:0 8px 8px 0 !important;
    }
    ${s} blockquote * { color:var(--chrome-text) !important; }

    /* misc */
    ${s} hr { border-color:var(--chrome-divider) !important; margin:16px 0 !important; }
    ${s} figure { margin:16px 0 !important; }
    ${s} figcaption,${s} cite { font-size:13px !important; color:var(--chrome-muted) !important; }
    ${s} p { margin:8px 0 !important; }
  `
})()

/* Pre-built <style> node — embedded once in all sanitized outputs */
const STYLE_TAG = `<style>${OVERRIDE_CSS}</style>`

function sanitize(html: string): string {
  // Extract <body> content from the full beehiiv email HTML document
  let body = html
    .replace(/^[\s\S]*?<body[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*$/i, '')

  // Strip tracking pixels
  body = body
    .replace(/<img[^>]*testeswaffle\.org[^>]*\/?>/gi, '')
    .replace(/<img[^>]*\/streaks\/pixel[^>]*\/?>/gi, '')
    .replace(/<img[^>]*width=["']?1["']?[^>]*height=["']?1["']?[^>]*\/?>/gi, '')

  return STYLE_TAG + body
}

/* ─── Component ─────────────────────────────────────────────────────── */

type Props = {
  html: string
  primaryColor: string
  className?: string
}

export function EditionHtml({ html, primaryColor, className }: Props) {
  const sanitized = useMemo(() => sanitize(html), [html])

  return (
    <div
      className={[SCOPE, className].filter(Boolean).join(' ')}
      // --edition-primary scoped to this element — no :root pollution
      style={{ '--edition-primary': primaryColor } as React.CSSProperties}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
