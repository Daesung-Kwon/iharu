import { format } from 'date-fns';

/** Local YYYY-MM-DD — UTC ISO slicing maps KST 00:00–08:59 to yesterday. */
export const toLocalDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * Rewrite leftover UTC-sliced morning keys so they match the local calendar day.
 * Idempotent: after a rewrite, date no longer equals createdAt's UTC prefix.
 */
export const migrateUtcSlicedScheduleDates = <T extends { date: string; createdAt: string }>(
  schedules: T[]
): T[] => {
  const occupied = new Set(schedules.map(schedule => schedule.date));
  let changed = false;
  const next = schedules.map(schedule => {
    if (!schedule.createdAt || schedule.date !== schedule.createdAt.slice(0, 10)) {
      return schedule;
    }
    const created = new Date(schedule.createdAt);
    if (Number.isNaN(created.getTime()) || created.getUTCHours() < 15) {
      return schedule;
    }
    const localDate = toLocalDateString(created);
    if (localDate === schedule.date || occupied.has(localDate)) {
      return schedule;
    }
    occupied.delete(schedule.date);
    occupied.add(localDate);
    changed = true;
    return { ...schedule, date: localDate };
  });
  return changed ? next : schedules;
};
