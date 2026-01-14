/**
 * 아이들을 위한 귀여운 색상 시스템
 * 유치원생~초등 저학년을 위한 밝고 친근한 파스텔 톤
 */

export const ChildFriendlyColors = {
  // Primary - 따뜻한 오렌지/피치 (친근하고 따뜻한 느낌)
  primary: {
    50: '#FFF5F0',
    100: '#FFE4D6',
    200: '#FFD4BC',
    300: '#FFC3A2',
    400: '#FFB288',
    500: '#FFA16E', // Main Primary
    600: '#FF8F54',
    700: '#FF7D3A',
    800: '#FF6B20',
    900: '#FF5906',
  },
  
  // Secondary - 밝은 파랑 (신뢰감과 활기)
  secondary: {
    50: '#E8F4FD',
    100: '#D1E9FB',
    200: '#BA DEF9',
    300: '#A3D3F7',
    400: '#8CC8F5',
    500: '#75BDF3', // Main Secondary
    600: '#5EB2F1',
    700: '#47A7EF',
    800: '#309CED',
    900: '#1991EB',
  },
  
  // Accent - 부드러운 핑크 (귀여움과 사랑스러움)
  accent: {
    50: '#FFF0F5',
    100: '#FFE1EB',
    200: '#FFD2E1',
    300: '#FFC3D7',
    400: '#FFB4CD',
    500: '#FFA5C3', // Main Accent
    600: '#FF96B9',
    700: '#FF87AF',
    800: '#FF78A5',
    900: '#FF699B',
  },
  
  // Success - 밝은 초록 (성취감과 긍정)
  success: {
    50: '#F0FFF4',
    100: '#E1FFE9',
    200: '#D2FFDE',
    300: '#C3FFD3',
    400: '#B4FFC8',
    500: '#A5FFBD', // Main Success
    600: '#96FFB2',
    700: '#87FFA7',
    800: '#78FF9C',
    900: '#69FF91',
  },
  
  // Warning - 따뜻한 노랑 (주의와 경고)
  warning: {
    50: '#FFFEF0',
    100: '#FFFDE1',
    200: '#FFFCD2',
    300: '#FFFBC3',
    400: '#FFFAB4',
    500: '#FFF9A5', // Main Warning
    600: '#FFF896',
    700: '#FFF787',
    800: '#FFF678',
    900: '#FFF569',
  },
  
  // Error - 부드러운 빨강 (주의지만 무섭지 않음)
  error: {
    50: '#FFF0F0',
    100: '#FFE1E1',
    200: '#FFD2D2',
    300: '#FFC3C3',
    400: '#FFB4B4',
    500: '#FFA5A5', // Main Error
    600: '#FF9696',
    700: '#FF8787',
    800: '#FF7878',
    900: '#FF6969',
  },
  
  // Background - 밝고 부드러운 배경
  background: {
    default: '#FFFBF5', // 따뜻한 크림색
    paper: '#FFFFFF',
    surface: '#FFFEF9',
    elevated: '#FFFFFF',
  },
  
  // Surface - 카드와 컨테이너
  surface: {
    default: '#FFFFFF',
    variant: '#FFF8F0',
    elevated: '#FFFFFF',
    overlay: 'rgba(255, 255, 255, 0.95)',
  },
  
  // Text - 읽기 쉬운 텍스트
  text: {
    primary: '#4A4A4A', // 부드러운 다크 그레이
    secondary: '#7A7A7A',
    disabled: '#BABABA',
    inverse: '#FFFFFF',
    accent: '#FFA16E', // Primary 색상
  },
  
  // Border & Divider
  divider: 'rgba(255, 161, 110, 0.2)', // Primary 색상의 투명한 버전
  border: 'rgba(255, 161, 110, 0.3)',
  
  // Activity Colors - 밝고 친근한 색상 팔레트
  activities: {
    purple: {
      light: '#E8D5FF',
      main: '#C4A3FF',
      dark: '#A070FF',
      surface: '#F5EDFF',
    },
    blue: {
      light: '#D1E9FB',
      main: '#75BDF3',
      dark: '#47A7EF',
      surface: '#E8F4FD',
    },
    pink: {
      light: '#FFE1EB',
      main: '#FFA5C3',
      dark: '#FF699B',
      surface: '#FFF0F5',
    },
    yellow: {
      light: '#FFFDE1',
      main: '#FFF9A5',
      dark: '#FFF569',
      surface: '#FFFEF0',
    },
    green: {
      light: '#E1FFE9',
      main: '#A5FFBD',
      dark: '#69FF91',
      surface: '#F0FFF4',
    },
    orange: {
      light: '#FFE4D6',
      main: '#FFA16E',
      dark: '#FF7D3A',
      surface: '#FFF5F0',
    },
    red: {
      light: '#FFE1E1',
      main: '#FFA5A5',
      dark: '#FF6969',
      surface: '#FFF0F0',
    },
    teal: {
      light: '#D1F5F5',
      main: '#7EE5E5',
      dark: '#4CD5D5',
      surface: '#E8FAFA',
    },
  },
  
  // Gradient Colors - 그라디언트 효과용
  gradients: {
    warm: ['#FFF5F0', '#FFFBF5'],
    cool: ['#E8F4FD', '#FFFBF5'],
    purple: ['#F5EDFF', '#FFFBF5'],
    pink: ['#FFF0F5', '#FFFBF5'],
    success: ['#F0FFF4', '#FFFBF5'],
  },
};

