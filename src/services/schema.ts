/**
 * Local data schema version and an ordered, idempotent migration runner.
 * Pure: storage is passed in, so tests use an in-memory map.
 *
 * v1 - everything before this key existed (no '@iharu.schemaVersion').
 * v2 - ScheduleItem.completedAt (optional). Nothing is rewritten: old items
 *      simply have no completedAt.
 */
import { KEYS } from './storageKeys';

export const CURRENT_SCHEMA_VERSION = 2;

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
