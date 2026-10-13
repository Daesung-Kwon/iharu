/**
 * Pure helpers for the add-sheet activity picker: usage ordering + name search.
 */

export const SEARCH_THRESHOLD = 8;

type Named = { id: string; name: string };
type UsageSchedule = { date: string; items: { activityId?: string; activity?: { id: string } }[] };

/** Most used first; ties broken by most recent use date, then original order. Unused keep original order. */
export const orderByUsage = <T extends Named>(activities: T[], schedules: UsageSchedule[]): T[] => {
  const count = new Map<string, number>();
  const last = new Map<string, string>();
  for (const s of schedules) {
    for (const it of s.items) {
      const id = it.activityId ?? it.activity?.id;
      if (!id) continue;
      count.set(id, (count.get(id) ?? 0) + 1);
      if ((last.get(id) ?? '') < s.date) last.set(id, s.date);
    }
  }
  return activities
    .map((a, i) => ({ a, i }))
    .sort((x, y) => {
      const c = (count.get(y.a.id) ?? 0) - (count.get(x.a.id) ?? 0);
      if (c) return c;
      const lx = last.get(x.a.id) ?? '';
      const ly = last.get(y.a.id) ?? '';
      if (lx !== ly) return lx < ly ? 1 : -1;
      return x.i - y.i;
    })
    .map(v => v.a);
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');

/** Case/space-insensitive substring match on name. Empty query returns all. */
export const filterActivities = <T extends Named>(activities: T[], query: string): T[] => {
  const q = norm(query);
  return q ? activities.filter(a => norm(a.name).includes(q)) : activities;
};

export const shouldShowSearch = (n: number) => n > SEARCH_THRESHOLD;

