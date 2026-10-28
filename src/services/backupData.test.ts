import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isValidAppData, parseBackupData } from './backupData';

const validAppData = {
  version: '1.0.0',
  userId: 'user-1',
  activities: [{ id: 'activity-1', name: '숙제' }],
  schedules: [{ id: 'schedule-1', date: '2026-08-20', items: [] }],
  deletedDefaultIds: ['default-0'],
  notificationSettings: { 'item-1': true, 'item-2': false },
  notificationsEnabled: false,
  notificationLeadMinutes: 10,
  settingsPin: '1234',
  lastSync: '2026-08-20T00:00:00.000Z',
};

describe('isValidAppData', () => {
  it('accepts a complete backup object', () => {
    assert.equal(isValidAppData(validAppData), true);
  });

  it('rejects non-objects', () => {
    assert.equal(isValidAppData(null), false);
    assert.equal(isValidAppData('{"version":"1.0.0"}'), false);
    assert.equal(isValidAppData([]), false);
  });

  it('rejects missing required fields', () => {
    const { version: _version, ...noVersion } = validAppData;
    const { userId: _userId, ...noUserId } = validAppData;
    const { activities: _activities, ...noActivities } = validAppData;
    const { schedules: _schedules, ...noSchedules } = validAppData;
    const { deletedDefaultIds: _deleted, ...noDeleted } = validAppData;
    const { notificationSettings: _settings, ...noSettings } = validAppData;
    const { notificationsEnabled: _enabled, ...noEnabled } = validAppData;
    const { notificationLeadMinutes: _lead, ...noLead } = validAppData;
    const { settingsPin: _pin, ...noPin } = validAppData;

    assert.equal(isValidAppData(noVersion), false);
    assert.equal(isValidAppData(noUserId), false);
    assert.equal(isValidAppData(noActivities), false);
    assert.equal(isValidAppData(noSchedules), false);
    assert.equal(isValidAppData(noDeleted), false);
    assert.equal(isValidAppData(noSettings), false);
    assert.equal(isValidAppData(noEnabled), false);
    assert.equal(isValidAppData(noLead), false);
    assert.equal(isValidAppData(noPin), false);
  });

  it('rejects wrong field types', () => {
    assert.equal(isValidAppData({ ...validAppData, version: 1 }), false);
    assert.equal(isValidAppData({ ...validAppData, version: '' }), false);
    assert.equal(isValidAppData({ ...validAppData, userId: 123 }), false);
    assert.equal(isValidAppData({ ...validAppData, activities: {} }), false);
    assert.equal(isValidAppData({ ...validAppData, schedules: 'none' }), false);
    assert.equal(isValidAppData({ ...validAppData, deletedDefaultIds: 'default-0' }), false);
    assert.equal(isValidAppData({ ...validAppData, deletedDefaultIds: [1] }), false);
    assert.equal(isValidAppData({ ...validAppData, notificationSettings: [] }), false);
    assert.equal(isValidAppData({ ...validAppData, notificationSettings: { 'item-1': 'yes' } }), false);
    assert.equal(isValidAppData({ ...validAppData, notificationsEnabled: 'true' }), false);
    assert.equal(isValidAppData({ ...validAppData, lastSync: 123 }), false);
    assert.equal(isValidAppData({ ...validAppData, notificationLeadMinutes: 7 }), false);
    assert.equal(isValidAppData({ ...validAppData, notificationLeadMinutes: '5' }), false);
    assert.equal(isValidAppData({ ...validAppData, settingsPin: '12' }), false);
    assert.equal(isValidAppData({ ...validAppData, settingsPin: 'abcd' }), false);
    assert.equal(isValidAppData({ ...validAppData, settingsPin: 1234 }), false);
  });

  it('accepts a null PIN and 0-minute lead', () => {
    assert.equal(isValidAppData({ ...validAppData, settingsPin: null, notificationLeadMinutes: 0 }), true);
  });

  it('rejects garbage nested activities and schedules', () => {
    assert.equal(isValidAppData({ ...validAppData, activities: [{}] }), false);
    assert.equal(isValidAppData({ ...validAppData, activities: [null] }), false);
    assert.equal(isValidAppData({ ...validAppData, activities: [{ id: 1, name: '숙제' }] }), false);
    assert.equal(isValidAppData({ ...validAppData, activities: [{ name: '숙제' }] }), false);
    assert.equal(isValidAppData({ ...validAppData, schedules: [{}] }), false);
    assert.equal(isValidAppData({ ...validAppData, schedules: [null] }), false);
    assert.equal(isValidAppData({ ...validAppData, schedules: [{ date: '2026-08-20' }] }), false);
    assert.equal(isValidAppData({
      ...validAppData,
      schedules: [{ date: '2026-08-20', items: 'nope' }],
    }), false);
    assert.equal(isValidAppData({
      ...validAppData,
      schedules: [{ date: '2026-08-20', items: [null] }],
    }), false);
  });
});

