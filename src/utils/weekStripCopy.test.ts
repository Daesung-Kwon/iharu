import test from 'node:test';
import assert from 'node:assert/strict';
import { weekKeptLine, weekKeptSummary } from './weekStripCopy';

const OLD_EMPTY = '아직 지킨 날이 없어요';

test('zero kept days use a short calm line', () => {
  assert.equal(weekKeptSummary(0), '아직이에요');
  assert.equal(weekKeptLine(0, true), '이번 주 아직이에요');
  assert.equal(weekKeptLine(0, false), '아직이에요');
  assert.equal(weekKeptSummary(0).includes(OLD_EMPTY), false);
  assert.equal(weekKeptLine(0, true).includes(OLD_EMPTY), false);
  // Today line stays one line on SE 375pt (numberOfLines={1}).
  assert.ok(weekKeptLine(0, true).length < `이번 주 ${OLD_EMPTY}`.length);
});

test('kept days stay a compliment', () => {
  assert.equal(weekKeptSummary(1), '1일 지켰어요');
  assert.equal(weekKeptSummary(3), '3일 지켰어요');
  assert.equal(weekKeptLine(3, true), '이번 주 3일 지켰어요');
  assert.equal(weekKeptLine(3, false), '3일 지켰어요');
});
