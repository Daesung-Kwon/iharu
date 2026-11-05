import test from 'node:test';
import assert from 'node:assert/strict';
import type { Schedule } from '../types';
import { WeeklyPromise } from './weeklyPromise';
import {
  canCreatePromise, judgeAll, latestUnseenWeek, managedPromises, normalizePromises, parseStoredPromises,
  promiseLine, stopPromiseById, summaryCopy, upsertPromise, usedSlots, weekResultCopy, weekSummary,
} from './weeklyPromises';
import { MULTI_PROMISE_COPY } from './multiPromiseCopy';

const day = (date: string, completed: number, total: number): Pick<Schedule, 'date' | 'items'> => ({
  date,
  items: Array.from({ length: total }, (_, i) => ({
    id: `${date}-${i}`, scheduleId: `s-${date}`, activityId: 'a', startTime: '09:00', endTime: '09:30',
    status: i < completed ? 'completed' : 'planned', orderIndex: i, createdAt: '', updatedAt: '',
  })),
});
// 2026-10-12, 2026-10-19 and 2026-10-26 are Mondays.
const o = (today: string, limit: number, newId = 'promise') => ({ today, nowIso: `${today}T00:00:00Z`, newId, limit });
function make(today: string, limit: number, inputs: { reward: string; goalPercent: number }[]): WeeklyPromise[] {
  let list: WeeklyPromise[] = [];
  for (const input of inputs) {
    const r = upsertPromise(list, null, input, o(today, limit));
    assert.ok(r.ok);
    list = r.list;
  }
  return list;
}

test('free slot: one promise, a second is refused', () => {
  const list = make('2026-10-14', 1, [{ reward: '게임', goalPercent: 80 }]);
  assert.equal(canCreatePromise(list, '2026-10-14', 1), false);
  assert.deepEqual(upsertPromise(list, null, { reward: '공원', goalPercent: 60 }, o('2026-10-14', 1)), { ok: false, reason: 'limit' });
});

test('expanded: three promises with unique ids, a fourth is refused', () => {
  const list = make('2026-10-14', 3, [
    { reward: '게임', goalPercent: 80 }, { reward: '공원', goalPercent: 60 }, { reward: '책', goalPercent: 100 },
  ]);
  assert.deepEqual(list.map(p => p.id), ['promise', 'promise-2', 'promise-3']);
  assert.equal(usedSlots(list, '2026-10-14'), 3);
  const r = upsertPromise(list, null, { reward: 'x', goalPercent: 50 }, o('2026-10-14', 3));
  assert.equal(r.ok, false);
});

test('editing does not need a free slot and keeps the id', () => {
  const list = make('2026-10-14', 1, [{ reward: '게임', goalPercent: 80 }]);
  const r = upsertPromise(list, 'promise', { reward: '게임 2', goalPercent: 70 }, o('2026-10-15', 1));
  assert.ok(r.ok);
  assert.equal(r.id, 'promise');
  assert.equal(r.list.length, 1);
  assert.deepEqual(upsertPromise(list, 'nope', { reward: 'a', goalPercent: 50 }, o('2026-10-15', 1)), { ok: false, reason: 'missing' });
});

test('an edit in a running week applies from next week, per promise', () => {
  const list = make('2026-10-14', 3, [{ reward: '게임', goalPercent: 80 }, { reward: '공원', goalPercent: 60 }]);
  const r = upsertPromise(list, 'promise-2', { reward: '바다', goalPercent: 50 }, o('2026-10-16', 3));
  assert.ok(r.ok);
  const line = promiseLine(r.list[1], '2026-10-16');
  assert.equal(line.title, '공원 (목표 60%)');
  assert.equal(line.note, '다음 주부터: 바다 (목표 50%)');
  assert.equal(promiseLine(r.list[0], '2026-10-16').note, '');
});

test('a stopped promise frees its slot from next week', () => {
  let list = make('2026-10-14', 1, [{ reward: '게임', goalPercent: 80 }]);
  list = stopPromiseById(list, 'promise', { today: '2026-10-15', nowIso: 'n' });
  assert.equal(usedSlots(list, '2026-10-15'), 1, 'still running this week');
  assert.match(promiseLine(list[0], '2026-10-15').note, /부터 그만해요$/);
  assert.equal(usedSlots(list, '2026-10-19'), 0);
  assert.deepEqual(managedPromises(list, '2026-10-19'), []);
  const r = upsertPromise(list, null, { reward: '공원', goalPercent: 60 }, o('2026-10-19', 1));
  assert.ok(r.ok);
  assert.equal(r.id, 'promise-2');
});

test('judging runs for each promise with its own goal', () => {
  const list = make('2026-10-12', 3, [{ reward: '게임', goalPercent: 100 }, { reward: '공원', goalPercent: 50 }]);
  const schedules = [day('2026-10-12', 1, 1), day('2026-10-13', 0, 1)];
  const res = judgeAll(list, [], schedules, { today: '2026-10-20', nowIso: 'j' });
  assert.deepEqual(res.map(r => [r.id, r.achieved]), [['promise:2026-10-12', false], ['promise-2:2026-10-12', true]]);
  assert.deepEqual(judgeAll(list, res, schedules, { today: '2026-10-20', nowIso: 'j' }), [], 'idempotent');
  const unseen = latestUnseenWeek(res);
  assert.equal(unseen.length, 2);
  const copy = weekResultCopy(unseen)!;
  assert.equal(copy.achieved, true);
  assert.equal(copy.footer, '약속한 보상: 공원');
  assert.equal(weekResultCopy([]), null);
});

test('the Today card is one summary for several promises', () => {
  const list = make('2026-10-12', 3, [{ reward: '게임', goalPercent: 100 }, { reward: '공원', goalPercent: 50 }]);
  const s = weekSummary(list, [day('2026-10-12', 1, 1), day('2026-10-13', 0, 1)], '2026-10-14')!;
  const c = summaryCopy(s);
  assert.equal(c.title, '이번 주 약속 2개');
  assert.match(c.detail, /\(목표 닿음 1\/2\)$/);
  const one = summaryCopy(weekSummary(list.slice(0, 1), [], '2026-10-14')!);
  assert.equal(one.title, '이번 주 약속: 게임');
  assert.equal(weekSummary([], [], '2026-10-14'), null);
});

test('stored promises: array, legacy object, garbage, duplicate ids', () => {
  const [p] = make('2026-10-14', 1, [{ reward: '게임', goalPercent: 80 }]);
  assert.deepEqual(parseStoredPromises(JSON.stringify([p, p, { id: 1 }])), [p]);
  assert.deepEqual(parseStoredPromises(JSON.stringify(p)), [p]);
  assert.deepEqual(parseStoredPromises('{oops'), []);
  assert.deepEqual(parseStoredPromises(null), []);
  assert.deepEqual(normalizePromises(null), []);
});

test('multi-promise copy avoids forbidden glyphs', () => {
  const all = Object.values(MULTI_PROMISE_COPY).map(v => (typeof v === 'function' ? (v as (a: number, b: number) => string)(2, 3) : v));
  for (const s of all) assert.doesNotMatch(s, /[·–]/);
});
