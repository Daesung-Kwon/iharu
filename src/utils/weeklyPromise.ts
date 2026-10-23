/**
 * Weekly reward promise (주간 보상 약속). Pure: no storage, no clock.
 *
 * - One promise. The parent sets only the reward text and the goal %.
 * - Goal rate = fully-done days ÷ days with to-dos in the Mon-Sun week
 *   (rewardPeriod.periodRate). The child's own check counts as done.
 * - A week is judged only after it ends; there is no partial reward.
 * - The first setup starts this week. Any later change (or stopping) starts
 *   next Monday, so the rules never move under the child mid-week.
 */
import type { Schedule } from '../types';
import { parseLocalDateString, toLocalDateString } from './dateUtils';
import { DateRange, getWeekRange, periodRate, PeriodRate } from './rewardPeriod';

type DaySchedule = Pick<Schedule, 'date' | 'items'>;

export const DEFAULT_GOAL_PERCENT = 80;
export const GOAL_OPTIONS = [60, 70, 80, 90, 100] as const;
export const REWARD_MAX_LENGTH = 40;
/** How many past weeks are judged at most when the app was not opened for a while. */
export const MAX_BACKFILL_WEEKS = 8;

export interface PromiseTerms {
  reward: string;
  goalPercent: number;
  /** Monday 'YYYY-MM-DD' from which these terms apply. */
  effectiveFrom: string;
}

