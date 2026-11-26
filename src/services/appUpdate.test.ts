import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BACKUP_READ_KEYS, RESET_KEYS } from './storageKeys';
import {
  APP_UPDATE_CHECK_INTERVAL_MS,
  APP_UPDATE_DISMISSED_VERSION_KEY,
  APP_UPDATE_HTTPS_URL,
  APP_UPDATE_ITMS_URL,
  APP_UPDATE_LAST_CHECK_KEY,
  APP_UPDATE_LOOKUP_URL,
  PREVIEW_CURRENT_VERSION,
  PREVIEW_STORE_VERSION,
  canPresentAppUpdate,
  clearAppUpdateBlockers,
  compareVersions,
  dismissAppUpdate,
  isAppUpdateBlocked,
  isStoreVersionNewer,
  lookupStoreVersion,
  openAppStorePage,
  parseLookupVersion,
  parseVersionParts,
  previewFromSources,
  resolveInstalledVersion,
  runAppUpdateCheck,
  setAppUpdateBlocked,
  shouldCheckForUpdate,
  shouldPromptForVersion,
  type UpdateFetch,
  type VersionStorage,
} from './appUpdate';

const memory = (initial: Record<string, string> = {}): VersionStorage & { data: Map<string, string> } => {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => { data.set(key, value); },
  };
};

const jsonResponse = (body: unknown, ok = true) => ({
  ok,
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
});

const lookup = (version: string) => jsonResponse({
  resultCount: 1,
  results: [{ version, trackId: 6758513674 }],
});

describe('compareVersions', () => {
  it('treats 1.10.0 as newer than 1.9.0', () => {
    assert.equal(compareVersions('1.10.0', '1.9.0'), 1);
    assert.equal(compareVersions('1.9.0', '1.10.0'), -1);
    assert.equal(isStoreVersionNewer('1.10.0', '1.9.0'), true);
    assert.equal(isStoreVersionNewer('1.9.0', '1.10.0'), false);
  });

  it('fills missing segments with zero', () => {
    assert.equal(compareVersions('1.2', '1.2.0'), 0);
    assert.equal(compareVersions('1.2.0', '1.2'), 0);
    assert.equal(compareVersions('1', '1.0.0'), 0);
    assert.equal(compareVersions('1.2.1', '1.2'), 1);
    assert.equal(compareVersions('1.2', '1.2.1'), -1);
    assert.equal(compareVersions('2', '1.9.9'), 1);
    assert.deepEqual(parseVersionParts(''), []);
    assert.equal(compareVersions('', '0.0.0'), 0);
  });

  it('ignores a leading v, leading zeros, and a non-numeric suffix', () => {
    assert.equal(compareVersions('v1.2.3', '1.2.3'), 0);
    assert.equal(compareVersions('V1.2.3', '1.2.3'), 0);
    assert.equal(compareVersions('01.002.3', '1.2.3'), 0);
    assert.equal(compareVersions('1.2.3-beta', '1.2.3'), 0);
    assert.equal(compareVersions('1.2.4-rc1', '1.2.3'), 1);
    assert.equal(compareVersions(' 1.10.0 ', '1.9.0'), 1);
  });

  it('treats a segment with no leading digits as zero', () => {
    assert.equal(compareVersions('1.beta.1', '1.0.1'), 0);
    assert.equal(compareVersions('foo', '0'), 0);
    assert.equal(compareVersions('foo', '1'), -1);
  });
});

describe('resolveInstalledVersion', () => {
  it('prefers the native version and falls back to app.json', () => {
    assert.equal(resolveInstalledVersion('1.1.0', '9.9.9'), '1.1.0');
    assert.equal(resolveInstalledVersion('  ', '1.1.0'), '1.1.0');
    assert.equal(resolveInstalledVersion(null, '1.1.0'), '1.1.0');
    assert.equal(resolveInstalledVersion(undefined, undefined), '0.0.0');
    assert.equal(resolveInstalledVersion('', '  '), '0.0.0');
  });
});

