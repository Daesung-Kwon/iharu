/** Ads are gone for good: no SDK, no banner, no ad IDs, kids-policy blocks kept. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

const sources = (dir: string): string[] =>
  readdirSync(join(root, dir)).flatMap(name => {
    const rel = join(dir, name);
    if (statSync(join(root, rel)).isDirectory()) return sources(rel);
    return /\.(tsx?|jsx?)$/.test(name) && !name.endsWith('.test.ts') ? [rel] : [];
  });

test('no source file imports an ad SDK or mounts a banner', () => {
  for (const file of ['App.tsx', ...sources('src')]) {
    const text = read(file);
    assert.ok(!/google-mobile-ads|AdBanner|AdSlot|AdsReady|BannerAd/.test(text), file);
  }
});

test('the ad SDK is not a dependency or config plugin', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal({ ...pkg.dependencies, ...pkg.devDependencies }['react-native-google-mobile-ads'], undefined);
  assert.ok(!read('app.json').includes('google-mobile-ads'));
  assert.ok(!read('ios/i/Info.plist').includes('GADApplicationIdentifier'));
  assert.ok(!read('android/app/src/main/AndroidManifest.xml').includes('gms.ads'));
});

test('kids-policy: ad ID permissions stay blocked on Android', () => {
  const blocked: string[] = JSON.parse(read('app.json')).expo.android.blockedPermissions;
  assert.ok(blocked.includes('com.google.android.gms.permission.AD_ID'));
  assert.ok(read('android/app/src/main/AndroidManifest.xml')
    .includes('com.google.android.gms.permission.AD_ID" tools:node="remove"'));
});
