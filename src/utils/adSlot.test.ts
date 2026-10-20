import test from 'node:test';
import assert from 'node:assert/strict';
import { AD_RETRY_DELAY_MS, nextAdRetryDelay, reservedAdHeight } from './adSlot';

test('a failed banner load retries once, then stops', () => {
  assert.equal(nextAdRetryDelay(0), null);
  assert.equal(nextAdRetryDelay(1), AD_RETRY_DELAY_MS);
  assert.equal(nextAdRetryDelay(2), null);
});

test('the slot holds the last loaded height until it gives up', () => {
  assert.equal(reservedAdHeight(0, false), 0); // never loaded yet: nothing to hold
  assert.equal(reservedAdHeight(61.6, false), 62);
  assert.equal(reservedAdHeight(62, true), 0);
});
