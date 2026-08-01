import {DeckCollection} from './types'
import {generateDeckCollection} from './deckGenerator'

const STORAGE_KEY = 'alias_deck_collection_v1'

function safeParse(raw: string | null): any {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function ensureDeckCollectionInStorage(): DeckCollection {
  const existing = safeParse(localStorage.getItem(STORAGE_KEY)) as DeckCollection | null
  if (existing && typeof existing === 'object' && existing.version === 1 && existing.languages) {
    return existing
  }

  const generated = generateDeckCollection()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(generated))
  return generated
}

export function getDeckCollectionFromStorage(): DeckCollection | null {
  const existing = safeParse(localStorage.getItem(STORAGE_KEY)) as DeckCollection | null
  if (existing && typeof existing === 'object' && existing.version === 1 && existing.languages) {
    return existing
  }
  return null
}

export function exportDeckCollectionForApi(): DeckCollection | null {
  return getDeckCollectionFromStorage()
}

