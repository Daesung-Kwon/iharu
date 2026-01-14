/**
 * 앱 전역 설정 상수
 */

// 타임라인 설정
export const TIMELINE_CONFIG = {
  START_HOUR: 0, // 00:00
  END_HOUR: 24, // 24:00
  INTERVAL_MINUTES: 30, // 30분 단위
  SLOT_HEIGHT: 80, // 30분당 높이 (px)
} as const;

// 화면 크기 기준 (태블릿)
export const BREAKPOINTS = {
  tablet: 768,
  tabletLarge: 1024,
} as const;

// 애니메이션 설정
export const ANIMATION_CONFIG = {
  dragScale: 1.05,
  transitionDuration: 200,
} as const;

// API 설정 (나중에 실제 백엔드 URL로 변경)
export const API_CONFIG = {
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
} as const;


