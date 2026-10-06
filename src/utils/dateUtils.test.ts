import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  toLocalDateString,
  migrateUtcSlicedScheduleDates,
  combineLocalDateAndTime,
  getActivityNotificationTime,
  getWeekdayDatesInWeek,
  getWeekDatesInWeek,
  getShiftedWeekDate,
  formatWeekRangeKo,
} from './dateUtils';
import { countCompleteDays, getWeekOverview, isToday, isPast, isFuture } from './statsUtils';
import { Schedule } from '../types';

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

  it('honors a custom lead time including 0 minutes', () => {
    const atStart = getActivityNotificationTime('2026-08-20', '09:00', 0);
    assert.equal(atStart.getHours(), 9);
    assert.equal(atStart.getMinutes(), 0);
    const tenBefore = getActivityNotificationTime('2026-08-20', '09:00', 10);
    assert.equal(tenBefore.getHours(), 8);
    assert.equal(tenBefore.getMinutes(), 50);
  });
});

describe('getWeekdayDatesInWeek', () => {
  it('returns Mon–Fri for a Wednesday', () => {
    const days = getWeekdayDatesInWeek(new Date(2026, 7, 19));
    assert.deepEqual(
      days.map(toLocalDateString),
      ['2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21'],
    );
  });
});

describe('getWeekDatesInWeek', () => {
  it('returns Mon–Sun for a Sunday', () => {
    const days = getWeekDatesInWeek(new Date(2026, 7, 23));
    assert.deepEqual(
      days.map(toLocalDateString),
      ['2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23'],
    );
  });
});

describe('getWeekOverview', () => {
  const week = getWeekDatesInWeek(new Date(2026, 7, 19));

  const schedule = (
    date: string,
    completed: number,
    total: number,
  ): Schedule => ({
    id: `schedule-${date}`,
    userId: 'u',
    childProfileId: 'c',
    date,
    items: Array.from({ length: total }, (_, index) => ({
      id: `${date}-${index}`,
      scheduleId: `schedule-${date}`,
      activityId: 'a',
      startTime: '09:00',
      endTime: '09:30',
      status: index < completed ? 'completed' : 'planned',
      orderIndex: index,
      createdAt: '',
      updatedAt: '',
    })),
    createdAt: '',
    updatedAt: '',
  });

  it('marks empty / partial / complete days and counts kept days', () => {
    const overview = getWeekOverview(week, [
      schedule('2026-08-17', 2, 2),
      schedule('2026-08-18', 1, 2),
    ]);
    assert.equal(overview[0].status, 'complete');
    assert.equal(overview[1].status, 'partial');
    assert.equal(overview[2].status, 'empty');
    assert.equal(countCompleteDays(overview), 1);
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

describe('getShiftedWeekDate (phone week strip arrows)', () => {
  const today = new Date(2026, 9, 5, 15, 0); // Mon 2026-10-05 15:00

  it('moves to the same weekday of the previous / next week', () => {
    const wed = new Date(2026, 9, 7);
    assert.equal(toLocalDateString(getShiftedWeekDate(wed, -1, today)!), '2026-09-30');
    assert.equal(toLocalDateString(getShiftedWeekDate(wed, 1, today)!), '2026-10-14');
  });

  it('lands on today when the target week contains today', () => {
    const lastWeekFri = new Date(2026, 9, 2);
    assert.equal(toLocalDateString(getShiftedWeekDate(lastWeekFri, 1, today)!), '2026-10-05');
  });

  it('clamps into the 30-day past range and stops beyond it', () => {
    // 2026-09-07 is a Monday; today - 30 = 2026-09-05 (Sat).
    const mon = new Date(2026, 8, 7);
    assert.equal(toLocalDateString(getShiftedWeekDate(mon, -1, today)!), '2026-09-05');
    const sat = new Date(2026, 8, 5);
    assert.equal(getShiftedWeekDate(sat, -1, today), null);
  });

  it('clamps into the 90-day future range and stops beyond it', () => {
    // today + 90 = 2027-01-03 (Sun).
    const sun = new Date(2026, 11, 27);
    assert.equal(toLocalDateString(getShiftedWeekDate(sun, 1, today)!), '2027-01-03');
    const fri = new Date(2027, 0, 1);
    assert.equal(getShiftedWeekDate(fri, 1, today), null);
  });
});

describe('formatWeekRangeKo', () => {
  it('formats a week within one month', () => {
    assert.equal(formatWeekRangeKo(getWeekDatesInWeek(new Date(2026, 9, 5))), '10월 5일 ~ 11일');
  });

  it('formats a week that spans two months', () => {
    assert.equal(formatWeekRangeKo(getWeekDatesInWeek(new Date(2026, 9, 1))), '9월 28일 ~ 10월 4일');
  });
});
