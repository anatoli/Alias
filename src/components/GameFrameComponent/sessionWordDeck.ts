type HardLevel = 'EASY' | 'NORMAL' | 'HARD'

function randomInt(maxExclusive: number) {
  if (maxExclusive <= 0) return 0

  // Prefer cryptographically strong randomness when available.
  // This avoids patterns if Math.random is poorly seeded on some devices.
  const cryptoObj: any = (typeof window !== 'undefined' ? (window as any).crypto : undefined)
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const buf = new Uint32Array(1)
    cryptoObj.getRandomValues(buf)
    return buf[0] % maxExclusive
  }

  return Math.floor(Math.random() * maxExclusive)
}

function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1)
    const tmp = arr[i]
    arr[i] = arr[j]
    arr[j] = tmp
  }
  return arr
}

function uniqueStringsPreserveOrder(words: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const w of words) {
    const key = String(w).trim()
    if (!key) continue
    if (seen.has(key)) continue
    seen.add(key)
    out.push(key)
  }
  return out
}

let deckState:
  | {
      hardLevel: HardLevel
      deck: string[]
      index: number
    }
  | undefined

export function resetSessionWordDeck() {
  deckState = undefined
}

export function initSessionWordDeck(hardLevel: HardLevel, sourceWords: string[]) {
  const deduped = uniqueStringsPreserveOrder(sourceWords)
  const deck = shuffleInPlace(deduped.slice())
  deckState = { hardLevel, deck, index: 0 }
}

export function drawNextWord(hardLevel: HardLevel, sourceWords: string[]) {
  if (!deckState || deckState.hardLevel !== hardLevel || deckState.deck.length < 1) {
    initSessionWordDeck(hardLevel, sourceWords)
  }

  if (!deckState) {
    return ''
  }

  // If exhausted, reshuffle the whole deck so the next cycle is also random.
  if (deckState.index >= deckState.deck.length) {
    initSessionWordDeck(hardLevel, sourceWords)
  }

  if (!deckState) return ''

  const word = deckState.deck[deckState.index] || ''
  deckState.index += 1
  return word
}

