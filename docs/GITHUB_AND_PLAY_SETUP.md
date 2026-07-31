# Setup: GitHub Actions + Google Play Console

This guide publishes **Alias, bitte** (`com.AAA.Alias`) as a signed Android App Bundle via GitHub Actions.

## 1. Google Play Console

1. Open [Google Play Console](https://play.google.com/console) → **Create app**
   - Name: `Alias, bitte`
   - Package: must match `com.AAA.Alias` (same as `config.xml`)
2. Complete store listing, content rating, privacy policy, target audience.
3. Create a release track (start with **Internal testing**).

### Upload keystore (signing)

```bash
keytool -genkeypair -v -keystore alias-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias alias
```

Keep the `.jks` and passwords offline. You will upload a base64 copy as a GitHub secret (below).

### Service account for CI uploads

1. Play Console → **Setup → API access** → link a Google Cloud project.
2. Create a **service account** with permission to release apps (e.g. *Release to testing tracks*).
3. Download the JSON key → this becomes `PLAY_SERVICE_ACCOUNT_JSON`.
4. Invite the service account email in Play Console with access to the app.

### AdMob

1. [AdMob](https://admob.google.com) → add app `com.AAA.Alias`.
2. Create an **Interstitial** unit.
3. Put App ID in Cordova (`admob-plus-cordova` / `package.json` `APP_ID_ANDROID`).
4. Put ad unit id in GitHub Variable `REACT_APP_ADMOB_INTERSTITIAL_ID`.

### Subscription (no ads, 6 months)

1. Play Console → **Monetize → Products → Subscriptions**.
2. Product id: `alias_no_ads_6m` (or your id).
3. Set base plan + discounted offer for 6 months.
4. Put id in Variable `REACT_APP_SUBSCRIPTION_PRODUCT_ID`.
5. (Recommended) add `cordova-plugin-purchase` and finish billing wiring — current app has a stub + browser debug grant.

### Firebase / google-services.json (optional)

Current `google-services.json` is a **placeholder** for `com.AAA.Alias`.  
If you enable Google Services / Analytics:

1. Firebase Console → add Android app with package `com.AAA.Alias`.
2. Download real `google-services.json` into the project root.
3. Enable Google Services Gradle plugin in Cordova Android config if needed.

### Word bank CDN

Host `src/data/word-bank.json` (or a newer `version`) on HTTPS, e.g.:

`https://your-cdn.example/alias/word-bank.json`

Set Variable `REACT_APP_WORDS_URL` to that URL. Until then, the app uses the bundled bank and skips network sync.

---

## 2. GitHub repository secrets & variables

Repo → **Settings → Secrets and variables → Actions**.

### Secrets (required)

| Secret | Value |
|--------|--------|
| `ANDROID_KEYSTORE_BASE64` | `base64 -w0 alias-upload.jks` (Git Bash / WSL) or PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes('alias-upload.jks'))` |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | e.g. `alias` |
| `ANDROID_KEY_PASSWORD` | key password |
| `PLAY_SERVICE_ACCOUNT_JSON` | full JSON of Play service account |

### Variables (optional but recommended)

| Variable | Example |
|----------|---------|
| `REACT_APP_WORDS_URL` | `https://cdn…/word-bank.json` |
| `REACT_APP_ADMOB_INTERSTITIAL_ID` | `ca-app-pub-xxx/yyy` |
| `REACT_APP_SUBSCRIPTION_PRODUCT_ID` | `alias_no_ads_6m` |

Workflow file: `.github/workflows/android-play-release.yml`

---

## 3. Run a release

### Manual

1. Push code to `main` (or your default branch).
2. Actions → **Android Play Release** → **Run workflow**.
3. Choose track: `internal` / `alpha` / `beta` / `production`.

### Tag-based

```bash
git tag v1.4.1
git push origin v1.4.1
```

Bump `version` in `config.xml` + `package.json` before tagging.

---

## 4. Local release check (optional)

```bash
npm ci
npm run cra:build
# place release-signing.properties + keystore as documented in the workflow
npx cordova build android --release -- --packageType=bundle
```

AAB path is under `platforms/android/app/build/outputs/bundle/release/`.

---

## 5. Checklist before first Play upload

- [ ] Package name `com.AAA.Alias` matches Console
- [ ] Version code increases each upload
- [ ] Real AdMob App ID + interstitial unit
- [ ] Privacy policy URL (ads + optional billing)
- [ ] Service account can upload to Internal testing
- [ ] Keystore backed up offline
- [ ] Replace placeholder `google-services.json` if using Firebase
