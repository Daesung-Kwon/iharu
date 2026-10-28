import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getBottomChromeOffset } from './layoutMetrics';
import { getLockedItemToast } from '../utils/completionLogic';

describe('bottom chrome', () => {
  it('reserves tab bar plus loaded ad height', () => {
    assert.equal(getBottomChromeOffset(76, 0), 76);
    assert.equal(getBottomChromeOffset(76, 50), 126);
    assert.equal(getBottomChromeOffset(76, -5), 76);
  });
});

describe('getLockedItemToast', () => {
  it('explains past and future, null for today', () => {
    assert.equal(getLockedItemToast({ isViewingPast: true, isViewingFuture: false }), '지난 날 일정은 기록만 볼 수 있어요');
    assert.equal(getLockedItemToast({ isViewingPast: false, isViewingFuture: true }), '그날이 되면 완료할 수 있어요');
    assert.equal(getLockedItemToast({ isViewingPast: false, isViewingFuture: false }), null);
  });
  it('uses no glyphs missing from BMJUA', () => {
    for (const m of [getLockedItemToast({ isViewingPast: true, isViewingFuture: false }), getLockedItemToast({ isViewingPast: false, isViewingFuture: true })]) {
      assert.ok(m && !/[–·]/.test(m));
    }
  });
});
