/**
 * 로컬 알림 서비스
 * 활동 시작 전 알림 스케줄링 및 관리
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduleItem } from '../types';

const NOTIFICATION_SETTINGS_KEY = '@daily_schedule_notifications';
const NOTIFICATION_PREFIX = 'activity-';

// 알림 수신 시 동작 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationSettings {
  [itemId: string]: boolean; // itemId -> enabled
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

    // Android 알림 채널 설정
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '활동 알림',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

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
 * 특정 활동의 알림 스케줄링
 * 활동 시작 5분 전에 알림 예약
 */
export async function scheduleActivityNotification(
  scheduleItem: ScheduleItem,
  enabled: boolean
): Promise<void> {
  try {
    const notificationId = `${NOTIFICATION_PREFIX}${scheduleItem.id}`;

    // 기존 알림 취소
    await Notifications.cancelScheduledNotificationAsync(notificationId);

    if (!enabled) {
      console.log(`알림 취소: ${scheduleItem.activity?.name}`);
      return;
    }

    // 활동 시간 파싱 (오늘 날짜 기준)
    const [startHours, startMinutes] = scheduleItem.startTime.split(':').map(Number);
    const today = new Date();
    const notificationTime = new Date(today);
    notificationTime.setHours(startHours, startMinutes, 0, 0);

    // 5분 전으로 설정
    notificationTime.setMinutes(notificationTime.getMinutes() - 5);

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
          type: 'date',
          date: notificationTime,
        },
      });

      if (Device.isDevice) {
        console.log(`✅ 알림 스케줄링: ${scheduleItem.activity?.name} at ${notificationTime.toLocaleTimeString()}`);
      } else {
        console.log(`✅ 스케줄링 시도: ${scheduleItem.activity?.name} at ${notificationTime.toLocaleTimeString()} (시뮬레이터: 실제 알림은 수신 안 됨)`);
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
 * 오늘의 모든 활동 알림 스케줄링
 */
export async function scheduleTodayNotifications(
  scheduleItems: ScheduleItem[],
  settings: NotificationSettings
): Promise<void> {
  try {
    // 오늘 날짜 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const item of scheduleItems) {
      const enabled = settings[item.id] || false;
      if (enabled) {
        await scheduleActivityNotification(item, true);
      }
    }

    console.log(`✅ 오늘 알림 ${scheduleItems.filter(item => settings[item.id]).length}개 스케줄링 완료`);
  } catch (error) {
    console.error('오늘 알림 스케줄링 실패:', error);
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
  requestNotificationPermissions,
  loadNotificationSettings,
  saveNotificationSettings,
  scheduleActivityNotification,
  scheduleTodayNotifications,
  cancelAllNotifications,
  cancelActivityNotification,
  getScheduledNotifications,
};
