/**
 * The dim layer behind every modal, sheet and dialog (see constants/modalStyle).
 * Pass onPress to close on tap outside; omit it where an accidental tap would
 * lose typed input.
 *
 * Bottom sheets share this scrim plus sheetFrameStyle (SheetChrome corners
 * and inset, getSheetBottomPadding underneath).
 */
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { MODAL_BACKDROP_COLOR, modalStyles } from '../constants/modalStyle';
import { getSheetBottomPadding } from '../utils/safeArea';

export default function ModalBackdrop({ onPress }: { onPress?: () => void }) {
  if (!onPress) {
    return <View style={styles.fill} pointerEvents="none" />;
  }
  return <Pressable style={styles.fill} onPress={onPress} accessibilityLabel="닫기" />;
}

/** Shared frame for 보상 약속, 보상 확장, and Plan +추가. */
export function sheetFrameStyle(insetBottom: number): ViewStyle[] {
  return [
    modalStyles.sheet,
    modalStyles.sheetInset,
    { paddingBottom: getSheetBottomPadding(insetBottom) },
  ];
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MODAL_BACKDROP_COLOR,
  },
});
