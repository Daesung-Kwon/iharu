/**
 * 데이터 저장 서비스
 * AsyncStorage를 사용한 로컬 저장소 관리
 * 향후 백엔드 마이그레이션을 위한 구조 설계
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity, Schedule } from '../types';

const KEYS = {
  APP_VERSION: '@app_version',
  USER_ID: '@user_id',
  ACTIVITIES: '@daily_schedule_activities', // ActivityContext와 동일
  SCHEDULES: '@daily_schedule_schedules', // ScheduleContext와 동일
  SETTINGS: '@settings',
  LAST_SYNC: '@last_sync',
  MIGRATED: '@migrated',
} as const;

const CURRENT_VERSION = '1.0.0';

export interface AppData {
  version: string;
  userId: string;
  activities: Activity[];
  schedules: Schedule[];
  lastSync?: string;
}

/**
 * 앱 데이터 전체 내보내기 (백업용)
 */
export const exportAllData = async (): Promise<AppData | null> => {
  try {
    const [activities, schedules, userId] = await Promise.all([
      AsyncStorage.getItem(KEYS.ACTIVITIES),
      AsyncStorage.getItem(KEYS.SCHEDULES),
      AsyncStorage.getItem(KEYS.USER_ID),
    ]);

    return {
      version: CURRENT_VERSION,
      userId: userId || generateUserId(),
      activities: activities ? JSON.parse(activities) : [],
      schedules: schedules ? JSON.parse(schedules) : [],
      lastSync: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to export data:', error);
    return null;
  }
};

/**
 * 앱 데이터 전체 가져오기 (복원용)
 */
export const importAllData = async (data: AppData): Promise<boolean> => {
  try {
    await Promise.all([
      AsyncStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(data.activities)),
      AsyncStorage.setItem(KEYS.SCHEDULES, JSON.stringify(data.schedules)),
      AsyncStorage.setItem(KEYS.USER_ID, data.userId),
      AsyncStorage.setItem(KEYS.APP_VERSION, data.version),
    ]);
    
    console.log('Data imported successfully');
    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
};

/**
 * 모든 데이터 삭제 (초기화)
 */
export const clearAllData = async (): Promise<boolean> => {
  try {
    await AsyncStorage.multiRemove([
      KEYS.ACTIVITIES,
      KEYS.SCHEDULES,
      KEYS.SETTINGS,
      KEYS.LAST_SYNC,
      '@daily_schedule_notifications', // 알림 설정도 삭제
    ]);
    
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
  exportAllData,
  importAllData,
  clearAllData,
  getUserId,
  isMigrated,
  markAsMigrated,
  checkVersion,
};
