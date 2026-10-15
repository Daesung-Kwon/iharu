/**
 * Every tab screen's root: applies the shared safe-area edges (top always,
 * sides in landscape, never bottom; see utils/safeArea).
 */
import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SoftPopColors } from '../constants/theme';
import { useLayout } from '../hooks/useLayout';
import { getScreenEdges } from '../utils/safeArea';

export default function ScreenContainer({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { isLandscape } = useLayout();
  return (
    <SafeAreaView style={[styles.container, style]} edges={getScreenEdges(isLandscape)}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SoftPopColors.background,
  },
});
