import test from 'node:test';
import assert from 'node:assert/strict';
import type { Schedule } from '../types';
import { BACKUP_READ_KEYS, KEYS, RESET_KEYS } from '../services/storageKeys';
import { judgeEndedWeeks, saveTerms, WeeklyPromise, WeeklyResult } from './weeklyPromise';
import { judgeAll, weekResultCopy } from './weeklyPromises';
import {
  activePromiseWeekStart,
  emptyWeeklyResultNotificationState,
  parseWeeklyResultNotificationEnabled,
  planWeeklyResultNotification,
  stateWithoutUnsentSchedules,
  UPCOMING_WEEKLY_RESULT_COPY,
  weeklyResultNotificationCopy,
  weeklyResultNotificationId,
  weeklyResultNotificationIdsToCancel,
  weeklyResultReadyAt,
  WeeklyResultNotificationState,
} from './weeklyResultNotification';

const day = (date: string, completed: number, total: number): Pick<Schedule, 'date' | 'items'> => ({
  date,
  items: Array.from({ length: total }, (_, i) => ({
    id: `${date}-${i}`, scheduleId: `s-${date}`, activityId: 'a', startTime: '09:00', endTime: '09:30',
    status: i < completed ? 'completed' : 'planned', orderIndex: i, createdAt: '', updatedAt: '',
  })),
});

function promise(id: string, reward: string, goalPercent: number): WeeklyPromise {
  return saveTerms(null, { reward, goalPercent }, { today: '2026-10-12', nowIso: 'n', newId: id });
}

const empty = emptyWeeklyResultNotificationState();

function plan(over: Partial<Parameters<typeof planWeeklyResultNotification>[0]> = {}) {
  return planWeeklyResultNotification({
    enabled: true,
    promises: [],
    results: [],
    schedules: [],
    today: '2026-10-14',
    now: new Date(2026, 9, 14, 15, 0, 0, 0),
    state: empty,
    ...over,
  });
}

test('weekly result notification defaults to on', () => {
  assert.equal(parseWeeklyResultNotificationEnabled(null), true);
  assert.equal(parseWeeklyResultNotificationEnabled(undefined), true);
  assert.equal(parseWeeklyResultNotificationEnabled('true'), true);
  assert.equal(parseWeeklyResultNotificationEnabled(''), true);
  assert.equal(parseWeeklyResultNotificationEnabled('false'), false);
  assert.ok(RESET_KEYS.includes(KEYS.WEEKLY_RESULT_NOTIFICATION));
  assert.ok(RESET_KEYS.includes(KEYS.WEEKLY_RESULT_NOTIFICATION_STATE));
  assert.ok(!BACKUP_READ_KEYS.includes(KEYS.WEEKLY_RESULT_NOTIFICATION));
  assert.ok(!BACKUP_READ_KEYS.includes(KEYS.WEEKLY_RESULT_NOTIFICATION_STATE));
});

test('schedules one Monday-morning notification for the running week, then not again', () => {
  const promises = [promise('promise', '게임', 80), promise('promise-2', '공원', 60)];
  const schedules = [day('2026-10-12', 0, 1)];
  const first = plan({ promises, schedules });
  assert.equal(first.schedule.length, 1, 'one batch, not one per promise');
  assert.equal(first.schedule[0].id, weeklyResultNotificationId('2026-10-12'));
  assert.equal(first.schedule[0].title, UPCOMING_WEEKLY_RESULT_COPY.title);
  assert.equal(first.schedule[0].body, UPCOMING_WEEKLY_RESULT_COPY.body);
  const ready = weeklyResultReadyAt('2026-10-12');
  assert.equal(first.schedule[0].fireAt.getTime(), ready.getTime());
  assert.equal(ready.getHours(), 8);
  assert.equal(ready.getDate(), 19);
  assert.equal(first.cancelIds.length, 0);

  const again = plan({ promises, schedules, state: first.state });
  assert.equal(again.schedule.length, 0);
  assert.equal(again.state.pending.length, 1);
});

test('no notification when the week has a promise but no to-dos', () => {
  const promises = [promise('promise', '게임', 80)];
  assert.equal(activePromiseWeekStart(promises, [], '2026-10-14'), null);
  assert.equal(plan({ promises }).schedule.length, 0);
});

