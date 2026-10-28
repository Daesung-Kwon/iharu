/** '보상 확장' unlock state plus the store purchase / restore actions. */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createStoreIap, IapClient, PurchaseOutcome } from '../services/iap';
import { loadRewardExpansion, saveRewardExpansion } from '../services/rewardExpansionStore';
import { LOCKED, RewardExpansion, rewardSlotLimit, testOff, unlock } from '../utils/rewardExpansion';

interface RewardExpansionContextType {
  expansion: RewardExpansion;
  slotLimit: number;
  loaded: boolean;
  getPrice: () => Promise<string | null>;
  purchase: () => Promise<PurchaseOutcome>;
  /** 'restored' | 'none' */
  restore: () => Promise<'restored' | 'none'>;
  /** Sim/QA only: flips a test unlock. Never removes a real purchase. */
  setTestUnlocked: (on: boolean) => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<RewardExpansionContextType | null>(null);

export function RewardExpansionProvider({ children, iap }: { children: React.ReactNode; iap?: IapClient }) {
  const client = useRef(iap ?? createStoreIap()).current;
  const [expansion, setExpansion] = useState<RewardExpansion>(LOCKED);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    setExpansion(await loadRewardExpansion());
    setLoaded(true);
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const commit = useCallback(async (next: RewardExpansion) => {
    await saveRewardExpansion(next);
    setExpansion(next);
  }, []);

  const purchase = useCallback(async () => {
    const out = await client.purchase();
    if (out.kind === 'purchased') await commit(unlock('store', new Date().toISOString(), out.productId));
    return out;
  }, [client, commit]);

  const restore = useCallback(async () => {
    if (!(await client.restore())) return 'none' as const;
    await commit(unlock('restore', new Date().toISOString()));
    return 'restored' as const;
  }, [client, commit]);

  const setTestUnlocked = useCallback(async (on: boolean) => {
    const current = await loadRewardExpansion();
    if (on && !current.unlocked) await commit(unlock('test', new Date().toISOString()));
    if (!on) await commit(testOff(current));
  }, [commit]);

  const value = useMemo(() => ({
    expansion, slotLimit: rewardSlotLimit(expansion), loaded,
    getPrice: () => client.getPrice(), purchase, restore, setTestUnlocked, reload,
  }), [expansion, loaded, client, purchase, restore, setTestUnlocked, reload]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRewardExpansion() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useRewardExpansion must be used inside RewardExpansionProvider');
  return v;
}
