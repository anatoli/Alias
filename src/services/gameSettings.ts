import { ExpatCategory, WordPack } from '../components/GameFrameComponent/helpArray'

const STORAGE_KEY = 'alias.gameSettings.v1'

export type PersistedGameSettings = {
  time: number
  hardLevel: string
  teams: { name: string }[]
  categories: ExpatCategory[]
  wordPack: WordPack
  customPackId: string
  wordsToFinish: number
}

const DEFAULT_CATEGORIES: ExpatCategory[] = [
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

export function defaultGameSettings(): PersistedGameSettings {
  return {
    time: 30,
    hardLevel: 'NORMAL',
    wordPack: 'classic',
    customPackId: '',
    teams: [{ name: 'Player 1' }, { name: 'Player 2' }],
    categories: DEFAULT_CATEGORIES.slice(),
    wordsToFinish: 30,
  }
}

function normalizeTeams(raw: unknown): { name: string }[] {
  if (!Array.isArray(raw)) return defaultGameSettings().teams
  const teams = raw
    .map((t: any) => ({ name: String((t && t.name) || '').trim() }))
    .filter((t) => t.name.length > 0)
    .slice(0, 10)
  if (teams.length < 2) return defaultGameSettings().teams
  return teams
}

function normalizeWordPack(raw: unknown): WordPack {
  if (raw === 'expat' || raw === 'custom' || raw === 'classic') return raw
  return 'classic'
}

function normalizeCategories(raw: unknown): ExpatCategory[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_CATEGORIES.slice()
  const allowed = new Set(DEFAULT_CATEGORIES)
  const cats = raw
    .map((c) => String(c) as ExpatCategory)
    .filter((c) => allowed.has(c))
  return cats.length > 0 ? cats : DEFAULT_CATEGORIES.slice()
}

export function loadGameSettings(): PersistedGameSettings {
  const defaults = defaultGameSettings()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return defaults

    const time = Number(parsed.time)
    const wordsToFinish = Number(parsed.wordsToFinish)
    const hardLevel = String(parsed.hardLevel || defaults.hardLevel).toUpperCase()

    return {
      time: time === 30 || time === 60 || time === 90 ? time : defaults.time,
      hardLevel: hardLevel === 'EASY' || hardLevel === 'NORMAL' || hardLevel === 'HARD'
        ? hardLevel
        : defaults.hardLevel,
      teams: normalizeTeams(parsed.teams),
      categories: normalizeCategories(parsed.categories),
      wordPack: normalizeWordPack(parsed.wordPack),
      customPackId: String(parsed.customPackId || ''),
      wordsToFinish:
        wordsToFinish === 30 || wordsToFinish === 60 || wordsToFinish === 90
          ? wordsToFinish
          : defaults.wordsToFinish,
    }
  } catch {
    return defaults
  }
}

export function saveGameSettings(settings: Partial<PersistedGameSettings> & {
  teams?: { name: string }[]
}) {
  const current = loadGameSettings()
  const next: PersistedGameSettings = {
    ...current,
    ...settings,
    teams: settings.teams ? normalizeTeams(settings.teams) : current.teams,
    categories: settings.categories
      ? normalizeCategories(settings.categories)
      : current.categories,
    wordPack: settings.wordPack
      ? normalizeWordPack(settings.wordPack)
      : current.wordPack,
    customPackId:
      settings.customPackId !== undefined
        ? String(settings.customPackId || '')
        : current.customPackId,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}
