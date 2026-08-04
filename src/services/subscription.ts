import { APP_CONFIG } from '../config/appConfig'
import { t } from '../i18n'

const ENTITLEMENT_KEY = 'alias.noAds.entitlement'

export type NoAdsEntitlement = {
  active: boolean
  productId: string
  /** ISO expiry; if missing and active, treat as lifetime */
  expiresAt?: string
  source: 'play' | 'debug' | 'restore'
}

type PurchaseResult = 'ok' | 'cancelled' | 'unavailable' | 'error'

type CdvPurchaseNs = {
  store: {
    register: (products: Array<{ id: string; type: string; platform: string }>) => void
    initialize: (platforms?: string[]) => Promise<unknown[]>
    restorePurchases: () => Promise<unknown>
    update: () => Promise<unknown>
    get: (id: string, platform?: string) => CdvProduct | undefined
    owned: (id: string) => boolean
    order: (offer: unknown) => Promise<unknown>
    when: () => CdvWhen
    error: (cb: (err: { code?: number; message?: string }) => void) => void
  }
  ProductType: { PAID_SUBSCRIPTION: string }
  Platform: { GOOGLE_PLAY: string }
  ErrorCode: { PAYMENT_CANCELLED: number }
}

type CdvProduct = {
  id: string
  owned: boolean
  getOffer: () => unknown
  offers?: Array<{ pricingPhases?: Array<{ price?: string }> }>
}

type CdvWhen = {
  approved: (cb: (transaction: CdvTransaction) => void) => CdvWhen
  productUpdated: (cb: (product: CdvProduct) => void) => CdvWhen
  receiptUpdated: (cb: () => void) => CdvWhen
}

type CdvTransaction = {
  products: Array<{ id: string }>
  finish: () => Promise<unknown>
}

let storeReady: Promise<boolean> | null = null
let listenersBound = false
let pendingPurchase: ((result: PurchaseResult) => void) | null = null

function getCdvPurchase(): CdvPurchaseNs | null {
  const cp = (window as any).CdvPurchase as CdvPurchaseNs | undefined
  if (!cp || !cp.store) return null
  return cp
}

function subscriptionProductId(): string {
  return APP_CONFIG.subscriptionProductId
}

