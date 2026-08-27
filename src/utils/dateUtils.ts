import { format } from 'date-fns';

/** Local YYYY-MM-DD — UTC ISO slicing maps KST 00:00–08:59 to yesterday. */
export const toLocalDateString = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

/** Parse YYYY-MM-DD as a local calendar date (not UTC). */
export const parseLocalDateString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/** Combine a local date (Date or YYYY-MM-DD) with HH:MM into a local Date. */
export const combineLocalDateAndTime = (date: Date | string, timeHHmm: string): Date => {
  const base = typeof date === 'string'
    ? parseLocalDateString(date)
    : new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const [hours, minutes] = timeHHmm.split(':').map(Number);
  base.setHours(hours, minutes, 0, 0);
  return base;
};

/** Activity notification time: schedule date + startTime − leadMinutes. */
export const getActivityNotificationTime = (
  scheduleDate: Date | string,
  startTime: string,
  leadMinutes = 5
): Date => {
  const time = combineLocalDateAndTime(scheduleDate, startTime);
  time.setMinutes(time.getMinutes() - leadMinutes);
  return time;
};

/** Mon–Fri of the week that contains `date` (local calendar). */
export const getWeekdayDatesInWeek = (date: Date): Date[] => {
  const mondayOffset = (date.getDay() + 6) % 7;
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayOffset);
  return [0, 1, 2, 3, 4].map(offset => (
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset)
  ));
};

export const NOTIFICATION_LEAD_OPTIONS = [0, 5, 10] as const;
export type NotificationLeadMinutes = (typeof NOTIFICATION_LEAD_OPTIONS)[number];

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
