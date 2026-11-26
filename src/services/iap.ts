/**
 * Store purchase for '보상 확장' (one non-consumable product).
 *
 * Thin wrapper over expo-iap so the rest of the app only sees this small
 * interface. The product ID is a placeholder until the product exists in
 * App Store Connect / Play Console; until then fetching it returns nothing
 * and the sheet shows "지금은 구매할 수 없어요". No server, no secrets.
 */
import { REWARD_EXPANSION_PRODUCT_ID } from '../utils/rewardExpansion';

export type PurchaseOutcome =
  | { kind: 'purchased'; productId: string }
  | { kind: 'cancelled' }
  | { kind: 'unavailable' }
  | { kind: 'error'; message: string };

export interface IapClient {
  /** Localized price from the store, or null when the product isn't available. */
  getPrice(): Promise<string | null>;
  purchase(): Promise<PurchaseOutcome>;
  /** True when the store says this account already owns the product. */
  restore(): Promise<boolean>;
}

type ExpoIap = typeof import('expo-iap');

/** StoreKit / Play Billing answers in well under this; past it we give up. */
export const IAP_TIMEOUT_MS = 10_000;

/** Resolve `fallback` if `work` has not settled within `ms`. Never rejects for a timeout. */
export function withTimeout<T>(work: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    work.then(
      v => { clearTimeout(timer); resolve(v); },
      e => { clearTimeout(timer); reject(e); },
    );
  });
}

const TIMED_OUT = Symbol('timedOut');

const loadNative = (): ExpoIap | null => {
  try {
    // Lazy so this file stays importable in node tests.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Platform } = require('react-native') as typeof import('react-native');
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-iap') as ExpoIap;
  } catch {
    return null;
  }
};

const isCancel = (e: unknown) => {
  const code = String((e as { code?: unknown })?.code ?? '').toLowerCase();
  return code.includes('cancel');
};

export function createStoreIap(
  productId = REWARD_EXPANSION_PRODUCT_ID,
  { load = loadNative, timeoutMs = IAP_TIMEOUT_MS }: { load?: () => ExpoIap | null; timeoutMs?: number } = {},
): IapClient {
  let connected: Promise<ExpoIap | null> | null = null;
  const connect = () => {
    connected ??= (async () => {
      const iap = load();
      if (!iap) return null;
      try {
        const ok = await withTimeout<boolean | typeof TIMED_OUT>(iap.initConnection().then(() => true), timeoutMs, TIMED_OUT);
        if (ok === TIMED_OUT) {
          connected = null;
          return null;
        }
        return iap;
      } catch {
        connected = null;
        return null;
      }
    })();
    return connected;
  };
  /** One product lookup; null when missing, failed, or too slow. */
  const findProduct = async (iap: ExpoIap) => {
    try {
      const products = await withTimeout(
        iap.fetchProducts({ skus: [productId], type: 'in-app' }),
        timeoutMs,
        null,
      );
      return products?.find(x => x.id === productId) ?? null;
    } catch {
      return null;
    }
  };

  const owns = (list: readonly { productId: string }[] | null | undefined) =>
    !!list?.some(p => p.productId === productId);

  return {
    async getPrice() {
      const iap = await connect();
      if (!iap) return null;
      const p = await findProduct(iap);
      return p?.displayPrice ?? null;
    },

    async purchase() {
      const iap = await connect();
      if (!iap) return { kind: 'unavailable' };
      if (!(await findProduct(iap))) return { kind: 'unavailable' };
      // No timeout from here on: the user may take a while in the store sheet.

      return new Promise<PurchaseOutcome>(resolve => {
        let done = false;
        const finish = (o: PurchaseOutcome) => {
          if (done) return;
          done = true;
          ok.remove();
          bad.remove();
          resolve(o);
        };
        const ok = iap.purchaseUpdatedListener(async purchase => {
          if (purchase.productId !== productId) return;
          try { await iap.finishTransaction({ purchase, isConsumable: false }); } catch { /* retried on next launch */ }
          finish({ kind: 'purchased', productId });
        });
        const bad = iap.purchaseErrorListener(e => {
          finish(isCancel(e) ? { kind: 'cancelled' } : { kind: 'error', message: String(e?.message ?? e) });
        });
        iap.requestPurchase({
          request: { apple: { sku: productId }, google: { skus: [productId] } },
          type: 'in-app',
        }).catch(e => finish(isCancel(e) ? { kind: 'cancelled' } : { kind: 'error', message: String(e?.message ?? e) }));
      });
    },

    async restore() {
      const iap = await connect();
      if (!iap) return false;
      try {
        return owns(await withTimeout(iap.getAvailablePurchases(), timeoutMs, null));
      } catch {
        return false;
      }
    },
  };
}

/** For tests and builds without a store. */
export const unavailableIap: IapClient = {
  getPrice: async () => null,
  purchase: async () => ({ kind: 'unavailable' }),
  restore: async () => false,
};