export function getNoAdsEntitlement(): NoAdsEntitlement | null {
  try {
    const raw = localStorage.getItem(ENTITLEMENT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as NoAdsEntitlement
  } catch (e) {
    return null
  }
}

export function hasNoAdsSubscription(): boolean {
  const e = getNoAdsEntitlement()
  if (!e || !e.active) return false
  if (!e.expiresAt) return true
  return new Date(e.expiresAt).getTime() > Date.now()
}

export function hasPremiumWordFeatures(): boolean {
  return hasNoAdsSubscription()
}

export function setNoAdsEntitlement(entitlement: NoAdsEntitlement) {
  localStorage.setItem(ENTITLEMENT_KEY, JSON.stringify(entitlement))
}

export function clearNoAdsEntitlement() {
  localStorage.removeItem(ENTITLEMENT_KEY)
}

const OFFER_SHOWN_AT_KEY = 'alias.noAds.offerShownAt'
const OFFER_COOLDOWN_MS = 60 * 60 * 1000

export function canShowNoAdsOffer(): boolean {
  if (hasNoAdsSubscription()) return false
  try {
    const raw = localStorage.getItem(OFFER_SHOWN_AT_KEY)
    if (!raw) return true
    const shownAt = Number(raw)
    if (!Number.isFinite(shownAt)) return true
    return Date.now() - shownAt >= OFFER_COOLDOWN_MS
  } catch (e) {
    return true
  }
}

export function markNoAdsOfferShown() {
  localStorage.setItem(OFFER_SHOWN_AT_KEY, String(Date.now()))
}

function isAndroidCordova(): boolean {
  const cordova = (window as any).cordova
  return !!cordova && cordova.platformId === 'android'
}

function grantEntitlement(source: NoAdsEntitlement['source'], expiresAt?: string) {
  setNoAdsEntitlement({
    active: true,
    productId: subscriptionProductId(),
    expiresAt,
    source,
  })
}

function revokeEntitlementIfExpired() {
  const e = getNoAdsEntitlement()
  if (!e || !e.active || !e.expiresAt) return
  if (new Date(e.expiresAt).getTime() <= Date.now()) {
    clearNoAdsEntitlement()
  }
}

function syncEntitlementFromStore(store: CdvPurchaseNs['store'], platform: string) {
  const productId = subscriptionProductId()
  const owned = store.owned(productId)
  if (owned) {
    grantEntitlement('restore')
    return
  }
  revokeEntitlementIfExpired()
}

function bindStoreListeners(cp: CdvPurchaseNs) {
  if (listenersBound) return
  listenersBound = true

  const { store, Platform } = cp
  const productId = subscriptionProductId()

  store.when().approved((transaction) => {
    const matches = transaction.products.some((p) => p.id === productId)
    if (!matches) return
    grantEntitlement('play')
    void transaction.finish()
    if (pendingPurchase) {
      pendingPurchase('ok')
      pendingPurchase = null
    }
  })

  store.when().productUpdated((product) => {
    if (product.id !== productId) return
    if (product.owned) {
      grantEntitlement('restore')
    } else {
      clearNoAdsEntitlement()
    }
  })

  store.when().receiptUpdated(() => {
    syncEntitlementFromStore(store, Platform.GOOGLE_PLAY)
  })

  store.error((err) => {
    if (!pendingPurchase) return
    if (err && err.code === cp.ErrorCode.PAYMENT_CANCELLED) {
      pendingPurchase('cancelled')
    } else {
      pendingPurchase('error')
    }
    pendingPurchase = null
  })
}

/** Initialize Google Play billing (safe to call multiple times). */
export async function initBillingStore(): Promise<boolean> {
  if (!isAndroidCordova()) return false
  const cp = getCdvPurchase()
  if (!cp) return false

  if (!storeReady) {
    storeReady = (async () => {
      const { store, ProductType, Platform } = cp
      const productId = subscriptionProductId()
      bindStoreListeners(cp)
      store.register([{
        id: productId,
        type: ProductType.PAID_SUBSCRIPTION,
        platform: Platform.GOOGLE_PLAY,
      }])
      await store.initialize([Platform.GOOGLE_PLAY])
      await store.restorePurchases()
      syncEntitlementFromStore(store, Platform.GOOGLE_PLAY)
      return true
    })().catch(() => false)
  }

  return storeReady
}

async function ensureBillingReady(): Promise<CdvPurchaseNs | null> {
  const ready = await initBillingStore()
  if (!ready) return null
  return getCdvPurchase()
}

/**
 * Purchase 6‑month no-ads subscription via Google Play Billing.
 */
export async function purchaseNoAdsSubscription(): Promise<PurchaseResult> {
  const productId = subscriptionProductId()
  const cp = await ensureBillingReady()

  if (cp) {
    const { store, Platform } = cp
    const product = store.get(productId, Platform.GOOGLE_PLAY)
    if (!product) return 'unavailable'
    const offer = product.getOffer && product.getOffer()
    if (!offer) return 'unavailable'

    return new Promise<PurchaseResult>((resolve) => {
      pendingPurchase = resolve
      store.order(offer).catch((e: { code?: number; message?: string }) => {
        pendingPurchase = null
        if (e && (e.code === cp.ErrorCode.PAYMENT_CANCELLED || /cancel/i.test(String(e.message || '')))) {
          resolve('cancelled')
          return
        }
        resolve('error')
      })
    })
  }

  // Dev / browser fallback: activate locally so UI can be tested
  if (!isAndroidCordova()) {
    const expires = new Date()
    expires.setMonth(expires.getMonth() + 6)
    grantEntitlement('debug', expires.toISOString())
    return 'ok'
  }

  return 'unavailable'
}

export function getSubscriptionOfferCopy() {
  return {
    title: t('ads.title'),
    message: t('ads.message', { offer: t('ads.offerLabel') }),
    productId: subscriptionProductId(),
  }
}
