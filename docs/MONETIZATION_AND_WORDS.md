# Word bank sync + monetization notes

## Word bank
- Bundled: `src/data/word-bank.json` (700 EASY / 700 NORMAL / 700 HARD)
- Rebuild from legacy lists: `node scripts/build-word-bank.js`
- Runtime: `src/services/wordSync.ts`
  - Play uses local cache → bundled immediately
  - Background fetch from `REACT_APP_WORDS_URL` updates cache when `version` is higher
  - Placeholder CDN URL is skipped until configured

## AdMob
- Plugin already in project (`admob-plus-cordova`)
- App ID in `package.json` / Cordova config
- Interstitial unit: `REACT_APP_ADMOB_INTERSTITIAL_ID` (defaults to Google test unit)
- Shown after round review (`ListWords` → Next), then results screen

## No-ads subscription
- Modal: `NoAdsModalComponent` after interstitial dismiss
- Entitlement in `localStorage` (`alias.noAds.entitlement`)
- Product id: `REACT_APP_SUBSCRIPTION_PRODUCT_ID`
- Full Play Billing: add `cordova-plugin-purchase` and wire `CdvPurchase` (stub + browser debug grant included)

## CI/CD
- Workflow: `.github/workflows/android-play-release.yml`
- Trigger: tag `v*` or manual `workflow_dispatch`
- Secrets listed in the workflow file header
