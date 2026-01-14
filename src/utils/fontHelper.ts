/**
 * 폰트 헬퍼 함수
 * 모든 텍스트 스타일에 주아체 폰트를 자동으로 추가
 */

import { TextStyle } from 'react-native';

/**
 * 텍스트 스타일에 주아체 폰트를 추가하는 헬퍼 함수
 */
export const withJuaFont = <T extends TextStyle>(style: T): T => {
  return {
    ...style,
    fontFamily: 'BMJUA',
  };
};

/**
 * 여러 스타일을 병합하고 주아체 폰트를 추가
 */
export const mergeWithJuaFont = (...styles: (TextStyle | undefined | null | false)[]): TextStyle => {
  const merged = Object.assign({}, ...styles.filter(Boolean));
  return {
    ...merged,
    fontFamily: 'BMJUA',
  };
};
