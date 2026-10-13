import test from 'node:test';
import assert from 'node:assert/strict';
import { getItemSpan, layoutTimelineItems, minuteToY, TimelineGrid } from './timelineLayout';

const grid: TimelineGrid = { startHour: 0, endHour: 24, slotMinutes: 30, slotHeight: 80 };
const at = (id: string, startTime: string, endTime?: string, durationMinutes?: number) =>
  ({ id, startTime, endTime, durationMinutes });

test('15:50 for 20 minutes sits between slots at its true offset and height', () => {
  const [b] = layoutTimelineItems([at('a', '15:50', '16:10')], grid);
  assert.equal(b.top, (950 / 30) * 80); // 2533.33...
  assert.ok(Math.abs(b.height - (20 / 30) * 80) < 1e-9); // 53.33
  assert.deepEqual([b.lane, b.laneCount], [0, 1]);
});

test('09:00 for 30 minutes fills exactly one slot', () => {
  const [b] = layoutTimelineItems([at('a', '09:00', '09:30')], grid);
  assert.equal(b.top, 18 * 80);
  assert.equal(b.height, 80);
});

test('item spanning several slots keeps its full height', () => {
  const [b] = layoutTimelineItems([at('a', '10:15', '11:45')], grid);
  assert.equal(b.top, minuteToY(615, grid));
  assert.equal(b.height, 3 * 80);
});

test('23:50 near midnight is clipped at 24:00 (endTime "24:10" or "00:10")', () => {
  for (const end of ['24:10', '00:10']) {
    const [b] = layoutTimelineItems([at('a', '23:50', end, 20)], grid);
    assert.equal(b.top, (1430 / 30) * 80);
    assert.ok(Math.abs(b.height - (10 / 30) * 80) < 1e-9);
    assert.equal(b.top + b.height, 48 * 80);
  }
});

test('missing endTime falls back to duration; zero-length or off-grid items are skipped', () => {
  assert.deepEqual(getItemSpan(at('a', '08:05', undefined, 25), grid), { startMin: 485, endMin: 510 });
  assert.equal(getItemSpan(at('b', '08:00', '08:00', 0), grid), null);
  assert.equal(layoutTimelineItems([at('c', '05:00', '06:00')], { ...grid, startHour: 7 }).length, 0);
});

test('overlapping items get side-by-side lanes; touching items do not', () => {
  const blocks = layoutTimelineItems([
    at('a', '15:30', '16:30'),
    at('b', '15:50', '16:10'),
    at('c', '16:10', '16:40'), // overlaps a, touches b
    at('d', '17:00', '17:30'), // separate cluster
  ], grid);
  const byId = Object.fromEntries(blocks.map(b => [b.id, b]));
  assert.deepEqual([byId.a.lane, byId.a.laneCount], [0, 2]);
  assert.deepEqual([byId.b.lane, byId.b.laneCount], [1, 2]);
  assert.deepEqual([byId.c.lane, byId.c.laneCount], [1, 2]);
  assert.deepEqual([byId.d.lane, byId.d.laneCount], [0, 1]);
});
