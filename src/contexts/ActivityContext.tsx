/**
 * ActivityContext
 * 활동 관련 전역 상태 관리
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Activity } from '../types';
import { DEFAULT_ACTIVITIES } from '../constants/defaultActivities';

const STORAGE_KEY = '@daily_schedule_activities';
const DELETED_DEFAULTS_KEY = '@daily_schedule_deleted_defaults';

interface ActivityContextType {
  // State
  activities: Activity[];
  defaultActivities: Activity[];

  // Actions
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateActivity: (activityId: string, updates: Partial<Activity>) => void;
  deleteActivity: (activityId: string) => void;
  getActivityById: (activityId: string) => Activity | undefined;
  resetActivities: () => void; // 데이터 초기화용
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 기본 활동들을 초기화
  const [defaultActivities] = useState<Activity[]>(() =>
    DEFAULT_ACTIVITIES.map((activity, index) => ({
      ...activity,
      id: `default-${index}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  );

  const [customActivities, setCustomActivities] = useState<Activity[]>([]);
  const [deletedDefaultIds, setDeletedDefaultIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  // 기본 활동과 커스텀 활동을 합치되, 커스텀 활동이 있으면 기본 활동을 제외 (중복 방지)
  // 삭제된 기본 활동도 제외
  const activities = React.useMemo(() => {
    const customIds = new Set(customActivities.map(a => {
      // 기본 활동에서 변환된 활동은 원본 기본 활동 ID를 추적
      const originalId = (a as any).originalDefaultId || a.id;
      return originalId;
    }));
    
    // 기본 활동 중 커스텀으로 변환되지 않고 삭제되지 않은 것만 포함
    const filteredDefaults = defaultActivities.filter(defaultAct => {
      // default-0, default-1 같은 ID를 체크
      return !customIds.has(defaultAct.id) && !deletedDefaultIds.has(defaultAct.id);
    });
    
    return [...filteredDefaults, ...customActivities];
  }, [defaultActivities, customActivities, deletedDefaultIds]);

  // AsyncStorage에서 커스텀 활동 및 삭제된 기본 활동 로드
  useEffect(() => {
    const loadActivities = async () => {
      try {
        // 커스텀 활동 로드
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          console.log('Activities loaded from storage:', parsed.length);
          setCustomActivities(parsed);
        }
        
        // 삭제된 기본 활동 ID 로드
        const deletedStored = await AsyncStorage.getItem(DELETED_DEFAULTS_KEY);
        if (deletedStored) {
          const deletedIds = JSON.parse(deletedStored);
          console.log('Deleted default activities loaded:', deletedIds.length);
          setDeletedDefaultIds(new Set(deletedIds));
        }
      } catch (error) {
        console.error('Failed to load activities:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadActivities();
  }, []);

  // 커스텀 활동 변경 시 AsyncStorage에 저장
  useEffect(() => {
    if (isLoaded) {
      const saveActivities = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(customActivities));
          console.log('Activities saved to storage:', customActivities.length);
        } catch (error) {
          console.error('Failed to save activities:', error);
        }
      };

      saveActivities();
    }
  }, [customActivities, isLoaded]);

  // 삭제된 기본 활동 ID 변경 시 AsyncStorage에 저장
  useEffect(() => {
    if (isLoaded) {
      const saveDeletedDefaults = async () => {
        try {
          await AsyncStorage.setItem(DELETED_DEFAULTS_KEY, JSON.stringify(Array.from(deletedDefaultIds)));
          console.log('Deleted default activities saved:', deletedDefaultIds.size);
        } catch (error) {
          console.error('Failed to save deleted default activities:', error);
        }
      };

      saveDeletedDefaults();
    }
  }, [deletedDefaultIds, isLoaded]);

  const addActivity = useCallback((
    activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomActivities(prev => [...prev, newActivity]);
  }, []);

  const updateActivity = useCallback((activityId: string, updates: Partial<Activity>) => {
    // 기본 활동인지 확인
    const isDefaultActivity = defaultActivities.some(a => a.id === activityId);
    
    if (isDefaultActivity) {
      // 기본 활동을 수정하면 커스텀 활동으로 변환
      const defaultActivity = defaultActivities.find(a => a.id === activityId);
      if (defaultActivity) {
        // 이미 커스텀 활동으로 변환된 것이 있는지 확인
        const existingCustom = customActivities.find(a => {
          const originalId = (a as any).originalDefaultId || a.id;
          return originalId === activityId;
        });
        
        if (existingCustom) {
          // 이미 변환된 활동이 있으면 업데이트
          setCustomActivities(prev =>
            prev.map(activity => {
              const originalId = (activity as any).originalDefaultId || activity.id;
              return originalId === activityId
                ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
                : activity;
            })
          );
        } else {
          // 새로운 커스텀 활동으로 추가 (원본 기본 활동 ID 추적)
          const updatedActivity: Activity & { originalDefaultId?: string } = {
            ...defaultActivity,
            ...updates,
            id: `activity-${Date.now()}-${Math.random()}`, // 새로운 ID 생성
            isDefault: false, // 기본 활동에서 커스텀 활동으로 변환
            updatedAt: new Date().toISOString(),
            originalDefaultId: activityId, // 원본 기본 활동 ID 추적
          };
          setCustomActivities(prev => [...prev, updatedActivity]);
        }
      }
    } else {
      // 커스텀 활동 수정
    setCustomActivities(prev =>
      prev.map(activity =>
        activity.id === activityId
          ? { ...activity, ...updates, updatedAt: new Date().toISOString() }
          : activity
      )
    );
    }
  }, [defaultActivities, customActivities]);

  const deleteActivity = useCallback((activityId: string) => {
    // 기본 활동인지 확인
    const isDefaultActivity = defaultActivities.some(a => a.id === activityId);
    
    if (isDefaultActivity) {
      // 기본 활동 삭제: 삭제된 기본 활동 ID 목록에 추가
      setDeletedDefaultIds(prev => new Set([...prev, activityId]));
      
      // 해당 기본 활동에서 변환된 커스텀 활동도 함께 삭제
      setCustomActivities(prev => 
        prev.filter(activity => {
          const originalId = (activity as any).originalDefaultId || activity.id;
          return originalId !== activityId;
        })
      );
    } else {
      // 커스텀 활동 삭제
      setCustomActivities(prev => 
        prev.filter(activity => {
          const originalId = (activity as any).originalDefaultId || activity.id;
          return activity.id !== activityId && originalId !== activityId;
        })
      );
    }
  }, [defaultActivities]);

  const getActivityById = useCallback((activityId: string): Activity | undefined => {
    return activities.find(activity => activity.id === activityId);
  }, [activities]);

  const resetActivities = useCallback(() => {
    setCustomActivities([]);
  }, []);

  return (
    <ActivityContext.Provider
      value={{
        activities,
        defaultActivities,
        addActivity,
        updateActivity,
        deleteActivity,
        getActivityById,
        resetActivities,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within ActivityProvider');
  }
  return context;
};