describe('parseLookupVersion', () => {
  it('reads results[0].version and ignores a bad payload', () => {
    assert.equal(parseLookupVersion({ resultCount: 1, results: [{ version: '1.2.0' }] }), '1.2.0');
    assert.equal(parseLookupVersion({ resultCount: 1, results: [{ version: ' 1.2.0 ' }] }), '1.2.0');
    assert.equal(parseLookupVersion({ resultCount: 0, results: [] }), null);
    assert.equal(parseLookupVersion({ results: [{}] }), null);
    assert.equal(parseLookupVersion({ results: [{ version: 1.2 }] }), null);
    assert.equal(parseLookupVersion({ results: [{ version: 'abc' }] }), null);
    assert.equal(parseLookupVersion({ results: 'nope' }), null);
    assert.equal(parseLookupVersion(null), null);
    assert.equal(parseLookupVersion('nope'), null);
    assert.equal(parseLookupVersion([]), null);
  });
});

describe('shouldCheckForUpdate', () => {
  const now = 1_700_000_000_000;
  it('allows a check when the last one is missing, junk, or a day old', () => {
    assert.equal(shouldCheckForUpdate(null, now), true);
    assert.equal(shouldCheckForUpdate('', now), true);
    assert.equal(shouldCheckForUpdate('yesterday', now), true);
    assert.equal(shouldCheckForUpdate(String(now - APP_UPDATE_CHECK_INTERVAL_MS), now), true);
    assert.equal(shouldCheckForUpdate(String(now - APP_UPDATE_CHECK_INTERVAL_MS - 1), now), true);
  });
  it('skips a check inside the same day', () => {
    assert.equal(shouldCheckForUpdate(String(now - APP_UPDATE_CHECK_INTERVAL_MS + 1), now), false);
    assert.equal(shouldCheckForUpdate(String(now), now), false);
    assert.equal(shouldCheckForUpdate(String(now + 1000), now), false);
  });
});

describe('shouldPromptForVersion', () => {
  it('prompts only for a newer store version that was not dismissed', () => {
    assert.equal(shouldPromptForVersion('1.2.0', '1.1.0', null), true);
    assert.equal(shouldPromptForVersion('1.1.0', '1.1.0', null), false);
    assert.equal(shouldPromptForVersion('1.0.0', '1.1.0', null), false);
    assert.equal(shouldPromptForVersion('1.2.0', '1.1.0', '1.2.0'), false);
    assert.equal(shouldPromptForVersion('1.2.0', '1.1.0', ' 1.2.0 '), false);
    assert.equal(shouldPromptForVersion('1.3.0', '1.1.0', '1.2.0'), true);
    assert.equal(shouldPromptForVersion(null, '1.1.0', null), false);
    assert.equal(shouldPromptForVersion('  ', '1.1.0', null), false);
  });
});

