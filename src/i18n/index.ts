import en from './locales/en'
import ru from './locales/ru'
import de from './locales/de'
import { Locale, MessageKey, Messages } from './types'

const catalogs: Record<Locale, Messages> = { en, ru, de }

const SUPPORTED: Locale[] = ['en', 'ru', 'de']

/** Map device language to app locale; anything else → English. */
export function detectLocale(raw?: string | null): Locale {
  const candidates: string[] = []
  if (raw) candidates.push(raw)
  try {
    if (typeof navigator !== 'undefined') {
      if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages)
      if (navigator.language) candidates.push(navigator.language)
    }
  } catch (e) {
    // ignore
  }

  for (const c of candidates) {
    const base = String(c || '')
      .trim()
      .toLowerCase()
      .split(/[-_]/)[0]
    if (base === 'ru') return 'ru'
    if (base === 'de') return 'de'
    if (base === 'en') return 'en'
  }
  return 'en'
}

let currentLocale: Locale = detectLocale()

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(locale: Locale) {
  if (SUPPORTED.includes(locale)) currentLocale = locale
}

export function initLocaleFromDevice() {
  currentLocale = detectLocale()
  return currentLocale
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] !== undefined && params[key] !== null ? String(params[key]) : `{${key}}`
  )
}

export function t(key: MessageKey, params?: Record<string, string | number>): string {
  const table = catalogs[currentLocale] || catalogs.en
  const fallback = catalogs.en[key]
  const raw = table[key] || fallback || String(key)
  return interpolate(raw, params)
}

export function categoryLabel(category: string): string {
  const key = `category.${category}` as MessageKey
  if (key in catalogs.en) return t(key)
  return category
}
