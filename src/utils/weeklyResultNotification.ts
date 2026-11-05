/**
 * One local notification per weekly-promise result batch.
 *
 * Week judging stays in weeklyPromise / weeklyPromises. This only decides
 * whether to schedule or cancel, and reuses weekResultCopy for the text.
 *
 * A batch is the newest unseen week (one or many promises). The same week
 * is never scheduled twice. While the week is still running and already has
 * to-dos, the notification is scheduled for the next Monday at 08:00 local
 * so it still fires if the app is backgrounded or killed. After that moment,
 * an unseen batch is scheduled once, immediately.
 */
import type { Schedule } from '../types';
import {
  addDays, termsForWeek, weekOf, WeeklyPromise, WeeklyResult,
} from './weeklyPromise';
import { latestUnseenWeek, weekResultCopy } from './weeklyPromises';

type DaySchedule = Pick<Schedule, 'date' | 'items'>;

export const WEEKLY_RESULT_NOTIFICATION_PREFIX = 'weekly-result:';
/** Monday morning, local time, once the new week (and its result) has started. */
export const WEEKLY_RESULT_NOTIFY_HOUR = 8;

export const UPCOMING_WEEKLY_RESULT_COPY = {
  title: '지난주 약속 결과가 나왔어요',
  body: '앱을 열면 결과를 볼 수 있어요',
} as const;

export interface WeeklyResultNotificationState {
  /** Weeks already sent, or already seen, so they are not sent again. */
  notified: string[];
  /** Future notifications still sitting on the OS. */
  pending: { weekStart: string; fireAt: string }[];
}

export interface ScheduledWeeklyResultNotification {
  id: string;
  weekStart: string;
  fireAt: Date;
  title: string;
  body: string;
}

export interface WeeklyResultNotificationPlan {
  schedule: ScheduledWeeklyResultNotification[];
  cancelIds: string[];
  state: WeeklyResultNotificationState;
}

const WEEK_RE = /^\d{4}-\d{2}-\d{2}$/;

export function emptyWeeklyResultNotificationState(): WeeklyResultNotificationState {
  return { notified: [], pending: [] };
}

/** Missing or unrecognized values stay on. Only the string 'false' turns it off. */
export function parseWeeklyResultNotificationEnabled(stored: string | null | undefined): boolean {
  return stored !== 'false';
}

export function parseWeeklyResultNotificationState(raw: string | null | undefined): WeeklyResultNotificationState {
  if (!raw) return emptyWeeklyResultNotificationState();
  try {
    const v = JSON.parse(raw) as { notified?: unknown; pending?: unknown };
    const notified = Array.isArray(v.notified) ? v.notified.filter(isWeek) : [];
    const pending = Array.isArray(v.pending)
      ? v.pending.flatMap(item => {
        if (!item || typeof item !== 'object') return [];
        const row = item as { weekStart?: unknown; fireAt?: unknown };
        if (!isWeek(row.weekStart) || typeof row.fireAt !== 'string') return [];
        return [{ weekStart: row.weekStart, fireAt: row.fireAt }];
      })
      : [];
    return { notified, pending };
  } catch {
    return emptyWeeklyResultNotificationState();
  }
}

export function weeklyResultNotificationId(weekStart: string): string {
  return `${WEEKLY_RESULT_NOTIFICATION_PREFIX}${weekStart}`;
}

/** 08:00 local on the Monday after `weekStart`. */
export function weeklyResultReadyAt(weekStart: string): Date {
  const [year, month, day] = addDays(weekStart, 7).split('-').map(Number);
  return new Date(year, month - 1, day, WEEKLY_RESULT_NOTIFY_HOUR, 0, 0, 0);
}

/** Modal copy, one string, for the whole batch. */
export function weeklyResultNotificationCopy(
  results: readonly WeeklyResult[],
): { title: string; body: string } | null {
  const copy = weekResultCopy(results);
  if (!copy) return null;
  return { title: copy.title, body: `${copy.body} ${copy.footer}` };
}

/**
 * Monday of the week that is still running, has a promise, and already has
 * to-dos (so the existing judge will produce a result). Not a second judge.
 */
export function activePromiseWeekStart(
  promises: readonly WeeklyPromise[],
  schedules: readonly DaySchedule[],
  today: string,
): string | null {
  const start = weekOf(today).start;
  if (!promises.some(p => termsForWeek(p, start))) return null;
  const end = addDays(start, 6);
  const hasTodos = schedules.some(s => s.date >= start && s.date <= end && s.items.length > 0);
  return hasTodos ? start : null;
}