describe('lookup and runAppUpdateCheck', () => {
  const now = 1_700_000_000_000;

  it('asks the fixed lookup URL with GET and no body', async () => {
    const fetchImpl: UpdateFetch = async (url, init) => {
      assert.equal(url, APP_UPDATE_LOOKUP_URL);
      assert.equal(init?.method, 'GET');
      assert.equal(init != null && 'body' in init, false);
      assert.equal(init?.headers?.Accept, 'application/json');
      return lookup('2.0.0');
    };
    assert.equal(await lookupStoreVersion(fetchImpl, 1000), '2.0.0');
    assert.equal(APP_UPDATE_LOOKUP_URL.includes('id=6758513674'), true);
    assert.equal(APP_UPDATE_LOOKUP_URL.includes('country=kr'), true);
  });

  it('prompts when the store version is newer, and records the check time', async () => {
    const store = memory();
    let calls = 0;
    const fetchImpl: UpdateFetch = async () => {
      calls += 1;
      return lookup('1.2.0');
    };
    const first = await runAppUpdateCheck({
      platform: 'ios', now, currentVersion: '1.1.0', preview: null, storage: store, fetchImpl,
    });
    assert.deepEqual(first, { promptVersion: '1.2.0', fetched: true });
    assert.equal(store.data.get(APP_UPDATE_LAST_CHECK_KEY), String(now));
    assert.equal(calls, 1);

    const second = await runAppUpdateCheck({
      platform: 'ios', now: now + 1000, currentVersion: '1.1.0', preview: null, storage: store, fetchImpl,
    });
    assert.deepEqual(second, { promptVersion: null, fetched: false });
    assert.equal(calls, 1);
  });

  it('does not prompt when the store version is the same or older', async () => {
    for (const version of ['1.1.0', '1.0.9']) {
      const store = memory();
      const result = await runAppUpdateCheck({
        platform: 'ios',
        now,
        currentVersion: '1.1.0',
        preview: null,
        storage: store,
        fetchImpl: async () => lookup(version),
      });
      assert.equal(result.promptVersion, null);
      assert.equal(result.fetched, true);
      assert.equal(store.data.get(APP_UPDATE_LAST_CHECK_KEY), String(now));
    }
  });

  it('stays quiet on a network error, a timeout, bad JSON, an error status, and no results', async () => {
    const cases: UpdateFetch[] = [
      async () => { throw new Error('offline'); },
      (_url, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      }),
      async () => jsonResponse('not-json'),
      async () => jsonResponse('{', false),
      async () => jsonResponse({ resultCount: 0, results: [] }),
      async () => jsonResponse({ results: [{ version: '' }] }),
    ];
    for (const fetchImpl of cases) {
      const store = memory();
      const result = await runAppUpdateCheck({
        platform: 'ios',
        now,
        currentVersion: '1.1.0',
        preview: null,
        storage: store,
        fetchImpl,
        timeoutMs: 30,
      });
      assert.equal(result.promptVersion, null);
      assert.equal(result.fetched, true);
      assert.equal(store.data.get(APP_UPDATE_LAST_CHECK_KEY), String(now));
    }
  });

  it('does not prompt again for a dismissed store version, and does for the next one', async () => {
    const store = memory();
    const fetchImpl: UpdateFetch = async () => lookup('1.2.0');
    const shown = await runAppUpdateCheck({
      platform: 'ios', now, currentVersion: '1.1.0', preview: null, storage: store, fetchImpl,
    });
    assert.equal(shown.promptVersion, '1.2.0');
    await dismissAppUpdate(store, '1.2.0');
    assert.equal(store.data.get(APP_UPDATE_DISMISSED_VERSION_KEY), '1.2.0');

    const nextDay = now + APP_UPDATE_CHECK_INTERVAL_MS;
    const again = await runAppUpdateCheck({
      platform: 'ios', now: nextDay, currentVersion: '1.1.0', preview: null, storage: store, fetchImpl,
    });
    assert.equal(again.promptVersion, null);
    assert.equal(again.fetched, true);

    const later = await runAppUpdateCheck({
      platform: 'ios',
      now: nextDay + APP_UPDATE_CHECK_INTERVAL_MS,
      currentVersion: '1.1.0',
      preview: null,
      storage: store,
      fetchImpl: async () => lookup('1.3.0'),
    });
    assert.equal(later.promptVersion, '1.3.0');
  });

  it('does not persist a preview dismiss', async () => {
    const store = memory();
    await dismissAppUpdate(store, '9.9.9', { persist: false });
    assert.equal(store.data.has(APP_UPDATE_DISMISSED_VERSION_KEY), false);
  });

  it('swallows storage failures', async () => {
    const store: VersionStorage = {
      getItem: async () => { throw new Error('read'); },
      setItem: async () => { throw new Error('write'); },
    };
    const result = await runAppUpdateCheck({
      platform: 'ios',
      now,
      currentVersion: '1.1.0',
      preview: null,
      storage: store,
      fetchImpl: async () => lookup('1.2.0'),
    });
    assert.equal(result.promptVersion, '1.2.0');
    await dismissAppUpdate(store, '1.2.0');
  });

  it('does nothing on Android, even with a preview', async () => {
    let calls = 0;
    const result = await runAppUpdateCheck({
      platform: 'android',
      now,
      currentVersion: '0.0.0',
      preview: { currentVersion: PREVIEW_CURRENT_VERSION, storeVersion: PREVIEW_STORE_VERSION },
      storage: memory(),
      fetchImpl: async () => {
        calls += 1;
        return lookup('9.9.9');
      },
    });
    assert.deepEqual(result, { promptVersion: null, fetched: false });
    assert.equal(calls, 0);
  });
});

