import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dayDoneMoment, feedbackForToggle, getDayProgress, msUntilNextLocalMidnight, rolloverSelectedDate,
} from './instantReward';
import { toLocalDateString } from './dateUtils';

const s = (...st: Array<'planned' | 'completed'>) => st.map(status => ({ status }));

test('progress: done/total, empty day is 0 and not all done', () => {
  assert.deepEqual(getDayProgress([]), { done: 0, total: 0, ratio: 0, allDone: false });
  assert.deepEqual(getDayProgress(s('completed', 'planned', 'planned', 'completed')), {
    done: 2, total: 4, ratio: 0.5, allDone: false,
  });
  assert.equal(getDayProgress(s('completed', 'completed')).allDone, true);
});

test('haptic: light on check, success on the last one, none on uncheck', () => {
  assert.equal(feedbackForToggle(true, false), 'light');
  assert.equal(feedbackForToggle(true, true), 'success');
  assert.equal(feedbackForToggle(false, false), 'none');
});

test('celebration only once per day; undo + re-check is quiet; new day celebrates again', () => {
  const base = { completesDay: true, isToday: true, today: '2026-10-20' };
  assert.equal(dayDoneMoment({ ...base, lastCelebratedDay: null }), 'celebrate');
  assert.equal(dayDoneMoment({ ...base, lastCelebratedDay: '2026-10-20' }), 'quiet');
  assert.equal(dayDoneMoment({ ...base, today: '2026-10-21', lastCelebratedDay: '2026-10-20' }), 'celebrate');
  assert.equal(dayDoneMoment({ ...base, completesDay: false, lastCelebratedDay: null }), 'none');
  assert.equal(dayDoneMoment({ ...base, isToday: false, lastCelebratedDay: null }), 'none');
});

test('ms until next local midnight', () => {
  assert.equal(msUntilNextLocalMidnight(new Date(2026, 9, 20, 23, 59, 30)), 30_000);
  assert.equal(msUntilNextLocalMidnight(new Date(2026, 9, 31, 23, 0, 0)), 3_600_000); // month end
  assert.equal(msUntilNextLocalMidnight(new Date(2026, 9, 20, 0, 0, 0)), 24 * 3_600_000);
});

test('rollover: a screen on the old today moves to the new today', () => {
  const next = rolloverSelectedDate(new Date(2026, 9, 20, 9), '2026-10-20', new Date(2026, 9, 21, 0, 0, 5));
  assert.ok(next);
  assert.equal(toLocalDateString(next), '2026-10-21');
  assert.equal(next.getHours(), 0);
});

test('rollover: same day or a deliberately chosen other day stays', () => {
  assert.equal(rolloverSelectedDate(new Date(2026, 9, 20), '2026-10-20', new Date(2026, 9, 20, 23)), null);
  assert.equal(rolloverSelectedDate(new Date(2026, 9, 25), '2026-10-20', new Date(2026, 9, 21, 7)), null);
});

test('rollover across a month and year end', () => {
  const next = rolloverSelectedDate(new Date(2026, 11, 31, 22), '2026-12-31', new Date(2027, 0, 1, 8));
  assert.ok(next);
  assert.equal(toLocalDateString(next), '2027-01-01');
});
