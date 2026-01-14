/**
 * 폰트 상수 정의
 */

export const Fonts = {
  // 주아체 (배달의민족 폰트)
  jua: 'BMJUA',
  
  // 시스템 폰트 (폴백용)
  system: 'System',
} as const;

/**
 * 전역 폰트 스타일
 * 모든 Text 컴포넌트에 기본적으로 적용할 수 있는 스타일
 */
export const GlobalFontStyles = {
  default: {
    fontFamily: Fonts.jua,
  },
  heading: {
    fontFamily: Fonts.jua,
    fontWeight: 'bold' as const,
  },
  body: {
    fontFamily: Fonts.jua,
  },
  caption: {
    fontFamily: Fonts.jua,
    fontSize: 12,
  },
};
