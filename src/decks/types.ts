export type GameLanguage = 'ru' | 'en' | 'de'

export type ExpatCategory =
  | 'Bureaucracy'
  | 'Work'
  | 'German Language'
  | 'Transport'
  | 'Social Life'
  | 'Stereotypes'
  | 'Expat Life'
  | 'Cringe Situations'
  | 'IT / Tech'
  | 'Absurd / Meme'

export type DeckCollection = {
  version: number
  createdAtMs: number
  languages: Record<GameLanguage, Record<ExpatCategory, string[]>>
}

