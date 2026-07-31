import wordBank from '../../data/word-bank.json'

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

export type CategoryDeck = Record<ExpatCategory, string[]>
export type HardLevel = 'EASY' | 'NORMAL' | 'HARD'
export type WordPack = 'classic' | 'expat'

/** Bundled difficulty decks (700 each). Prefer wordSync cache at runtime. */
export const WORDS: Record<HardLevel, string[]> = {
    EASY: wordBank.difficulties.EASY as string[],
    NORMAL: wordBank.difficulties.NORMAL as string[],
    HARD: wordBank.difficulties.HARD as string[],
}

export const BUNDLED_WORD_BANK_VERSION = Number(wordBank.version) || 1

// Optional themed deck (expat / Germany) — kept for category mode & future packs
export const EXPAT_DECK: CategoryDeck = {
    'Bureaucracy': [
        'Anmeldung',
        'Bürgeramt',
        'Termin',
        'SteuerID',
        'Brief',
        'Formular',
        'Stempel',
        'Wartezimmer',
        'Nachreichung',
        'Zuständigkeit',
    ],
    'Work': [
        'Probezeit',
        'Feierabend',
        'Überstunden',
        'Brutto',
        'Netto',
        'Urlaub',
        'Kündigung',
        'Bewerbung',
        'Teamlead',
        'mitarbeiten',
    ],
    'German Language': [
        'doch',
        'bitte',
        'genau',
        'Umlaut',
        'Artikel',
        'Komposita',
        'Dialekt',
        'Akzent',
        'sprechen',
        'verstehen',
    ],
    'Transport': [
        'Verspätung',
        'Streik',
        'ICE',
        'S-Bahn',
        'U-Bahn',
        'BahnCard',
        'Fahrkarte',
        'Kontrolleur',
        'Radweg',
        'ausfallen',
    ],
    'Social Life': [
        'WG',
        'Nachbar',
        'Späti',
        'Stammtisch',
        'Grillparty',
        'Prost',
        'Smalltalk',
        'Sonntag',
        'Ruhezeit',
        'einladen',
    ],
    'Stereotypes': [
        'Ordnung',
        'pünktlich',
        'sparsam',
        'streng',
        'regelkonform',
        'sortieren',
        'meckern',
        'verbieten',
        'Döner',
        'Currywurst',
    ],
    'Expat Life': [
        'ностальгия',
        'гречка',
        'кефир',
        'переводчик',
        'документы',
        'переезд',
        'посылка',
        'Ausländerbehörde',
        'Heimweh',
        'интегрироваться',
    ],
    'Cringe Situations': [
        'stottern',
        'краснеть',
        'забыть',
        'перепутать',
        'извиняться',
        'Siezen',
        'Duzen',
        'Mülltonne',
        'Kassenzettel',
        'паниковать',
    ],
    'IT / Tech': [
        'VPN',
        'WiFi',
        'Jira',
        'Deploy',
        'Rollback',
        'Prod',
        'Bug',
        'Ticket',
        'Standup',
        'debuggen',
    ],
    'Absurd / Meme': [
        'Fax',
        'Behörde',
        'Papierkrieg',
        'Warteschlange',
        'absurd',
        'verzweifelt',
        '„nein“',
        'überleben',
        'закрыто',
        'бессмысленно',
    ],
}
