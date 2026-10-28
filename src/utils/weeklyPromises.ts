/**
 * Several weekly promises (1 free, more with '보상 확장'). Pure.
 *
 * Each promise keeps the single-promise rules from weeklyPromise.ts:
 * first setup starts this week, later changes and stopping start next
 * Monday, and a week is judged only after it ends. All promises share the
 * same week progress (fully-done days), only the reward and goal differ.
 */
import type { Schedule } from '../types';
import { periodRate, PeriodRate } from './rewardPeriod';
import {
  daysLine, isAchieved, isWeeklyPromise, judgeEndedWeeks, pendingChange, PromiseTerms,
  resultCopy, saveTerms, shortDate, stopPromise, termsForWeek, TermsInput, weekOf, WeeklyPromise, WeeklyResult,
} from './weeklyPromise';

type DaySchedule = Pick<Schedule, 'date' | 'items'>;

/** Still takes a slot: running, or not yet past its stop date. */
export function occupiesSlot(p: WeeklyPromise, today: string): boolean {
  const thisWeek = weekOf(today).start;
  if (p.endsFrom && p.endsFrom <= thisWeek) return false;
  return p.terms.length > 0;
}

/** Promises the parent sees and manages, oldest first. */
export function managedPromises(list: readonly WeeklyPromise[], today: string): WeeklyPromise[] {
  return list.filter(p => occupiesSlot(p, today)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function usedSlots(list: readonly WeeklyPromise[], today: string): number {
  return managedPromises(list, today).length;
}

export function canCreatePromise(list: readonly WeeklyPromise[], today: string, limit: number): boolean {
  return usedSlots(list, today) < limit;
}

/** A new id that no stored promise uses (ids stay stable forever). */
export function uniquePromiseId(list: readonly WeeklyPromise[], base: string): string {
  const ids = new Set(list.map(p => p.id));
  if (!ids.has(base)) return base;
  let n = 2;
  while (ids.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

export type UpsertResult = { ok: true; list: WeeklyPromise[]; id: string } | { ok: false; reason: 'limit' | 'missing' };

/**
 * Create (id null) or edit one promise. Creating, or restarting a promise
 * that no longer takes a slot, needs a free slot.
 */
export function upsertPromise(
  list: readonly WeeklyPromise[],
  id: string | null,
  input: TermsInput,
  opts: { today: string; nowIso: string; newId: string; limit: number },
): UpsertResult {
  const current = id ? list.find(p => p.id === id) ?? null : null;
  if (id && !current) return { ok: false, reason: 'missing' };
  const needsSlot = !current || !occupiesSlot(current, opts.today);
  if (needsSlot && !canCreatePromise(list, opts.today, opts.limit)) return { ok: false, reason: 'limit' };
  const newId = uniquePromiseId(list, opts.newId);
  const next = saveTerms(current, input, { ...opts, newId });
  const out = current ? list.map(p => (p.id === current.id ? next : p)) : [...list, next];
  return { ok: true, list: out, id: next.id };
}

export function stopPromiseById(
  list: readonly WeeklyPromise[],
  id: string,
  opts: { today: string; nowIso: string },
): WeeklyPromise[] {
  return list.map(p => (p.id === id ? stopPromise(p, opts) : p));
}

/** Judge ended weeks for every promise (results keep `${promiseId}:${week}` ids). */
export function judgeAll(
  list: readonly WeeklyPromise[],
  results: readonly WeeklyResult[],
  schedules: readonly DaySchedule[],
  opts: { today: string; nowIso: string },
): WeeklyResult[] {
  return list.flatMap(p => judgeEndedWeeks(p, results, schedules, opts));
}

/* ── Today card (child): one calm summary ────────────────────────────── */

export interface WeekSummary {
  /** Running this week, oldest first. */
  terms: PromiseTerms[];
  progress: PeriodRate;
}

export function weekSummary(
  list: readonly WeeklyPromise[],
  schedules: readonly DaySchedule[],
  today: string,
): WeekSummary | null {
  const range = weekOf(today);
  const terms = [...list]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(p => termsForWeek(p, range.start))
    .filter((t): t is PromiseTerms => t !== null);
  if (terms.length === 0) return null;
  return { terms, progress: periodRate(schedules, range.start, range.end, today) };
}

export function summaryCopy(s: WeekSummary): { title: string; detail: string } {
  const { terms, progress } = s;
  if (terms.length === 1) {
    const goal = `목표 ${terms[0].goalPercent}%`;
    return {
      title: `이번 주 약속: ${terms[0].reward}`,
      detail: progress.countedDays === 0 ? `할 일을 다 끝낸 날을 모아 봐요 (${goal})` : `${daysLine(progress)} (${goal})`,
    };
  }
  const reached = terms.filter(t => isAchieved(progress, t.goalPercent)).length;
  return {
    title: `이번 주 약속 ${terms.length}개`,
    detail: progress.countedDays === 0
      ? '할 일을 다 끝낸 날을 모아 봐요'
      : `${daysLine(progress)} (목표 닿음 ${reached}/${terms.length})`,
  };
}

/* ── Result moment: one modal for the newest unseen week ─────────────── */

export function latestUnseenWeek(results: readonly WeeklyResult[]): WeeklyResult[] {
  let week: string | null = null;
  for (const r of results) if (!r.seenAt && (!week || r.weekStart > week)) week = r.weekStart;
  return week ? results.filter(r => !r.seenAt && r.weekStart === week) : [];
}

export function weekResultCopy(rs: readonly WeeklyResult[]): { title: string; body: string; footer: string; achieved: boolean } | null {
  if (rs.length === 0) return null;
  if (rs.length === 1) return { ...resultCopy(rs[0]), achieved: rs[0].achieved };
  const won = rs.filter(r => r.achieved);
  const body = `${daysLine(rs[0])} (${Math.round(rs[0].rate)}%)`;
  return won.length > 0
    ? { title: '지난주 약속을 지켰어요!', body, footer: `약속한 보상: ${won.map(r => r.reward).join(', ')}`, achieved: true }
    : { title: '지난주 결과예요', body, footer: '목표에는 닿지 못했어요. 이번 주에 다시 해 봐요!', achieved: false };
}

/* ── Parent row/list copy ─────────────────────────────────────────────── */

export function promiseLine(p: WeeklyPromise, today: string): { title: string; note: string } {
  const now = termsForWeek(p, weekOf(today).start);
  const pending = pendingChange(p, today);
  const shown = now ?? (pending.kind === 'change' ? pending.terms : null);
  const title = shown ? `${shown.reward} (목표 ${shown.goalPercent}%)` : '';
  const note = pending.kind === 'change' && now
    ? `다음 주부터: ${pending.terms.reward} (목표 ${pending.terms.goalPercent}%)`
    : pending.kind === 'stop' ? `${shortDate(pending.from)}부터 그만해요` : '';
  return { title, note };
}

/* ── Storage ─────────────────────────────────────────────────────────── */

/** Accepts the v5 array and the v3/v4 single object (or null). Drops bad rows and duplicate ids. */
export function parseStoredPromises(raw: string | null): WeeklyPromise[] {
  if (!raw) return [];
  try {
    return normalizePromises(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function normalizePromises(v: unknown): WeeklyPromise[] {
  const arr = Array.isArray(v) ? v : v ? [v] : [];
  const seen = new Set<string>();
  const out: WeeklyPromise[] = [];
  for (const p of arr) {
    if (!isWeeklyPromise(p) || seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
  }
  return out;
}