test('toggle off cancels the pending notification; toggle on schedules it once more', () => {
  const promises = [promise('promise', '게임', 80)];
  const schedules = [day('2026-10-12', 1, 1)];
  const scheduled = plan({ promises, schedules });
  assert.equal(scheduled.schedule.length, 1);

  const off = plan({ enabled: false, promises, schedules, state: scheduled.state });
  assert.deepEqual(off.schedule, []);
  assert.deepEqual(off.cancelIds, [weeklyResultNotificationId('2026-10-12')]);
  assert.deepEqual(off.state.pending, []);

  const on = plan({ enabled: true, promises, schedules, state: off.state });
  assert.equal(on.schedule.length, 1);
  assert.equal(on.schedule[0].id, weeklyResultNotificationId('2026-10-12'));
  const duplicate = plan({ enabled: true, promises, schedules, state: on.state });
  assert.equal(duplicate.schedule.length, 0);
});

test('an unseen week fires exactly one notification and reuses the result copy', () => {
  const promises = [promise('promise', '게임', 100), promise('promise-2', '공원', 50)];
  const schedules = [day('2026-10-12', 1, 1), day('2026-10-13', 0, 1), day('2026-10-19', 1, 1)];
  const judged = judgeAll(promises, [], schedules, { today: '2026-10-26', nowIso: 'j' });
  const frozen = JSON.stringify(judged);
  const direct = judgeEndedWeeks(promises[0], [], schedules, { today: '2026-10-26', nowIso: 'j' });
  assert.deepEqual(judged.map(r => [r.id, r.achieved]), [
    ['promise:2026-10-12', false],
    ['promise:2026-10-19', true],
    ['promise-2:2026-10-12', true],
    ['promise-2:2026-10-19', true],
  ]);
  assert.equal(direct[0].achieved, false);
  assert.equal(direct[0].rate, 50);

  const now = new Date(2026, 9, 26, 9, 0, 0, 0);
  const next = plan({ promises, results: judged, schedules, today: '2026-10-26', now });
  assert.equal(JSON.stringify(judged), frozen, 'planning does not change judged results');
  assert.equal(next.schedule.length, 1);
  assert.equal(next.schedule[0].weekStart, '2026-10-19');
  assert.equal(next.schedule[0].id, 'weekly-result:2026-10-19');
  const newest = judged.filter(r => r.weekStart === '2026-10-19');
  const copy = weekResultCopy(newest)!;
  assert.deepEqual(weeklyResultNotificationCopy(newest), { title: copy.title, body: `${copy.body} ${copy.footer}` });
  assert.equal(next.schedule[0].title, copy.title);
  assert.equal(next.schedule[0].body, `${copy.body} ${copy.footer}`);
  assert.equal(next.schedule[0].fireAt.getTime(), now.getTime());
  assert.deepEqual(next.state.notified, ['2026-10-19']);

  const second = plan({ promises, results: judged, schedules, today: '2026-10-26', now, state: next.state });
  assert.equal(second.schedule.length, 0);
});

test('seeing the result before Monday morning cancels the pending notification', () => {
  const promises = [promise('promise', '게임', 80)];
  const schedules = [day('2026-10-12', 1, 1)];
  const judged = judgeAll(promises, [], schedules, { today: '2026-10-19', nowIso: 'j' });
  const seen: WeeklyResult[] = judged.map(r => ({ ...r, seenAt: 'seen' }));
  const ready = weeklyResultReadyAt('2026-10-12');
  const now = new Date(2026, 9, 19, 7, 0, 0, 0);
  assert.ok(ready.getTime() > now.getTime());
  const state: WeeklyResultNotificationState = {
    notified: [],
    pending: [{ weekStart: '2026-10-12', fireAt: ready.toISOString() }],
  };
  const next = plan({ promises, results: seen, schedules, today: '2026-10-19', now, state });
  assert.deepEqual(next.schedule, []);
  assert.deepEqual(next.cancelIds, [weeklyResultNotificationId('2026-10-12')]);
  assert.ok(next.state.notified.includes('2026-10-12'));
  const later = plan({ promises, results: seen, schedules, today: '2026-10-19', now, state: next.state });
  assert.equal(later.schedule.length, 0);
  assert.equal(later.cancelIds.length, 0);
});

test('a schedule that never reached the OS is not remembered', () => {
  const promises = [promise('promise', '게임', 80)];
  const schedules = [day('2026-10-12', 1, 1)];
  const scheduled = plan({ promises, schedules });
  const rolled = stateWithoutUnsentSchedules(empty, scheduled);
  assert.deepEqual(rolled, empty);
  const retry = plan({ promises, schedules, state: rolled });
  assert.equal(retry.schedule.length, 1);
});

test('cancel list drops weekly-result ids only and keeps the one still wanted', () => {
  assert.deepEqual(
    weeklyResultNotificationIdsToCancel(
      ['weekly-result:2026-10-12', 'activity-1', 'weekly-result:2026-10-19'],
      ['weekly-result:2026-10-19'],
    ),
    ['weekly-result:2026-10-12'],
  );
});
