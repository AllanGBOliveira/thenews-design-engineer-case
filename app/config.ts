const siteName = import.meta.env.VITE_SITE_NAME ?? 'thenews'

export const appSlug = siteName
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

export const config = {
  siteName,
  siteUrl: import.meta.env.VITE_SITE_URL ?? 'https://thenewscc.com.br',
  siteShortName: import.meta.env.VITE_SITE_SHORT_NAME ?? 'thenews',
  siteDescription: import.meta.env.VITE_SITE_DESCRIPTION ?? 'the news — design engineer case',
  themeColor: import.meta.env.VITE_THEME_COLOR ?? '#000000',
  bgColor: import.meta.env.VITE_BG_COLOR ?? '#ffffff',
  i18nCookieKey: import.meta.env.VITE_I18N_COOKIE_KEY ?? `${appSlug}-i18n`,
  themeCookieKey: import.meta.env.VITE_THEME_COOKIE_KEY ?? `${appSlug}-theme`,
} as const
