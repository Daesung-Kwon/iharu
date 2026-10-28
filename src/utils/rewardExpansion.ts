/**
 * '보상 확장' one-time purchase: the unlock flag and what it allows. Pure.
 *
 * Free: one weekly promise. Expansion: more reward slots (REWARD_SLOTS).
 * The store is the source of truth for real purchases; this flag is the
 * on-device cache (restored from the store, or from a backup file).
 */

/** Placeholder until the price and store product are decided. */
export const REWARD_EXPANSION_PRODUCT_ID = 'com.dailyschedule.app.reward_expansion';

export type UnlockSource = 'store' | 'restore' | 'test';

export interface RewardExpansion {
  unlocked: boolean;
  source: UnlockSource | null;
  productId: string | null;
  unlockedAt: string | null;
}

export const LOCKED: RewardExpansion = { unlocked: false, source: null, productId: null, unlockedAt: null };

export const REWARD_SLOTS = { free: 1, expanded: 3 } as const;

export function rewardSlotLimit(e: RewardExpansion): number {
  return e.unlocked ? REWARD_SLOTS.expanded : REWARD_SLOTS.free;
}

export function canAddRewardSlot(e: RewardExpansion, used: number): boolean {
  return used < rewardSlotLimit(e);
}

const SOURCES: readonly UnlockSource[] = ['store', 'restore', 'test'];

export function isRewardExpansion(v: unknown): v is RewardExpansion {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  const o = v as Record<string, unknown>;
  return typeof o.unlocked === 'boolean'
    && (o.source === null || SOURCES.includes(o.source as UnlockSource))
    && (o.productId === null || typeof o.productId === 'string')
    && (o.unlockedAt === null || typeof o.unlockedAt === 'string');
}

/** Missing or unreadable → locked. */
export function parseStoredExpansion(raw: string | null | undefined): RewardExpansion {
  if (!raw) return LOCKED;
  try {
    const v = JSON.parse(raw);
    return isRewardExpansion(v) ? v : LOCKED;
  } catch {
    return LOCKED;
  }
}

export function unlock(source: UnlockSource, nowIso: string, productId = REWARD_EXPANSION_PRODUCT_ID): RewardExpansion {
  return { unlocked: true, source, productId, unlockedAt: nowIso };
}

/**
 * Restoring a backup never takes a purchase away: unlocked wins. A test
 * unlock in the file stays a test unlock.
 */
export function mergeOnRestore(current: RewardExpansion, fromBackup: RewardExpansion | null | undefined): RewardExpansion {
  if (current.unlocked) return current;
  return fromBackup?.unlocked ? fromBackup : current;
}

/** Only the sim/test toggle may be turned off; a real purchase stays. */
export function testOff(current: RewardExpansion): RewardExpansion {
  return current.source === 'test' ? LOCKED : current;
}

export const EXPANSION_COPY = {
  title: '보상 확장',
  lockedSummary: '주간 약속 1개 (무료)',
  unlockedSummary: `보상 칸 ${REWARD_SLOTS.expanded}개까지 쓸 수 있어요`,
  intro: '한 번 구매하면 보상 칸을 더 쓸 수 있어요. 광고나 정기 결제는 없어요.',
  benefits: [
    `주간 약속을 ${REWARD_SLOTS.expanded}개까지 만들 수 있어요`,
    '한 번만 결제하고 계속 써요',
    '구매 기록은 스토어에서 다시 불러올 수 있어요',
  ],
  buy: '구매하기',
  restore: '구매 복원',
  done: '확장을 쓰고 있어요',
  priceLater: '가격은 스토어에서 확인해요',
  unavailable: '지금은 구매할 수 없어요. 잠시 뒤에 다시 해 봐요.',
  testOn: '테스트: 확장 켜기',
  testOff: '테스트: 확장 끄기',
} as const;