describe('parseBackupData', () => {
  it('parses a valid JSON string', () => {
    const parsed = parseBackupData(JSON.stringify(validAppData));
    assert.deepEqual(parsed, { ...validAppData, weeklyPromise: null, weeklyPromises: [], weeklyResults: [] });
  });

  it('parses a valid object', () => {
    const parsed = parseBackupData(validAppData);
    assert.deepEqual(parsed, { ...validAppData, weeklyPromise: null, weeklyPromises: [], weeklyResults: [] });
  });

  it('returns null for invalid JSON', () => {
    assert.equal(parseBackupData('{not json'), null);
    assert.equal(parseBackupData(''), null);
  });

  it('returns null when required core fields are missing', () => {
    assert.equal(parseBackupData({}), null);
    assert.equal(parseBackupData({ version: '1.0.0' }), null);
    assert.equal(parseBackupData({
      version: '1.0.0',
      userId: 'user-1',
      schedules: [],
    }), null);
    assert.equal(parseBackupData({
      version: '1.0.0',
      userId: 'user-1',
      activities: [],
    }), null);
  });

  it('returns null for wrong types', () => {
    assert.equal(parseBackupData({
      version: '1.0.0',
      userId: 'user-1',
      activities: '[]',
      schedules: [],
    }), null);
    assert.equal(parseBackupData({
      version: '1.0.0',
      userId: 'user-1',
      activities: [],
      schedules: [],
      deletedDefaultIds: {},
    }), null);
    assert.equal(parseBackupData({
      version: '1.0.0',
      userId: 'user-1',
      activities: [],
      schedules: [],
      notificationsEnabled: 'false',
    }), null);
    assert.equal(parseBackupData({
      version: '1.0.0',
      userId: 'user-1',
      activities: [{ id: 'activity-1' }],
      schedules: [],
    }), null);
    assert.equal(parseBackupData({
      version: '1.0.0',
      userId: 'user-1',
      activities: [],
      schedules: [{ id: 'schedule-1', date: '2026-08-20', items: [{}] }],
    }), null);
    assert.equal(parseBackupData({
      version: '1.0.0',
      userId: 'user-1',
      activities: [],
      schedules: [],
      notificationLeadMinutes: 3,
    }), null);
    assert.equal(parseBackupData({
      version: '1.0.0',
      userId: 'user-1',
      activities: [],
      schedules: [],
      settingsPin: '99',
    }), null);
  });

  it('fills defaults for legacy backups that omit newer keys', () => {
    const parsed = parseBackupData({
      version: '1.0.0',
      userId: 'user-1',
      activities: [],
      schedules: [],
    });
    assert.deepEqual(parsed, {
      version: '1.0.0',
      userId: 'user-1',
      activities: [],
      schedules: [],
      deletedDefaultIds: [],
      notificationSettings: {},
      notificationsEnabled: true,
      notificationLeadMinutes: 5,
      settingsPin: null,
      weeklyPromise: null,
      weeklyPromises: [],
      weeklyResults: [],
    });
  });

  it('keeps an explicit 0-minute lead and does not treat it as missing', () => {
    const parsed = parseBackupData({
      version: '1.0.0',
      userId: 'user-1',
      activities: [],
      schedules: [],
      notificationLeadMinutes: 0,
      settingsPin: null,
    });
    assert.equal(parsed?.notificationLeadMinutes, 0);
    assert.equal(parsed?.settingsPin, null);
  });
});

import { appDataFromStorage, appDataToStorage } from './backupData';
import { BACKUP_JSON_FIELDS, BACKUP_READ_KEYS, KEYS, RESET_KEYS } from './storageKeys';

describe('backup key list', () => {
  it('reset removes every backed-up JSON key and the schema version, but keeps the user id', () => {
    for (const { key } of Object.values(BACKUP_JSON_FIELDS)) {
      assert.ok(RESET_KEYS.includes(key), key);
      assert.ok(BACKUP_READ_KEYS.includes(key), key);
    }
    assert.ok(RESET_KEYS.includes(KEYS.SCHEMA_VERSION));
    assert.ok(!RESET_KEYS.includes(KEYS.USER_ID));
  });
});

