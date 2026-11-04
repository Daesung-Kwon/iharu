/**
 * Forwards tab URLs and proof launch args into the same queue.
 * `-initialTab`, `-openSheet`, and `-suppressWeeklyResult` are already in
 * NSUserDefaults' argument domain; React Native's SettingsManager (in the
 * installed binary) publishes that dictionary to JS. Absent args do nothing.
 */

import { Linking, Platform, Settings } from 'react-native';
import {
  flushQueuedTab,
  INITIAL_TAB_SETTING,
  OPEN_SHEET_SETTING,
  queueTabFromLaunchValue,
  queueTabFromUrl,
  sheetFromLaunchValue,
  SUPPRESS_WEEKLY_RESULT_SETTING,
  suppressWeeklyResultFromLaunchValue,
  tabFromLaunchValue,
  type ProofSheet,
  type TabLinkNavigation,
  type TabTarget,
} from './tabLink';

function readLaunchSetting(key: string): unknown {
  if (Platform.OS !== 'ios') return null;
  try {
    return Settings.get(key);
  } catch {
    return null;
  }
}

/** Tab requested by `-initialTab`. Null when the arg is absent (Today stays the default). */
export function readLaunchTab(): TabTarget | null {
  return tabFromLaunchValue(readLaunchSetting(INITIAL_TAB_SETTING));
}

/** Sheet requested by `-openSheet`. Null when the arg is absent. */
export function readLaunchSheet(): ProofSheet | null {
  return sheetFromLaunchValue(readLaunchSetting(OPEN_SHEET_SETTING));
}

/**
 * True only for this process when `-suppressWeeklyResult 1` was passed.
 * Does not mark results seen and does not change the next launch.
 */
export function readSuppressWeeklyResult(): boolean {
  return suppressWeeklyResultFromLaunchValue(readLaunchSetting(SUPPRESS_WEEKLY_RESULT_SETTING));
}

export function bindTabDeepLinks(navigation: TabLinkNavigation): () => void {
  const handle = (url: string | null) => {
    queueTabFromUrl(url);
    flushQueuedTab(navigation);
  };

  // A sheet lives on Settings. Selecting it here is what makes
  // `-openSheet weeklyPromise` work without a separate `-initialTab`.
  const sheet = readLaunchSheet();
  queueTabFromLaunchValue(sheet ? 'settings' : readLaunchSetting(INITIAL_TAB_SETTING));
  flushQueuedTab(navigation);

  Linking.getInitialURL().then(handle).catch(() => {});
  const sub = Linking.addEventListener('url', ({ url }) => handle(url));
  return () => sub.remove();
}

export { flushQueuedTab };
