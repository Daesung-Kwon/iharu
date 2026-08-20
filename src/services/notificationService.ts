/**
 * 로컬 알림 서비스
 * 활동 시작 전 알림 스케줄링 및 관리
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Schedule, ScheduleItem } from '../types';
import { getActivityNotificationTime } from '../utils/dateUtils';
import { KEYS } from './storage';

const NOTIFICATION_PREFIX = 'activity-';
const ANDROID_CHANNEL_ID = 'activity_reminders';

export type ScheduleNotificationResult =
  | 'scheduled'
  | 'cancelled'
  | 'master_off'
  | 'past'
  | 'failed';

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: '활동 알림',
      description: '일정 시작 전 알림',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
      sound: 'default',
      enableVibrate: true,
    });
  } catch (e) {
    console.warn('Android 알림 채널 설정 실패:', e);
  }
}

// 알림 수신 시 동작 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  [itemId: string]: boolean; // itemId -> enabled
}

/**
 * 알림 권한 상태 확인 (요청하지 않음)
 */
export async function getNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  } catch (error) {
    console.error('알림 권한 확인 실패:', error);
    return 'undetermined';
  }
}

/**
 * 알림 권한 요청
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const isRealDevice = Device.isDevice;
    
    if (!isRealDevice) {
      console.log('⚠️ 시뮬레이터/에뮬레이터 감지: 실제 알림은 수신되지 않지만 스케줄링은 테스트 가능합니다');
      // 시뮬레이터에서도 권한 요청 시도 (테스트용)
      // Android 에뮬레이터는 알림이 작동할 수 있음
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      if (isRealDevice) {
        console.log('❌ 알림 권한이 거부되었습니다');
      } else {
        console.log('⚠️ 시뮬레이터: 권한 거부됨 (정상, 실제 알림은 작동하지 않음)');
      }
      return false;
    }

    await ensureAndroidChannel();

    if (isRealDevice) {
      console.log('✅ 알림 권한 허용됨');
    } else {
      console.log('✅ 시뮬레이터: 권한 허용됨 (스케줄링 로직 테스트 가능, 실제 알림은 수신 안 됨)');
    }
    return true;
  } catch (error) {
    console.error('알림 권한 요청 실패:', error);
    return false;
  }
}

/**
 * 알림 설정 불러오기 (AsyncStorage)
 */
export async function loadNotificationSettings(): Promise<NotificationSettings> {
  try {
    const stored = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
    if (stored) {
      return JSON.parse(stored);
    }
    return {};
  } catch (error) {
    console.error('알림 설정 로드 실패:', error);
    return {};
  }
}

/**
 * 알림 설정 저장 (AsyncStorage)
 */
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(settings));
  } catch (error) {
    console.error('알림 설정 저장 실패:', error);
  }
}

/**
 * 마스터 알림 스위치. 키가 없으면 true (기존 per-item 설정을 막지 않음).
 */
export async function loadNotificationsMasterEnabled(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(KEYS.NOTIFICATIONS_ENABLED);
    if (stored === null) {
      return true;
    }
    return stored === 'true';
  } catch (error) {
    console.error('알림 마스터 설정 로드 실패:', error);
    return true;
  }
}

export async function saveNotificationsMasterEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS_ENABLED, enabled ? 'true' : 'false');
  } catch (error) {
    console.error('알림 마스터 설정 저장 실패:', error);
  }
}

/**
 * 특정 활동의 알림 스케줄링
 * 해당 일정 날짜의 시작 5분 전에 알림 예약
 */
