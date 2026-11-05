/**
 * Local data schema version and an ordered, idempotent migration runner.
 * Pure: storage is passed in, so tests use an in-memory map.
 *
 * v1 - everything before this key existed (no '@iharu.schemaVersion').
 * v2 - ScheduleItem.completedAt (optional). Nothing is rewritten: old items
 *      simply have no completedAt.
 * v3 - weekly reward promise ('@iharu.weeklyPromise', '@iharu.weeklyResults').
 *      New keys only; the step drops unreadable result rows if any exist.
 * v4 - '보상 확장' unlock ('@iharu.rewardExpansion'). New key only; an
 *      unreadable value is rewritten as locked.
 * v5 - several weekly promises ('@iharu.weeklyPromises', an array). The old
 *      single '@iharu.weeklyPromise' moves in with its id; the old key becomes null.
 */
import { KEYS } from './storageKeys';
import { parseStoredResults } from '../utils/weeklyPromise';
import { parseStoredExpansion } from '../utils/rewardExpansion';
import { normalizePromises, parseStoredPromises } from '../utils/weeklyPromises';

export const CURRENT_SCHEMA_VERSION = 5;

export interface KeyValueStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export interface Migration {
  /** Version the store is at after this step. */
  to: number;
  run(store: KeyValueStore): Promise<void>;
}

export const MIGRATIONS: Migration[] = [
  { to: 2, run: async () => { /* additive field only */ } },
  {
    to: 3,
    run: async (store) => {
      const raw = await store.getItem(KEYS.WEEKLY_RESULTS);
      if (raw === null) return;
      await store.setItem(KEYS.WEEKLY_RESULTS, JSON.stringify(parseStoredResults(raw)));
    },
  },
  {
    to: 4,
    run: async (store) => {
      const raw = await store.getItem(KEYS.REWARD_EXPANSION);
      if (raw === null) return;
      await store.setItem(KEYS.REWARD_EXPANSION, JSON.stringify(parseStoredExpansion(raw)));
    },
  },
  {
    to: 5,
    run: async (store) => {
      const legacy = parseStoredPromises(await store.getItem(KEYS.WEEKLY_PROMISE));
      const current = parseStoredPromises(await store.getItem(KEYS.WEEKLY_PROMISES));
      const merged = normalizePromises([...current, ...legacy]);
      if (merged.length === 0 && (await store.getItem(KEYS.WEEKLY_PROMISES)) === null
        && (await store.getItem(KEYS.WEEKLY_PROMISE)) === null) return;
      await store.setItem(KEYS.WEEKLY_PROMISES, JSON.stringify(merged));
      await store.setItem(KEYS.WEEKLY_PROMISE, 'null');
    },
  },
];

/** Missing or unreadable → 1 (data written before versioning). */
export function parseSchemaVersion(raw: string | null): number {
  const n = raw === null ? NaN : Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export interface MigrationResult {
  from: number;
  to: number;
  ran: number[];
}

/**
 * Run every migration above the stored version, in order, saving the version
 * after each step so a crash resumes where it stopped. A store already at or
 * above `target` (e.g. data from a newer build) is left untouched.
 */
export async function runMigrations(
  store: KeyValueStore,
  migrations: Migration[] = MIGRATIONS,
  target: number = CURRENT_SCHEMA_VERSION,
): Promise<MigrationResult> {
  const from = parseSchemaVersion(await store.getItem(KEYS.SCHEMA_VERSION));
  let current = from;
  const ran: number[] = [];
  const steps = [...migrations].sort((a, b) => a.to - b.to);
  for (const step of steps) {
    if (step.to <= current || step.to > target) continue;
    await step.run(store);
    current = step.to;
    await store.setItem(KEYS.SCHEMA_VERSION, String(current));
    ran.push(step.to);
  }
  return { from, to: current, ran };
}
