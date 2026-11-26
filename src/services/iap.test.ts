import test from 'node:test';
import assert from 'node:assert/strict';
import { createStoreIap, withTimeout } from './iap';

const ID = 'com.dailyschedule.app.reward_expansion';
const never = <T,>() => new Promise<T>(() => {});

/** Minimal expo-iap stand-in; each test overrides what it needs. */
function fakeIap(over: Record<string, unknown> = {}) {
  return {
    initConnection: async () => true,
    fetchProducts: async () => [],
    getAvailablePurchases: async () => [],
    purchaseUpdatedListener: () => ({ remove() {} }),
    purchaseErrorListener: () => ({ remove() {} }),
    requestPurchase: async () => undefined,
    finishTransaction: async () => undefined,
    ...over,
  } as never;
}

test('withTimeout returns the fallback when the work is too slow', async () => {
  assert.equal(await withTimeout(never<string>(), 10, 'late'), 'late');
  assert.equal(await withTimeout(Promise.resolve('ok'), 50, 'late'), 'ok');
  await assert.rejects(withTimeout(Promise.reject(new Error('x')), 50, 'late'));
});

test('product not found (unapproved / not attached): no price, purchase unavailable', async () => {
  const iap = createStoreIap(ID, { load: () => fakeIap() });
  assert.equal(await iap.getPrice(), null);
  assert.deepEqual(await iap.purchase(), { kind: 'unavailable' });
});

test('a hung StoreKit / Billing call gives up instead of spinning forever', async () => {
  const hungFetch = createStoreIap(ID, { load: () => fakeIap({ fetchProducts: never }), timeoutMs: 20 });
  assert.equal(await hungFetch.getPrice(), null);
  assert.deepEqual(await hungFetch.purchase(), { kind: 'unavailable' });

  const hungConnect = createStoreIap(ID, { load: () => fakeIap({ initConnection: never }), timeoutMs: 20 });
  assert.equal(await hungConnect.getPrice(), null);

  const hungRestore = createStoreIap(ID, { load: () => fakeIap({ getAvailablePurchases: never }), timeoutMs: 20 });
  assert.equal(await hungRestore.restore(), false);
});

test('a loaded product gives its store price', async () => {
  const iap = createStoreIap(ID, {
    load: () => fakeIap({ fetchProducts: async () => [{ id: ID, displayPrice: '₩2,200' }] }),
  });
  assert.equal(await iap.getPrice(), '₩2,200');
});

test('no native store (web / node): unavailable, not an error', async () => {
  const iap = createStoreIap(ID, { load: () => null });
  assert.equal(await iap.getPrice(), null);
  assert.deepEqual(await iap.purchase(), { kind: 'unavailable' });
  assert.equal(await iap.restore(), false);
});
