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

const startOfLocalWeekMonday = (date: Date): Date => {
  const mondayOffset = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayOffset);
};

/** Mon–Fri of the week that contains `date` (local calendar). */
export const getWeekdayDatesInWeek = (date: Date): Date[] => {
  const monday = startOfLocalWeekMonday(date);
  return [0, 1, 2, 3, 4].map(offset => (
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset)
  ));
};

/** Mon–Sun of the week that contains `date` (local calendar). */
export const getWeekDatesInWeek = (date: Date): Date[] => {
  const monday = startOfLocalWeekMonday(date);
  return [0, 1, 2, 3, 4, 5, 6].map(offset => (
    new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + offset)
  ));
};

/** Same navigable range as HorizontalDatePicker (past 30 / future 90 days). */
export const DATE_NAV_PAST_DAYS = 30;
export const DATE_NAV_FUTURE_DAYS = 90;

const startOfLocalDay = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Date to select after moving `deltaWeeks` weeks from `selected` (phone week
 * strip arrows). Keeps the weekday, lands on today when the target week
 * contains it, clamps into [today - pastDays, today + futureDays], and returns
 * null when the whole target week is outside that range (arrow disabled).
 */
export const getShiftedWeekDate = (
  selected: Date,
  deltaWeeks: number,
  today: Date = new Date(),
  pastDays: number = DATE_NAV_PAST_DAYS,
  futureDays: number = DATE_NAV_FUTURE_DAYS,
): Date | null => {
  const base = new Date(
    selected.getFullYear(),
    selected.getMonth(),
    selected.getDate() + deltaWeeks * 7,
  );
  const todayStart = startOfLocalDay(today);
  const min = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() - pastDays);
  const max = new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() + futureDays);
  const week = getWeekDatesInWeek(base);
  const todayString = toLocalDateString(todayStart);
  if (week.some(day => toLocalDateString(day) === todayString)) {
    return todayStart;
  }
  if (week[6].getTime() < min.getTime() || week[0].getTime() > max.getTime()) {
    return null;
  }
  if (base.getTime() < min.getTime()) return min;
  if (base.getTime() > max.getTime()) return max;
  return base;
};

/**
 * "10월 5일 ~ 11일", or "9월 28일 ~ 10월 4일" when the week spans months.
 * ASCII "~" on purpose: the BMJUA font has no en dash / middle dot glyphs.
 */
export const formatWeekRangeKo = (weekDates: Date[]): string => {
  const first = weekDates[0];
  const last = weekDates[weekDates.length - 1];
  const left = `${first.getMonth() + 1}월 ${first.getDate()}일`;
  const right = first.getMonth() === last.getMonth()
    ? `${last.getDate()}일`
    : `${last.getMonth() + 1}월 ${last.getDate()}일`;
  return `${left} ~ ${right}`;
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