export async function scheduleActivityNotification(
  scheduleItem: ScheduleItem,
  enabled: boolean,
  scheduleDate: Date | string
): Promise<ScheduleNotificationResult> {
  try {
    const notificationId = `${NOTIFICATION_PREFIX}${scheduleItem.id}`;

    if (enabled) {
      await ensureAndroidChannel();
    }

    await Notifications.cancelScheduledNotificationAsync(notificationId);

    if (!enabled) {
      console.log(`알림 취소: ${scheduleItem.activity?.name}`);
      return 'cancelled';
    }

    if (scheduleItem.status === 'completed' || scheduleItem.status === 'skipped') {
      return 'cancelled';
    }

    const masterEnabled = await loadNotificationsMasterEnabled();
    if (!masterEnabled) {
      return 'master_off';
    }

    const notificationTime = getActivityNotificationTime(scheduleDate, scheduleItem.startTime);

    if (notificationTime.getTime() <= Date.now()) {
      console.log(`과거 시간이므로 알림 스케줄링 안 함: ${scheduleItem.activity?.name}`);
      return 'past';
    }

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: '활동 시작 예정',
          body: `${scheduleItem.activity?.name} 시작까지 5분 남았어요! 🎯`,
          sound: true,
          data: {
            scheduleItemId: scheduleItem.id,
            activityName: scheduleItem.activity?.name,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notificationTime,
          ...(Platform.OS === 'android' && { channelId: ANDROID_CHANNEL_ID }),
        },
      });

      if (Device.isDevice) {
        console.log(`✅ 알림 스케줄링: ${scheduleItem.activity?.name} at ${notificationTime.toLocaleString()}`);
      } else {
        console.log(`✅ 스케줄링 시도: ${scheduleItem.activity?.name} at ${notificationTime.toLocaleString()} (시뮬레이터: 실제 알림은 수신 안 됨)`);
      }
      return 'scheduled';
    } catch (scheduleError) {
      if (Device.isDevice) {
        throw scheduleError;
      }
      console.log(`⚠️ 시뮬레이터: 스케줄링 실패 (무시됨): ${scheduleItem.activity?.name}`);
      return 'scheduled';
    }
  } catch (error) {
    console.error('알림 스케줄링 실패:', error);
    return 'failed';
  }
}

/**
 * 저장된 모든 일정의 활성 알림을 재스케줄 (identifier별로 먼저 취소).
 * 과거 trigger는 scheduleActivityNotification에서 skip.
 */
export async function rescheduleUpcomingNotifications(
  schedules: Schedule[],
  settings: NotificationSettings
): Promise<void> {
  try {
    const masterEnabled = await loadNotificationsMasterEnabled();
    if (!masterEnabled) {
      await cancelAllNotifications();
      return;
    }

    const permStatus = await getNotificationPermissionStatus();
    if (permStatus !== 'granted') {
      return;
    }

    await ensureAndroidChannel();

    for (const schedule of schedules) {
      for (const item of schedule.items) {
        if (settings[item.id]) {
          await scheduleActivityNotification(item, true, schedule.date);
        }
      }
    }

    console.log('✅ 일정 알림 재스케줄링 완료');
  } catch (error) {
    console.error('알림 재스케줄링 실패:', error);
  }
}

/**
 * 모든 알림 취소
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ 모든 알림 취소됨');
  } catch (error) {
    console.error('알림 취소 실패:', error);
  }
}

/**
 * 특정 활동 알림 취소
 */
export async function cancelActivityNotification(itemId: string): Promise<void> {
  try {
    const notificationId = `${NOTIFICATION_PREFIX}${itemId}`;
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`✅ 알림 취소: ${itemId}`);
  } catch (error) {
    console.error('알림 취소 실패:', error);
  }
}

/** Cancel OS notifications and drop per-item map keys. */
export async function clearItemNotifications(itemIds: string[]): Promise<void> {
  if (itemIds.length === 0) return;
  await Promise.all(itemIds.map(id => cancelActivityNotification(id)));
  try {
    const settings = await loadNotificationSettings();
    let changed = false;
    for (const id of itemIds) {
      if (id in settings) {
        delete settings[id];
        changed = true;
      }
    }
    if (changed) {
      await saveNotificationSettings(settings);
    }
  } catch (error) {
    console.error('알림 설정 항목 삭제 실패:', error);
  }
}

/**
 * 예약된 알림 목록 확인 (디버깅용)
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('예약된 알림 조회 실패:', error);
    return [];
  }
}

export default {
  getNotificationPermissionStatus,
  requestNotificationPermissions,
  loadNotificationSettings,
  saveNotificationSettings,
  loadNotificationsMasterEnabled,
  saveNotificationsMasterEnabled,
  scheduleActivityNotification,
  rescheduleUpcomingNotifications,
  cancelAllNotifications,
  cancelActivityNotification,
  clearItemNotifications,
  getScheduledNotifications,
};
