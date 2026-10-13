/**
 * Pure helpers for the phone Plan list + add sheet (option C).
 * Times are "HH:MM"; ranges use "~" because BMJUA lacks the en dash.
 */
import { toMinutes } from './timelineLayout';

export type SpanItem = { id: string; startTime: string; endTime: string; name?: string };

export const DAY_END_MIN = 24 * 60;
export const TIME_STEP_MIN = 10;
export const MIN_DURATION = 10;
export const MAX_DURATION = 240;

export const fromMinutes = (min: number): string => {
  const m = Math.max(0, Math.min(DAY_END_MIN, Math.round(min)));
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export const formatRange = (start: string, end: string) => `${start}~${end}`;

export const sortByStart = <T extends { startTime: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

export const findConflict = <T extends SpanItem>(
  items: T[],
  startMin: number,
  durationMin: number,
): T | null => {
  const endMin = startMin + durationMin;
  return sortByStart(items).find(
    it => startMin < toMinutes(it.endTime) && endMin > toMinutes(it.startTime),
  ) ?? null;
};

/** Earliest start >= fromMin (step-aligned) where durationMin fits before midnight, or null. */
export const findNextFreeStart = (
  items: SpanItem[],
  durationMin: number,
  fromMin: number,
  step = TIME_STEP_MIN,
): number | null => {
  let t = Math.ceil(Math.max(0, fromMin) / step) * step;
  while (t + durationMin <= DAY_END_MIN) {
    const c = findConflict(items, t, durationMin);
    if (!c) return t;
    t = Math.ceil(toMinutes(c.endTime) / step) * step;
  }
  return null;
};

export type SlotValidation =
  | { ok: true; endTime: string }
  | { ok: false; message: string; suggestion: number | null };

export const validateSlot = (
  items: SpanItem[],
  startMin: number,
  durationMin: number,
): SlotValidation => {
  const endMin = startMin + durationMin;
  if (endMin > DAY_END_MIN) {
    return {
      ok: false,
      message: '자정(24:00)을 넘을 수 없어요. 시작 시간을 앞당기거나 시간을 줄여 주세요.',
      suggestion: findNextFreeStart(items, durationMin, 0) === null
        ? null
        : Math.min(DAY_END_MIN - durationMin, startMin),
    };
  }
  const c = findConflict(items, startMin, durationMin);
  if (c) {
    const label = c.name ? `'${c.name}'(${formatRange(c.startTime, c.endTime)})` : formatRange(c.startTime, c.endTime);
    return {
      ok: false,
      message: `${label} 일정과 겹쳐요.`,
      suggestion: findNextFreeStart(items, durationMin, startMin),
    };
  }
  return { ok: true, endTime: fromMinutes(endMin) };
};

export const clampDuration = (d: number) =>
  Math.max(MIN_DURATION, Math.min(MAX_DURATION, Math.round(d / TIME_STEP_MIN) * TIME_STEP_MIN));

/** Default start for the sheet: first free slot after the last item, else 07:00 (or now on today). */
export const defaultStart = (items: SpanItem[], durationMin: number, nowMin?: number): number => {
  const sorted = sortByStart(items);
  const from = sorted.length
    ? toMinutes(sorted[sorted.length - 1].endTime)
    : Math.max(7 * 60, nowMin ?? 0);
  return findNextFreeStart(items, durationMin, from)
    ?? findNextFreeStart(items, durationMin, 0)
    ?? 0;
};
