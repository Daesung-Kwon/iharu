/** In-repo privacy copy and iOS version sources stay on the no-ads 1.1.0 (8) tip. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(__dirname, '..');
const read = (p: string) => readFileSync(join(root, p), 'utf8');

test('public privacy page matches the no-ads in-app policy', () => {
  const html = read('docs/privacy.html');
  assert.match(read('src/data/privacy.ts'), /앱에는 광고가 없으며/);
  assert.match(
    html,
    /앱에는 광고가 없으며, 광고 식별자\(Android 광고 ID, iOS IDFA\)를 사용하거나 추적하지 않습니다/,
  );
  assert.match(html, /보상 확장 구매 여부는 기기에 저장되며/);
  assert.match(html, /<strong>시행일:<\/strong> 2026년 10월 28일/);
  assert.doesNotMatch(html, /AdMob|app-ads|광고를 표시/);
  assert.equal(existsSync(join(root, 'docs/app-ads.txt')), false);
  assert.doesNotMatch(read('docs/APP_STORE_LAUNCH_GUIDE.md'), /AdMob 앱 인증/);
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
