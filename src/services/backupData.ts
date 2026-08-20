/**
 * Backup JSON shape and pure parse/validate helpers (no AsyncStorage).
 */

import { Activity, Schedule } from '../types';

export interface AppData {
  version: string;
  userId: string;
  activities: Activity[];
  schedules: Schedule[];
  deletedDefaultIds: string[];
  notificationSettings: Record<string, boolean>;
  notificationsEnabled: boolean;
  lastSync?: string;
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
  if (value.lastSync !== undefined && typeof value.lastSync !== 'string') return false;
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
  };
  return isValidAppData(normalized) ? normalized : null;
}
