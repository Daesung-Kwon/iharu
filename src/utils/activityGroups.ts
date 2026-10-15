/**
 * Activities tab ordering: most used first (same rule as the add sheet,
 * see activityPicker.orderByUsage), grouped by category. Groups appear in the
 * order of their most-used activity, so the busiest group is on top.
 */
import { orderByUsage } from './activityPicker';

export const CATEGORY_LABELS: Record<string, string> = {
  study: '공부',
  play: '놀이',
  reading: '독서',
  exercise: '운동',
  meal: '식사',
  rest: '휴식',
  art: '미술',
  music: '음악',
};

type Grouped = { id: string; name: string; category?: string };
type UsageSchedule = Parameters<typeof orderByUsage>[1];

export interface ActivityGroup<T> {
  key: string;
  /** null when there is only one group: no header needed. */
  label: string | null;
  items: T[];
}

export function groupActivitiesByUsage<T extends Grouped>(
  activities: T[],
  schedules: UsageSchedule,
): ActivityGroup<T>[] {
  const ordered = orderByUsage(activities, schedules);
  const groups = new Map<string, T[]>();
  for (const a of ordered) {
    const key = a.category ?? 'etc';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(a);
  }
  // Headers only help when groups actually collect cards; with mostly
  // one-card groups (e.g. the 8 defaults in 8 categories) keep one flat grid.
  const single = !shouldGroup(groups.size, ordered.length);
  if (single) return ordered.length ? [{ key: 'all', label: null, items: ordered }] : [];
  return [...groups.entries()].map(([key, items]) => ({
    key,
    label: single ? null : (CATEGORY_LABELS[key] ?? '기타'),
    items,
  }));
}

/** Group only when there are 2+ groups averaging at least 2 cards each. */
export function shouldGroup(groupCount: number, itemCount: number): boolean {
  return groupCount >= 2 && itemCount >= groupCount * 2;
}
