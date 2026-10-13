import test from 'node:test';
import assert from 'node:assert/strict';
import { filterActivities, orderByUsage, shouldShowSearch } from './activityPicker';

const acts = ['양치', '숙제', '피아노', '태권도'].map((name, i) => ({ id: `a${i}`, name }));
const sch = (date: string, ids: string[]) => ({ date, items: ids.map(activityId => ({ activityId })) });
const ids = (r: { id: string }[]) => r.map(a => a.id);

test('orderByUsage keeps original order with no usage', () => {
  assert.deepEqual(ids(orderByUsage(acts, [])), ['a0', 'a1', 'a2', 'a3']);
});
test('orderByUsage puts most used first', () => {
  assert.deepEqual(ids(orderByUsage(acts, [sch('2026-10-01', ['a2', 'a3']), sch('2026-10-02', ['a2'])])), ['a2', 'a3', 'a0', 'a1']);
});
test('orderByUsage breaks ties by most recent use', () => {
  assert.deepEqual(ids(orderByUsage(acts, [sch('2026-10-01', ['a1']), sch('2026-10-05', ['a3'])])), ['a3', 'a1', 'a0', 'a2']);
});
test('orderByUsage reads joined activity id and does not mutate input', () => {
  const copy = [...acts];
  assert.equal(orderByUsage(acts, [{ date: '2026-10-01', items: [{ activity: { id: 'a3' } }] }])[0].id, 'a3');
  assert.deepEqual(acts, copy);
});
test('filterActivities ignores case and spaces', () => {
  assert.equal(filterActivities(acts, '  ').length, 4);
  assert.deepEqual(filterActivities(acts, '피 아').map(a => a.name), ['피아노']);
  assert.equal(filterActivities([{ id: 'x', name: 'Piano Time' }], 'piano').length, 1);
  assert.deepEqual(filterActivities(acts, '수영'), []);
});
test('search shows only above 8 activities', () => {
  assert.equal(shouldShowSearch(8), false);
  assert.equal(shouldShowSearch(9), true);
});
