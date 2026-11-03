/**
 * Forwards incoming URLs (simctl openurl) to the tab queue.
 * Scheme registration lives in app.json / Info.plist; this only parses host/path.
 */

import { Linking } from 'react-native';
import { flushQueuedTab, queueTabFromUrl, type TabLinkNavigation } from './tabLink';

export function bindTabDeepLinks(navigation: TabLinkNavigation): () => void {
  const handle = (url: string | null) => {
    queueTabFromUrl(url);
    flushQueuedTab(navigation);
  };

  Linking.getInitialURL().then(handle).catch(() => {});
  const sub = Linking.addEventListener('url', ({ url }) => handle(url));
  return () => sub.remove();
}

export { flushQueuedTab };
