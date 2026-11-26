/**
 * Soft "a newer App Store version is out" check.
 *
 * iOS only. One public GET of a fixed iTunes lookup URL: no account, no
 * device id, no body. Offline, timeout, bad JSON, and an empty result stay
 * quiet. Android does not call out (Play is not launched).
 *
 * Dev preview (ignored unless `dev` is true; the UI also skips it off iOS):
 *   -previewAppUpdate 1
 *   -mockCurrentVersion 0.9.0
 *   -mockStoreVersion 9.9.9
 *   EXPO_PUBLIC_PREVIEW_APP_UPDATE=1
 *   EXPO_PUBLIC_APP_UPDATE_MOCK_CURRENT
 *   EXPO_PUBLIC_APP_UPDATE_MOCK_STORE
 * Preview skips the daily throttle and the saved dismiss, and it does not
 * write either key, so a screenshot launch does not change a real check.
 */

export const APP_UPDATE_LOOKUP_URL =
  'https://itunes.apple.com/lookup?id=6758513674&country=kr';
export const APP_UPDATE_ITMS_URL = 'itms-apps://apps.apple.com/app/id6758513674';
export const APP_UPDATE_HTTPS_URL = 'https://apps.apple.com/app/id6758513674';

/** Epoch milliseconds. Not backed up and not part of a data reset. */
export const APP_UPDATE_LAST_CHECK_KEY = '@iharu.appUpdate.lastCheckAt';
/** Store version the user hid with 나중에. Not backed up. */
export const APP_UPDATE_DISMISSED_VERSION_KEY = '@iharu.appUpdate.dismissedVersion';

export const APP_UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const APP_UPDATE_TIMEOUT_MS = 8000;

export const PREVIEW_APP_UPDATE_SETTING = 'previewAppUpdate';
export const MOCK_CURRENT_VERSION_SETTING = 'mockCurrentVersion';
export const MOCK_STORE_VERSION_SETTING = 'mockStoreVersion';

/** Pretend the installed build is ancient so any store version is newer. */
export const PREVIEW_CURRENT_VERSION = '0.0.0';
/** Used when -previewAppUpdate is on and no mock store version was passed. */
export const PREVIEW_STORE_VERSION = '9.9.9';

export type VersionStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

export type UpdateFetch = (
  input: string,
  init?: { method?: string; headers?: Record<string, string>; signal?: AbortSignal },
) => Promise<{ ok: boolean; text: () => Promise<string> }>;

export type AppUpdatePreview = {
  /** Replaces the installed version. Null keeps the real one. */
  currentVersion: string | null;
  /** When set, skip the network and treat this as results[0].version. */
  storeVersion: string | null;
};

export type UpdateCheckResult = {
  promptVersion: string | null;
  fetched: boolean;
};

const TRUTHY = new Set(['1', 'true', 'yes', 'y', 'on']);

export function isTruthyFlag(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value !== 'string') return false;
  return TRUTHY.has(value.trim().toLowerCase());
}

/** A launch/env version, or null when the value is absent or has no digit. */
export function versionFromLaunchValue(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || !/\d/.test(trimmed)) return null;
  return trimmed;
}

export function previewFromSources(
  dev: boolean,
  sources: {
    previewFlag?: unknown;
    mockCurrent?: unknown;
    mockStore?: unknown;
    envPreview?: unknown;
    envCurrent?: unknown;
    envStore?: unknown;
  },
): AppUpdatePreview | null {
  if (!dev) return null;
  const current = versionFromLaunchValue(sources.mockCurrent)
    ?? versionFromLaunchValue(sources.envCurrent);
  const store = versionFromLaunchValue(sources.mockStore)
    ?? versionFromLaunchValue(sources.envStore);
  if (isTruthyFlag(sources.previewFlag) || isTruthyFlag(sources.envPreview)) {
    return {
      currentVersion: current ?? PREVIEW_CURRENT_VERSION,
      storeVersion: store ?? PREVIEW_STORE_VERSION,
    };
  }
  if (!current && !store) return null;
  return { currentVersion: current, storeVersion: store };
}

export function isPreviewActive(preview: AppUpdatePreview | null | undefined): boolean {
  return !!preview && (preview.currentVersion != null || preview.storeVersion != null);
}

/** Leading integers per segment. Missing segments compare as 0. A leading v is ignored. */
export function parseVersionParts(version: string): number[] {
  const cleaned = version.trim().replace(/^v/i, '');
  if (!cleaned) return [];
  return cleaned.split('.').map((segment) => {
    const match = segment.trim().match(/^(\d+)/);
    if (!match) return 0;
    const n = parseInt(match[1], 10);
    return Number.isFinite(n) ? n : 0;
  });
}

/** Positive when `a` is newer than `b`. */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersionParts(a);
  const pb = parseVersionParts(b);
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const da = pa[i] ?? 0;
    const db = pb[i] ?? 0;
    if (da > db) return 1;
    if (da < db) return -1;
  }
  return 0;
}

export function isStoreVersionNewer(store: string, current: string): boolean {
  return compareVersions(store, current) > 0;
}

/**
 * Installed version: nativeApplicationVersion when it is non-empty, otherwise
 * the app.json version from expo-constants. `0.0.0` only when both are missing.
 */
export function resolveInstalledVersion(
  nativeVersion: string | null | undefined,
  configVersion: string | null | undefined,
): string {
  const native = nativeVersion?.trim();
  if (native) return native;
  const config = configVersion?.trim();
  if (config) return config;
  return '0.0.0';
}

