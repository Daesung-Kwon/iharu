/**
 * AsyncStorage keys and which of them backup / restore / reset touch.
 * Pure (no AsyncStorage import) so backup code and tests can share it.
 *
 * Adding a new local data key (e.g. rewards, dayConfirms, boxes):
 *   1. add it to KEYS,
 *   2. add one entry to BACKUP_JSON_FIELDS (JSON value) - backup, restore and
 *      reset then all pick it up,
 *   3. add the field to AppData and, if it can be missing in old backups, a
 *      default in parseBackupData (backupData.ts).
 */

export const KEYS = {
  APP_VERSION: '@app_version',
  USER_ID: '@user_id',
  ACTIVITIES: '@daily_schedule_activities',
  SCHEDULES: '@daily_schedule_schedules',
  DELETED_DEFAULTS: '@daily_schedule_deleted_defaults',
  NOTIFICATIONS: '@daily_schedule_notifications',
  NOTIFICATIONS_ENABLED: '@settings.notificationsEnabled',
  NOTIFICATION_LEAD_MINUTES: '@settings.notificationLeadMinutes',
  SETTINGS_PIN: '@settings.pin',
  SETTINGS: '@settings',
  LAST_SYNC: '@last_sync',
  MIGRATED: '@migrated',
  SCHEMA_VERSION: '@iharu.schemaVersion',
} as const;

/** JSON-valued AppData fields, their key, and the value used when the key is empty. */
export const BACKUP_JSON_FIELDS = {
  activities: { key: KEYS.ACTIVITIES, empty: [] as unknown[] },
  schedules: { key: KEYS.SCHEDULES, empty: [] as unknown[] },
  deletedDefaultIds: { key: KEYS.DELETED_DEFAULTS, empty: [] as unknown[] },
  notificationSettings: { key: KEYS.NOTIFICATIONS, empty: {} as Record<string, unknown> },
} as const;

export type BackupJsonField = keyof typeof BACKUP_JSON_FIELDS;

export const BACKUP_JSON_FIELD_NAMES = Object.keys(BACKUP_JSON_FIELDS) as BackupJsonField[];

/** Scalar keys backup reads and restore writes (handled one by one in backupData.ts). */
export const BACKUP_SCALAR_KEYS = [
  KEYS.USER_ID,
  KEYS.NOTIFICATIONS_ENABLED,
  KEYS.NOTIFICATION_LEAD_MINUTES,
  KEYS.SETTINGS_PIN,
  KEYS.SCHEMA_VERSION,
] as const;

/** Every key backup reads. */
export const BACKUP_READ_KEYS: string[] = [
  ...BACKUP_JSON_FIELD_NAMES.map(f => BACKUP_JSON_FIELDS[f].key),
  ...BACKUP_SCALAR_KEYS,
];

/**
 * Keys "데이터 초기화" removes. USER_ID and APP_VERSION stay. The schema
 * version goes too: an empty store re-runs the (non-destructive) migrations.
 */
export const RESET_KEYS: string[] = [
  ...BACKUP_JSON_FIELD_NAMES.map(f => BACKUP_JSON_FIELDS[f].key),
  KEYS.NOTIFICATIONS_ENABLED,
  KEYS.NOTIFICATION_LEAD_MINUTES,
  KEYS.SETTINGS_PIN,
  KEYS.SETTINGS,
  KEYS.LAST_SYNC,
  KEYS.SCHEMA_VERSION,
];
