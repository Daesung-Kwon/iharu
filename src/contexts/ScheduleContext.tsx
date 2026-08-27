/**
 * ScheduleContext
 * 일정 관련 전역 상태 관리
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Schedule, ScheduleItem, Activity } from '../types';
import { getWeekdayDatesInWeek, migrateUtcSlicedScheduleDates, toLocalDateString } from '../utils/dateUtils';
import { cancelActivityNotification, clearItemNotifications } from '../services/notificationService';
import { KEYS } from '../services/storage';

const createScheduleItemId = (): string =>
  `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface CopyScheduleOptions {
  overwrite?: boolean;
}

interface ScheduleContextType {
  // State
  schedules: Schedule[];
  selectedDate: Date;
  selectedChildProfileId: string | null;

  // Actions
  setSelectedDate: (date: Date) => void;
  setSelectedChildProfileId: (id: string | null) => void;
  getScheduleForDate: (date: Date) => Schedule | null;
  addScheduleItem: (
    date: Date,
    activity: Activity,
    startTime: string,
    options?: { weekdays?: boolean }
  ) => boolean;
  updateScheduleItem: (itemId: string, updates: Partial<ScheduleItem>) => void;
  removeScheduleItem: (itemId: string) => void;
  removeAllScheduleItems: (date: Date) => void;
  checkTimeConflict: (date: Date, startTime: string, endTime: string, excludeItemId?: string) => boolean;
  copyScheduleToDate: (sourceDate: Date, targetDate: Date, options?: CopyScheduleOptions) => boolean;
  resetSchedules: () => void; // 데이터 초기화용
  reloadFromStorage: () => Promise<Schedule[]>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export const ScheduleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedChildProfileId, setSelectedChildProfileId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const reloadFromStorage = useCallback(async (): Promise<Schedule[]> => {
    try {
      const stored = await AsyncStorage.getItem(KEYS.SCHEDULES);
      if (stored) {
        const parsed: Schedule[] = JSON.parse(stored);
        const migrated = migrateUtcSlicedScheduleDates(parsed);
        console.log('Schedules loaded from storage:', migrated.length);
        setSchedules(migrated);
        if (migrated !== parsed) {
          await AsyncStorage.setItem(KEYS.SCHEDULES, JSON.stringify(migrated));
        }
        return migrated;
      }
      setSchedules([]);
      return [];
    } catch (error) {
      console.error('Failed to load schedules:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    const loadSchedules = async () => {
      await reloadFromStorage();
      setIsLoaded(true);
    };

    loadSchedules();
  }, [reloadFromStorage]);

  // 일정 변경 시 AsyncStorage에 저장
  useEffect(() => {
    if (isLoaded) {
      const saveSchedules = async () => {
        try {
          await AsyncStorage.setItem(KEYS.SCHEDULES, JSON.stringify(schedules));
          console.log('Schedules saved to storage:', schedules.length);
        } catch (error) {
          console.error('Failed to save schedules:', error);
        }
      };

      saveSchedules();
    }
  }, [schedules, isLoaded]);

  const getScheduleForDate = useCallback((date: Date): Schedule | null => {
    const dateString = toLocalDateString(date);
    return schedules.find(s => s.date === dateString) || null;
  }, [schedules]);

  // 시간 중복 체크 함수
  const checkTimeConflict = useCallback((
    date: Date,
    startTime: string,
    endTime: string,
    excludeItemId?: string
  ): boolean => {
    const dateString = toLocalDateString(date);
    const schedule = schedules.find(s => s.date === dateString);
    if (!schedule) return false;

    const [startHours, startMins] = startTime.split(':').map(Number);
    const [endHours, endMins] = endTime.split(':').map(Number);
    const newStart = startHours * 60 + startMins;
    const newEnd = endHours * 60 + endMins;

    return schedule.items.some(item => {
      if (excludeItemId && item.id === excludeItemId) return false;
      
      const [itemStartHours, itemStartMins] = item.startTime.split(':').map(Number);
      const [itemEndHours, itemEndMins] = item.endTime.split(':').map(Number);
      const itemStart = itemStartHours * 60 + itemStartMins;
      const itemEnd = itemEndHours * 60 + itemEndMins;

      // 겹치는지 체크
      return (newStart < itemEnd && newEnd > itemStart);
    });
  }, [schedules]);

  const addScheduleItem = useCallback((
    date: Date,
    activity: Activity,
    startTime: string,
    options?: { weekdays?: boolean }
  ) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + activity.durationMinutes;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    if (checkTimeConflict(date, startTime, endTime)) {
      return false;
    }

    const targets = options?.weekdays ? getWeekdayDatesInWeek(date) : [date];
    const nowIso = new Date().toISOString();

    setSchedules(prev => {
      let next = prev;
      for (const target of targets) {
        const dateString = toLocalDateString(target);
        const existing = next.find(s => s.date === dateString);
        const items = existing?.items ?? [];
        const conflict = items.some(item => {
          const [itemStartHours, itemStartMins] = item.startTime.split(':').map(Number);
          const [itemEndHours, itemEndMins] = item.endTime.split(':').map(Number);
          const itemStart = itemStartHours * 60 + itemStartMins;
          const itemEnd = itemEndHours * 60 + itemEndMins;
          return startMinutes < itemEnd && endMinutes > itemStart;
        });
        if (conflict) continue;

        const newItem: ScheduleItem = {
          id: createScheduleItemId(),
          scheduleId: `schedule-${dateString}`,
          activityId: activity.id,
          activity,
          startTime,
          endTime,
          status: 'planned',
          orderIndex: 0,
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        if (existing) {
          next = next.map(schedule =>
            schedule.id === existing.id
              ? { ...schedule, items: [...schedule.items, newItem], updatedAt: nowIso }
              : schedule
          );
        } else {
          next = [
            ...next,
            {
              id: `schedule-${dateString}`,
              userId: 'current-user',
              childProfileId: selectedChildProfileId || 'default',
              date: dateString,
              dateKind: 'local',
              items: [newItem],
              createdAt: nowIso,
              updatedAt: nowIso,
            },
          ];
        }
      }
      return next;
    });
    return true;
  }, [selectedChildProfileId, checkTimeConflict]);

  const updateScheduleItem = useCallback((itemId: string, updates: Partial<ScheduleItem>) => {
    if (updates.status === 'completed' || updates.status === 'skipped') {
      void cancelActivityNotification(itemId);
    }
    setSchedules(prev =>
      prev.map(schedule => ({
        ...schedule,
        items: schedule.items.map(item =>
          item.id === itemId
            ? { ...item, ...updates, updatedAt: new Date().toISOString() }
            : item
        ),
        updatedAt: new Date().toISOString(),
      }))
    );
  }, []);

  const removeScheduleItem = useCallback((itemId: string) => {
    void clearItemNotifications([itemId]);
    setSchedules(prev =>
      prev.map(schedule => ({
        ...schedule,
        items: schedule.items.filter(item => item.id !== itemId),
        updatedAt: new Date().toISOString(),
      }))
    );
  }, []);

  const removeAllScheduleItems = useCallback((date: Date) => {
    const dateString = toLocalDateString(date);
    const ids = schedules.find(s => s.date === dateString)?.items.map(item => item.id) ?? [];
    if (ids.length > 0) {
      void clearItemNotifications(ids);
    }
    setSchedules(prev =>
      prev.map(schedule =>
        schedule.date === dateString
          ? { ...schedule, items: [], updatedAt: new Date().toISOString() }
          : schedule
      )
    );
  }, [schedules]);

  const copyScheduleToDate = useCallback((
    sourceDate: Date,
    targetDate: Date,
    options?: CopyScheduleOptions
  ): boolean => {
    const sourceDateString = toLocalDateString(sourceDate);
    const targetDateString = toLocalDateString(targetDate);
    const overwrite = options?.overwrite === true;

    const sourceSchedule = schedules.find(s => s.date === sourceDateString);
    if (!sourceSchedule || sourceSchedule.items.length === 0) {
      return false;
    }

    const targetSchedule = schedules.find(s => s.date === targetDateString);
    if (targetSchedule && targetSchedule.items.length > 0 && !overwrite) {
      return false;
    }

    if (overwrite && targetSchedule && targetSchedule.items.length > 0) {
      void clearItemNotifications(targetSchedule.items.map(item => item.id));
    }

    const now = new Date().toISOString();
    const targetId = targetSchedule?.id ?? `schedule-${targetDateString}`;
    const copiedItems: ScheduleItem[] = sourceSchedule.items.map(item => ({
      ...item,
      id: createScheduleItemId(),
      scheduleId: targetId,
      status: 'planned',
      createdAt: now,
      updatedAt: now,
    }));

    setSchedules(prev => {
      if (targetSchedule) {
        return prev.map(schedule =>
          schedule.date === targetDateString
            ? { ...schedule, items: copiedItems, dateKind: 'local', updatedAt: now }
            : schedule
        );
      }

      const newSchedule: Schedule = {
        id: targetId,
        userId: sourceSchedule.userId,
        childProfileId: sourceSchedule.childProfileId,
        date: targetDateString,
        dateKind: 'local',
        items: copiedItems,
        createdAt: now,
        updatedAt: now,
      };
      return [...prev, newSchedule];
    });
    return true;
  }, [schedules]);

  const resetSchedules = useCallback(() => {
    setSchedules([]);
  }, []);

  return (
    <ScheduleContext.Provider
      value={{
        schedules,
        selectedDate,
        selectedChildProfileId,
        setSelectedDate,
        setSelectedChildProfileId,
        getScheduleForDate,
        addScheduleItem,
        updateScheduleItem,
        removeScheduleItem,
        removeAllScheduleItems,
        checkTimeConflict,
        copyScheduleToDate,
        resetSchedules,
        reloadFromStorage,
      }}
    >
      {children}
    </ScheduleContext.Provider>
  );
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within ScheduleProvider');
  }
  return context;
};