// 아이들을 위한 큰 텍스트 크기
export const ChildFriendlyTypography = {
  h1: {
    fontSize: 40, // 기존 32 → 40
    fontWeight: '700' as const,
    lineHeight: 48,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 32, // 기존 28 → 32
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 28, // 기존 24 → 28
    fontWeight: '600' as const,
    lineHeight: 36,
    letterSpacing: 0,
  },
  h4: {
    fontSize: 24, // 기존 20 → 24
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h5: {
    fontSize: 22, // 기존 18 → 22
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  h6: {
    fontSize: 20, // 기존 16 → 20
    fontWeight: '600' as const,
    lineHeight: 26,
    letterSpacing: 0.15,
  },
  body1: {
    fontSize: 20, // 기존 16 → 20
    fontWeight: '400' as const,
    lineHeight: 28,
    letterSpacing: 0.25,
  },
  body2: {
    fontSize: 18, // 기존 14 → 18
    fontWeight: '400' as const,
    lineHeight: 24,
    letterSpacing: 0.25,
  },
  button: {
    fontSize: 20, // 기존 14 → 20
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: 0.5,
    textTransform: 'none' as const, // 대문자 변환 제거
  },
  caption: {
    fontSize: 16, // 기존 12 → 16
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 18, // 새로운
    fontWeight: '500' as const,
    lineHeight: 24,
    letterSpacing: 0.25,
  },
};

// 아이들을 위한 큰 간격
export const ChildFriendlySpacing = {
  xs: 8,   // 기존 4 → 8
  sm: 12,  // 기존 8 → 12
  md: 20,  // 기존 16 → 20
  lg: 32,  // 기존 24 → 32
  xl: 40,  // 기존 32 → 40
  xxl: 56, // 기존 48 → 56
};

// 아이들을 위한 둥근 모서리
export const ChildFriendlyShape = {
  none: 0,
  small: 8,      // 기존 4 → 8
  medium: 16,    // 기존 8 → 16
  large: 24,     // 기존 12 → 24
  extraLarge: 32, // 기존 16 → 32
  round: 9999,
  pill: 9999,    // 알약 모양
};

// 큰 터치 영역 (아이들이 쉽게 누를 수 있도록)
export const ChildFriendlyTouch = {
  minHeight: 56,  // 기존 48 → 56
  minWidth: 56,
  padding: 16,    // 기존 12 → 16
};