export interface WeeklyPromise {
  id: string;
  kind: 'weekly';
  /** Sorted by effectiveFrom; the last one at or before a week applies. */
  terms: PromiseTerms[];
  /** Monday from which the promise no longer applies (null = ongoing). */
  endsFrom: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyResult {
  /** `${promiseId}:${weekStart}` - stable, one per promise per week. */
  id: string;
  promiseId: string;
  weekStart: string;
  weekEnd: string;
  reward: string;
  goalPercent: number;
  doneDays: number;
  countedDays: number;
  rate: number;
  achieved: boolean;
  judgedAt: string;
  seenAt: string | null;
}

export function addDays(date: string, days: number): string {
  const d = parseLocalDateString(date);
  d.setDate(d.getDate() + days);
  return toLocalDateString(d);
}

export function weekOf(date: string): DateRange {
  return getWeekRange(parseLocalDateString(date));
}

export function normalizeReward(reward: string): string {
  return reward.replace(/\s+/g, ' ').trim().slice(0, REWARD_MAX_LENGTH);
}

export function isValidGoal(goal: number): boolean {
  return Number.isInteger(goal) && goal >= 1 && goal <= 100;
}

/** Terms that apply to the week starting `weekStart`, or null. */
export function termsForWeek(promise: WeeklyPromise | null, weekStart: string): PromiseTerms | null {
  if (!promise) return null;
  if (promise.endsFrom && weekStart >= promise.endsFrom) return null;
  let found: PromiseTerms | null = null;
  for (const t of promise.terms) {
    if (t.effectiveFrom <= weekStart) found = t;
  }
  return found;
}

export interface TermsInput {
  reward: string;
  goalPercent: number;
}

/**
 * Save the parent's form. First setup (or restarting a stopped promise)
 * applies this week; changing an active promise applies next Monday.
 * Saving the same terms as this week cancels any pending change.
 */
export function saveTerms(
  promise: WeeklyPromise | null,
  input: TermsInput,
  opts: { today: string; nowIso: string; newId: string },
): WeeklyPromise {
  const reward = normalizeReward(input.reward);
  const goalPercent = isValidGoal(input.goalPercent) ? input.goalPercent : DEFAULT_GOAL_PERCENT;
  const thisWeek = weekOf(opts.today).start;
  const nextWeek = addDays(thisWeek, 7);
  if (!promise) {
    return {
      id: opts.newId,
      kind: 'weekly',
      terms: [{ reward, goalPercent, effectiveFrom: thisWeek }],
      endsFrom: null,
      createdAt: opts.nowIso,
      updatedAt: opts.nowIso,
    };
  }
  const active = termsForWeek(promise, thisWeek);
  const past = promise.terms.filter(t => t.effectiveFrom < thisWeek);
  if (!active) {
    return { ...promise, terms: [...past, { reward, goalPercent, effectiveFrom: thisWeek }], endsFrom: null, updatedAt: opts.nowIso };
  }
  const upToThisWeek = promise.terms.filter(t => t.effectiveFrom <= thisWeek);
  const same = active.reward === reward && active.goalPercent === goalPercent;
  return {
    ...promise,
    terms: same ? upToThisWeek : [...upToThisWeek, { reward, goalPercent, effectiveFrom: nextWeek }],
    endsFrom: null,
    updatedAt: opts.nowIso,
  };
}

/** Stop the promise. This week still counts if it is running; it ends next Monday. */
export function stopPromise(promise: WeeklyPromise, opts: { today: string; nowIso: string }): WeeklyPromise {
  const thisWeek = weekOf(opts.today).start;
  const runningNow = termsForWeek(promise, thisWeek) !== null;
  const endsFrom = runningNow ? addDays(thisWeek, 7) : thisWeek;
  return {
    ...promise,
    terms: promise.terms.filter(t => t.effectiveFrom <= thisWeek),
    endsFrom,
    updatedAt: opts.nowIso,
  };
}

export type PendingChange =
  | { kind: 'none' }
  | { kind: 'change'; terms: PromiseTerms }
  | { kind: 'stop'; from: string };

/** What starts next week, for the parent form. */
export function pendingChange(promise: WeeklyPromise | null, today: string): PendingChange {
  if (!promise) return { kind: 'none' };
  const thisWeek = weekOf(today).start;
  if (promise.endsFrom && promise.endsFrom > thisWeek) return { kind: 'stop', from: promise.endsFrom };
  const next = promise.terms.find(t => t.effectiveFrom > thisWeek);
  return next ? { kind: 'change', terms: next } : { kind: 'none' };
}

export interface WeekStatus {
  terms: PromiseTerms;
  range: DateRange;
  progress: PeriodRate;
}

/** This week's promise and progress so far (for the Today card), or null. */
export function currentWeekStatus(
  promise: WeeklyPromise | null,
  schedules: readonly DaySchedule[],
  today: string,
): WeekStatus | null {
  const range = weekOf(today);
  const terms = termsForWeek(promise, range.start);
  if (!terms) return null;
  return { terms, range, progress: periodRate(schedules, range.start, range.end, today) };
}

export function isAchieved(progress: PeriodRate, goalPercent: number): boolean {
  return progress.countedDays > 0 && progress.rate + 1e-9 >= goalPercent;
}

/**
 * Judge every ended week (up to MAX_BACKFILL_WEEKS back) that has terms and
 * no result yet. Weeks with no to-dos at all get no result.
 */
export function judgeEndedWeeks(
  promise: WeeklyPromise | null,
  results: readonly WeeklyResult[],
  schedules: readonly DaySchedule[],
  opts: { today: string; nowIso: string },
): WeeklyResult[] {
  if (!promise || promise.terms.length === 0) return [];
  const thisWeek = weekOf(opts.today).start;
  const first = promise.terms[0].effectiveFrom;
  const oldest = addDays(thisWeek, -7 * MAX_BACKFILL_WEEKS);
  const judged = new Set(results.map(r => r.id));
  const out: WeeklyResult[] = [];
  for (let start = first > oldest ? weekOf(first).start : oldest; start < thisWeek; start = addDays(start, 7)) {
    const id = `${promise.id}:${start}`;
    if (judged.has(id)) continue;
    const terms = termsForWeek(promise, start);
    if (!terms) continue;
    const end = addDays(start, 6);
    const progress = periodRate(schedules, start, end, end);
    if (progress.countedDays === 0) continue;
    out.push({
      id,
      promiseId: promise.id,
      weekStart: start,
      weekEnd: end,
      reward: terms.reward,
      goalPercent: terms.goalPercent,
      doneDays: progress.doneDays,
      countedDays: progress.countedDays,
      rate: progress.rate,
      achieved: isAchieved(progress, terms.goalPercent),
      judgedAt: opts.nowIso,
      seenAt: null,
    });
  }
  return out;
}

/** The newest result the child has not seen yet. */
export function latestUnseen(results: readonly WeeklyResult[]): WeeklyResult | null {
  let best: WeeklyResult | null = null;
  for (const r of results) {
    if (r.seenAt) continue;
    if (!best || r.weekStart > best.weekStart) best = r;
  }
  return best;
}

/** Mark every unseen result as seen (only the newest one is ever shown). */
export function markAllSeen(results: readonly WeeklyResult[], nowIso: string): WeeklyResult[] {
  return results.map(r => (r.seenAt ? r : { ...r, seenAt: nowIso }));
}

/* ── Copy (plain Korean; what was achieved comes first) ─────────────── */

export function daysLine(p: Pick<PeriodRate, 'doneDays' | 'countedDays'>): string {
  return `${p.countedDays}일 중 ${p.doneDays}일 다 끝냈어요`;
}

export function cardCopy(status: WeekStatus): { title: string; detail: string } {
  const goal = `목표 ${status.terms.goalPercent}%`;
  return {
    title: `이번 주 약속: ${status.terms.reward}`,
    detail: status.progress.countedDays === 0
      ? `할 일을 다 끝낸 날을 모아 봐요 (${goal})`
      : `${daysLine(status.progress)} (${goal})`,
  };
}

export function resultCopy(r: WeeklyResult): { title: string; body: string; footer: string } {
  const line = `${daysLine(r)} (${Math.round(r.rate)}%)`;
  return r.achieved
    ? { title: '지난주 약속을 지켰어요!', body: line, footer: `약속한 보상: ${r.reward}` }
    : { title: '지난주 결과예요', body: line, footer: `목표 ${r.goalPercent}%에는 닿지 못했어요. 이번 주에 다시 해 봐요!` };
}

/** Short 'M/D' for parent-facing notes. */
export function shortDate(date: string): string {
  const [, m, d] = date.split('-');
  return `${Number(m)}/${Number(d)}`;
}

/* ── Validation (stored JSON and backups) ───────────────────────────── */

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function isWeeklyPromise(v: unknown): v is WeeklyPromise {
  return isRecord(v)
    && typeof v.id === 'string' && v.id.length > 0
    && v.kind === 'weekly'
    && Array.isArray(v.terms)
    && v.terms.every(t => isRecord(t) && typeof t.reward === 'string'
      && typeof t.goalPercent === 'number' && isValidGoal(t.goalPercent) && isDate(t.effectiveFrom))
    && (v.endsFrom === null || isDate(v.endsFrom))
    && typeof v.createdAt === 'string'
    && typeof v.updatedAt === 'string';
}

export function isWeeklyResult(v: unknown): v is WeeklyResult {
  return isRecord(v)
    && typeof v.id === 'string' && typeof v.promiseId === 'string'
    && isDate(v.weekStart) && isDate(v.weekEnd)
    && typeof v.reward === 'string' && typeof v.goalPercent === 'number'
    && typeof v.doneDays === 'number' && typeof v.countedDays === 'number'
    && typeof v.rate === 'number' && typeof v.achieved === 'boolean'
    && typeof v.judgedAt === 'string'
    && (v.seenAt === null || typeof v.seenAt === 'string');
}

export function parseStoredPromise(raw: string | null): WeeklyPromise | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return isWeeklyPromise(v) ? v : null;
  } catch {
    return null;
  }
}

export function parseStoredResults(raw: string | null): WeeklyResult[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter(isWeeklyResult) : [];
  } catch {
    return [];
  }
}
