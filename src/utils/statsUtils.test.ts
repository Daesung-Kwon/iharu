import test from 'node:test';
import assert from 'node:assert/strict';
import { SoftPopColors } from '../constants/theme';
import { calculateDayStats, getDayDotColor, getDayDotStatus } from './statsUtils';
import { Schedule } from '../types';

const day = (completed: number, total: number): Schedule => ({
  id: 's', userId: 'u', childProfileId: 'c', date: '2026-10-08',
  items: Array.from({ length: total }, (_, i) => ({
    id: `i${i}`, scheduleId: 's', activityId: 'a', startTime: '09:00', endTime: '09:30',
    status: i < completed ? 'completed' : 'planned', orderIndex: i, createdAt: '', updatedAt: '',
  })),
  createdAt: '', updatedAt: '',
});

const colorFor = (completed: number, total: number) =>
  getDayDotColor(getDayDotStatus(calculateDayStats(total ? day(completed, total) : null)));

test('day dot: every planned day that is not fully done is partial blue, 0% included', () => {
  assert.equal(colorFor(0, 4), SoftPopColors.partial); // planned, nothing done yet (was red)
  assert.equal(colorFor(1, 4), SoftPopColors.partial); // 25% (was light orange)
  assert.equal(colorFor(3, 4), SoftPopColors.partial); // 75% (was orange)
  assert.equal(SoftPopColors.partial, '#5B8DEF');
});

test('day dot: fully done is theme complete green, no schedule draws no dot colour', () => {
  assert.equal(colorFor(4, 4), SoftPopColors.complete);
  assert.equal(colorFor(0, 0), null);
  assert.equal(getDayDotStatus({ totalItems: 0, completionRate: 0 }), 'empty');
  assert.equal(getDayDotStatus({ totalItems: 2, completionRate: 100 }), 'complete');
});
