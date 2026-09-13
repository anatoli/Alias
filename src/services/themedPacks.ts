import { GameLanguage } from '../decks/types'
import { filterPlayableCards } from './cardText'
import { resolveGameLanguage } from './gameSettings'

import home from '../data/packs/home.json'
import food from '../data/packs/food.json'
import travel from '../data/packs/travel.json'
import nature from '../data/packs/nature.json'

export type ThemedPackId = 'home' | 'food' | 'travel' | 'nature'

type PackFile = {
  id: string
  version: number
  languages: Partial<Record<GameLanguage, string[]>>
}

const PACKS: Record<ThemedPackId, PackFile> = {
  home: home as PackFile,
  food: food as PackFile,
  travel: travel as PackFile,
  nature: nature as PackFile,
}

export const THEMED_PACK_IDS: ThemedPackId[] = ['home', 'food', 'travel', 'nature']

export function isThemedPackId(id: string | undefined | null): id is ThemedPackId {
  return !!id && (THEMED_PACK_IDS as string[]).includes(id)
}

export function getThemedPackWords(
  packId: ThemedPackId,
  language?: GameLanguage | null
): string[] {
  const pack = PACKS[packId]
  if (!pack) return []
  const lang = resolveGameLanguage(language)
  const raw = (pack.languages && pack.languages[lang]) || pack.languages.en || []
  return filterPlayableCards(raw)
}
