import { format } from 'date-fns';

/** Local YYYY-MM-DD — UTC ISO slicing maps KST 00:00–08:59 to yesterday. */
export const toLocalDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

const addOneLocalDay = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  return toLocalDateString(new Date(year, month - 1, day + 1));
};

type MigratableSchedule = {
  date: string;
  createdAt: string;
  dateKind?: 'local';
};

/** Unmarked KST-morning UTC keys (createdAt hour ≥ 15) that are not already on createdAt's local day. */
const isUtcSlicedMorningRow = (schedule: MigratableSchedule): boolean => {
  if (schedule.dateKind === 'local' || !schedule.createdAt) {
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
 * Occupancy leftovers stay unmarked; successful rewrites set dateKind local.
 */
export const migrateUtcSlicedScheduleDates = <T extends MigratableSchedule>(
  schedules: T[]
): Array<T & { dateKind?: 'local' }> => {
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
    return { ...schedule, date: localDate, dateKind: 'local' as const };
  });
  return changed ? next : schedules;
};