describe('backup round trip', () => {
  const storedSchedules = [{
    id: 'schedule-2026-10-19', userId: 'u', childProfileId: 'c', date: '2026-10-19', dateKind: 'local',
    createdAt: 'c', updatedAt: 'u',
    items: [{
      id: 'item-1', scheduleId: 'schedule-2026-10-19', activityId: 'a', startTime: '09:00', endTime: '09:30',
      status: 'completed', completedAt: '2026-10-19T00:10:00.000Z', orderIndex: 0, createdAt: 'c', updatedAt: 'u',
    }],
  }];
  const values: Record<string, string> = {
    [KEYS.USER_ID]: 'user-1',
    [KEYS.SCHEDULES]: JSON.stringify(storedSchedules),
    [KEYS.ACTIVITIES]: JSON.stringify([{ id: 'activity-1', name: '숙제' }]),
    [KEYS.NOTIFICATIONS_ENABLED]: 'false',
    [KEYS.NOTIFICATION_LEAD_MINUTES]: '10',
    [KEYS.SETTINGS_PIN]: '1234',
    [KEYS.SCHEMA_VERSION]: '2',
  };
  const opts = { appVersion: '1.0.0', fallbackUserId: 'fallback', nowIso: 'NOW' };

  it('export → JSON file → restore keeps completedAt and every stored value', () => {
    const exported = appDataFromStorage(values, opts);
    const file = JSON.stringify(exported);
    const parsed = parseBackupData(file);
    assert.ok(parsed);
    assert.equal(parsed.schedules[0].items[0].completedAt, '2026-10-19T00:10:00.000Z');
    const { set, remove } = appDataToStorage(parsed);
    const restored = Object.fromEntries(set);
    assert.deepEqual(JSON.parse(restored[KEYS.SCHEDULES]), storedSchedules);
    assert.equal(restored[KEYS.SETTINGS_PIN], '1234');
    assert.equal(restored[KEYS.NOTIFICATIONS_ENABLED], 'false');
    assert.equal(restored[KEYS.NOTIFICATION_LEAD_MINUTES], '10');
    assert.equal(restored[KEYS.SCHEMA_VERSION], '2');
    assert.equal(restored[KEYS.USER_ID], 'user-1');
    assert.deepEqual(remove, []);
    assert.deepEqual(appDataFromStorage(restored, opts), exported);
  });

  it('empty store exports defaults like before', () => {
    const exported = appDataFromStorage({}, opts);
    assert.equal(exported.userId, 'fallback');
    assert.deepEqual(exported.schedules, []);
    assert.deepEqual(exported.notificationSettings, {});
    assert.equal(exported.notificationsEnabled, true);
    assert.equal(exported.notificationLeadMinutes, 5);
    assert.equal(exported.settingsPin, null);
    assert.equal(exported.schemaVersion, 1);
  });

  it('an old backup without schemaVersion restores as v1 and drops the PIN key when it has none', () => {
    const parsed = parseBackupData({ ...validAppData, settingsPin: null });
    assert.ok(parsed);
    const { set, remove } = appDataToStorage(parsed);
    assert.equal(Object.fromEntries(set)[KEYS.SCHEMA_VERSION], '1');
    assert.deepEqual(remove, [KEYS.SETTINGS_PIN]);
  });

  it('rejects a bad schemaVersion', () => {
    assert.equal(isValidAppData({ ...validAppData, schemaVersion: 0 }), false);
    assert.equal(isValidAppData({ ...validAppData, schemaVersion: '2' }), false);
    assert.equal(isValidAppData({ ...validAppData, schemaVersion: 2 }), true);
  });
});

