import {DeckCollection, ExpatCategory, GameLanguage} from './types'
import {generateDeckCollection} from './deckGenerator'
import {isPlayableCardText} from '../services/cardText'

const STORAGE_KEY = 'alias_deck_collection_v1'

const LANG_REGEX: Record<GameLanguage, RegExp> = {
  en: /^[A-Za-z0-9 ,.'"\-!?()/:;&]+$/,
  de: /^[A-Za-zÄÖÜäöüß0-9 ,.'"\-!?()/:;&]+$/,
  ru: /^[А-Яа-яЁё0-9 ,.'"\-!?()/:;&]+$/,
}

const CATEGORIES: ExpatCategory[] = [
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

function safeParse(raw: string | null): any {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/** Reject corrupt / mixed-language cached decks so generator can rebuild. */
function isValidCollection(obj: any): obj is DeckCollection {
  if (!obj || typeof obj !== 'object') return false
  if (obj.version !== 1) return false
  if (!obj.languages || typeof obj.languages !== 'object') return false

  const langs: GameLanguage[] = ['ru', 'en', 'de']
  for (const lang of langs) {
    const langDeck = obj.languages[lang]
    if (!langDeck || typeof langDeck !== 'object') return false
    const rx = LANG_REGEX[lang]

    for (const cat of CATEGORIES) {
      const list = langDeck[cat]
      if (!Array.isArray(list)) return false

      const sampleCount = Math.min(list.length, 50)
      for (let i = 0; i < sampleCount; i += 1) {
        const s = String(list[i] || '').replace(/\s+/g, ' ').trim()
        if (!s) return false
        if (!rx.test(s)) return false
        if (!isPlayableCardText(s)) return false
      }
    }
  }

  return true
}

export function ensureDeckCollectionInStorage(): DeckCollection {
  const existing = safeParse(localStorage.getItem(STORAGE_KEY))
  if (isValidCollection(existing)) {
    return existing
  }

  const generated = generateDeckCollection()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(generated))
  return generated
}

export function getDeckCollectionFromStorage(): DeckCollection | null {
  const existing = safeParse(localStorage.getItem(STORAGE_KEY))
  if (isValidCollection(existing)) {
    return existing
  }
  return null
}

export function exportDeckCollectionForApi(): DeckCollection | null {
  return getDeckCollectionFromStorage()
}
