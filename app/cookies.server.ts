import { createCookie } from 'react-router'
import { config } from './config'

export const themeCookie = createCookie(config.themeCookieKey, {
  path: '/',
  sameSite: 'lax',
  maxAge: 365 * 24 * 60 * 60,
})

export const localeCookie = createCookie(config.i18nCookieKey, {
  path: '/',
  sameSite: 'lax',
  maxAge: 365 * 24 * 60 * 60,
})
