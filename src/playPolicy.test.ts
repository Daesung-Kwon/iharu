/** Google Play readiness: permissions, target SDK, package, billing hook, no ads. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const app = () => JSON.parse(read('app.json')).expo;
const eas = () => JSON.parse(read('eas.json'));

test('Android package stays com.iharu.app (Play listing id is immutable)', () => {
  assert.equal(app().android.package, 'com.iharu.app');
  assert.ok(read('android/app/build.gradle').includes("applicationId 'com.iharu.app'"));
});

test('Play target/compile SDK 36 is pinned for uploads after 2026-08-31', () => {
  const props = app().plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-build-properties')[1];
  assert.equal(props.android.targetSdkVersion, 36);
  assert.equal(props.android.compileSdkVersion, 36);
  assert.equal(props.android.minSdkVersion, 24);
});

test('kids policy: advertising IDs stay blocked and stripped from the manifest', () => {
  const blocked: string[] = app().android.blockedPermissions;
  assert.ok(blocked.includes('com.google.android.gms.permission.AD_ID'));
  const manifest = read('android/app/src/main/AndroidManifest.xml');
  assert.ok(manifest.includes('com.google.android.gms.permission.AD_ID" tools:node="remove"'));
  assert.ok(!read('package.json').includes('google-mobile-ads'));
});

test('USE_EXACT_ALARM is blocked; SCHEDULE_EXACT_ALARM is declared for reminders', () => {
  const blocked: string[] = app().android.blockedPermissions;
  const permissions: string[] = app().android.permissions;
  assert.ok(blocked.includes('android.permission.USE_EXACT_ALARM'));
  assert.ok(permissions.includes('android.permission.SCHEDULE_EXACT_ALARM'));
  assert.ok(!permissions.includes('android.permission.USE_EXACT_ALARM'));
  const manifest = read('android/app/src/main/AndroidManifest.xml');
  assert.ok(manifest.includes('android.permission.USE_EXACT_ALARM" tools:node="remove"'));
  assert.ok(manifest.includes('android.permission.SCHEDULE_EXACT_ALARM"/>') ||
    manifest.includes("android.permission.SCHEDULE_EXACT_ALARM\""));
});

test('SYSTEM_ALERT_WINDOW is removed; legacy storage is capped at SDK 32', () => {
  const blocked: string[] = app().android.blockedPermissions;
  assert.ok(blocked.includes('android.permission.SYSTEM_ALERT_WINDOW'));
  const manifest = read('android/app/src/main/AndroidManifest.xml');
  assert.ok(manifest.includes('SYSTEM_ALERT_WINDOW" tools:node="remove"'));
  assert.match(manifest, /READ_EXTERNAL_STORAGE" android:maxSdkVersion="32"/);
  assert.match(manifest, /WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="32"/);
});

test('production EAS profile builds an AAB and does not auto-submit to production', () => {
  const cfg = eas();
  assert.equal(cfg.build.production.android.buildType, 'app-bundle');
  assert.equal(cfg.submit.production.android.track, 'internal');
});

test('reward_expansion IAP id is shared with Play and expo-iap is a dependency', () => {
  const src = read('src/utils/rewardExpansion.ts');
  assert.ok(src.includes('com.dailyschedule.app.reward_expansion'));
  const pkg = JSON.parse(read('package.json'));
  assert.ok(pkg.dependencies['expo-iap']);
});
