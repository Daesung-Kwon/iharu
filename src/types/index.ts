/**
 * 앱 전체에서 사용하는 TypeScript 타입 정의
 */

// ==================== Activity (활동) ====================
export type ActivityColor = 
  | 'purple' 
  | 'blue' 
  | 'pink' 
  | 'yellow' 
  | 'green' 
  | 'orange' 
  | 'red' 
  | 'teal';

export type ActivityCategory = 
  | 'study' 
  | 'play' 
  | 'reading' 
  | 'exercise' 
  | 'meal' 
  | 'rest' 
  | 'art' 
  | 'music';

export interface Activity {
  id: string;
  userId?: string | null; // null이면 시스템 기본 활동
  childProfileId?: string | null;
  name: string;
  emojiKey: string; // 이모지 프리셋 키 또는 실제 이모지 문자
  colorKey: ActivityColor;
  durationMinutes: number; // 10분 단위
  category: ActivityCategory;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== Schedule (일정) ====================
export type ScheduleItemStatus = 
  | 'planned' 
  | 'in_progress' 
  | 'completed' 
  | 'skipped';

export interface ScheduleItem {
  id: string;
  scheduleId: string;
  activityId: string;
  activity?: Activity; // 조인된 활동 정보
  startTime: string; // "HH:MM" 형식, 10분 단위
  endTime: string; // "HH:MM" 형식
  status: ScheduleItemStatus;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  userId: string;
  childProfileId: string;
  date: string; // "YYYY-MM-DD" 형식
  items: ScheduleItem[];
  createdAt: string;
  updatedAt: string;
}

// ==================== Child Profile ====================
export interface ChildProfile {
  id: string;
  userId: string;
  name: string;
  avatarEmoji?: string;
  birthYear?: number;
  createdAt: string;
}

// ==================== User ====================
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

// ==================== Today Dashboard ====================
export interface TodayScheduleSummary {
  totalItems: number;
  completedItems: number;
  totalPlannedMinutes: number;
  completedMinutes: number;
  progressPercentage: number;
  schedule: Schedule | null;
}

// ==================== Navigation ====================
export type RootStackParamList = {
  MainTabs: undefined;
  Login: undefined;
  Register: undefined;
  ActivityDetail: { activityId?: string }; // activityId가 있으면 수정 모드
  ScheduleDetail: { date: string; childProfileId: string };
};

export type MainTabParamList = {
  Today: undefined;
  PlanSchedule: undefined;
  Activities: undefined;
  Profile: undefined;
};


