import {DeckCollection} from './types'
import {generateDeckCollection} from './deckGenerator'

const STORAGE_KEY = 'alias_deck_collection_v1'

const LANG_REGEX: Record<string, RegExp> = {
  en: /^[A-Za-z0-9 ,.'"\-!?()/:;&]+$/,
  de: /^[A-Za-zÄÖÜäöüß0-9 ,.'"\-!?()/:;&]+$/,
  ru: /^[А-Яа-яЁё0-9 ,.'"\-!?()/:;&]+$/,
}

function safeParse(raw: string | null): any {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function isValidCollection(obj: any) {
  if (!obj || typeof obj !== 'object') return false
  if (obj.version !== 1) return false
  if (!obj.languages || typeof obj.languages !== 'object') return false

  const langs = ['ru', 'en', 'de']
  const categories = [
    'Bureaucracy',
    'Work',
    'German Language',
    'Transport',
    'Social Life',
    'Stereotypes',
    'Expat Life',
    'Cringe Situations',
    'IT / Tech',
    'Absurd / Meme',
  ]

  for (const lang of langs) {
    const langDeck = obj.languages[lang]
    if (!langDeck || typeof langDeck !== 'object') return false
    const rx = LANG_REGEX[lang]
    if (!rx) return false

    for (const cat of categories) {
      const list = langDeck[cat]
      if (!Array.isArray(list)) return false

      // Quick sampling validation: reject any mixed-language strings.
      const sampleCount = Math.min(list.length, 50)
      for (let i = 0; i < sampleCount; i += 1) {
        const s = String(list[i] || '').replace(/\s+/g, ' ').trim()
        if (!s) return false
        if (!rx.test(s)) return false
      }
    }
  }

  return true
}

export function ensureDeckCollectionInStorage(): DeckCollection {
  const existing = safeParse(localStorage.getItem(STORAGE_KEY)) as DeckCollection | null
  if (existing && isValidCollection(existing)) {
    return existing
  }

  const generated = generateDeckCollection()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(generated))
  return generated
}

export function getDeckCollectionFromStorage(): DeckCollection | null {
  const existing = safeParse(localStorage.getItem(STORAGE_KEY)) as DeckCollection | null
  if (existing && isValidCollection(existing)) {
    return existing
  }
  return null
}

export function exportDeckCollectionForApi(): DeckCollection | null {
  return getDeckCollectionFromStorage()
}

