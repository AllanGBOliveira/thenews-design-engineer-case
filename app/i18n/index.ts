import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import { config } from '../config'
import ptBR from './locales/pt-BR.json'
import enUS from './locales/en-US.json'
import esES from './locales/es-ES.json'
import arSA from './locales/ar-SA.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      'en-US': { translation: enUS },
      'es-ES': { translation: esES },
      'ar-SA': { translation: arSA },
    },
    defaultNS: 'translation',
    fallbackLng: 'pt-BR',
    supportedLngs: ['pt-BR', 'en-US', 'es-ES', 'ar-SA'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['cookie', 'navigator'],
      caches: ['cookie'],
      cookieMinutes: 525600, // 1 year
      cookieOptions: { path: '/', sameSite: 'strict' as const },
      lookupCookie: config.i18nCookieKey,
      // Normalize any browser locale to our four supported codes.
      // e.g. es-MX → es-ES, ar-SA → ar-SA, en-GB → en-US, pt-PT → pt-BR.
      convertDetectedLanguage: (lng: string) => {
        const l = lng.toLowerCase()
        if (l.startsWith('ar')) return 'ar-SA'
        if (l.startsWith('es')) return 'es-ES'
        if (l.startsWith('en')) return 'en-US'
        if (l.startsWith('pt')) return 'pt-BR'
        return 'pt-BR'
      },
    },
  })

export default i18n
