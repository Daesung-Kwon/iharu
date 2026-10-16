/**
 * The dim layer behind every modal, sheet and dialog (see constants/modalStyle).
 * Pass onPress to close on tap outside; omit it where an accidental tap would
 * lose typed input.
 */
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MODAL_BACKDROP_COLOR } from '../constants/modalStyle';

export default function ModalBackdrop({ onPress }: { onPress?: () => void }) {
  if (!onPress) {
    return <View style={styles.fill} pointerEvents="none" />;
  }
  return <Pressable style={styles.fill} onPress={onPress} accessibilityLabel="닫기" />;
}

const styles = StyleSheet.create({
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: MODAL_BACKDROP_COLOR,
  },
});
