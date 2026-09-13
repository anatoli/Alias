/** Playable Alias cards: short enough to stay large on screen. */
export const MAX_CARD_CHARS = 16
export const MAX_CARD_WORDS = 2

export function normalizeCardText(raw: string): string {
  return String(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Keep cards readable on phones: not ultra-long compounds / phrases.
 * 10 chars would drop too many good DE/RU words; 16 + max 2 words is a better fit.
 */
export function isPlayableCardText(raw: string): boolean {
  const text = normalizeCardText(raw)
  if (!text) return false
  if (text.length > MAX_CARD_CHARS) return false
  const words = text.split(' ').filter(Boolean)
  if (words.length < 1 || words.length > MAX_CARD_WORDS) return false
  // Avoid one giant token that forces tiny type (e.g. 20+ letter compounds)
  if (words.some((w) => w.length > 14)) return false
  return true
}

export function filterPlayableCards(words: string[]): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const w of words) {
    const text = normalizeCardText(w)
    if (!isPlayableCardText(text)) continue
    const key = text.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(text)
  }
  return out
}
