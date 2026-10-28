import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAddRewardSlot, EXPANSION_COPY, LOCKED, mergeOnRestore, parseStoredExpansion,
  rewardSlotLimit, testOff, unlock,
} from './rewardExpansion';

const NOW = '2026-10-28T03:00:00.000Z';

test('free has one reward slot, expansion has three', () => {
  assert.equal(rewardSlotLimit(LOCKED), 1);
  assert.equal(rewardSlotLimit(unlock('store', NOW)), 3);
  assert.equal(canAddRewardSlot(LOCKED, 0), true);
  assert.equal(canAddRewardSlot(LOCKED, 1), false);
  assert.equal(canAddRewardSlot(unlock('test', NOW), 2), true);
  assert.equal(canAddRewardSlot(unlock('test', NOW), 3), false);
});

test('stored flag: missing or broken reads as locked', () => {
  assert.deepEqual(parseStoredExpansion(null), LOCKED);
  assert.deepEqual(parseStoredExpansion('{bad'), LOCKED);
  assert.deepEqual(parseStoredExpansion(JSON.stringify({ unlocked: 'yes' })), LOCKED);
  const u = unlock('store', NOW);
  assert.deepEqual(parseStoredExpansion(JSON.stringify(u)), u);
});

test('restore never removes a purchase and can bring one back', () => {
  const bought = unlock('store', NOW);
  assert.equal(mergeOnRestore(bought, LOCKED), bought);
  assert.equal(mergeOnRestore(bought, null), bought);
  assert.deepEqual(mergeOnRestore(LOCKED, bought), bought);
  assert.deepEqual(mergeOnRestore(LOCKED, undefined), LOCKED);
});

test('the test toggle only turns off a test unlock', () => {
  assert.deepEqual(testOff(unlock('test', NOW)), LOCKED);
  const bought = unlock('store', NOW);
  assert.equal(testOff(bought), bought);
});

test('copy uses no glyphs missing from BMJUA', () => {
  const all = Object.values(EXPANSION_COPY).flat().join(' ');
  assert.ok(!/[–·]/.test(all));
});
