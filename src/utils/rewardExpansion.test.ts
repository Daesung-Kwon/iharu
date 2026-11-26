import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAddRewardSlot, EXPANSION_COPY, LOCKED, mergeOnRestore, parseStoredExpansion,
  rewardSlotLimit, showExpansionEntry, showRestore, storeAvailabilityFromPrice, testOff, unlock,
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

test('store availability comes from the one product fetch', () => {
  assert.equal(storeAvailabilityFromPrice('₩2,200'), 'available');
  assert.equal(storeAvailabilityFromPrice(null), 'unavailable');
  assert.equal(storeAvailabilityFromPrice(undefined), 'unavailable');
  assert.equal(storeAvailabilityFromPrice(''), 'unavailable');
});

test('보상 확장 entry points hide while the product cannot load', () => {
  const locked = false;
  assert.equal(showExpansionEntry({ unlocked: locked, store: 'unknown' }), false);
  assert.equal(showExpansionEntry({ unlocked: locked, store: 'unavailable' }), false);
  assert.equal(showExpansionEntry({ unlocked: locked, store: 'available' }), true);
  // Already unlocked: still shown, so the user sees 「확장을 쓰고 있어요」.
  assert.equal(showExpansionEntry({ unlocked: true, store: 'unavailable' }), true);
  assert.equal(showExpansionEntry({ unlocked: true, store: 'unknown' }), true);
  // Dev / EXPO_PUBLIC_IAP_TEST builds keep the test toggle reachable.
  assert.equal(showExpansionEntry({ unlocked: locked, store: 'unavailable', qa: true }), true);
});

test('구매 복원 needs the product and a locked state', () => {
  assert.equal(showRestore({ unlocked: false, store: 'available' }), true);
  assert.equal(showRestore({ unlocked: false, store: 'unavailable' }), false);
  assert.equal(showRestore({ unlocked: false, store: 'unknown' }), false);
  assert.equal(showRestore({ unlocked: true, store: 'available' }), false);
});
