import en from './locales/en'
import ru from './locales/ru'
import de from './locales/de'
import { Locale, MessageKey, Messages } from './types'

const catalogs: Record<Locale, Messages> = { en, ru, de }

export const SUPPORTED_LOCALES: Locale[] = ['en', 'ru', 'de']

const UI_LOCALE_KEY = 'alias.uiLocale'

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

export function getSavedUiLocale(): Locale | null {
  try {
    const raw = localStorage.getItem(UI_LOCALE_KEY)
    if (raw === 'en' || raw === 'ru' || raw === 'de') return raw
  } catch (e) {
    // ignore
  }
  return null
}

let currentLocale: Locale = detectLocale()

export function getLocale(): Locale {
  return currentLocale
}

/** Apply locale in memory only (no persistence). */
export function setLocale(locale: Locale) {
  if (SUPPORTED_LOCALES.includes(locale)) currentLocale = locale
  return currentLocale
}

/** Persist manual UI language override and apply it. */
export function setUiLocale(locale: Locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return currentLocale
  currentLocale = locale
  try {
    localStorage.setItem(UI_LOCALE_KEY, locale)
  } catch (e) {
    // ignore
  }
  return currentLocale
}

/**
 * Resolve UI locale: saved manual choice → device language → English.
 */
export function initLocale() {
  currentLocale = getSavedUiLocale() || detectLocale()
  return currentLocale
}

/** @deprecated Prefer initLocale() which respects a saved override. */
export function initLocaleFromDevice() {
  return initLocale()
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
