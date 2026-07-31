import bundled from '../data/word-bank.json'
import { APP_CONFIG, HardLevel } from '../config/appConfig'

export type WordBankPayload = {
  version: number
  updatedAt?: string
  difficulties: Record<HardLevel, string[]>
}

const CACHE_KEY = 'alias.wordBank.v1'
const META_KEY = 'alias.wordBank.meta.v1'

type CacheMeta = {
  version: number
  updatedAt?: string
  source: 'bundled' | 'cache' | 'network'
  lastCheckedAt?: string
}

function isValidBank(data: any): data is WordBankPayload {
  if (!data || typeof data !== 'object') return false
  if (!data.difficulties) return false
  for (const level of ['EASY', 'NORMAL', 'HARD'] as HardLevel[]) {
    if (!Array.isArray(data.difficulties[level]) || data.difficulties[level].length < 50) return false
  }
  return true
}

function readCache(): WordBankPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isValidBank(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeCache(bank: WordBankPayload, source: CacheMeta['source']) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(bank))
  const meta: CacheMeta = {
    version: Number(bank.version) || 1,
    updatedAt: bank.updatedAt,
    source,
    lastCheckedAt: new Date().toISOString(),
  }
  localStorage.setItem(META_KEY, JSON.stringify(meta))
}

function bundledBank(): WordBankPayload {
  return {
    version: Number((bundled as any).version) || 1,
    updatedAt: (bundled as any).updatedAt,
    difficulties: {
      EASY: (bundled as any).difficulties.EASY,
      NORMAL: (bundled as any).difficulties.NORMAL,
      HARD: (bundled as any).difficulties.HARD,
    },
  }
}

/** Immediate words for play: local cache → bundled. Never blocks on network. */
export function getLocalWordBank(): WordBankPayload {
  const cached = readCache()
  if (cached) return cached
  const bank = bundledBank()
  writeCache(bank, 'bundled')
  return bank
}

export function getWordsForLevel(level: HardLevel | string): string[] {
  const key = (String(level || 'NORMAL').toUpperCase() as HardLevel)
  const bank = getLocalWordBank()
  return bank.difficulties[key] || bank.difficulties.NORMAL
}

export function getWordBankMeta(): CacheMeta | null {
  try {
    const raw = localStorage.getItem(META_KEY)
    return raw ? (JSON.parse(raw) as CacheMeta) : null
  } catch {
    return null
  }
}

/**
 * Background sync: if remote version is newer, replace local cache.
 * Failures are silent — game keeps using cached/bundled words.
 */
export async function syncWordBankInBackground(): Promise<'updated' | 'unchanged' | 'skipped' | 'error'> {
  const url = APP_CONFIG.wordsUrl
  if (!url || url.includes('cdn.example.com')) {
    // Placeholder URL — skip until real CDN/API is configured
    return 'skipped'
  }

  try {
    const local = getLocalWordBank()
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return 'error'

    const remote = await res.json()
    if (!isValidBank(remote)) return 'error'

    const remoteVersion = Number(remote.version) || 0
    const localVersion = Number(local.version) || 0
    if (remoteVersion <= localVersion) {
      const meta = getWordBankMeta()
      localStorage.setItem(
        META_KEY,
        JSON.stringify({
          ...(meta || { version: localVersion, source: 'cache' }),
          lastCheckedAt: new Date().toISOString(),
        })
      )
      return 'unchanged'
    }

    writeCache(
      {
        version: remoteVersion,
        updatedAt: remote.updatedAt || new Date().toISOString(),
        difficulties: remote.difficulties,
      },
      'network'
    )
    return 'updated'
  } catch {
    return 'error'
  }
}

/** Call once on app start (after first paint). */
export function startWordBankSync() {
  // Ensure bundled/cache is ready immediately
  getLocalWordBank()
  // Fire-and-forget background check
  void syncWordBankInBackground()
}
