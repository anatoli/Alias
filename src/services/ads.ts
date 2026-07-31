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

function canUseAdmob(): boolean {
  return typeof window !== 'undefined' && !!(window as any).admob
}

export async function initAds(): Promise<void> {
  if (started) return
  if (!canUseAdmob()) return
  try {
    await window.admob!.start()
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
      interstitial = new window.admob!.InterstitialAd({
        adUnitId: APP_CONFIG.admobInterstitialId,
      })
      await interstitial.load()
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
 * Always resolves (fail-open) so UX never sticks.
 */
export function showInterstitialAfterRound(): Promise<'shown' | 'skipped' | 'error'> {
  return new Promise(async (resolve) => {
    if (hasNoAdsSubscription()) {
      resolve('skipped')
      return
    }
    if (!canUseAdmob()) {
      resolve('skipped')
      return
    }

    try {
      if (!interstitial) await preloadInterstitial()
      if (!interstitial) {
        resolve('skipped')
        return
      }

      const onDismiss = () => {
        try {
          interstitial.off && interstitial.off('dismiss', onDismiss)
        } catch {
          // ignore
        }
        // Reload next ad in background
        interstitial = null
        void preloadInterstitial()
        resolve('shown')
      }

      if (typeof interstitial.on === 'function') {
        interstitial.on('dismiss', onDismiss)
      } else {
        // Fallback: resolve shortly after show
        setTimeout(onDismiss, 800)
      }

      await interstitial.show()
    } catch {
      interstitial = null
      void preloadInterstitial()
      resolve('error')
    }
  })
}
