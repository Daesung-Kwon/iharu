import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isPlanDayEditable, filterEditableDays, confirmCopyToToday, PAST_DAY_NOTICE, type ConfirmButton,
} from './planActions';
import { getWeekdayDatesInWeek } from './dateUtils';

const today = new Date(2026, 9, 15, 14, 30); // Thu 15 Oct 2026, 14:30

describe('isPlanDayEditable', () => {
  it('yesterday and earlier are read-only', () => {
    assert.equal(isPlanDayEditable(new Date(2026, 9, 14, 23, 59), today), false);
    assert.equal(isPlanDayEditable(new Date(2025, 11, 31), today), false);
  });
  it('today stays editable all day, even at 00:00 and 23:59', () => {
    assert.equal(isPlanDayEditable(new Date(2026, 9, 15, 0, 0), today), true);
    assert.equal(isPlanDayEditable(new Date(2026, 9, 15, 23, 59), today), true);
  });
  it('future days are editable, across month and year ends', () => {
    assert.equal(isPlanDayEditable(new Date(2026, 9, 16), today), true);
    assert.equal(isPlanDayEditable(new Date(2027, 0, 1), new Date(2026, 11, 31, 23, 0)), true);
    assert.equal(isPlanDayEditable(new Date(2026, 10, 1), new Date(2026, 9, 31)), true);
  });
  it('has a calm one-line notice', () => {
    assert.equal(PAST_DAY_NOTICE, '지난 날은 기록만 볼 수 있어요');
    assert.ok(!PAST_DAY_NOTICE.includes('\n'));
  });
});

describe('filterEditableDays (월~금 반복)', () => {
  it('skips Mon–Wed when today is Thursday', () => {
    const days = filterEditableDays(getWeekdayDatesInWeek(today), today);
    assert.deepEqual(days.map(d => d.getDate()), [15, 16]);
  });
  it('keeps the whole week when planning ahead', () => {
    const nextWeek = new Date(2026, 9, 20);
    assert.equal(filterEditableDays(getWeekdayDatesInWeek(nextWeek), today).length, 5);
  });
});

describe('confirmCopyToToday', () => {
  const run = (todayHasItems: boolean) => {
    let buttons: ConfirmButton[] = [];
    const calls: boolean[] = [];
    confirmCopyToToday({
      alert: (_t, _m, b) => { buttons = b ?? []; },
      date: new Date(2026, 9, 14), todayHasItems, today, onCopy: o => calls.push(o),
    });
    return { buttons, calls };
  };
  it('copies without overwrite when today is empty', () => {
    const { buttons, calls } = run(false);
    buttons.find(b => b.text === '복사')!.onPress!();
    assert.deepEqual(calls, [false]);
  });
  it('asks before replacing today and cancel does nothing', () => {
    const { buttons, calls } = run(true);
    assert.equal(buttons[0].style, 'cancel');
    assert.equal(buttons[0].onPress, undefined);
    buttons.find(b => b.text === '삭제하고 복사')!.onPress!();
    assert.deepEqual(calls, [true]);
  });
});
