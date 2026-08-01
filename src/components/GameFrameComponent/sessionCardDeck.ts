import {ExpatCategory, GameLanguage} from '../../decks/types'

export type DeckCard = { category: ExpatCategory; text: string }

function randomInt(maxExclusive: number) {
  if (maxExclusive <= 0) return 0
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

function normalizeText(s: string) {
  return String(s || '').replace(/\s+/g, ' ').trim()
}

function uniqueByText(cards: DeckCard[]) {
  const seen = new Set<string>()
  const out: DeckCard[] = []
  for (const c of cards) {
    const t = normalizeText(c.text)
    if (!t) continue
    const key = t.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ category: c.category, text: t })
  }
  return out
}

let deckState:
  | {
      key: string
      deck: DeckCard[]
      index: number
    }
  | undefined

export function resetSessionCardDeck() {
  deckState = undefined
}

export function buildDeckKey(lang: GameLanguage, categories: ExpatCategory[]) {
  const cats = categories.slice().sort().join('|')
  return `${lang}::${cats}`
}

export function initSessionCardDeck(key: string, cards: DeckCard[]) {
  const deduped = uniqueByText(cards)
  const deck = shuffleInPlace(deduped.slice())
  deckState = { key, deck, index: 0 }
}

export function drawNextCard(key: string, cards: DeckCard[]) {
  if (!deckState || deckState.key !== key || deckState.deck.length < 1) {
    initSessionCardDeck(key, cards)
  }
  if (!deckState) return { category: (cards[0] ? cards[0].category : ('Expat Life' as any)), text: '' }

  if (deckState.index >= deckState.deck.length) {
    initSessionCardDeck(key, cards)
  }
  if (!deckState) return { category: (cards[0] ? cards[0].category : ('Expat Life' as any)), text: '' }

  const card =
    deckState.deck[deckState.index] ||
    { category: (cards[0] ? cards[0].category : ('Expat Life' as any)), text: '' }
  deckState.index += 1
  return card
}

