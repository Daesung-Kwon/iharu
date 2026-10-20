/**
 * Pure schedule item updates (ScheduleContext uses these; tests cover them).
 */
import type { Schedule, ScheduleItem } from '../types';

/**
 * Apply `updates` to one item. completedAt is set when the item becomes
 * completed (kept if it already was) and cleared when the status moves
 * away from completed (undo / un-complete).
 */
export function applyItemUpdate(
  item: ScheduleItem,
  updates: Partial<ScheduleItem>,
  nowIso: string,
): ScheduleItem {
  const next: ScheduleItem = { ...item, ...updates, updatedAt: nowIso };
  if (updates.status !== undefined) {
    if (updates.status === 'completed') {
      next.completedAt = item.status === 'completed' && item.completedAt
        ? item.completedAt
        : updates.completedAt ?? nowIso;
    } else {
      delete next.completedAt;
    }
  }
  return next;
}

/** Update one item; only the schedule that holds it gets a new updatedAt. */
export function applyScheduleItemUpdate(
  schedules: Schedule[],
  itemId: string,
  updates: Partial<ScheduleItem>,
  nowIso: string,
): Schedule[] {
  let changed = false;
  const next = schedules.map(schedule => {
    if (!schedule.items.some(item => item.id === itemId)) return schedule;
    changed = true;
    return {
      ...schedule,
      items: schedule.items.map(item =>
        item.id === itemId ? applyItemUpdate(item, updates, nowIso) : item,
      ),
      updatedAt: nowIso,
    };
  });
  return changed ? next : schedules;
}

/** Remove one item; only the schedule that held it gets a new updatedAt. */
export function removeScheduleItemFrom(
  schedules: Schedule[],
  itemId: string,
  nowIso: string,
): Schedule[] {
  let changed = false;
  const next = schedules.map(schedule => {
    if (!schedule.items.some(item => item.id === itemId)) return schedule;
    changed = true;
    return { ...schedule, items: schedule.items.filter(item => item.id !== itemId), updatedAt: nowIso };
  });
  return changed ? next : schedules;
}

/** Copy of an item for another day: fresh, not completed. */
export function resetCopiedItem(
  item: ScheduleItem,
  id: string,
  scheduleId: string,
  nowIso: string,
): ScheduleItem {
  const { completedAt: _completedAt, ...rest } = item;
  return { ...rest, id, scheduleId, status: 'planned', createdAt: nowIso, updatedAt: nowIso };
}
