/**
 * Forwards tab URLs and the `-initialTab` launch argument into the same queue.
 * The argument is already in NSUserDefaults' argument domain; React Native's
 * SettingsManager (in the installed binary) publishes that dictionary to JS.
 */

import { Linking, Platform, Settings } from 'react-native';
import {
  flushQueuedTab,
  INITIAL_TAB_SETTING,
  queueTabFromLaunchValue,
  queueTabFromUrl,
  type TabLinkNavigation,
} from './tabLink';

function readInitialTabSetting(): unknown {
  if (Platform.OS !== 'ios') return null;
  try {
    return Settings.get(INITIAL_TAB_SETTING);
  } catch {
    return null;
  }
}

export function bindTabDeepLinks(navigation: TabLinkNavigation): () => void {
  const handle = (url: string | null) => {
    queueTabFromUrl(url);
    flushQueuedTab(navigation);
  };

  queueTabFromLaunchValue(readInitialTabSetting());
  flushQueuedTab(navigation);

  Linking.getInitialURL().then(handle).catch(() => {});
  const sub = Linking.addEventListener('url', ({ url }) => handle(url));
  return () => sub.remove();
}

export { flushQueuedTab };
