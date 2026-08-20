import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  toLocalDateString,
  migrateUtcSlicedScheduleDates,
  combineLocalDateAndTime,
  getActivityNotificationTime,
} from './dateUtils';
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

describe('combineLocalDateAndTime / getActivityNotificationTime', () => {
  it('combines YYYY-MM-DD and HH:MM into a local Date', () => {
    const result = combineLocalDateAndTime('2026-08-20', '09:30');
    assert.equal(result.getFullYear(), 2026);
    assert.equal(result.getMonth(), 7);
    assert.equal(result.getDate(), 20);
    assert.equal(result.getHours(), 9);
    assert.equal(result.getMinutes(), 30);
  });

  it('uses the local calendar date from a Date argument, not UTC', () => {
    const date = new Date(2026, 7, 20, 1, 0, 0);
    const result = combineLocalDateAndTime(date, '08:00');
    assert.equal(toLocalDateString(result), '2026-08-20');
    assert.equal(result.getHours(), 8);
  });

  it('schedules 5 minutes before startTime on that calendar day', () => {
    const result = getActivityNotificationTime('2026-08-25', '09:00');
    assert.equal(toLocalDateString(result), '2026-08-25');
    assert.equal(result.getHours(), 8);
    assert.equal(result.getMinutes(), 55);
  });

  it('does not fall back to today when given a future YYYY-MM-DD', () => {
    const result = getActivityNotificationTime('2026-12-01', '07:10');
    assert.equal(toLocalDateString(result), '2026-12-01');
    assert.equal(result.getHours(), 7);
    assert.equal(result.getMinutes(), 5);
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
    assert.equal(migrated[0].dateKind, 'local');
    assert.equal(migrated[0].createdAt, '2026-08-19T16:00:00.000Z');
  });

  it('migrates an unmarked row once; a second pass is a no-op', () => {
    const schedules = [{
      date: '2026-08-19',
      createdAt: '2026-08-19T16:00:00.000Z',
    }];
    const once = migrateUtcSlicedScheduleDates(schedules);
    assert.equal(once[0].date, '2026-08-20');
    assert.equal(once[0].dateKind, 'local');
    const twice = migrateUtcSlicedScheduleDates(once);
    assert.equal(twice, once);
  });

  it('never shifts a row already marked dateKind local', () => {
    const schedules = [{
      date: '2026-08-25',
      createdAt: '2026-08-19T22:00:00.000Z',
      dateKind: 'local' as const,
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
    assert.deepEqual(migrated.map(schedule => schedule.dateKind), ['local', 'local']);
  });

  it('shifts a future-day morning UTC key one local day forward', () => {
    const schedules = [{
      date: '2026-08-24',
      createdAt: '2026-08-19T22:00:00.000Z',
    }];
    const migrated = migrateUtcSlicedScheduleDates(schedules);
    assert.equal(migrated[0].date, '2026-08-25');
    assert.equal(migrated[0].dateKind, 'local');
    assert.equal(migrated[0].createdAt, '2026-08-19T22:00:00.000Z');
  });
});