describe('preview', () => {
  it('ignores flags outside dev', () => {
    assert.equal(previewFromSources(false, {
      previewFlag: '1',
      mockCurrent: '0.9.0',
      envPreview: '1',
    }), null);
  });

  it('previewAppUpdate forces a lower current version and a fake store version', () => {
    assert.deepEqual(previewFromSources(true, { previewFlag: '1' }), {
      currentVersion: PREVIEW_CURRENT_VERSION,
      storeVersion: PREVIEW_STORE_VERSION,
    });
    assert.deepEqual(previewFromSources(true, { envPreview: 'yes' }), {
      currentVersion: '0.0.0',
      storeVersion: '9.9.9',
    });
    assert.deepEqual(previewFromSources(true, { previewFlag: 1, mockCurrent: '0.5.0' }), {
      currentVersion: '0.5.0',
      storeVersion: '9.9.9',
    });
    assert.equal(previewFromSources(true, { previewFlag: '0' }), null);
    assert.equal(previewFromSources(true, {}), null);
  });

  it('shows the fake prompt without calling iTunes or writing storage', async () => {
    const store = memory({ [APP_UPDATE_DISMISSED_VERSION_KEY]: '9.9.9' });
    let calls = 0;
    const result = await runAppUpdateCheck({
      platform: 'ios',
      now: 10,
      currentVersion: '1.1.0',
      preview: previewFromSources(true, { previewFlag: '1' }),
      storage: store,
      fetchImpl: async () => {
        calls += 1;
        return lookup('1.0.0');
      },
    });
    assert.equal(result.promptVersion, '9.9.9');
    assert.equal(result.fetched, false);
    assert.equal(calls, 0);
    assert.equal(store.data.has(APP_UPDATE_LAST_CHECK_KEY), false);
    assert.equal(store.data.get(APP_UPDATE_DISMISSED_VERSION_KEY), '9.9.9');
  });

  it('a lower mock current version still uses the lookup and ignores dismiss and throttle', async () => {
    const store = memory({
      [APP_UPDATE_LAST_CHECK_KEY]: '10',
      [APP_UPDATE_DISMISSED_VERSION_KEY]: '1.2.0',
    });
    const result = await runAppUpdateCheck({
      platform: 'ios',
      now: 11,
      currentVersion: '1.1.0',
      preview: previewFromSources(true, { mockCurrent: '0.9.0' }),
      storage: store,
      fetchImpl: async () => lookup('1.2.0'),
    });
    assert.equal(result.promptVersion, '1.2.0');
    assert.equal(result.fetched, true);
    assert.equal(store.data.get(APP_UPDATE_LAST_CHECK_KEY), '10');
  });
});

describe('openAppStorePage', () => {
  it('opens the itms URL and falls back to https', async () => {
    const opened: string[] = [];
    assert.equal(
      await openAppStorePage(async (url) => { opened.push(url); }),
      'itms',
    );
    assert.deepEqual(opened, [APP_UPDATE_ITMS_URL]);

    const fallen: string[] = [];
    assert.equal(
      await openAppStorePage(async (url) => {
        fallen.push(url);
        if (url.startsWith('itms-apps:')) throw new Error('no handler');
      }),
      'https',
    );
    assert.deepEqual(fallen, [APP_UPDATE_ITMS_URL, APP_UPDATE_HTTPS_URL]);

    assert.equal(
      await openAppStorePage(async () => { throw new Error('offline'); }),
      'failed',
    );
  });
});

describe('overlay gate', () => {
  beforeEach(() => clearAppUpdateBlockers());

  it('holds the prompt while any lock or reward surface is up', () => {
    assert.equal(canPresentAppUpdate('1.2.0', false), true);
    assert.equal(canPresentAppUpdate('1.2.0', true), false);
    assert.equal(canPresentAppUpdate(null, false), false);
    assert.equal(canPresentAppUpdate('  ', false), false);

    setAppUpdateBlocked('pin', true);
    setAppUpdateBlocked('celebration', true);
    assert.equal(isAppUpdateBlocked(), true);
    setAppUpdateBlocked('pin', false);
    assert.equal(isAppUpdateBlocked(), true);
    setAppUpdateBlocked('celebration', false);
    assert.equal(isAppUpdateBlocked(), false);
  });
});

describe('storage is not personal data', () => {
  it('keeps the check keys out of backup and reset', () => {
    assert.equal(BACKUP_READ_KEYS.includes(APP_UPDATE_LAST_CHECK_KEY), false);
    assert.equal(BACKUP_READ_KEYS.includes(APP_UPDATE_DISMISSED_VERSION_KEY), false);
    assert.equal(RESET_KEYS.includes(APP_UPDATE_LAST_CHECK_KEY), false);
    assert.equal(RESET_KEYS.includes(APP_UPDATE_DISMISSED_VERSION_KEY), false);
  });
});
