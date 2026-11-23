/**
 * CelebrationModal
 * Shown once when every activity for the day is done.
 * The hero is 하루 해님 (cheer). No emoji, no star ring.
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandAccent, SoftPopColors } from '../constants/theme';
import { CELEBRATION_COPY, CELEBRATION_MASCOT_SIZE } from '../constants/celebration';
import { Fonts } from '../constants/fonts';
import { HaruSun } from './icons/HaruSun';
import ModalBackdrop from './ModalBackdrop';
import { modalStyles } from '../constants/modalStyle';
import { useReduceMotion } from '../hooks/useReduceMotion';

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
}

const systemFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

export default function CelebrationModal({ visible, onClose }: CelebrationModalProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && reduceMotion) {
      scaleAnim.setValue(1);
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      return;
    }
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible, reduceMotion, opacityAnim, scaleAnim]);

  const modalStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={modalStyles.dialogOverlay}>
        <ModalBackdrop onPress={onClose} />
        <Animated.View style={[modalStyles.dialog, styles.modalContainer, modalStyle]}>
          <HaruSun mood="cheer" size={CELEBRATION_MASCOT_SIZE} />

          <Text style={styles.title}>{CELEBRATION_COPY.title}</Text>
          <Text style={styles.message}>{CELEBRATION_COPY.message}</Text>
          <Text style={styles.subMessage}>{CELEBRATION_COPY.sub}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              Platform.OS === 'android' && {
                marginBottom: Math.max(insets.bottom, 16),
              },
            ]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>{CELEBRATION_COPY.confirm}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    paddingTop: 28,
    paddingBottom: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    color: SoftPopColors.text,
    textAlign: 'center',
    lineHeight: 36,
    fontFamily: Fonts.jua,
    marginTop: 4,
  },
  message: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    color: SoftPopColors.text,
    marginTop: 12,
    textAlign: 'center',
    fontFamily: systemFont,
  },
  subMessage: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    color: SoftPopColors.textSecondary,
    textAlign: 'center',
    fontFamily: systemFont,
    marginTop: 8,
    marginBottom: 28,
  },
  button: {
    backgroundColor: BrandAccent.strong,
    height: 48,
    paddingHorizontal: 40,
    borderRadius: 999,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D3436',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    elevation: 1,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    color: SoftPopColors.white,
    textAlign: 'center',
    fontFamily: systemFont,
  },
});
