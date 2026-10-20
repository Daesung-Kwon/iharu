/**
 * Reward goal rate = fully-completed days ÷ days that had at least one item.
 * Days with no items don't count. Today counts only once every item is done
 * (later: also once the parent confirms it). Days after today never count.
 * Pure: dates are local 'YYYY-MM-DD' strings.
 */
import type { Schedule } from '../types';
import { getWeekDatesInWeek, toLocalDateString } from './dateUtils';

type DaySchedule = Pick<Schedule, 'date' | 'items'>;

export interface PeriodRate {
  doneDays: number;
  countedDays: number;
  /** 0-100, same scale as DayStats.completionRate; 0 when nothing counted. */
  rate: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export function isDayFullyDone(schedule: DaySchedule | null | undefined): boolean {
  return !!schedule
    && schedule.items.length > 0
    && schedule.items.every(item => item.status === 'completed');
}

export function periodRate(
  schedules: readonly DaySchedule[],
  start: string,
  end: string,
  today: string,
): PeriodRate {
  const seen = new Set<string>();
  let doneDays = 0;
  let countedDays = 0;
  for (const schedule of schedules) {
    const { date } = schedule;
    if (date < start || date > end || date > today) continue;
    if (seen.has(date)) continue; // one row per day; ignore stray duplicates
    if (schedule.items.length === 0) continue;
    const done = isDayFullyDone(schedule);
    if (date === today && !done) continue;
    seen.add(date);
    countedDays++;
    if (done) doneDays++;
  }
  return {
    doneDays,
    countedDays,
    rate: countedDays > 0 ? (doneDays / countedDays) * 100 : 0,
  };
}

/** Mon-Sun week containing `date`, same as WeekStrip (getWeekDatesInWeek). */
export function getWeekRange(date: Date): DateRange {
  const week = getWeekDatesInWeek(date);
  return { start: toLocalDateString(week[0]), end: toLocalDateString(week[6]) };
}

/** Calendar month containing `date`. */
export function getMonthRange(date: Date): DateRange {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return { start: toLocalDateString(first), end: toLocalDateString(last) };
}