export function parseLookupVersion(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const results = (body as { results?: unknown }).results;
  if (!Array.isArray(results) || results.length === 0) return null;
  const first = results[0];
  if (!first || typeof first !== 'object') return null;
  const version = (first as { version?: unknown }).version;
  if (typeof version !== 'string') return null;
  const trimmed = version.trim();
  if (!trimmed || !/\d/.test(trimmed)) return null;
  return trimmed;
}

export function shouldCheckForUpdate(
  lastCheckRaw: string | null | undefined,
  now: number,
  intervalMs: number = APP_UPDATE_CHECK_INTERVAL_MS,
): boolean {
  if (lastCheckRaw == null) return true;
  const raw = lastCheckRaw.trim();
  if (!raw) return true;
  const asNumber = Number(raw);
  const then = Number.isFinite(asNumber) && /^\d+$/.test(raw) ? asNumber : Date.parse(raw);
  if (!Number.isFinite(then)) return true;
  return now - then >= intervalMs;
}

export function shouldPromptForVersion(
  storeVersion: string | null | undefined,
  currentVersion: string,
  dismissedVersion: string | null | undefined,
): boolean {
  if (!storeVersion) return false;
  const store = storeVersion.trim();
  if (!store) return false;
  if (!isStoreVersionNewer(store, currentVersion)) return false;
  if (dismissedVersion && dismissedVersion.trim() === store) return false;
  return true;
}

export function canPresentAppUpdate(promptVersion: string | null, blocked: boolean): boolean {
  return !blocked && promptVersion != null && promptVersion.trim().length > 0;
}

async function readItem(storage: VersionStorage, key: string): Promise<string | null> {
  try {
    return await storage.getItem(key);
  } catch {
    return null;
  }
}

async function writeItem(storage: VersionStorage, key: string, value: string): Promise<void> {
  try {
    await storage.setItem(key, value);
  } catch {
    // A failed write must not surface. The next foreground can try again.
  }
}

export async function lookupStoreVersion(
  fetchImpl: UpdateFetch,
  timeoutMs: number = APP_UPDATE_TIMEOUT_MS,
): Promise<string | null> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve(null);
    }, timeoutMs);
  });
  const request = (async (): Promise<string | null> => {
    try {
      const res = await fetchImpl(APP_UPDATE_LOOKUP_URL, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!res?.ok) return null;
      const text = await res.text();
      try {
        return parseLookupVersion(JSON.parse(text));
      } catch {
        return null;
      }
    } catch {
      return null;
    }
  })();
  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function runAppUpdateCheck(input: {
  platform: string;
  now: number;
  currentVersion: string;
  preview: AppUpdatePreview | null;
  storage: VersionStorage;
  fetchImpl?: UpdateFetch;
  timeoutMs?: number;
  intervalMs?: number;
}): Promise<UpdateCheckResult> {
  const none: UpdateCheckResult = { promptVersion: null, fetched: false };
  try {
    if (input.platform !== 'ios') return none;
    const preview = isPreviewActive(input.preview) ? input.preview : null;
    const current = (preview?.currentVersion ?? input.currentVersion).trim();
    if (!current) return none;

    if (preview?.storeVersion) {
      const store = preview.storeVersion.trim();
      return {
        promptVersion: shouldPromptForVersion(store, current, null) ? store : null,
        fetched: false,
      };
    }

    if (!preview) {
      const last = await readItem(input.storage, APP_UPDATE_LAST_CHECK_KEY);
      if (!shouldCheckForUpdate(last, input.now, input.intervalMs)) return none;
    }

    const fetchImpl = input.fetchImpl ?? (fetch as unknown as UpdateFetch);
    const store = await lookupStoreVersion(fetchImpl, input.timeoutMs ?? APP_UPDATE_TIMEOUT_MS);
    if (!preview) {
      await writeItem(input.storage, APP_UPDATE_LAST_CHECK_KEY, String(input.now));
    }
    if (!store) return { promptVersion: null, fetched: true };
    const dismissed = preview
      ? null
      : await readItem(input.storage, APP_UPDATE_DISMISSED_VERSION_KEY);
    return {
      promptVersion: shouldPromptForVersion(store, current, dismissed) ? store : null,
      fetched: true,
    };
  } catch {
    return none;
  }
}

export async function dismissAppUpdate(
  storage: VersionStorage,
  version: string,
  options?: { persist?: boolean },
): Promise<void> {
  if (options?.persist === false) return;
  const trimmed = version.trim();
  if (!trimmed) return;
  await writeItem(storage, APP_UPDATE_DISMISSED_VERSION_KEY, trimmed);
}

export async function openAppStorePage(
  openURL: (url: string) => Promise<unknown>,
): Promise<'itms' | 'https' | 'failed'> {
  try {
    await openURL(APP_UPDATE_ITMS_URL);
    return 'itms';
  } catch {
    try {
      await openURL(APP_UPDATE_HTTPS_URL);
      return 'https';
    } catch {
      return 'failed';
    }
  }
}

const blockers = new Set<string>();
const blockerListeners = new Set<() => void>();

function emitBlockers(): void {
  for (const listener of blockerListeners) listener();
}

/** True while a lock, celebration, or reward surface is on screen. */
export function isAppUpdateBlocked(): boolean {
  return blockers.size > 0;
}

export function setAppUpdateBlocked(id: string, blocked: boolean): void {
  const before = blockers.size > 0;
  if (blocked) blockers.add(id);
  else blockers.delete(id);
  if (before !== blockers.size > 0) emitBlockers();
}

export function subscribeAppUpdateGate(listener: () => void): () => void {
  blockerListeners.add(listener);
  return () => {
    blockerListeners.delete(listener);
  };
}

export function clearAppUpdateBlockers(): void {
  if (blockers.size === 0) return;
  blockers.clear();
  emitBlockers();
}
