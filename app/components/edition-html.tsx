import { useMemo } from 'react'

/* ─── HTML sanitizer ─────────────────────────────────────────────────
   Mirrors the WebView CSS injection found in the APK JS bundle.
   The email HTML from the API is beehiiv email format:
   - table-based layout with many inline styles
   - short class names (.a, .b, .c …) scoped to the email <style> block
   - all colors hardcoded as #000000 / #ffffff
   Strategy: strip email chrome, override with CSS custom properties
   so dark/light mode works without any JS.
──────────────────────────────────────────────────────────────────────── */

function buildOverrideCss(primaryColor: string): string {
  return `
    :root { --wt-primary: ${primaryColor}; }

    /* transparent strip — removes all white email backgrounds */
    *:not(img):not(blockquote) { background-color: transparent !important; }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: hidden !important;
      max-width: 100% !important;
    }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont,
                   'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
      font-size: 16px !important;
      line-height: 1.6 !important;
      color: var(--chrome-text) !important;
      padding: 4px 0 32px 0 !important;
    }

    /* make email tables fluid */
    table, tbody, thead, tr { width: 100% !important; min-width: 0 !important; table-layout: auto !important; }
    td, th { max-width: 100% !important; }

    /* images — mirrors app: border-radius 12px, auto height */
    img { max-width: 100% !important; height: auto !important; border-radius: 12px !important; margin: 4px 0 !important; display: block !important; }

    /* text elements */
    p, li, span, div { color: var(--chrome-text) !important; }
    h1, h2, h3, h4, h5 {
      color: var(--chrome-text) !important;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
    }
    /* h6 is used as section label in beehiiv — brand color */
    h6 {
      color: var(--wt-primary) !important;
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      letter-spacing: 0.18em !important;
      text-transform: uppercase !important;
      margin: 24px 0 4px !important;
    }

    strong, b { color: var(--chrome-text) !important; font-weight: 700 !important; }
    em, i { color: var(--chrome-muted) !important; }

    /* links */
    a, a span, a p { color: var(--brand) !important; text-decoration: underline !important; word-break: break-word !important; }

    /* blockquote / highlighted callout boxes */
    blockquote {
      border-left: 4px solid var(--wt-primary) !important;
      background-color: var(--chrome-surface) !important;
      padding: 12px 16px !important;
      margin: 12px 0 !important;
      border-radius: 0 8px 8px 0 !important;
    }
    blockquote p, blockquote span, blockquote div { color: var(--chrome-text) !important; }

    /* dividers */
    hr { border-color: var(--chrome-divider) !important; margin: 16px 0 !important; }

    /* figure / captions */
    figure { margin: 16px 0 !important; }
    figcaption, cite { font-size: 13px !important; color: var(--chrome-muted) !important; }

    /* beehiiv specific: inline sponsored label / "POWERED BY" rows */
    .g p { color: var(--chrome-muted) !important; font-size: 11px !important; letter-spacing: 0.15em !important; }
  `
}

function sanitize(html: string, primaryColor: string): string {
  // Extract <body> content — the email HTML is a full document
  let body = html
    .replace(/^[\s\S]*?<body[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*$/i, '')

  // Remove tracking pixels (waffle streaks pixel + similar 1x1 images)
  body = body.replace(/<img[^>]*testeswaffle\.org[^>]*\/?>/gi, '')
  body = body.replace(/<img[^>]*\/streaks\/pixel[^>]*\/?>/gi, '')
  body = body.replace(/<img[^>]*width=["']?1["']?[^>]*height=["']?1["']?[^>]*\/?>/gi, '')

  return `<style>${buildOverrideCss(primaryColor)}</style>${body}`
}

/* ─── Component ─────────────────────────────────────────────────────── */

type Props = {
  html: string
  primaryColor: string
  className?: string
}

export function EditionHtml({ html, primaryColor, className }: Props) {
  const sanitized = useMemo(
    () => sanitize(html, primaryColor),
    [html, primaryColor],
  )

  return (
    <div
      className={className}
      style={{ overflowX: 'hidden', maxWidth: '100%' }}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  )
}
