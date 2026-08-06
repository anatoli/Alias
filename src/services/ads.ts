import { APP_CONFIG } from '../config/appConfig'
import { hasNoAdsSubscription } from './subscription'

declare global {
  interface Window {
    admob?: any
  }
}

let started = false
let interstitial: any = null
let loading: Promise<void> | null = null

const PRELOAD_TIMEOUT_MS = 8000
const SHOW_TIMEOUT_MS = 5000

function canUseAdmob(): boolean {
  return typeof window !== 'undefined' && !!(window as any).admob
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    let done = false
    const timer = window.setTimeout(() => {
      if (done) return
      done = true
      resolve(fallback)
    }, ms)
    promise.then(
      (value) => {
        if (done) return
        done = true
        window.clearTimeout(timer)
        resolve(value)
      },
      () => {
        if (done) return
        done = true
        window.clearTimeout(timer)
        resolve(fallback)
      }
    )
  })
}

export async function initAds(): Promise<void> {
  if (started) return
  if (!canUseAdmob()) return
  try {
    await withTimeout(window.admob!.start(), 5000, undefined as any)
    started = true
    void preloadInterstitial()
  } catch {
    // Ads optional — never block gameplay
  }
}

export async function preloadInterstitial(): Promise<void> {
  if (!canUseAdmob() || hasNoAdsSubscription()) return
  if (loading) return loading

  loading = (async () => {
    try {
      if (!started) await initAds()
      if (!canUseAdmob()) return
      const ad = new window.admob!.InterstitialAd({
        adUnitId: APP_CONFIG.admobInterstitialId,
      })
      const loaded = await withTimeout(
        ad.load().then(() => true as const),
        PRELOAD_TIMEOUT_MS,
        false as const
      )
      interstitial = loaded ? ad : null
    } catch {
      interstitial = null
    } finally {
      loading = null
    }
  })()

  return loading
}

/**
 * Show interstitial after a round. Resolves when ad is closed or skipped.
 * Always resolves within SHOW_TIMEOUT_MS so UX never sticks.
 */
export function showInterstitialAfterRound(): Promise<'shown' | 'skipped' | 'error'> {
  const run = async (): Promise<'shown' | 'skipped' | 'error'> => {
    if (hasNoAdsSubscription()) return 'skipped'
    if (!canUseAdmob()) return 'skipped'

    try {
      // Only show if already loaded — never block on a cold load here
      if (!interstitial) {
        void preloadInterstitial()
        return 'skipped'
      }

      const ad = interstitial
      interstitial = null

      return await new Promise<'shown' | 'skipped' | 'error'>((resolve) => {
        let settled = false
        const finish = (result: 'shown' | 'skipped' | 'error') => {
          if (settled) return
          settled = true
          window.clearTimeout(safetyTimer)
          try {
            ad.off && ad.off('dismiss', onDismiss)
          } catch {
            // ignore
          }
          void preloadInterstitial()
          resolve(result)
        }

        const onDismiss = () => finish('shown')
        const safetyTimer = window.setTimeout(() => finish('shown'), SHOW_TIMEOUT_MS)

        try {
          if (typeof ad.on === 'function') {
            ad.on('dismiss', onDismiss)
          }
          void ad.show().catch(() => finish('error'))
        } catch {
          finish('error')
        }
      })
    } catch {
      interstitial = null
      void preloadInterstitial()
      return 'error'
    }
  }

  return withTimeout(run(), SHOW_TIMEOUT_MS + 1000, 'error')
}
