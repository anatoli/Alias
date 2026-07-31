/** User-created word packs (premium: no-ads / subscription). */

export type CustomWordPack = {
  id: string
  name: string
  words: string[]
  updatedAt: string
}

const STORAGE_KEY = 'alias.customWordPacks.v1'

function safeParse(raw: string | null): CustomWordPack[] {
  try {
    const data = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function listCustomPacks(): CustomWordPack[] {
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

export function getCustomPack(id: string): CustomWordPack | null {
  return listCustomPacks().find((p) => p.id === id) || null
}

export function saveCustomPack(input: { id?: string; name: string; words: string[] }): CustomWordPack | null {
  const name = String(input.name || '').trim()
  const words = (input.words || [])
    .map((w) => String(w).trim())
    .filter(Boolean)
  if (!name || words.length === 0) return null

  const packs = listCustomPacks()
  const id = input.id || `custom_${Date.now().toString(36)}`
  const next: CustomWordPack = {
    id,
    name,
    words,
    updatedAt: new Date().toISOString(),
  }
  const idx = packs.findIndex((p) => p.id === id)
  if (idx >= 0) packs[idx] = next
  else packs.push(next)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packs))
  return next
}

export function deleteCustomPack(id: string) {
  const packs = listCustomPacks().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packs))
}

/** Parse textarea: one word per line (commas also split). */
export function parseWordsText(text: string): string[] {
  return String(text || '')
    .split(/[\n,;]+/)
    .map((w) => w.trim())
    .filter(Boolean)
}
