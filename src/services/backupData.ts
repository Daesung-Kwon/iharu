/**
 * Backup JSON shape and pure parse/validate helpers (no AsyncStorage).
 */

import { Activity, Schedule } from '../types';
import { NotificationLeadMinutes } from '../utils/dateUtils';
import { BACKUP_JSON_FIELDS, BACKUP_JSON_FIELD_NAMES, KEYS } from './storageKeys';
import { parseSchemaVersion } from './schema';

export interface AppData {
  version: string;
  userId: string;
  activities: Activity[];
  schedules: Schedule[];
  deletedDefaultIds: string[];
  notificationSettings: Record<string, boolean>;
  notificationsEnabled: boolean;
  notificationLeadMinutes: NotificationLeadMinutes;
  settingsPin: string | null;
  lastSync?: string;
  /** Local schema version of the data (missing in old backups → 1). */
  schemaVersion?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

function isNotificationSettings(value: unknown): value is Record<string, boolean> {
  if (!isRecord(value)) return false;
  return Object.values(value).every(item => typeof item === 'boolean');
}

function isActivityEntry(value: unknown): boolean {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.name === 'string';
}

function isScheduleItemEntry(value: unknown): boolean {
  return isRecord(value) && typeof value.id === 'string';
}

function isScheduleEntry(value: unknown): boolean {
  return isRecord(value)
    && typeof value.date === 'string'
    && Array.isArray(value.items)
    && value.items.every(isScheduleItemEntry);
}

function isLeadMinutes(value: unknown): value is NotificationLeadMinutes {
  return value === 0 || value === 5 || value === 10;
}

function isSettingsPin(value: unknown): value is string | null {
  return value === null || (typeof value === 'string' && /^\d{4}$/.test(value));
}

/** True only when every AppData field is present with the right JSON types. */
export function isValidAppData(value: unknown): value is AppData {
  if (!isRecord(value)) return false;
  if (typeof value.version !== 'string' || value.version.length === 0) return false;
  if (typeof value.userId !== 'string') return false;
  if (!Array.isArray(value.activities) || !value.activities.every(isActivityEntry)) return false;
  if (!Array.isArray(value.schedules) || !value.schedules.every(isScheduleEntry)) return false;
  if (!isStringArray(value.deletedDefaultIds)) return false;
  if (!isNotificationSettings(value.notificationSettings)) return false;
  if (typeof value.notificationsEnabled !== 'boolean') return false;
  if (!isLeadMinutes(value.notificationLeadMinutes)) return false;
  if (!isSettingsPin(value.settingsPin)) return false;
  if (value.lastSync !== undefined && typeof value.lastSync !== 'string') return false;
  if (value.schemaVersion !== undefined
    && !(typeof value.schemaVersion === 'number' && Number.isInteger(value.schemaVersion) && value.schemaVersion >= 1)) return false;
  return true;
}

/**
 * Parse a backup JSON string or object.
 * Legacy files may omit the newer keys; those default so restore still works.
 */
export function parseBackupData(input: string | unknown): AppData | null {
  let value: unknown = input;
  if (typeof input === 'string') {
    try {
      value = JSON.parse(input);
    } catch {
      return null;
    }
  }
  if (!isRecord(value)) return null;

  const normalized = {
    ...value,
    deletedDefaultIds: value.deletedDefaultIds ?? [],
    notificationSettings: value.notificationSettings ?? {},
    notificationsEnabled: value.notificationsEnabled ?? true,
    notificationLeadMinutes: value.notificationLeadMinutes ?? 5,
    settingsPin: value.settingsPin === undefined ? null : value.settingsPin,
  };
  return isValidAppData(normalized) ? normalized : null;
}

/* ── Storage <-> AppData (pure; storage.ts does the AsyncStorage calls) ─── */

export function parseStoredLeadMinutes(stored: string | null): NotificationLeadMinutes {
  const parsed = stored ? Number(stored) : 5;
  return isLeadMinutes(parsed) ? parsed : 5;
}

export function parseStoredPin(stored: string | null): string | null {
  return stored && /^\d{4}$/.test(stored) ? stored : null;
}

/** Build a backup from raw stored values (key → string | null). */
export function appDataFromStorage(
  values: Record<string, string | null | undefined>,
  opts: { appVersion: string; fallbackUserId: string; nowIso: string },
): AppData {
  const get = (key: string): string | null => values[key] ?? null;
  const json = {} as Record<string, unknown>;
  for (const field of BACKUP_JSON_FIELD_NAMES) {
    const raw = get(BACKUP_JSON_FIELDS[field].key);
    json[field] = raw ? JSON.parse(raw) : BACKUP_JSON_FIELDS[field].empty;
  }
  const enabled = get(KEYS.NOTIFICATIONS_ENABLED);
  return {
    version: opts.appVersion,
    userId: get(KEYS.USER_ID) || opts.fallbackUserId,
    ...(json as Pick<AppData, 'activities' | 'schedules' | 'deletedDefaultIds' | 'notificationSettings'>),
    notificationsEnabled: enabled === null ? true : enabled === 'true',
    notificationLeadMinutes: parseStoredLeadMinutes(get(KEYS.NOTIFICATION_LEAD_MINUTES)),
    settingsPin: parseStoredPin(get(KEYS.SETTINGS_PIN)),
    schemaVersion: parseSchemaVersion(get(KEYS.SCHEMA_VERSION)),
    lastSync: opts.nowIso,
  };
}

/**
 * What restoring `data` writes. The schema version comes from the backup
 * (old backups → 1) so the migration runner upgrades restored data.
 */
export function appDataToStorage(data: AppData): { set: [string, string][]; remove: string[] } {
  const set: [string, string][] = BACKUP_JSON_FIELD_NAMES.map(field => [
    BACKUP_JSON_FIELDS[field].key,
    JSON.stringify(data[field]),
  ]);
  set.push(
    [KEYS.USER_ID, data.userId],
    [KEYS.APP_VERSION, data.version],
    [KEYS.NOTIFICATIONS_ENABLED, data.notificationsEnabled ? 'true' : 'false'],
    [KEYS.NOTIFICATION_LEAD_MINUTES, String(data.notificationLeadMinutes)],
    [KEYS.SCHEMA_VERSION, String(data.schemaVersion ?? 1)],
  );
  const remove: string[] = [];
  if (data.settingsPin) set.push([KEYS.SETTINGS_PIN, data.settingsPin]);
  else remove.push(KEYS.SETTINGS_PIN);
  return { set, remove };
}
