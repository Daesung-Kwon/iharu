import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { groupActivitiesByUsage } from './activityGroups';
import { formatLastBackup } from './lastBackup';

const acts = [
  { id: 'a', name: '숙제', category: 'study' },
  { id: 'b', name: '책', category: 'reading' },
  { id: 'c', name: '수학', category: 'study' },
  { id: 'd', name: '놀이', category: 'play' },
];
const sched = [
  { date: '2026-10-10', items: [{ activityId: 'b' }, { activityId: 'b' }, { activityId: 'c' }] },
  { date: '2026-10-11', items: [{ activityId: 'c' }, { activityId: 'b' }] },
];

describe('groupActivitiesByUsage', () => {
  it('orders groups and items most used first', () => {
    const more = [...acts, { id: 'e', name: '동화', category: 'reading' }, { id: 'f', name: '블록', category: 'play' }];
    const g = groupActivitiesByUsage(more, sched);
    assert.deepEqual(g.map(x => x.label), ['독서', '공부', '놀이']);
    assert.deepEqual(g[1].items.map(x => x.id), ['c', 'a']);
  });
  it('stays one flat usage-ordered grid when groups would be mostly single cards', () => {
    const g = groupActivitiesByUsage(acts, sched);
    assert.equal(g.length, 1);
    assert.equal(g[0].label, null);
    assert.deepEqual(g[0].items.map(x => x.id), ['b', 'c', 'a', 'd']);
  });
  it('drops the header when there is only one category', () => {
    const g = groupActivitiesByUsage(acts.filter(a => a.category === 'study'), []);
    assert.equal(g.length, 1);
    assert.equal(g[0].label, null);
  });
  it('handles no activities', () => {
    assert.deepEqual(groupActivitiesByUsage([], []), []);
  });
});

describe('formatLastBackup', () => {
  it('formats M/D HH:mm in local time', () => {
    assert.equal(formatLastBackup(new Date(2026, 9, 4, 9, 5).toISOString()), '마지막 백업: 10/4 09:05');
  });
  it('explains when never backed up', () => {
    assert.equal(formatLastBackup(null), '아직 백업하지 않았어요');
    assert.equal(formatLastBackup('garbage'), '아직 백업하지 않았어요');
  });
});
