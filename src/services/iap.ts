/**
 * Store purchase for '보상 확장' (one non-consumable product).
 *
 * Thin wrapper over expo-iap so the rest of the app only sees this small
 * interface. The product ID is a placeholder until the product exists in
 * App Store Connect / Play Console; until then fetching it returns nothing
 * and the sheet shows "지금은 구매할 수 없어요". No server, no secrets.
 */
import { Platform } from 'react-native';
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

const loadNative = (): ExpoIap | null => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;
  try {
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

export function createStoreIap(productId = REWARD_EXPANSION_PRODUCT_ID): IapClient {
  let connected: Promise<ExpoIap | null> | null = null;
  const connect = () => {
    connected ??= (async () => {
      const iap = loadNative();
      if (!iap) return null;
      try {
        await iap.initConnection();
        return iap;
      } catch {
        connected = null;
        return null;
      }
    })();
    return connected;
  };

  const owns = (list: readonly { productId: string }[] | null | undefined) =>
    !!list?.some(p => p.productId === productId);

  return {
    async getPrice() {
      const iap = await connect();
      if (!iap) return null;
      try {
        const products = await iap.fetchProducts({ skus: [productId], type: 'in-app' });
        const p = products?.find(x => x.id === productId);
        return p?.displayPrice ?? null;
      } catch {
        return null;
      }
    },

    async purchase() {
      const iap = await connect();
      if (!iap) return { kind: 'unavailable' };
      const products = await iap.fetchProducts({ skus: [productId], type: 'in-app' }).catch(() => null);
      if (!products?.some(x => x.id === productId)) return { kind: 'unavailable' };

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
        return owns(await iap.getAvailablePurchases());
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
