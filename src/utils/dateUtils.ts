import { format } from 'date-fns';

/** Load-path guard so future morning keys are not +1 on every cold start. */
export const UTC_DATE_MIGRATION_KEY = '@daily_schedule_utc_date_keys_migrated';

/** Local YYYY-MM-DD — UTC ISO slicing maps KST 00:00–08:59 to yesterday. */
export const toLocalDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

const addOneLocalDay = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  return toLocalDateString(new Date(year, month - 1, day + 1));
};

/** KST-morning UTC keys (createdAt hour ≥ 15) that are not already on createdAt's local day. */
const isUtcSlicedMorningRow = (schedule: { date: string; createdAt: string }): boolean => {
  if (!schedule.createdAt) {
    return false;
  }
  const created = new Date(schedule.createdAt);
  if (Number.isNaN(created.getTime()) || created.getUTCHours() < 15) {
    return false;
  }
  return schedule.date !== toLocalDateString(created);
};

/**
 * Move leftover KST-morning UTC keys one local day forward.
 * Occupied dates are rows that will not migrate; migrants are not treated as occupants.
 */
export const migrateUtcSlicedScheduleDates = <T extends { date: string; createdAt: string }>(
  schedules: T[]
): T[] => {
  const occupied = new Set(
    schedules.filter(schedule => !isUtcSlicedMorningRow(schedule)).map(schedule => schedule.date)
  );
  let changed = false;
  const next = schedules.map(schedule => {
    if (!isUtcSlicedMorningRow(schedule)) {
      return schedule;
    }
    const localDate = addOneLocalDay(schedule.date);
    if (occupied.has(localDate)) {
      return schedule;
    }
    occupied.add(localDate);
    changed = true;
    return { ...schedule, date: localDate };
  });
  return changed ? next : schedules;
};
