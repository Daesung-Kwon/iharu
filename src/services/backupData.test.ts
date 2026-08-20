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

    assert.equal(isValidAppData(noVersion), false);
    assert.equal(isValidAppData(noUserId), false);
    assert.equal(isValidAppData(noActivities), false);
    assert.equal(isValidAppData(noSchedules), false);
    assert.equal(isValidAppData(noDeleted), false);
    assert.equal(isValidAppData(noSettings), false);
    assert.equal(isValidAppData(noEnabled), false);
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
  });
});

describe('parseBackupData', () => {
  it('parses a valid JSON string', () => {
    const parsed = parseBackupData(JSON.stringify(validAppData));
    assert.deepEqual(parsed, validAppData);
  });

  it('parses a valid object', () => {
    const parsed = parseBackupData(validAppData);
    assert.deepEqual(parsed, validAppData);
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
    });
  });
});
