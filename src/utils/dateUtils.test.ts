import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { toLocalDateString } from './dateUtils';
import { isToday, isPast, isFuture } from './statsUtils';

describe('toLocalDateString', () => {
  it('returns local calendar date at 01:00', () => {
    const date = new Date(2026, 7, 20, 1, 0, 0);
    assert.equal(toLocalDateString(date), '2026-08-20');
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
