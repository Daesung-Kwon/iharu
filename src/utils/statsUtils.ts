/**
 * 통계 관련 유틸리티 함수
 */

import { Schedule, ScheduleItem } from '../types';

export interface DayStats {
  date: string;
  totalItems: number;
  completedItems: number;
  completionRate: number; // 0-100
  totalMinutes: number;
  completedMinutes: number;
  missedItems: number;
}

/**
 * 특정 날짜의 달성률 계산
 */
export const calculateDayStats = (schedule: Schedule | null): DayStats => {
  if (!schedule || schedule.items.length === 0) {
    return {
      date: schedule?.date || '',
      totalItems: 0,
      completedItems: 0,
      completionRate: 0,
      totalMinutes: 0,
      completedMinutes: 0,
      missedItems: 0,
    };
  }

  const totalItems = schedule.items.length;
  const completedItems = schedule.items.filter(item => item.status === 'completed').length;
  const missedItems = schedule.items.filter(item => item.status === 'skipped').length;

  const totalMinutes = schedule.items.reduce((sum, item) => {
    return sum + (item.activity?.durationMinutes || 0);
  }, 0);

  const completedMinutes = schedule.items
    .filter(item => item.status === 'completed')
    .reduce((sum, item) => {
      return sum + (item.activity?.durationMinutes || 0);
    }, 0);

  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return {
    date: schedule.date,
    totalItems,
    completedItems,
    completionRate,
    totalMinutes,
    completedMinutes,
    missedItems,
  };
};

/**
 * 여러 날짜의 평균 달성률 계산
 */
export const calculateAverageStats = (schedules: Schedule[]): {
  avgCompletionRate: number;
  totalDays: number;
  perfectDays: number;
} => {
  if (schedules.length === 0) {
    return {
      avgCompletionRate: 0,
      totalDays: 0,
      perfectDays: 0,
    };
  }

  let totalRate = 0;
  let perfectDays = 0;

  schedules.forEach(schedule => {
    const stats = calculateDayStats(schedule);
    totalRate += stats.completionRate;
    if (stats.completionRate === 100) {
      perfectDays++;
    }
  });

  return {
    avgCompletionRate: totalRate / schedules.length,
    totalDays: schedules.length,
    perfectDays,
  };
};

/**
 * 날짜가 오늘인지 확인
 */
export const isToday = (dateString: string): boolean => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  return dateString === todayString;
};

/**
 * 날짜가 과거인지 확인
 */
export const isPast = (dateString: string): boolean => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  return dateString < todayString;
};

/**
 * 날짜가 미래인지 확인
 */
export const isFuture = (dateString: string): boolean => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
  return dateString > todayString;
};

