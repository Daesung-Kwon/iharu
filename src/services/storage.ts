/**
 * 데이터 저장 서비스
 * AsyncStorage를 사용한 로컬 저장소 관리
 * 향후 백엔드 마이그레이션을 위한 구조 설계
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, appDataFromStorage, appDataToStorage, parseBackupData } from './backupData';
import { BACKUP_READ_KEYS, KEYS, RESET_KEYS } from './storageKeys';
import { runMigrations, MigrationResult } from './schema';

export { AppData, isValidAppData, parseBackupData } from './backupData';
export { KEYS } from './storageKeys';

const CURRENT_VERSION = '1.0.0';

let migrationInFlight: Promise<MigrationResult> | null = null;

/**
 * Bring stored data up to CURRENT_SCHEMA_VERSION before anything reads it.
 * Concurrent callers share one run; later calls (e.g. after a restore) run
 * again, which is a no-op when the data is already current.
 */
export const ensureSchema = (): Promise<MigrationResult> => {
  if (!migrationInFlight) {
    migrationInFlight = runMigrations({
      getItem: key => AsyncStorage.getItem(key),
      setItem: (key, value) => AsyncStorage.setItem(key, value),
    }).finally(() => {
      migrationInFlight = null;
    });
  }
  return migrationInFlight;
};

/**
 * 앱 데이터 전체 내보내기 (백업용)
 */
export const exportAllData = async (): Promise<AppData | null> => {
  try {
    const pairs = await AsyncStorage.multiGet(BACKUP_READ_KEYS);
    return appDataFromStorage(Object.fromEntries(pairs), {
      appVersion: CURRENT_VERSION,
      fallbackUserId: generateUserId(),
      nowIso: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to export data:', error);
    return null;
  }
};

/**
 * 앱 데이터 전체 가져오기 (복원용)
 */
export const importAllData = async (data: unknown): Promise<boolean> => {
  const parsed = parseBackupData(data);
  if (!parsed) {
    console.error('Invalid backup data');
    return false;
  }

  try {
    const { set, remove } = appDataToStorage(parsed);
    await AsyncStorage.multiSet(set);
    if (remove.length > 0) await AsyncStorage.multiRemove(remove);
    await ensureSchema();
    console.log('Data imported successfully');
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};

/**
 * 모든 데이터 삭제 (초기화). USER_ID는 유지.
 */
export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove(RESET_KEYS);

    console.log('All data cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear data:', error);
    return false;
  }
};

/**
 * 디바이스 고유 ID 생성
 */
const generateUserId = (): string => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 사용자 ID 가져오기 (없으면 생성)
 */
export const getUserId = async (): Promise<string> => {
  try {
    let userId = await AsyncStorage.getItem(KEYS.USER_ID);
    if (!userId) {
      userId = generateUserId();
      await AsyncStorage.setItem(KEYS.USER_ID, userId);
    }
    return userId;
  } catch (error) {
    console.error('Failed to get user ID:', error);
    return generateUserId();
  }
};

/**
 * 마이그레이션 상태 확인
 */
export const isMigrated = async (): Promise<boolean> => {
  try {
    const migrated = await AsyncStorage.getItem(KEYS.MIGRATED);
    return migrated === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * 마이그레이션 완료 표시
 */
export const markAsMigrated = async (): Promise<void> => {
  await AsyncStorage.setItem(KEYS.MIGRATED, 'true');
};

/**
 * 앱 버전 확인 (데이터 마이그레이션용)
 */
export const checkVersion = async (): Promise<string> => {
  try {
    const version = await AsyncStorage.getItem(KEYS.APP_VERSION);
    if (!version) {
      await AsyncStorage.setItem(KEYS.APP_VERSION, CURRENT_VERSION);
      return CURRENT_VERSION;
    }
    return version;
  } catch (error) {
    return CURRENT_VERSION;
  }
};

export default {
  ensureSchema,
  exportAllData,
  importAllData,
  clearAllData,
  getUserId,
  isMigrated,
  markAsMigrated,
  checkVersion,
  parseBackupData,
};
