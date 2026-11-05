/**
 * Instant-reward rules for the Today check flow (pure, tested).
 * - progress: done / total for the bar
 * - celebration: the big "all done" moment once per day; a later undo and
 *   re-check gets a quiet line instead of the modal again
 * - day rollover: when the date changes while the app is open, a screen that
 *   was showing "today" moves to the new today
 */
import { toLocalDateString } from './dateUtils';
import type { ScheduleItemStatus } from '../types';

export interface DayProgress {
  done: number;
  total: number;
  /** 0..1 */
  ratio: number;
  allDone: boolean;
}

export function getDayProgress(items: readonly { status: ScheduleItemStatus }[]): DayProgress {
  const total = items.length;
  const done = items.filter(i => i.status === 'completed').length;
  return { done, total, ratio: total > 0 ? done / total : 0, allDone: total > 0 && done === total };
}

export type CompletionFeedback = 'none' | 'light' | 'success';

/** Haptic for one toggle: light on a check, success when it finishes the day, none on uncheck. */
export function feedbackForToggle(completedNow: boolean, completesDay: boolean): CompletionFeedback {
  if (!completedNow) return 'none';
  return completesDay ? 'success' : 'light';
}

export type DayDoneMoment = 'celebrate' | 'quiet' | 'none';

/**
 * What finishing the day shows. The modal only the first time per day; after
 * that (undo then check again) a short line, so it never feels like a slot
 * machine and the child can't farm it.
 */
export function dayDoneMoment(params: {
  completesDay: boolean;
  isToday: boolean;
  today: string;
  lastCelebratedDay: string | null;
}): DayDoneMoment {
  const { completesDay, isToday, today, lastCelebratedDay } = params;
  if (!completesDay || !isToday) return 'none';
  return lastCelebratedDay === today ? 'quiet' : 'celebrate';
}

export const DAY_DONE_QUIET_MESSAGE = '오늘 할 일을 다 끝냈어요';

/** Milliseconds until the next local midnight (at least 1). */
export function msUntilNextLocalMidnight(now: Date): number {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return Math.max(1, next.getTime() - now.getTime());
}

/**
 * New selected date after the calendar day changed from `prevToday`
 * ('YYYY-MM-DD') to the day of `now`. Only a screen that was on the old today
 * follows; a deliberately chosen other day stays. null = keep the selection.
 */
export function rolloverSelectedDate(selected: Date, prevToday: string, now: Date): Date | null {
  const today = toLocalDateString(now);
  if (today === prevToday) return null;
  if (toLocalDateString(selected) !== prevToday) return null;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
