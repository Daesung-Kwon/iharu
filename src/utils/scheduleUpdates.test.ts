import test from 'node:test';
import assert from 'node:assert/strict';
import { applyItemUpdate, applyScheduleItemUpdate, removeScheduleItemFrom, resetCopiedItem } from './scheduleUpdates';
import type { Schedule, ScheduleItem } from '../types';

const item = (id: string, extra: Partial<ScheduleItem> = {}): ScheduleItem => ({
  id, scheduleId: 's', activityId: 'a', startTime: '09:00', endTime: '09:30',
  status: 'planned', orderIndex: 0, createdAt: 'c', updatedAt: 'old', ...extra,
});
const schedule = (date: string, items: ScheduleItem[]): Schedule => ({
  id: `schedule-${date}`, userId: 'u', childProfileId: 'c', date, items, createdAt: 'c', updatedAt: 'old',
});

test('completing sets completedAt; undo and un-complete clear it', () => {
  const done = applyItemUpdate(item('i'), { status: 'completed' }, 'T1');
  assert.equal(done.completedAt, 'T1');
  assert.equal(applyItemUpdate(done, { status: 'planned' }, 'T2').completedAt, undefined);
  assert.equal('completedAt' in applyItemUpdate(done, { status: 'planned' }, 'T2'), false);
  assert.equal(applyItemUpdate(done, { status: 'skipped' }, 'T2').completedAt, undefined);
});

test('re-completing an already completed item keeps the first completedAt', () => {
  const done = item('i', { status: 'completed', completedAt: 'T1' });
  assert.equal(applyItemUpdate(done, { status: 'completed' }, 'T9').completedAt, 'T1');
});

test('updates without a status leave completedAt alone', () => {
  const done = item('i', { status: 'completed', completedAt: 'T1' });
  assert.equal(applyItemUpdate(done, { startTime: '10:00' }, 'T2').completedAt, 'T1');
});

test('only the schedule holding the item gets a new updatedAt', () => {
  const a = schedule('2026-10-19', [item('a1')]);
  const b = schedule('2026-10-20', [item('b1')]);
  const next = applyScheduleItemUpdate([a, b], 'b1', { status: 'completed' }, 'NOW');
  assert.equal(next[0], a);
  assert.equal(next[1].updatedAt, 'NOW');
  assert.equal(next[1].items[0].completedAt, 'NOW');
  const same = [a, b];
  assert.equal(applyScheduleItemUpdate(same, 'missing', { status: 'completed' }, 'NOW'), same);
});

test('removing an item bumps only its own schedule', () => {
  const a = schedule('2026-10-19', [item('a1')]);
  const b = schedule('2026-10-20', [item('b1'), item('b2')]);
  const next = removeScheduleItemFrom([a, b], 'b1', 'NOW');
  assert.equal(next[0], a);
  assert.deepEqual(next[1].items.map(i => i.id), ['b2']);
  assert.equal(next[1].updatedAt, 'NOW');
});

test('a copied item starts fresh: planned, no completedAt', () => {
  const copy = resetCopiedItem(item('i', { status: 'completed', completedAt: 'T1' }), 'new', 'schedule-x', 'NOW');
  assert.equal(copy.status, 'planned');
  assert.equal('completedAt' in copy, false);
  assert.equal(copy.id, 'new');
  assert.equal(copy.scheduleId, 'schedule-x');
});
