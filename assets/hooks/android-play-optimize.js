/**
 * Cordova after_prepare: Play Console optimizations for Android release builds.
 * - R8 minify + shrinkResources
 * - Keep rules for Cordova / AdMob / Billing
 */
const fs = require('fs')
const path = require('path')

module.exports = function (ctx) {
  if (!ctx.opts.platforms || ctx.opts.platforms.indexOf('android') < 0) {
    return
  }

  const appDir = path.join(ctx.opts.projectRoot, 'platforms', 'android', 'app')
  if (!fs.existsSync(appDir)) {
    console.warn('[android-play-optimize] platforms/android/app missing — skip')
    return
  }

  const extrasSrc = path.join(ctx.opts.projectRoot, 'assets', 'android', 'build-extras.gradle')
  const proguardSrc = path.join(ctx.opts.projectRoot, 'assets', 'android', 'proguard-rules.pro')
  const extrasDst = path.join(appDir, 'build-extras.gradle')
  const proguardDst = path.join(appDir, 'proguard-rules.pro')

  fs.copyFileSync(extrasSrc, extrasDst)
  fs.copyFileSync(proguardSrc, proguardDst)
  console.log('[android-play-optimize] installed build-extras.gradle + proguard-rules.pro')
}
