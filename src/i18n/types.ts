export type Locale = 'en' | 'ru' | 'de'

export type Messages = {
  'home.start': string
  'home.rules': string

  'common.back': string
  'common.next': string
  'common.ok': string
  'common.close': string
  'common.play': string
  'common.restart': string
  'common.skip': string
  'common.locked': string
  'common.exitAppTitle': string
  'common.exitAppMessage': string
  'common.exitAppYes': string
  'common.exitAppNo': string

  'rules.title': string
  'rules.1': string
  'rules.2': string
  'rules.3': string
  'rules.4': string
  'rules.5': string
  'rules.6': string
  'rules.7': string

  'settings.teams': string
  'settings.audio': string
  'settings.sounds': string
  'settings.music': string
  'settings.start': string
  'settings.player': string
  'settings.addTeam': string
  'settings.gameSettings': string

  'settings.wordPack': string
  'settings.viewWords': string
  'settings.packClassic': string
  'settings.packExpat': string
  'settings.packMy': string
  'settings.premiumHint': string
  'settings.yourPacks': string
  'settings.noCustomPacks': string
  'settings.packName': string
  'settings.packNamePlaceholder': string
  'settings.wordsLabel': string
  'settings.wordsPlaceholder': string
  'settings.draftError': string
  'settings.savePack': string
  'settings.morePacks': string
  'settings.comingSoonPlay': string
  'settings.time': string
  'settings.difficulty': string
  'settings.easy': string
  'settings.normal': string
  'settings.hard': string
  'settings.targetScore': string
  'settings.wordLanguage': string
  'settings.uiLanguage': string
  'settings.categories': string

  'pack.classic.title': string
  'pack.classic.desc': string
  'pack.expat.title': string
  'pack.expat.desc': string
  'pack.custom.title': string
  'pack.custom.desc': string
  'pack.seasonal.title': string
  'pack.seasonal.desc': string

  'category.Bureaucracy': string
  'category.Work': string
  'category.German Language': string
  'category.Transport': string
  'category.Social Life': string
  'category.Stereotypes': string
  'category.Expat Life': string
  'category.Cringe Situations': string
  'category.IT / Tech': string
  'category.Absurd / Meme': string

  'preview.myPack': string
  'preview.wordsCount': string
  'preview.empty': string
  'preview.classic': string

  'game.skip': string
  'game.next': string
  'game.streak': string
  'game.streakBonus': string
  'game.emptyCustom': string
  'game.pause': string
  'game.resume': string
  'game.exit': string
  'game.exitConfirmTitle': string
  'game.exitConfirmMessage': string
  'game.exitConfirmYes': string
  'game.exitConfirmNo': string
  'game.paused': string

  'review.correct': string
  'review.skipped': string
  'review.bonus': string

  'results.name': string
  'results.score': string
  'results.true': string
  'results.bonus': string
  'results.wrong': string
  'results.winner': string
  'results.catchup': string
  'results.overtime': string

  'ads.title': string
  'ads.message': string
  'ads.offerLabel': string
  'ads.subscribe': string
  'ads.continue': string
  'ads.errorUnavailable': string
  'ads.errorFailed': string
}

export type MessageKey = keyof Messages
