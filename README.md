# Alias, bitte

Cordova + React party word game for Android (`com.AAA.Alias`), with AdMob, optional no-ads subscription, and RU/EN/DE UI.

## For humans

- Develop on branch **`redisign`** (keep **`master`** aligned to it).
- Local web build: `DISABLE_ESLINT_PLUGIN=true CI=false npm run cra:build`
- Android / Play release: bump versions → tag `vX.Y.Z` → GitHub Action uploads AAB to internal testing.

## For agents (local + online)

Start here:

- **[`AGENTS.md`](AGENTS.md)** — hard constraints (AdMob/GMA, billing, CI, secrets)
- **[`docs/AGENT_CONTEXT.md`](docs/AGENT_CONTEXT.md)** — stack, releases, packs, known failure modes
- **[`.cursor/rules/`](.cursor/rules/)** — Cursor rules loaded automatically

Do **not** restore old `admob-plus-cordova` / Play Services Ads **20.6.0** or Cordova Android 12. Do **not** commit keystores or credentials.
