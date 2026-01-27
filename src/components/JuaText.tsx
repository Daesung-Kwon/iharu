/**
 * 주아체 폰트를 자동으로 적용하는 Text 컴포넌트 래퍼
 */

import React from 'react';
import { Text, TextProps, StyleSheet, Platform } from 'react-native';

interface JuaTextProps extends TextProps {
  children: React.ReactNode;
}

export const JuaText: React.FC<JuaTextProps> = ({ style, ...props }) => {
  return (
    <Text
      style={[styles.juaText, style]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  juaText: {
    fontFamily: 'BMJUA',
    // Android 폰트 렌더링 최적화
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
  },
});

export default JuaText;
