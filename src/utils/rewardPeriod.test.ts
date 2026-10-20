import test from 'node:test';
import assert from 'node:assert/strict';
import { getMonthRange, getWeekRange, isDayFullyDone, periodRate } from './rewardPeriod';
import type { Schedule } from '../types';

const day = (date: string, completed: number, total: number): Pick<Schedule, 'date' | 'items'> => ({
  date,
  items: Array.from({ length: total }, (_, i) => ({
    id: `${date}-${i}`, scheduleId: `schedule-${date}`, activityId: 'a', startTime: '09:00', endTime: '09:30',
    status: i < completed ? 'completed' : 'planned', orderIndex: i, createdAt: '', updatedAt: '',
  })),
});

test('isDayFullyDone: needs at least one item and every item completed', () => {
  assert.equal(isDayFullyDone(null), false);
  assert.equal(isDayFullyDone(undefined), false);
  assert.equal(isDayFullyDone(day('2026-10-19', 0, 0)), false);
  assert.equal(isDayFullyDone(day('2026-10-19', 2, 3)), false);
  assert.equal(isDayFullyDone(day('2026-10-19', 3, 3)), true);
});

test('periodRate: done days over days with items; empty days excluded', () => {
  const r = periodRate(
    [day('2026-10-12', 2, 2), day('2026-10-13', 1, 2), day('2026-10-14', 0, 0), day('2026-10-15', 3, 3)],
    '2026-10-12', '2026-10-18', '2026-10-21',
  );
  assert.deepEqual(r, { doneDays: 2, countedDays: 3, rate: (2 / 3) * 100 });
});

test('periodRate: today counts only when all done; future days never count', () => {
  const week = [day('2026-10-19', 2, 2), day('2026-10-20', 1, 2), day('2026-10-21', 1, 3), day('2026-10-22', 2, 2)];
  assert.deepEqual(periodRate(week, '2026-10-19', '2026-10-25', '2026-10-21'), { doneDays: 1, countedDays: 2, rate: 50 });
  const todayDone = [...week.slice(0, 2), day('2026-10-21', 3, 3), week[3]];
  assert.deepEqual(periodRate(todayDone, '2026-10-19', '2026-10-25', '2026-10-21'), {
    doneDays: 2, countedDays: 3, rate: (2 / 3) * 100,
  });
});

test('periodRate: nothing counted gives rate 0, not NaN', () => {
  assert.deepEqual(periodRate([], '2026-10-01', '2026-10-31', '2026-10-21'), { doneDays: 0, countedDays: 0, rate: 0 });
  assert.deepEqual(periodRate([day('2026-10-21', 0, 2)], '2026-10-19', '2026-10-25', '2026-10-21'), {
    doneDays: 0, countedDays: 0, rate: 0,
  });
});

test('periodRate: start and end are inclusive; outside days and duplicate rows ignored', () => {
  const rows = [
    day('2026-09-30', 1, 1), day('2026-10-01', 1, 1), day('2026-10-01', 0, 1),
    day('2026-10-31', 0, 1), day('2026-11-01', 1, 1),
  ];
  assert.deepEqual(periodRate(rows, '2026-10-01', '2026-10-31', '2026-11-05'), { doneDays: 1, countedDays: 2, rate: 50 });
});

test('getWeekRange: Mon-Sun like WeekStrip, across months and years', () => {
  assert.deepEqual(getWeekRange(new Date(2026, 9, 19)), { start: '2026-10-19', end: '2026-10-25' }); // Monday
  assert.deepEqual(getWeekRange(new Date(2026, 9, 25)), { start: '2026-10-19', end: '2026-10-25' }); // Sunday
  assert.deepEqual(getWeekRange(new Date(2026, 8, 30)), { start: '2026-09-28', end: '2026-10-04' });
  assert.deepEqual(getWeekRange(new Date(2026, 11, 31)), { start: '2026-12-28', end: '2027-01-03' });
});

test('getMonthRange: month ends incl. February and leap years', () => {
  assert.deepEqual(getMonthRange(new Date(2026, 9, 19)), { start: '2026-10-01', end: '2026-10-31' });
  assert.deepEqual(getMonthRange(new Date(2026, 1, 15)), { start: '2026-02-01', end: '2026-02-28' });
  assert.deepEqual(getMonthRange(new Date(2028, 1, 29)), { start: '2028-02-01', end: '2028-02-29' });
  assert.deepEqual(getMonthRange(new Date(2026, 11, 31)), { start: '2026-12-01', end: '2026-12-31' });
  assert.deepEqual(getMonthRange(new Date(2026, 3, 30)), { start: '2026-04-01', end: '2026-04-30' });
});

test('periodRate over a week that spans two months uses that week only', () => {
  const { start, end } = getWeekRange(new Date(2026, 8, 30));
  const rows = [day('2026-09-27', 1, 1), day('2026-09-28', 1, 1), day('2026-10-04', 0, 2), day('2026-10-05', 1, 1)];
  assert.deepEqual(periodRate(rows, start, end, '2026-10-10'), { doneDays: 1, countedDays: 2, rate: 50 });
});
