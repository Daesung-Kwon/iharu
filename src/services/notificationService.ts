/**
 * 로컬 알림 서비스
 * 활동 시작 전 알림 스케줄링 및 관리
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Schedule, ScheduleItem } from '../types';
import { getActivityNotificationTime, toLocalDateString } from '../utils/dateUtils';

const NOTIFICATION_SETTINGS_KEY = '@daily_schedule_notifications';
const NOTIFICATIONS_MASTER_KEY = '@settings.notificationsEnabled';
const NOTIFICATION_PREFIX = 'activity-';
const ANDROID_CHANNEL_ID = 'activity_reminders';
const UPCOMING_DAYS = 7;

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
    const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
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
    await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('알림 설정 저장 실패:', error);
  }
}

/**
 * 마스터 알림 스위치. 키가 없으면 true (기존 per-item 설정을 막지 않음).
 */
export async function loadNotificationsMasterEnabled(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(NOTIFICATIONS_MASTER_KEY);
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
    await AsyncStorage.setItem(NOTIFICATIONS_MASTER_KEY, enabled ? 'true' : 'false');
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
): Promise<void> {
  try {
    const notificationId = `${NOTIFICATION_PREFIX}${scheduleItem.id}`;

    if (enabled) {
      await ensureAndroidChannel();
    }

    // 기존 알림 취소
    await Notifications.cancelScheduledNotificationAsync(notificationId);

    if (!enabled) {
      console.log(`알림 취소: ${scheduleItem.activity?.name}`);
      return;
    }

    const masterEnabled = await loadNotificationsMasterEnabled();
    if (!masterEnabled) {
      return;
    }

    const notificationTime = getActivityNotificationTime(scheduleDate, scheduleItem.startTime);

    // 과거 시간이면 스케줄링하지 않음
    if (notificationTime.getTime() <= Date.now()) {
      console.log(`과거 시간이므로 알림 스케줄링 안 함: ${scheduleItem.activity?.name}`);
      return;
    }

    // 알림 스케줄링 (시뮬레이터에서도 시도, 에러 발생 시 무시)
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
    } catch (scheduleError) {
      // 시뮬레이터에서는 스케줄링이 실패할 수 있음 (무시)
      if (Device.isDevice) {
        throw scheduleError; // 실제 디바이스에서는 에러를 다시 던짐
      } else {
        console.log(`⚠️ 시뮬레이터: 스케줄링 실패 (무시됨): ${scheduleItem.activity?.name}`);
      }
    }
  } catch (error) {
    console.error('알림 스케줄링 실패:', error);
  }
}

/**
 * 오늘부터 N일간의 활성 알림을 재스케줄
 */
export async function rescheduleUpcomingNotifications(
  schedules: Schedule[],
  settings: NotificationSettings,
  daysAhead = UPCOMING_DAYS
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

    await cancelAllNotifications();
    await ensureAndroidChannel();

    const today = new Date();
    const start = toLocalDateString(today);
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysAhead);
    const end = toLocalDateString(endDate);

    for (const schedule of schedules) {
      if (schedule.date < start || schedule.date > end) continue;
      for (const item of schedule.items) {
        if (settings[item.id]) {
          await scheduleActivityNotification(item, true, schedule.date);
        }
      }
    }

    console.log('✅ 다가오는 일정 알림 재스케줄링 완료');
  } catch (error) {
    console.error('다가오는 알림 재스케줄링 실패:', error);
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
  getScheduledNotifications,
};