export function planWeeklyResultNotification(input: {
  enabled: boolean;
  promises: readonly WeeklyPromise[];
  results: readonly WeeklyResult[];
  schedules: readonly DaySchedule[];
  today: string;
  now: Date;
  state: WeeklyResultNotificationState;
}): WeeklyResultNotificationPlan {
  const notified = new Set(input.state.notified.filter(isWeek));
  const pending = dedupePending(input.state.pending);

  if (!input.enabled) {
    return {
      schedule: [],
      cancelIds: pending.map(p => weeklyResultNotificationId(p.weekStart)),
      state: { notified: trimWeeks(notified), pending: [] },
    };
  }

  const desired = desiredBatches(input);
  const desiredWeeks = new Set(desired.map(d => d.weekStart));
  const pendingByWeek = new Map(pending.map(p => [p.weekStart, p]));
  const schedule: ScheduledWeeklyResultNotification[] = [];
  const nextPending: WeeklyResultNotificationState['pending'] = [];
  const cancelIds: string[] = [];

  for (const batch of desired) {
    if (notified.has(batch.weekStart)) continue;
    const existing = pendingByWeek.get(batch.weekStart);
    if (existing && Number.isFinite(Date.parse(existing.fireAt))) {
      const at = Date.parse(existing.fireAt);
      if (at <= input.now.getTime()) notified.add(batch.weekStart);
      else nextPending.push(existing);
      continue;
    }
    const fireAt = fireAtFor(batch.weekStart, input.now);
    schedule.push({
      id: weeklyResultNotificationId(batch.weekStart),
      weekStart: batch.weekStart,
      fireAt,
      title: batch.title,
      body: batch.body,
    });
    if (fireAt.getTime() <= input.now.getTime()) notified.add(batch.weekStart);
    else nextPending.push({ weekStart: batch.weekStart, fireAt: fireAt.toISOString() });
  }

  for (const row of pending) {
    if (nextPending.some(p => p.weekStart === row.weekStart)) continue;
    if (desiredWeeks.has(row.weekStart) && !notified.has(row.weekStart)) continue;
    const at = Date.parse(row.fireAt);
    const future = Number.isFinite(at) && at > input.now.getTime();
    if (future) cancelIds.push(weeklyResultNotificationId(row.weekStart));
    const weekResults = input.results.filter(r => r.weekStart === row.weekStart);
    const seen = weekResults.length > 0 && weekResults.every(r => r.seenAt != null);
    if (seen || !future) notified.add(row.weekStart);
  }

  return {
    schedule,
    cancelIds,
    state: { notified: trimWeeks(notified), pending: nextPending },
  };
}

/**
 * Schedules that never reached the OS (permission denied, schedule threw)
 * must not be remembered, or that week would be skipped forever.
 * Cancels and "already seen" notes from the plan still apply.
 */
export function stateWithoutUnsentSchedules(
  previous: WeeklyResultNotificationState,
  plan: WeeklyResultNotificationPlan,
): WeeklyResultNotificationState {
  const unsent = new Set(plan.schedule.map(s => s.weekStart));
  const cancelled = new Set(plan.cancelIds);
  const prevNotified = new Set(previous.notified);
  return {
    notified: plan.state.notified.filter(w => !unsent.has(w) || prevNotified.has(w)),
    pending: plan.state.pending.filter(p =>
      !unsent.has(p.weekStart) && !cancelled.has(weeklyResultNotificationId(p.weekStart))),
  };
}

/** Weekly-result ids currently on the OS that this plan no longer wants. */
export function weeklyResultNotificationIdsToCancel(
  scheduledIds: readonly string[],
  keepIds: readonly string[],
): string[] {
  const keep = new Set(keepIds);
  return scheduledIds.filter(id => id.startsWith(WEEKLY_RESULT_NOTIFICATION_PREFIX) && !keep.has(id));
}

function desiredBatches(input: {
  promises: readonly WeeklyPromise[];
  results: readonly WeeklyResult[];
  schedules: readonly DaySchedule[];
  today: string;
}): { weekStart: string; title: string; body: string }[] {
  const out: { weekStart: string; title: string; body: string }[] = [];
  const unseen = latestUnseenWeek(input.results);
  if (unseen.length > 0) {
    const copy = weeklyResultNotificationCopy(unseen);
    if (copy) out.push({ weekStart: unseen[0].weekStart, ...copy });
  }
  const active = activePromiseWeekStart(input.promises, input.schedules, input.today);
  if (active && !out.some(d => d.weekStart === active)) {
    out.push({ weekStart: active, ...UPCOMING_WEEKLY_RESULT_COPY });
  }
  return out;
}

function fireAtFor(weekStart: string, now: Date): Date {
  const ready = weeklyResultReadyAt(weekStart);
  return ready.getTime() <= now.getTime() ? now : ready;
}

function isWeek(v: unknown): v is string {
  return typeof v === 'string' && WEEK_RE.test(v);
}

function dedupePending(
  pending: WeeklyResultNotificationState['pending'],
): WeeklyResultNotificationState['pending'] {
  const byWeek = new Map<string, { weekStart: string; fireAt: string }>();
  for (const row of pending) {
    if (!isWeek(row.weekStart) || typeof row.fireAt !== 'string') continue;
    byWeek.set(row.weekStart, row);
  }
  return [...byWeek.values()];
}

function trimWeeks(weeks: Set<string>): string[] {
  return [...weeks].filter(isWeek).sort().slice(-24);
}
