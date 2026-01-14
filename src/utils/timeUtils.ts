/**
 * 시간 관련 유틸리티 함수
 */

import { ScheduleItem } from '../types';

export type ItemStatus = 'upcoming' | 'current' | 'completed' | 'missed' | 'future';

/**
 * 현재 시간 기준으로 일정 아이템의 상태를 계산
 * @param item 일정 아이템
 * @param currentTime 현재 시간
 * @param selectedDate 선택된 날짜 (미래 일정 확인용)
 */
export const getItemStatus = (
  item: ScheduleItem, 
  currentTime: Date, 
  selectedDate?: Date
): ItemStatus => {
  // 이미 완료된 경우
  if (item.status === 'completed') {
    return 'completed';
  }

  // 미래 일정인지 확인 (선택된 날짜가 오늘보다 미래인 경우)
  if (selectedDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    
    if (selected > today) {
      return 'future';
    }
  }

  const now = currentTime.getHours() * 60 + currentTime.getMinutes();
  const [startHours, startMins] = item.startTime.split(':').map(Number);
  const [endHours, endMins] = item.endTime.split(':').map(Number);
  const startMinutes = startHours * 60 + startMins;
  const endMinutes = endHours * 60 + endMins;

  // 현재 진행 중
  if (now >= startMinutes && now < endMinutes) {
    return 'current';
  }

  // 시간이 지났는데 완료 안함
  if (now >= endMinutes) {
    return 'missed';
  }

  // 아직 시작 전
  return 'upcoming';
};

/**
 * 다음 활동 찾기
 */
export const getNextActivity = (
  scheduleItems: ScheduleItem[],
  currentTime: Date
): ScheduleItem | null => {
  const now = currentTime.getHours() * 60 + currentTime.getMinutes();

  // 시간순 정렬
  const sortedItems = [...scheduleItems].sort((a, b) => {
    const [aHours, aMins] = a.startTime.split(':').map(Number);
    const [bHours, bMins] = b.startTime.split(':').map(Number);
    return (aHours * 60 + aMins) - (bHours * 60 + bMins);
  });

  // 현재 시간 이후의 첫 번째 활동
  for (const item of sortedItems) {
    const [startHours, startMins] = item.startTime.split(':').map(Number);
    const startMinutes = startHours * 60 + startMins;

    if (startMinutes > now && item.status !== 'completed') {
      return item;
    }
  }

  return null;
};

/**
 * 현재 진행 중인 활동 찾기
 */
export const getCurrentActivity = (
  scheduleItems: ScheduleItem[],
  currentTime: Date
): ScheduleItem | null => {
  const now = currentTime.getHours() * 60 + currentTime.getMinutes();

  for (const item of scheduleItems) {
    const [startHours, startMins] = item.startTime.split(':').map(Number);
    const [endHours, endMins] = item.endTime.split(':').map(Number);
    const startMinutes = startHours * 60 + startMins;
    const endMinutes = endHours * 60 + endMins;

    if (now >= startMinutes && now < endMinutes && item.status !== 'completed') {
      return item;
    }
  }

  return null;
};

/**
 * 시간 차이를 분 단위로 계산
 */
export const getMinutesUntil = (targetTime: string, currentTime: Date): number => {
  const [targetHours, targetMins] = targetTime.split(':').map(Number);
  const targetMinutes = targetHours * 60 + targetMins;
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  return targetMinutes - nowMinutes;
};

/**
 * 남은 시간을 "N시간 N분" 형식으로 변환
 */
export const formatRemainingTime = (minutes: number): string => {
  if (minutes < 0) return '시간 지남';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}시간 ${mins}분 남음`;
  } else if (hours > 0) {
    return `${hours}시간 남음`;
  } else {
    return `${mins}분 남음`;
  }
};

