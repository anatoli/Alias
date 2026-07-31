const fs = require('fs');
const path = require('path');

/**
 * Cordova 12 CLI bug on newer Node versions:
 * it does `process.exitCode = err.code || 1;`
 * but `err.code` can be a string like 'EPERM', and Node requires exitCode to be a number.
 *
 * This patch is intentionally tiny and idempotent.
 */

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return { patched: false, reason: 'file_missing' };

  const src = fs.readFileSync(filePath, 'utf8');

  const bad = 'process.exitCode = err.code || 1;';
  const good =
    "process.exitCode = (typeof err.code === 'number' ? err.code : 1);";

  if (src.includes(good)) return { patched: false, reason: 'already_patched' };
  if (!src.includes(bad)) return { patched: false, reason: 'pattern_not_found' };

  const next = src.replace(bad, good);
  fs.writeFileSync(filePath, next, 'utf8');
  return { patched: true };
}

function main() {
  const cordovaBin = path.join(
    process.cwd(),
    'node_modules',
    'cordova',
    'bin',
    'cordova'
  );

  const res = patchFile(cordovaBin);
  if (res.patched) {
    console.log('[postinstall] Patched cordova exitCode assignment.');
    return;
  }

  // Non-fatal: we don't want installs to fail if Cordova isn't present yet
  // or if the upstream code changed.
  console.log(
    `[postinstall] Cordova exitCode patch skipped (${res.reason}).`
  );
}

main();

