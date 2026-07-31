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

export function getNoAdsEntitlement(): NoAdsEntitlement | null {
  try {
    const raw = localStorage.getItem(ENTITLEMENT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as NoAdsEntitlement
  } catch {
    return null
  }
}

export function hasNoAdsSubscription(): boolean {
  const e = getNoAdsEntitlement()
  if (!e || !e.active) return false
  if (!e.expiresAt) return true
  return new Date(e.expiresAt).getTime() > Date.now()
}

/**
 * Premium word features (custom packs today; may later include unlocked IAP packs).
 * Currently same gate as no-ads subscription — split later if pack SKUs diverge.
 */
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
const OFFER_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour

/** True if the discounted no-ads offer may be shown (not subscribed, cooldown elapsed). */
export function canShowNoAdsOffer(): boolean {
  if (hasNoAdsSubscription()) return false
  try {
    const raw = localStorage.getItem(OFFER_SHOWN_AT_KEY)
    if (!raw) return true
    const shownAt = Number(raw)
    if (!Number.isFinite(shownAt)) return true
    return Date.now() - shownAt >= OFFER_COOLDOWN_MS
  } catch {
    return true
  }
}

/** Call when the offer is presented (or dismissed) so it won't spam for an hour. */
export function markNoAdsOfferShown() {
  localStorage.setItem(OFFER_SHOWN_AT_KEY, String(Date.now()))
}

/**
 * Purchase 6‑month no-ads subscription.
 * Uses CdvPurchase when available; otherwise debug-activates for local testing.
 */
export async function purchaseNoAdsSubscription(): Promise<'ok' | 'cancelled' | 'unavailable' | 'error'> {
  const productId = APP_CONFIG.subscriptionProductId
  const store = (window as any).CdvPurchase && (window as any).CdvPurchase.store

  if (store) {
    try {
      // Minimal restore/purchase flow — product must exist in Play Console
      await store.initialize([{ id: productId, type: store.ProductType && store.ProductType.PAID_SUBSCRIPTION }].filter(Boolean))
      const product = store.get(productId)
      if (!product) return 'unavailable'
      await store.order(product)
      // Entitlement should be set via approved callback in a fuller integration;
      // optimistic local grant for UX until server-side verification is added:
      const expires = new Date()
      expires.setMonth(expires.getMonth() + 6)
      setNoAdsEntitlement({
        active: true,
        productId,
        expiresAt: expires.toISOString(),
        source: 'play',
      })
      return 'ok'
    } catch (e) {
      if (e && ((e as any).code === 'cancelled' || /cancel/i.test(String((e as any).message || '')))) return 'cancelled'
      return 'error'
    }
  }

  // Dev / browser fallback: activate locally so UI can be tested
  if (!(window as any).cordova || (window as any).cordova.platformId === 'browser') {
    const expires = new Date()
    expires.setMonth(expires.getMonth() + 6)
    setNoAdsEntitlement({
      active: true,
      productId,
      expiresAt: expires.toISOString(),
      source: 'debug',
    })
    return 'ok'
  }

  return 'unavailable'
}

export function getSubscriptionOfferCopy() {
  return {
    title: t('ads.title'),
    message: t('ads.message', { offer: t('ads.offerLabel') }),
    productId: APP_CONFIG.subscriptionProductId,
  }
}
