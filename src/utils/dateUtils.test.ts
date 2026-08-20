import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toLocalDateString, migrateUtcSlicedScheduleDates } from './dateUtils';
import { isToday, isPast, isFuture } from './statsUtils';

describe('toLocalDateString', () => {
  it('returns local calendar date at 01:00, not the UTC ISO date', () => {
    const date = new Date(2026, 7, 20, 1, 0, 0);
    const local = toLocalDateString(date);
    assert.equal(local, '2026-08-20');
    assert.notEqual(local, date.toISOString().split('T')[0]);
  });

  it('returns the same calendar date at 23:00', () => {
    const date = new Date(2026, 7, 20, 23, 0, 0);
    assert.equal(toLocalDateString(date), '2026-08-20');
  });
});

describe('isToday/isPast/isFuture', () => {
  it('classifies today, past, and future using local YYYY-MM-DD', () => {
    const now = new Date();
    const today = toLocalDateString(now);
    assert.equal(isToday(today), true);
    assert.equal(isPast(today), false);
    assert.equal(isFuture(today), false);

    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 1, 0, 0);
    const yesterdayString = toLocalDateString(yesterday);
    assert.equal(isToday(yesterdayString), false);
    assert.equal(isPast(yesterdayString), true);
    assert.equal(isFuture(yesterdayString), false);

    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 1, 0, 0);
    const tomorrowString = toLocalDateString(tomorrow);
    assert.equal(isToday(tomorrowString), false);
    assert.equal(isPast(tomorrowString), false);
    assert.equal(isFuture(tomorrowString), true);
  });
});

describe('migrateUtcSlicedScheduleDates', () => {
  it('rewrites a KST-morning UTC key to the local calendar day', () => {
    const schedules = [{
      date: '2026-08-19',
      createdAt: '2026-08-19T16:00:00.000Z',
    }];
    const migrated = migrateUtcSlicedScheduleDates(schedules);
    assert.equal(migrated[0].date, '2026-08-20');
    assert.equal(migrated[0].createdAt, '2026-08-19T16:00:00.000Z');
  });

  it('is idempotent after the date has been rewritten', () => {
    const schedules = [{
      date: '2026-08-20',
      createdAt: '2026-08-19T16:00:00.000Z',
    }];
    const migrated = migrateUtcSlicedScheduleDates(schedules);
    assert.equal(migrated, schedules);
  });

  it('leaves afternoon UTC-aligned dates unchanged', () => {
    const schedules = [{
      date: '2026-08-20',
      createdAt: '2026-08-20T05:00:00.000Z',
    }];
    assert.equal(migrateUtcSlicedScheduleDates(schedules), schedules);
  });

  it('skips when the local date is already occupied', () => {
    const schedules = [
      { date: '2026-08-19', createdAt: '2026-08-19T16:00:00.000Z' },
      { date: '2026-08-20', createdAt: '2026-08-20T05:00:00.000Z' },
    ];
    const migrated = migrateUtcSlicedScheduleDates(schedules);
    assert.equal(migrated[0].date, '2026-08-19');
    assert.equal(migrated, schedules);
  });

  it('shifts consecutive morning UTC keys in chronological order', () => {
    const schedules = [
      { date: '2026-08-19', createdAt: '2026-08-19T16:00:00.000Z' },
      { date: '2026-08-20', createdAt: '2026-08-20T16:00:00.000Z' },
    ];
    const migrated = migrateUtcSlicedScheduleDates(schedules);
    assert.deepEqual(migrated.map(schedule => schedule.date), ['2026-08-20', '2026-08-21']);
  });

  it('shifts a future-day morning UTC key one local day forward', () => {
    const schedules = [{
      date: '2026-08-24',
      createdAt: '2026-08-19T22:00:00.000Z',
    }];
    const migrated = migrateUtcSlicedScheduleDates(schedules);
    assert.equal(migrated[0].date, '2026-08-25');
    assert.equal(migrated[0].createdAt, '2026-08-19T22:00:00.000Z');
  });
});
