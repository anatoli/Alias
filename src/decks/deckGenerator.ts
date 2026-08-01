import {DeckCollection, ExpatCategory, GameLanguage} from './types'

type GeneratorConfig = {
  perCategoryTarget: number
}

const DEFAULT_CONFIG: GeneratorConfig = {
  // 10 categories * 3 languages * 60 ~= 1800 phrases (≈ “about a thousand more”)
  perCategoryTarget: 60,
}

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

function pick<T>(arr: T[]) {
  return arr[randomInt(arr.length)]
}

function shuffle<T>(arr: T[]) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1)
    const tmp = a[i]
    a[i] = a[j]
    a[j] = tmp
  }
  return a
}

const LANG_REGEX: Record<GameLanguage, RegExp> = {
  en: /^[A-Za-z0-9 ,.'"\-!?()/:;&]+$/,
  de: /^[A-Za-zÄÖÜäöüß0-9 ,.'"\-!?()/:;&]+$/,
  ru: /^[А-Яа-яЁё0-9 ,.'"\-!?()/:;&]+$/,
}

function normalizePhrase(s: string) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function isValidForLanguage(lang: GameLanguage, phrase: string) {
  const p = normalizePhrase(phrase)
  if (!p) return false
  // Reject obvious mixing: phrase must match allowed charset.
  if (!LANG_REGEX[lang].test(p)) return false
  return true
}

function addUnique(
  out: Set<string>,
  lang: GameLanguage,
  phrase: string,
) {
  const p = normalizePhrase(phrase)
  if (!isValidForLanguage(lang, p)) return
  out.add(p)
}

const CATEGORIES: ExpatCategory[] = [
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

function basePhrases(lang: GameLanguage, cat: ExpatCategory): string[] {
  if (lang === 'en') {
    switch (cat) {
      case 'Bureaucracy':
        return [
          'residence permit',
          'registration office',
          'tax number',
          'health insurance',
          'appointment letter',
          'application form',
          'passport photo',
          'queue ticket',
          'bank account',
          'proof of address',
        ]
      case 'Work':
        return [
          'job interview',
          'standup meeting',
          'code review',
          'deadline pressure',
          'salary negotiation',
          'team lead',
          'remote work',
          'work permit',
          'onboarding day',
          'performance review',
        ]
      case 'German Language':
        return [
          'der die das',
          'separable verbs',
          'cases: nominative',
          'cases: accusative',
          'cases: dative',
          'compound nouns',
          'umlauts ä ö ü',
          'pronunciation practice',
          'article mistakes',
          'speaking anxiety',
        ]
      case 'Transport':
        return [
          'train platform',
          'late bus',
          'ticket validator',
          'bike lane',
          'missed connection',
          'rush hour',
          'station announcement',
          'tram stop',
          'monthly pass',
          'airport security',
        ]
      case 'Social Life':
        return [
          'small talk',
          'house party',
          'new friends',
          'birthday toast',
          'coffee meetup',
          'group chat',
          'awkward silence',
          'weekend plans',
          'board game night',
          'random invitation',
        ]
      case 'Stereotypes':
        return [
          'punctuality stereotype',
          'bread obsession',
          'cash only',
          'rules are rules',
          'paperwork everywhere',
          'quiet Sundays',
          'recycling police',
          'direct communication',
          'weather complaints',
          'train delays meme',
        ]
      case 'Expat Life':
        return [
          'culture shock',
          'missing home',
          'new apartment',
          'language barrier',
          'international supermarket',
          'visa stress',
          'moving boxes',
          'new routine',
          'homesick playlist',
          'expat community',
        ]
      case 'Cringe Situations':
        return [
          'forgot your PIN',
          'wrong train',
          'called the boss mom',
          'spilled coffee',
          'door slams loudly',
          'silent elevator',
          'mispronounced a word',
          'sent the wrong emoji',
          'wallet at home',
          'unmuted microphone',
        ]
      case 'IT / Tech':
        return [
          'broken build',
          'merge conflict',
          'hotfix on Friday',
          'password reset',
          'two-factor login',
          'Wi-Fi outage',
          'bug report',
          'cloud outage',
          'deploy pipeline',
          'laptop charger',
        ]
      case 'Absurd / Meme':
        return [
          'mystery sausage',
          'unexpected techno party',
          'giant pretzel',
          'random accordion',
          'lost in IKEA',
          'tiny elevator',
          'mysterious basement',
          'infinite paperwork',
          'unnecessary meeting',
          'legendary queue',
        ]
    }
  }

  if (lang === 'de') {
    switch (cat) {
      case 'Bureaucracy':
        return [
          'Aufenthaltstitel',
          'Bürgeramt',
          'Steuer-ID',
          'Krankenversicherung',
          'Terminbestätigung',
          'Antragsformular',
          'Passfoto',
          'Wartenummer',
          'Kontoeröffnung',
          'Meldebescheinigung',
        ]
      case 'Work':
        return [
          'Vorstellungsgespräch',
          'Daily Stand-up',
          'Code-Review',
          'Abgabefrist',
          'Gehaltsverhandlung',
          'Teamleitung',
          'Homeoffice',
          'Arbeitsvertrag',
          'Einarbeitung',
          'Leistungsbeurteilung',
        ]
      case 'German Language':
        return [
          'der die das',
          'trennbare Verben',
          'Nominativ',
          'Akkusativ',
          'Dativ',
          'Komposita',
          'Umlaute ä ö ü',
          'Aussprache üben',
          'Artikel Fehler',
          'Sprechangst',
        ]
      case 'Transport':
        return [
          'Bahnsteig',
          'Verspätung',
          'Entwerter',
          'Radweg',
          'Umsteigen',
          'Stoßzeit',
          'Durchsage',
          'Haltestelle',
          'Monatskarte',
          'Sicherheitskontrolle',
        ]
      case 'Social Life':
        return [
          'Smalltalk',
          'Hausparty',
          'neue Freunde',
          'Geburtstagstoast',
          'Kaffeetreffen',
          'Gruppenchat',
          'peinliches Schweigen',
          'Wochenendpläne',
          'Spieleabend',
          'spontane Einladung',
        ]
      case 'Stereotypes':
        return [
          'Pünktlichkeit',
          'Brotkultur',
          'nur Barzahlung',
          'Regeln sind Regeln',
          'Papierkram',
          'Sonntagsruhe',
          'Mülltrennung',
          'direkte Art',
          'Wetter meckern',
          'Bahn verspätet',
        ]
      case 'Expat Life':
        return [
          'Kulturschock',
          'Heimweh',
          'Wohnungssuche',
          'Sprachbarriere',
          'internationaler Laden',
          'Visastress',
          'Umzugskartons',
          'neue Routine',
          'Heimweh-Playlist',
          'Expat-Community',
        ]
      case 'Cringe Situations':
        return [
          'PIN vergessen',
          'falscher Zug',
          'Chef Mama genannt',
          'Kaffee verschüttet',
          'Tür knallt',
          'stiller Aufzug',
          'Wort falsch gesagt',
          'falsches Emoji',
          'Geldbeutel vergessen',
          'Mikro nicht stumm',
        ]
      case 'IT / Tech':
        return [
          'Build kaputt',
          'Merge-Konflikt',
          'Hotfix am Freitag',
          'Passwort zurücksetzen',
          'Zwei-Faktor-Login',
          'WLAN Ausfall',
          'Bugreport',
          'Cloud-Ausfall',
          'Deploy-Pipeline',
          'Laptop-Ladegerät',
        ]
      case 'Absurd / Meme':
        return [
          'mysteriöse Wurst',
          'spontane Techno-Party',
          'riesige Brezel',
          'Akkordeon zufällig',
          'verloren bei IKEA',
          'winziger Aufzug',
          'geheimer Keller',
          'endloser Papierkram',
          'unnötiges Meeting',
          'legendäre Schlange',
        ]
    }
  }

  // ru
  switch (cat) {
    case 'Bureaucracy':
      return [
        'вид на жительство',
        'регистрация по адресу',
        'налоговый номер',
        'медицинская страховка',
        'запись на прием',
        'анкета заявления',
        'фото на документы',
        'талон очереди',
        'банковский счет',
        'подтверждение адреса',
      ]
    case 'Work':
      return [
        'собеседование',
        'стендап митинг',
        'код ревью',
        'дедлайн',
        'переговоры о зарплате',
        'тимлид',
        'удаленная работа',
        'рабочий контракт',
        'онбординг',
        'оценка эффективности',
      ]
    case 'German Language':
      return [
        'артикли der die das',
        'отделяемые глаголы',
        'падеж номинатив',
        'падеж аккузатив',
        'падеж датив',
        'составные слова',
        'умлауты ä ö ü',
        'тренировка произношения',
        'ошибка с артиклем',
        'страх говорить',
      ]
    case 'Transport':
      return [
        'платформа поезда',
        'опоздание автобуса',
        'валидатор билета',
        'велодорожка',
        'пропущенная пересадка',
        'час пик',
        'объявление на станции',
        'остановка трамвая',
        'проездной на месяц',
        'контроль в аэропорту',
      ]
    case 'Social Life':
      return [
        'разговор ни о чем',
        'домашняя вечеринка',
        'новые друзья',
        'тост на день рождения',
        'встреча на кофе',
        'чатик в мессенджере',
        'неловкая пауза',
        'планы на выходные',
        'настолки вечером',
        'случайное приглашение',
      ]
    case 'Stereotypes':
      return [
        'стереотип про пунктуальность',
        'любовь к хлебу',
        'только наличные',
        'правила есть правила',
        'бумажная волокита',
        'тихое воскресенье',
        'полиция сортировки',
        'прямолинейность',
        'жалобы на погоду',
        'мем про опоздания',
      ]
    case 'Expat Life':
      return [
        'культурный шок',
        'тоска по дому',
        'поиск квартиры',
        'языковой барьер',
        'международный магазин',
        'стресс из-за визы',
        'коробки с переездом',
        'новая рутина',
        'плейлист ностальгии',
        'экспат сообщество',
      ]
    case 'Cringe Situations':
      return [
        'забыл пин код',
        'сел не в тот поезд',
        'назвал босса мамой',
        'пролил кофе',
        'громко хлопнула дверь',
        'тихий лифт',
        'перепутал слово',
        'не тот смайлик',
        'кошелек дома',
        'микрофон включен',
      ]
    case 'IT / Tech':
      return [
        'сломалась сборка',
        'конфликт мержа',
        'хотфикс в пятницу',
        'сброс пароля',
        'двухфакторный вход',
        'упал вай фай',
        'баг репорт',
        'упал облачный сервис',
        'деплой пайплайн',
        'зарядка для ноутбука',
      ]
    case 'Absurd / Meme':
      return [
        'загадочная колбаса',
        'внезапная техно вечеринка',
        'огромный брецель',
        'случайный аккордеон',
        'потерялся в икее',
        'крошечный лифт',
        'таинственный подвал',
        'бесконечные бумаги',
        'ненужная встреча',
        'легендарная очередь',
      ]
  }
}

function templates(lang: GameLanguage, cat: ExpatCategory) {
  if (lang === 'en') {
    const verbs = ['apply for', 'renew', 'submit', 'book', 'cancel', 'sign', 'scan', 'print', 'lose', 'find']
    const objectsByCat: Record<ExpatCategory, string[]> = {
      Bureaucracy: ['appointment', 'form', 'document', 'permit', 'letter', 'ID card', 'insurance paper', 'bank statement'],
      Work: ['meeting', 'task', 'ticket', 'contract', 'offer', 'deadline', 'presentation', 'demo'],
      'German Language': ['article', 'case', 'pronunciation', 'word order', 'vocabulary', 'grammar rule', 'conversation'],
      Transport: ['ticket', 'connection', 'platform', 'bike', 'bus', 'train', 'tram', 'route'],
      'Social Life': ['invitation', 'message', 'plan', 'party', 'meetup', 'group chat', 'joke', 'compliment'],
      Stereotypes: ['rule', 'queue', 'schedule', 'recycling', 'complaint', 'tradition', 'habit'],
      'Expat Life': ['move', 'routine', 'neighborhood', 'flat viewing', 'paperwork', 'homesickness', 'community'],
      'Cringe Situations': ['PIN', 'wallet', 'microphone', 'email', 'elevator ride', 'name', 'address'],
      'IT / Tech': ['build', 'deploy', 'bug', 'password', 'Wi-Fi', 'laptop', 'pipeline', 'alert'],
      'Absurd / Meme': ['pretzel', 'sausage', 'queue', 'basement', 'meeting', 'elevator', 'mystery box'],
    }
    const adjectives = ['awkward', 'unexpected', 'urgent', 'random', 'late', 'silent', 'tiny', 'massive', 'confusing', 'classic']
    const places = ['at the office', 'at the station', 'at the counter', 'in the queue', 'in the app', 'in the chat', 'on the call']

    const objs = objectsByCat[cat] || objectsByCat['Expat Life']
    return [
      () => `${pick(verbs)} the ${pick(objs)}`,
      () => `${pick(adjectives)} ${pick(objs)}`,
      () => `${pick(verbs)} the ${pick(objs)} ${pick(places)}`,
      () => `${pick(adjectives)} moment ${pick(places)}`,
    ]
  }

  if (lang === 'de') {
    const verbs = ['beantragen', 'verlängern', 'einreichen', 'buchen', 'stornieren', 'unterschreiben', 'scannen', 'drucken', 'verlieren', 'finden']
    const objectsByCat: Record<ExpatCategory, string[]> = {
      Bureaucracy: ['Termin', 'Formular', 'Dokument', 'Antrag', 'Bescheinigung', 'Ausweis', 'Versicherungspapier', 'Kontoauszug'],
      Work: ['Meeting', 'Aufgabe', 'Ticket', 'Vertrag', 'Angebot', 'Abgabefrist', 'Präsentation', 'Demo'],
      'German Language': ['Artikel', 'Kasus', 'Aussprache', 'Wortstellung', 'Wortschatz', 'Grammatikregel', 'Gespräch'],
      Transport: ['Ticket', 'Umstieg', 'Bahnsteig', 'Fahrrad', 'Bus', 'Zug', 'Straßenbahn', 'Route'],
      'Social Life': ['Einladung', 'Nachricht', 'Plan', 'Party', 'Treffen', 'Gruppenchat', 'Witz', 'Kompliment'],
      Stereotypes: ['Regel', 'Schlange', 'Zeitplan', 'Mülltrennung', 'Beschwerde', 'Tradition', 'Gewohnheit'],
      'Expat Life': ['Umzug', 'Routine', 'Kiez', 'Wohnungsbesichtigung', 'Papierkram', 'Heimweh', 'Community'],
      'Cringe Situations': ['PIN', 'Geldbeutel', 'Mikrofon', 'E-Mail', 'Aufzugfahrt', 'Name', 'Adresse'],
      'IT / Tech': ['Build', 'Deploy', 'Bug', 'Passwort', 'WLAN', 'Laptop', 'Pipeline', 'Alarm'],
      'Absurd / Meme': ['Brezel', 'Wurst', 'Schlange', 'Keller', 'Meeting', 'Aufzug', 'Mystery-Box'],
    }
    const adjectives = ['peinlich', 'unerwartet', 'dringend', 'zufällig', 'spät', 'still', 'winzig', 'riesig', 'verwirrend', 'klassisch']
    const places = ['im Büro', 'am Bahnhof', 'am Schalter', 'in der Schlange', 'in der App', 'im Chat', 'im Call']

    const objs = objectsByCat[cat] || objectsByCat['Expat Life']
    return [
      () => `${pick(objs)} ${pick(verbs)}`,
      () => `${pick(adjectives)} ${pick(objs)}`,
      () => `${pick(objs)} ${pick(verbs)} ${pick(places)}`,
      () => `${pick(adjectives)}er Moment ${pick(places)}`,
    ]
  }

  // ru
  const verbs = ['подать', 'продлить', 'отправить', 'записать', 'отменить', 'подписать', 'сканировать', 'распечатать', 'потерять', 'найти']
  const objectsByCat: Record<ExpatCategory, string[]> = {
    Bureaucracy: ['заявление', 'форму', 'документ', 'разрешение', 'справку', 'паспорт', 'страховку', 'выписку'],
    Work: ['встречу', 'задачу', 'тикет', 'контракт', 'оффер', 'дедлайн', 'презентацию', 'демо'],
    'German Language': ['артикль', 'падеж', 'произношение', 'порядок слов', 'словарный запас', 'правило грамматики', 'разговор'],
    Transport: ['билет', 'пересадку', 'платформу', 'велосипед', 'автобус', 'поезд', 'трамвай', 'маршрут'],
    'Social Life': ['приглашение', 'сообщение', 'план', 'вечеринку', 'встречу', 'чат', 'шутку', 'комплимент'],
    Stereotypes: ['правило', 'очередь', 'расписание', 'сортировку', 'жалобу', 'традицию', 'привычку'],
    'Expat Life': ['переезд', 'рутину', 'район', 'просмотр квартиры', 'бумаги', 'ностальгию', 'сообщество'],
    'Cringe Situations': ['пин код', 'кошелек', 'микрофон', 'письмо', 'поездку в лифте', 'имя', 'адрес'],
    'IT / Tech': ['сборку', 'деплой', 'баг', 'пароль', 'вай фай', 'ноутбук', 'пайплайн', 'алерт'],
    'Absurd / Meme': ['брецель', 'колбасу', 'очередь', 'подвал', 'встречу', 'лифт', 'загадочную коробку'],
  }
  const adjectives = ['неловкий', 'внезапный', 'срочный', 'случайный', 'поздний', 'тихий', 'крошечный', 'огромный', 'странный', 'классический']
  const places = ['в офисе', 'на станции', 'у окна', 'в очереди', 'в приложении', 'в чате', 'на созвоне']

  const objs = objectsByCat[cat] || objectsByCat['Expat Life']
  return [
    () => `${pick(verbs)} ${pick(objs)}`,
    () => `${pick(adjectives)} ${pick(objs)}`,
    () => `${pick(verbs)} ${pick(objs)} ${pick(places)}`,
    () => `${pick(adjectives)} момент ${pick(places)}`,
  ]
}

function generateCategory(lang: GameLanguage, cat: ExpatCategory, target: number) {
  const out = new Set<string>()

  basePhrases(lang, cat).forEach((p) => addUnique(out, lang, p))

  const gens = templates(lang, cat)
  // Safe cap to avoid infinite loops if validation filters too much.
  const maxAttempts = Math.max(500, target * 50)
  let attempts = 0
  while (out.size < target && attempts < maxAttempts) {
    attempts += 1
    const phrase = pick(gens)()
    addUnique(out, lang, phrase)
  }

  // Keep base phrases first, then shuffled generated phrases.
  const base = basePhrases(lang, cat)
    .map(normalizePhrase)
    .filter((p) => isValidForLanguage(lang, p))
  const generated = Array.from(out)
    .filter((p) => !base.includes(p))
  const result = base.concat(shuffle(generated))
  return result.slice(0, Math.max(target, base.length))
}

export function generateDeckCollection(config: Partial<GeneratorConfig> = {}): DeckCollection {
  const cfg = { ...DEFAULT_CONFIG, ...config }

  const languages: GameLanguage[] = ['en', 'de', 'ru']
  const collection: DeckCollection = {
    version: 1,
    createdAtMs: Date.now(),
    languages: {
      en: {} as any,
      de: {} as any,
      ru: {} as any,
    },
  }

  for (const lang of languages) {
    for (const cat of CATEGORIES) {
      collection.languages[lang][cat] = generateCategory(lang, cat, cfg.perCategoryTarget)
    }
  }

  return collection
}