describe('weekly promise backup', () => {
  const promise = {
    id: 'promise-1', kind: 'weekly', endsFrom: null, createdAt: 'c', updatedAt: 'u',
    terms: [{ reward: '게임 재화 100', goalPercent: 80, effectiveFrom: '2026-10-12' }],
  };
  const result = {
    id: 'promise-1:2026-10-12', promiseId: 'promise-1', weekStart: '2026-10-12', weekEnd: '2026-10-18',
    reward: '게임 재화 100', goalPercent: 80, doneDays: 4, countedDays: 5, rate: 80, achieved: true,
    judgedAt: 'j', seenAt: null,
  };
  const opts = { appVersion: '1.0.0', fallbackUserId: 'f', nowIso: 'NOW' };

  it('an old single-promise backup restores into the list with the same id', () => {
    const exported = appDataFromStorage({
      [KEYS.WEEKLY_PROMISE]: JSON.stringify(promise),
      [KEYS.WEEKLY_RESULTS]: JSON.stringify([result]),
      [KEYS.SCHEMA_VERSION]: '3',
    }, opts);
    assert.deepEqual(exported.weeklyPromise, promise);
    const parsed = parseBackupData(JSON.stringify(exported));
    assert.ok(parsed);
    const restored = Object.fromEntries(appDataToStorage(parsed).set);
    assert.deepEqual(JSON.parse(restored[KEYS.WEEKLY_PROMISES]), [promise]);
    assert.equal(restored[KEYS.WEEKLY_PROMISE], 'null');
    assert.deepEqual(JSON.parse(restored[KEYS.WEEKLY_RESULTS]), [result]);
  });

  it('round-trips several promises with stable ids', () => {
    const two = { ...promise, id: 'promise-2', terms: [{ reward: '공원 가기', goalPercent: 60, effectiveFrom: '2026-10-19' }] };
    const exported = appDataFromStorage({
      [KEYS.WEEKLY_PROMISES]: JSON.stringify([promise, two]),
      [KEYS.WEEKLY_RESULTS]: JSON.stringify([result]),
      [KEYS.SCHEMA_VERSION]: '5',
    }, opts);
    const parsed = parseBackupData(JSON.stringify(exported));
    assert.ok(parsed);
    const restored = Object.fromEntries(appDataToStorage(parsed).set);
    assert.deepEqual(JSON.parse(restored[KEYS.WEEKLY_PROMISES]).map((p: { id: string }) => p.id), ['promise-1', 'promise-2']);
    assert.deepEqual(appDataFromStorage(restored, opts), exported);
  });

  it('rejects a backup with a broken promise in the list or duplicate ids', () => {
    const base = { version: '1', userId: 'u', activities: [], schedules: [] };
    assert.equal(parseBackupData({ ...base, weeklyPromises: [promise, { id: 'x' }] }), null);
    assert.equal(isValidAppData({ ...parseBackupData(base)!, weeklyPromises: [promise, promise] }), false);
  });

  it('a backup without a promise restores as none, and the keys are reset', () => {
    const restored = Object.fromEntries(appDataToStorage(appDataFromStorage({}, opts)).set);
    assert.equal(restored[KEYS.WEEKLY_PROMISE], 'null');
    assert.equal(restored[KEYS.WEEKLY_RESULTS], '[]');
    assert.ok(RESET_KEYS.includes(KEYS.WEEKLY_PROMISE));
    assert.ok(RESET_KEYS.includes(KEYS.WEEKLY_PROMISES));
    assert.equal(restored[KEYS.WEEKLY_PROMISES], '[]');
    assert.ok(RESET_KEYS.includes(KEYS.WEEKLY_RESULTS));
  });

  it('rejects a broken promise in a backup', () => {
    assert.equal(parseBackupData({ version: '1', userId: 'u', activities: [], schedules: [],
      weeklyPromise: { id: 'x', kind: 'weekly', terms: [{ reward: 'a', goalPercent: 500, effectiveFrom: '2026-10-12' }],
        endsFrom: null, createdAt: 'c', updatedAt: 'u' } }), null);
  });
});

describe('reward expansion backup', () => {
  const base = {
    [KEYS.USER_ID]: 'user-1', [KEYS.SCHEDULES]: '[]', [KEYS.ACTIVITIES]: '[]',
  };
  const opts = { appVersion: '1.0.0', fallbackUserId: 'f', nowIso: 'NOW' };
  const bought = { unlocked: true, source: 'store' as const, productId: 'p', unlockedAt: 'x' };
  const locked = { unlocked: false, source: null, productId: null, unlockedAt: null };
  const flagWrite = (set: [string, string][]) => set.find(([k]) => k === KEYS.REWARD_EXPANSION);

  it('is exported and read back from the file', () => {
    const exported = appDataFromStorage({ ...base, [KEYS.REWARD_EXPANSION]: JSON.stringify(bought) }, opts);
    const parsed = parseBackupData(JSON.stringify(exported))!;
    assert.deepEqual(parsed.rewardExpansion, bought);
    const { set } = appDataToStorage(parsed, { rewardExpansion: locked });
    assert.deepEqual(JSON.parse(flagWrite(set)![1]), bought);
  });

  it('restoring an old or locked backup never removes a purchase', () => {
    const old = parseBackupData(JSON.stringify(appDataFromStorage(base, opts)))!;
    assert.deepEqual(old.rewardExpansion, locked);
    assert.equal(flagWrite(appDataToStorage(old, { rewardExpansion: bought }).set), undefined);
    assert.equal(flagWrite(appDataToStorage(old, { rewardExpansion: locked }).set), undefined);
  });

  it('is backed up but kept on reset', () => {
    assert.ok(BACKUP_READ_KEYS.includes(KEYS.REWARD_EXPANSION));
    assert.ok(!RESET_KEYS.includes(KEYS.REWARD_EXPANSION));
  });

  it('rejects a broken flag in a backup', () => {
    const exported = appDataFromStorage(base, opts);
    assert.equal(isValidAppData({ ...exported, rewardExpansion: { unlocked: 'yes' } }), false);
  });
});
