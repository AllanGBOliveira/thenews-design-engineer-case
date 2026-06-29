/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_NAME?: string
  readonly VITE_SITE_URL?: string
  readonly VITE_SITE_SHORT_NAME?: string
  readonly VITE_SITE_DESCRIPTION?: string
  readonly VITE_THEME_COLOR?: string
  readonly VITE_BG_COLOR?: string
  readonly VITE_I18N_COOKIE_KEY?: string
  readonly VITE_THEME_COOKIE_KEY?: string
  readonly [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV?: 'development' | 'production' | 'test'
    PORT?: string
    // Build-time rendering mode — set via shell, not .env (not exposed to client)
    RENDER_MODE?: 'ssr' | 'spa' | 'ssg'
  }
}
