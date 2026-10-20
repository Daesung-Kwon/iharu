import test from 'node:test';
import assert from 'node:assert/strict';
import { CURRENT_SCHEMA_VERSION, Migration, parseSchemaVersion, runMigrations } from './schema';
import { KEYS } from './storageKeys';

const memoryStore = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: async (k: string) => data.get(k) ?? null,
    setItem: async (k: string, v: string) => { data.set(k, v); },
  };
};

test('parseSchemaVersion: missing or junk means v1 (pre-versioning data)', () => {
  assert.equal(parseSchemaVersion(null), 1);
  assert.equal(parseSchemaVersion('abc'), 1);
  assert.equal(parseSchemaVersion('0'), 1);
  assert.equal(parseSchemaVersion('1.5'), 1);
  assert.equal(parseSchemaVersion('2'), 2);
});

test('existing v1 data goes to v2 without touching other keys', async () => {
  const store = memoryStore({ [KEYS.SCHEDULES]: '[{"date":"2026-10-19","items":[]}]' });
  const r = await runMigrations(store);
  assert.deepEqual(r, { from: 1, to: CURRENT_SCHEMA_VERSION, ran: [2] });
  assert.equal(store.data.get(KEYS.SCHEMA_VERSION), '2');
  assert.equal(store.data.get(KEYS.SCHEDULES), '[{"date":"2026-10-19","items":[]}]');
});

test('runner is idempotent: a second run does nothing', async () => {
  const store = memoryStore();
  await runMigrations(store);
  assert.deepEqual(await runMigrations(store), { from: 2, to: 2, ran: [] });
});

test('data from a newer build is left alone', async () => {
  const store = memoryStore({ [KEYS.SCHEMA_VERSION]: '5' });
  assert.deepEqual(await runMigrations(store), { from: 5, to: 5, ran: [] });
  assert.equal(store.data.get(KEYS.SCHEMA_VERSION), '5');
});

test('steps run in version order and the version is saved after each step', async () => {
  const calls: string[] = [];
  const store = memoryStore();
  const steps: Migration[] = [
    { to: 3, run: async s => { calls.push(`3@${await s.getItem(KEYS.SCHEMA_VERSION)}`); } },
    { to: 2, run: async s => { calls.push(`2@${await s.getItem(KEYS.SCHEMA_VERSION)}`); } },
  ];
  assert.deepEqual(await runMigrations(store, steps, 3), { from: 1, to: 3, ran: [2, 3] });
  assert.deepEqual(calls, ['2@null', '3@2']);
});

test('a failing step stops the run and keeps the last good version', async () => {
  const store = memoryStore();
  const steps: Migration[] = [
    { to: 2, run: async () => {} },
    { to: 3, run: async () => { throw new Error('boom'); } },
  ];
  await assert.rejects(runMigrations(store, steps, 3));
  assert.equal(store.data.get(KEYS.SCHEMA_VERSION), '2');
  assert.deepEqual(await runMigrations(store, [{ to: 3, run: async () => {} }], 3), { from: 2, to: 3, ran: [3] });
});
