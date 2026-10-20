import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AD_RETRY_DELAYS_MS, adBannerReducer, initialAdBannerState, nextAdRetryDelay, reservedAdHeight,
} from './adSlot';

test('a fresh banner (every return from Settings) starts ready to request', () => {
  assert.deepEqual(initialAdBannerState, { attempt: 0, failures: 0, waiting: false });
});

test('fail → wait → retry makes a new request; it never ends in a stuck state', () => {
  let s = initialAdBannerState;
  for (let n = 1; n <= 5; n++) {
    s = adBannerReducer(s, { type: 'FAILED' });
    assert.equal(s.waiting, true);
    assert.equal(s.failures, n);
    s = adBannerReducer(s, { type: 'RETRY' });
    assert.equal(s.waiting, false);
    assert.equal(s.attempt, n);
  }
  s = adBannerReducer(s, { type: 'LOADED' });
  assert.deepEqual({ failures: s.failures, waiting: s.waiting }, { failures: 0, waiting: false });
});

test('duplicate events are ignored', () => {
  const failed = adBannerReducer(initialAdBannerState, { type: 'FAILED' });
  assert.equal(adBannerReducer(failed, { type: 'FAILED' }), failed);
  assert.equal(adBannerReducer(initialAdBannerState, { type: 'RETRY' }), initialAdBannerState);
});

test('retry delay grows and stays capped', () => {
  assert.equal(nextAdRetryDelay(1), AD_RETRY_DELAYS_MS[0]);
  assert.equal(nextAdRetryDelay(2), AD_RETRY_DELAYS_MS[1]);
  assert.equal(nextAdRetryDelay(9), AD_RETRY_DELAYS_MS[2]);
});

test('the slot holds the last loaded height', () => {
  assert.equal(reservedAdHeight(0), 0);
  assert.equal(reservedAdHeight(58.6), 59);
});
