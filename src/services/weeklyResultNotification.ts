/**
 * Schedules the one weekly-result local notification (expo-notifications).
 * Decisions live in utils/weeklyResultNotification; this only talks to the OS.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Schedule } from '../types';
import { toLocalDateString } from '../utils/dateUtils';
import { WeeklyPromise, WeeklyResult } from '../utils/weeklyPromise';
import {
  parseWeeklyResultNotificationEnabled,
  parseWeeklyResultNotificationState,
  planWeeklyResultNotification,
  ScheduledWeeklyResultNotification,
  stateWithoutUnsentSchedules,
  WEEKLY_RESULT_NOTIFICATION_PREFIX,
  WeeklyResultNotificationPlan,
  weeklyResultNotificationIdsToCancel,
} from '../utils/weeklyResultNotification';
import { loadWeeklyPromises } from './weeklyPromiseStore';
import { getNotificationPermissionStatus, requestNotificationPermissions } from './notificationService';
import { KEYS } from './storageKeys';

const ANDROID_CHANNEL_ID = 'weekly_result';

type DaySchedule = Pick<Schedule, 'date' | 'items'>;

export interface WeeklyResultNotificationSnapshot {
  promises: readonly WeeklyPromise[];
  results: readonly WeeklyResult[];
  schedules: readonly DaySchedule[];
  today: string;
  now?: Date;
}

let queue: Promise<void> = Promise.resolve();

export async function loadWeeklyResultNotificationEnabled(): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(KEYS.WEEKLY_RESULT_NOTIFICATION);
    return parseWeeklyResultNotificationEnabled(stored);
  } catch (error) {
    console.error('주간 결과 알림 설정 로드 실패:', error);
    return true;
  }
}

export async function saveWeeklyResultNotificationEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.WEEKLY_RESULT_NOTIFICATION, enabled ? 'true' : 'false');
}

/** Loads promises from storage when the caller does not already have them. */
export function syncWeeklyResultNotifications(snapshot?: WeeklyResultNotificationSnapshot): Promise<void> {
  const job = queue.then(() => runSync(snapshot));
  queue = job.catch(error => {
    console.error('주간 결과 알림 동기화 실패:', error);
  });
  return job;
}

async function runSync(snapshot?: WeeklyResultNotificationSnapshot): Promise<void> {
  const [enabledRaw, stateRaw] = await AsyncStorage.multiGet([
    KEYS.WEEKLY_RESULT_NOTIFICATION,
    KEYS.WEEKLY_RESULT_NOTIFICATION_STATE,
  ]);
  const enabled = parseWeeklyResultNotificationEnabled(enabledRaw[1]);
  const previous = parseWeeklyResultNotificationState(stateRaw[1]);
  const data = snapshot ?? await loadSnapshot();
  const plan = planWeeklyResultNotification({
    enabled,
    promises: data.promises,
    results: data.results,
    schedules: data.schedules,
    today: data.today,
    now: data.now ?? new Date(),
    state: previous,
  });

  const send = plan.schedule.length === 0 || await ensurePermission();
  const committed = send ? plan.state : stateWithoutUnsentSchedules(previous, plan);
  const toSchedule = send ? plan.schedule : [];

  if (toSchedule.length > 0) await ensureAndroidChannel();
  await applyCancels(plan, committed, toSchedule);
  try {
    for (const item of toSchedule) {
      await scheduleOne(item);
      console.log(`주간 결과 알림 예약: ${item.id} ${item.fireAt.toISOString()}`);
    }
    await saveState(committed);
  } catch (error) {
    console.error('주간 결과 알림 예약 실패:', error);
    await saveState(stateWithoutUnsentSchedules(previous, plan));
  }
}

async function loadSnapshot(): Promise<WeeklyResultNotificationSnapshot> {
  const [{ promises, results }, rawSchedules] = await Promise.all([
    loadWeeklyPromises(),
    AsyncStorage.getItem(KEYS.SCHEDULES),
  ]);
  return {
    promises,
    results,
    schedules: parseScheduleSnapshot(rawSchedules),
    today: toLocalDateString(new Date()),
  };
}

function parseScheduleSnapshot(raw: string | null): DaySchedule[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap(row => {
      if (!row || typeof row !== 'object') return [];
      const date = (row as { date?: unknown }).date;
      const items = (row as { items?: unknown }).items;
      if (typeof date !== 'string' || !Array.isArray(items)) return [];
      return [{ date, items: items as DaySchedule['items'] }];
    });
  } catch {
    return [];
  }
}

async function applyCancels(
  plan: WeeklyResultNotificationPlan,
  committed: WeeklyResultNotificationPlan['state'],
  toSchedule: readonly ScheduledWeeklyResultNotification[],
): Promise<void> {
  const keep = [
    ...committed.pending.map(p => `${WEEKLY_RESULT_NOTIFICATION_PREFIX}${p.weekStart}`),
    ...toSchedule.map(s => s.id),
  ];
  let scheduledIds: string[] = [];
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    scheduledIds = scheduled.map(req => req.identifier);
  } catch (error) {
    console.error('예약된 알림 조회 실패:', error);
  }
  const keepSet = new Set(keep);
  const ids = new Set([
    ...plan.cancelIds.filter(id => !keepSet.has(id)),
    ...weeklyResultNotificationIdsToCancel(scheduledIds, keep),
  ]);
  if (ids.size > 0) console.log(`주간 결과 알림 취소: ${[...ids].join(', ')}`);
  await Promise.all([...ids].map(id => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
}

async function scheduleOne(item: ScheduledWeeklyResultNotification): Promise<void> {
  const when = item.fireAt.getTime() <= Date.now() ? new Date(Date.now() + 1000) : item.fireAt;
  await Notifications.scheduleNotificationAsync({
    identifier: item.id,
    content: {
      title: item.title,
      body: item.body,
      sound: true,
      data: { kind: 'weekly-result', weekStart: item.weekStart },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
  });
}

async function ensurePermission(): Promise<boolean> {
  try {
    const status = await getNotificationPermissionStatus();
    if (status === 'granted') return true;
    if (status === 'denied') return false;
    return requestNotificationPermissions();
  } catch (error) {
    console.error('주간 결과 알림 권한 확인 실패:', error);
    return false;
  }
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: '주간 약속 결과',
      description: '한 주가 끝나면 약속 결과를 알려 드려요',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      enableVibrate: true,
    });
  } catch (error) {
    console.warn('주간 결과 알림 채널 설정 실패:', error);
  }
}

async function saveState(state: WeeklyResultNotificationPlan['state']): Promise<void> {
  await AsyncStorage.setItem(KEYS.WEEKLY_RESULT_NOTIFICATION_STATE, JSON.stringify(state));
}
