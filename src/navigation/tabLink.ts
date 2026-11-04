/**
 * Proof tab switches for a headless Simulator (no GUI taps).
 * URL host/path: iharu://plan, com.dailyschedule.app://activity.
 * Launch args (NSUserDefaults argument domain, ignored when absent):
 *   -initialTab today|plan|activity|settings
 *   -openSheet weeklyPromise|rewardExpansion  (opens Settings so the sheet can show)
 *   -suppressWeeklyResult 1                    (hides 「지난주 결과예요」 for this process)
 */

export type TabTarget = 'Today' | 'PlanSchedule' | 'Activities' | 'Profile';

/** NSUserDefaults key set by `simctl launch <app> -initialTab plan`. */
export const INITIAL_TAB_SETTING = 'initialTab';

/** `simctl launch <app> -openSheet weeklyPromise`. Proof only. */
export const OPEN_SHEET_SETTING = 'openSheet';

/** `simctl launch <app> -suppressWeeklyResult 1`. Proof only. Does not write storage. */
export const SUPPRESS_WEEKLY_RESULT_SETTING = 'suppressWeeklyResult';

const TAB_BY_SEGMENT: Record<string, TabTarget> = {
  today: 'Today',
  plan: 'PlanSchedule',
  activity: 'Activities',
  settings: 'Profile',
};

/** Sheets that live on the Settings tab. Opening one selects that tab. */
export type ProofSheet = 'weeklyPromise' | 'rewardExpansion';

const SHEET_BY_TOKEN: Record<string, ProofSheet> = {
  weeklypromise: 'weeklyPromise',
  rewardexpansion: 'rewardExpansion',
};

/** `today` / `plan` / `activity` / `settings`, or a full tab URL if that string is the arg value. */
export function tabFromLaunchValue(value: unknown): TabTarget | null {
  if (typeof value !== 'string') return null;
  const token = value.trim().toLowerCase();
  if (!token) return null;
  if (token.includes('://')) return tabFromUrl(token);
  return TAB_BY_SEGMENT[token] ?? null;
}

/** `weeklyPromise` / `rewardExpansion`, hyphens optional. Unknown values do nothing. */
export function sheetFromLaunchValue(value: unknown): ProofSheet | null {
  if (typeof value !== 'string') return null;
  const token = value.trim().toLowerCase().replace(/-/g, '');
  if (!token) return null;
  return SHEET_BY_TOKEN[token] ?? null;
}

/**
 * Proof flag. Absent, empty, and explicit negatives stay off so a normal
 * cold start still shows the weekly-result confirm.
 */
export function suppressWeeklyResultFromLaunchValue(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value !== 'string') return false;
  const token = value.trim().toLowerCase();
  return token === '1' || token === 'true' || token === 'yes' || token === 'y' || token === 'on';
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
