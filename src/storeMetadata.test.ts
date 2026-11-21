/** In-repo privacy copy and iOS version sources stay on the no-ads 1.1.0 (8) tip. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');
const CANONICAL_PRIVACY_URL = 'https://iharu.wodybody.com/privacy.html';
const NO_ADS_POLICY =
  /앱에는 광고가 없으며, 광고 식별자\(Android 광고 ID, iOS IDFA\)를 사용하거나 추적하지 않습니다/;
const EXPANSION_PURCHASE = /보상 확장 구매 여부는 기기에 저장되며/;
const EFFECTIVE_DATE = /<strong>시행일:<\/strong> 2026년 10월 28일/;
const AD_SDK = /AdMob|app-ads|광고를 표시/;

test('in-app privacy policy stays no-ads', () => {
  const policy = read('src/data/privacy.ts');
  assert.match(policy, NO_ADS_POLICY);
  assert.match(policy, EXPANSION_PURCHASE);
  assert.match(policy, /시행일: 2026년 10월 28일/);
  assert.doesNotMatch(policy, AD_SDK);
});

test('GitHub Pages privacy page redirects to the canonical public policy', () => {
  const html = read('docs/privacy.html');
  const escaped = CANONICAL_PRIVACY_URL.replace(/\./g, '\\.');
  assert.match(html, new RegExp(`<meta http-equiv="refresh" content="0; url=${escaped}">`));
  assert.match(html, new RegExp(`<link rel="canonical" href="${escaped}">`));
  assert.match(html, new RegExp(`location\\.replace\\("${escaped}"\\)`));
  assert.match(html, new RegExp(`<a href="${escaped}">`));
  assert.doesNotMatch(html, AD_SDK);
  assert.equal(existsSync(join(root, 'docs/app-ads.txt')), false);
  assert.doesNotMatch(read('docs/APP_STORE_LAUNCH_GUIDE.md'), /AdMob 앱 인증/);
});

test('canonical public privacy page matches the no-ads in-app policy', async () => {
  const res = await fetch(CANONICAL_PRIVACY_URL, {
    redirect: 'follow',
    headers: { 'user-agent': 'iharu-store-metadata-test' },
    signal: AbortSignal.timeout(15_000),
  });
  assert.equal(res.ok, true, `GET ${CANONICAL_PRIVACY_URL} returned ${res.status}`);
  const html = await res.text();
  assert.match(html, NO_ADS_POLICY);
  assert.match(html, EXPANSION_PURCHASE);
  assert.match(html, EFFECTIVE_DATE);
  assert.doesNotMatch(html, AD_SDK);
});

test('ios version settings match app.json 1.1.0 (8)', () => {
  const app = JSON.parse(read('app.json'));
  assert.equal(app.expo.version, '1.1.0');
  assert.equal(app.expo.ios.buildNumber, '8');
  const plist = read('ios/i/Info.plist');
  assert.match(plist, /<key>CFBundleShortVersionString<\/key>\s*<string>1\.1\.0<\/string>/);
  assert.match(plist, /<key>CFBundleVersion<\/key>\s*<string>8<\/string>/);
  const pbx = read('ios/i.xcodeproj/project.pbxproj');
  assert.deepEqual(pbx.match(/MARKETING_VERSION = [^;]+;/g), [
    'MARKETING_VERSION = 1.1.0;',
    'MARKETING_VERSION = 1.1.0;',
  ]);
  assert.deepEqual(pbx.match(/CURRENT_PROJECT_VERSION = [^;]+;/g), [
    'CURRENT_PROJECT_VERSION = 8;',
    'CURRENT_PROJECT_VERSION = 8;',
  ]);
});

test('checked-in Info.plist matches app.json ITSAppUsesNonExemptEncryption', () => {
  const app = JSON.parse(read('app.json'));
  const usesNonExempt = app.expo.ios.infoPlist.ITSAppUsesNonExemptEncryption;
  assert.equal(usesNonExempt, false);
  const token = usesNonExempt ? '<true/>' : '<false/>';
  assert.match(
    read('ios/i/Info.plist'),
    new RegExp(`<key>ITSAppUsesNonExemptEncryption</key>\\s*${token}`),
  );
});
