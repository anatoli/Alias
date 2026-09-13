# Alias — agent instructions (local + online)

**Source of truth:** branch `redisign` (keep `master` aligned to it). Do **not** rebuild the app from old Cordova/AdMob baselines.

## Never regress (hard)

- AdMob: `community-admob-plus-cordova` + `PLAY_SERVICES_VERSION` **25.4.0** (not `admob-plus-cordova` / **20.6.0**).
- Billing: keep `cordova-plugin-purchase` and subscription id `alias_no_ads_6m`.
- Cordova Android: **15.x** (not 12).
- Play release workflow: `.github/workflows/android-play-release.yml` — keep `DISABLE_ESLINT_PLUGIN`, `CI: 'false'`, AAB checks, upload step.
- `config.xml` XML declaration must stay `<?xml version='1.0' ...?>` (never put app version in the XML declaration).
- Do not commit secrets: `*.jks`, `*credentials*`, keystore passwords, Play service-account JSON.

## Releases

- Bump **both** `package.json` and `config.xml` widget `version`.
- Tag `vX.Y.Z` on the release commit and push the tag (triggers Play internal upload).
- Prefer shipping from `redisign`; after merge, sync `master` to the same commit.
- Full playbook: [`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md)

## Product constraints

- UI locales: `en` | `ru` | `de` (else English). Persisted: `alias.uiLocale`.
- Word cards: ≤16 chars, ≤2 words (`src/services/cardText.ts`) so in-game type stays large.
- Themed packs: `home` | `food` | `travel` | `nature` under `src/data/packs/` (each lang ≥200 words).
- TypeScript is **3.5** — no `import type` / `export type { X }` re-exports for value imports.

## Before changing Android / CI / plugins

Read `docs/AGENT_CONTEXT.md` and diff against current `redisign`. If a change would downgrade AdMob, Cordova, billing, or the Play workflow — **stop** and keep the current stack.
