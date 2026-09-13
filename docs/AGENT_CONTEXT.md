# Alias — full agent context

Cordova + CRA React Android app (`com.AAA.Alias`). Party word game with AdMob interstitials and optional no-ads Play subscription.

## Branches

| Branch | Role |
|--------|------|
| `redisign` | **Canonical.** All product + Play work lands here first. |
| `master` | Must match `redisign`. Online agents must not reinvent an older master tree. |

If `master` diverges with older AdMob/Cordova, **reset it to `redisign`** (do not merge old master “fixes” that downgrade the stack).

## Stack (current)

| Area | Value |
|------|--------|
| App id | `com.AAA.Alias` |
| Cordova Android | `^15.x` |
| Ads plugin | `community-admob-plus-cordova@1.33.2` |
| GMA / Play Services Ads | `25.4.0` |
| Billing | `cordova-plugin-purchase@13.18.0` |
| Subscription product | `alias_no_ads_6m` |
| AdMob app id | `ca-app-pub-8774936490708638~9388085959` |
| Interstitial | `ca-app-pub-8774936490708638/4543787532` |
| TS | `3.5.1` (CRA 5) |

### AdMob Java note

`MobileAds.getVersionString()` was removed in GMA 22+. Plugin uses `MobileAds.getVersion().toString()`. Do not reintroduce UTF-8 BOM in Java sources (breaks javac).

## Play CI

Workflow: `.github/workflows/android-play-release.yml`

- Trigger: tag `v*` (and manual `workflow_dispatch`)
- Build: Cordova signed AAB → verify → upload internal track
- Env that must stay: `DISABLE_ESLINT_PLUGIN=true`, `CI=false` (CRA otherwise fails under Actions)
- Upload: `status: completed`, `releaseName: ${{ github.ref_name }}`

Required GitHub secrets (never commit): `ANDROID_KEYSTORE_*`, `PLAY_SERVICE_ACCOUNT_JSON`.

### Play Console tips already handled in app config

- `AndroidEdgeToEdge=true`
- `Orientation=default`, `resizeableActivity=true`
- R8 via `assets/hooks/android-play-optimize.js` + `assets/android/*`

## Feature map

| Feature | Where |
|---------|--------|
| UI i18n en/ru/de | `src/i18n/` — override key `alias.uiLocale` |
| Word language | `gameSettings.language` (separate from UI locale) |
| Classic words | `src/data/word-bank.json` + `wordSync.ts` |
| Expat decks | `src/decks/` generated → `localStorage` |
| Themed packs | `src/data/packs/{home,food,travel,nature}.json` + `themedPacks.ts` |
| Card length limits | `src/services/cardText.ts` |
| Ads fail-open | `src/services/ads.ts` (timeouts; never block Next) |
| Hardware back | `BodyComponent` exit confirm / double-back |
| Settings packs UI | `Modal-Settings-Window` |

## Adding themed packs

1. Add JSON under `src/data/packs/<id>.json` with `languages: { en, ru, de }` (≥200 playable words each).
2. Register in `themedPacks.ts`, `helpArray` `WordPack`, `gameSettings.normalizeWordPack`, `packCatalog.ts`.
3. Add `pack.<id>.title` / `.desc` in `i18n` en+ru+de + `types.ts`.
4. Words must pass `isPlayableCardText` (≤16 chars, ≤2 words).

## Release checklist

1. Implement on `redisign`.
2. Bump `package.json` + `config.xml` version together.
3. Local: `DISABLE_ESLINT_PLUGIN=true CI=false npm run cra:build`.
4. Commit, push `redisign`, tag `vX.Y.Z`, push tag.
5. Sync `master`: `git push origin redisign:master`.
6. Confirm Actions run uploads AAB; in Play Console check **Internal testing**.

## Known failure modes (do not repeat)

1. Online agent restored `admob-plus-cordova` + GMA **20.6.0** and Cordova 12 → Play sunset / broken billing.
2. `config.xml` declaration set to `version='1.4.0'` (invalid) while bumping app version.
3. Waiting forever on interstitial `load()`/`dismiss` → Next hung (fixed with timeouts + show-only-if-ready).
4. Word autofit shrunk type to **12px** (fixed: min ~32px + shorter cards).
5. `import type` under TS 3.5 → CRA failed.

## Secrets / local-only files

Ignore and never commit: `alias-upload.jks`, `alias-upload.credentials.txt`, any Play JSON keys, `www/` build dumps unless intentionally tracked.
