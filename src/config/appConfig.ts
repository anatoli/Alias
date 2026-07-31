/** App-level config. Override via REACT_APP_* at build time. */

export type HardLevel = 'EASY' | 'NORMAL' | 'HARD'

export const APP_CONFIG = {
  /** Remote word bank JSON. Expected shape: { version, updatedAt, difficulties: { EASY, NORMAL, HARD } } */
  wordsUrl:
    (typeof process !== 'undefined' && process.env && process.env.REACT_APP_WORDS_URL) ||
    'https://cdn.example.com/alias/word-bank.json',

  /** AdMob interstitial unit (use Google test ID until production unit is ready) */
  admobInterstitialId:
    (typeof process !== 'undefined' && process.env && process.env.REACT_APP_ADMOB_INTERSTITIAL_ID) ||
    'ca-app-pub-3940256099942544/1033173712',

  /** Play Billing subscription product id (6 months, discounted) */
  subscriptionProductId:
    (typeof process !== 'undefined' && process.env && process.env.REACT_APP_SUBSCRIPTION_PRODUCT_ID) ||
    'alias_no_ads_6m',

  /** Soft offer price label shown in UI (real price comes from Play) */
  subscriptionOfferLabel: '6 months — special discount',

  /**
   * Future Play product ids for unique word packs (IAP / pack subscription).
   * Wire in billing when products exist in Play Console.
   */
  packProductIds: {
    seasonal: 'alias_pack_seasonal',
  } as Record<string, string>,
}
