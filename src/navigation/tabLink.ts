/**
 * Proof tab switches for a headless Simulator (no GUI taps).
 * URL host/path: iharu://plan, com.dailyschedule.app://activity.
 * Launch arg: `simctl launch … -initialTab plan` (NSUserDefaults argument domain).
 */

export type TabTarget = 'PlanSchedule' | 'Activities';

/** NSUserDefaults key set by `simctl launch <app> -initialTab plan`. */
export const INITIAL_TAB_SETTING = 'initialTab';

const TAB_BY_SEGMENT: Record<string, TabTarget> = {
  plan: 'PlanSchedule',
  activity: 'Activities',
};

/** `plan` / `activity`, or a full tab URL if that string is passed as the arg value. */
export function tabFromLaunchValue(value: unknown): TabTarget | null {
  if (typeof value !== 'string') return null;
  const token = value.trim().toLowerCase();
  if (!token) return null;
  if (token.includes('://')) return tabFromUrl(token);
  return TAB_BY_SEGMENT[token] ?? null;
}

export function tabFromUrl(url: string | null | undefined): TabTarget | null {
  if (!url) return null;
  const schemeSep = url.indexOf('://');
  if (schemeSep < 0) return null;
  const rest = url.slice(schemeSep + 3).split(/[?#]/, 1)[0];
  const segment = rest.split('/').find(part => part.length > 0);
  if (!segment) return null;
  return TAB_BY_SEGMENT[segment.toLowerCase()] ?? null;
}

export type TabLinkNavigation = {
  isReady: () => boolean;
  navigate: (name: 'MainTabs', params: { screen: TabTarget }) => void;
};

let queued: TabTarget | null = null;

export function queueTabFromUrl(url: string | null | undefined): TabTarget | null {
  const tab = tabFromUrl(url);
  if (tab) queued = tab;
  return tab;
}

export function queueTabFromLaunchValue(value: unknown): TabTarget | null {
  const tab = tabFromLaunchValue(value);
  if (tab) queued = tab;
  return tab;
}

/** Navigate when the container is ready. Keeps the last tab if it is not. */
export function flushQueuedTab(navigation: TabLinkNavigation): boolean {
  if (!queued || !navigation.isReady()) return false;
  const tab = queued;
  queued = null;
  navigation.navigate('MainTabs', { screen: tab });
  return true;
}
