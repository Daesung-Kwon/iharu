/**
 * 전역 스타일 정의
 * 주아체 폰트를 기본으로 사용
 */

import { TextStyle } from 'react-native';
import { Fonts } from '../constants/fonts';

/**
 * 기본 텍스트 스타일 (주아체 적용)
 */
export const defaultTextStyle: TextStyle = {
  fontFamily: Fonts.jua,
};

/**
 * 제목 스타일
 */
export const headingTextStyle: TextStyle = {
  fontFamily: Fonts.jua,
  fontWeight: 'bold',
};

/**
 * 본문 스타일
 */
export const bodyTextStyle: TextStyle = {
  fontFamily: Fonts.jua,
};

/**
 * 캡션 스타일
 */
export const captionTextStyle: TextStyle = {
  fontFamily: Fonts.jua,
  fontSize: 12,
};
