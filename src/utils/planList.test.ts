import test from 'node:test';
import assert from 'node:assert/strict';
import { clampDuration, defaultStart, findConflict, findNextFreeStart, formatRange, fromMinutes, sortByStart, validateSlot } from './planList';

const items = [
  { id: 'b', startTime: '15:50', endTime: '16:10', name: '독서' },
  { id: 'a', startTime: '15:00', endTime: '15:30', name: '수학' },
  { id: 'c', startTime: '16:30', endTime: '17:10', name: '피아노' },
];

test('formats and sorts', () => {
    assert.equal(fromMinutes(905), '15:05');
    assert.equal(formatRange('15:00', '15:30'), '15:00~15:30');
    assert.deepEqual(sortByStart(items).map(i => i.id), ['a', 'b', 'c']);
  });
test('finds overlaps, including partly covered slots', () => {
    assert.equal(findConflict(items, 15 * 60 + 30, 30)?.id, 'b'); // 15:30~16:00 hits 15:50
    assert.equal(findConflict(items, 15 * 60 + 30, 20), null); // 15:30~15:50 fits
    assert.equal(findConflict(items, 16 * 60 + 10, 20), null);
  });
test('suggests the next free start', () => {
    assert.equal(findNextFreeStart(items, 30, 15 * 60), 17 * 60 + 10);
    assert.equal(findNextFreeStart(items, 20, 15 * 60), 15 * 60 + 30);
    assert.equal(findNextFreeStart([], 30, 23 * 60 + 40), null);
  });
test('validates with a clear Korean message', () => {
    const r = validateSlot(items, 15 * 60 + 10, 30);
    assert.equal(r.ok, false);
    if (!r.ok) {
      assert.equal(r.message, "'수학'(15:00~15:30) 일정과 겹쳐요.");
      assert.equal(r.suggestion, 17 * 60 + 10);
    }
    assert.deepEqual(validateSlot(items, 9 * 60, 30), { ok: true, endTime: '09:30' });
    const late = validateSlot([], 23 * 60 + 50, 30);
    assert.equal(late.ok, false);
    if (!late.ok) assert.equal(late.suggestion, 23 * 60 + 30);
  });
test('clamps duration and picks a default start', () => {
    assert.equal(clampDuration(5), 10);
    assert.equal(clampDuration(999), 240);
    assert.equal(defaultStart([], 30), 7 * 60);
    assert.equal(defaultStart(items, 30), 17 * 60 + 10);
  });

