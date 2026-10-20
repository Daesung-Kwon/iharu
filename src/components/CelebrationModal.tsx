/**
 * CelebrationModal 컴포넌트
 * 모든 일정 완료 시 축하 애니메이션
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { SoftPopColors } from '../constants/theme';
import ModalBackdrop from './ModalBackdrop';
import { modalStyles } from '../constants/modalStyle';
import { useReduceMotion } from '../hooks/useReduceMotion';

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CelebrationModal({ visible, onClose }: CelebrationModalProps) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotion();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && reduceMotion) {
      // Reduce Motion: just appear (fade-in only), no spin or bounce.
      scaleAnim.setValue(1);
      rotationAnim.setValue(0);
      confettiScaleAnim.setValue(1);
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      return;
    }
    if (visible) {
      // Modal scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Opacity animation
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Rotation animation (continuous)
      // One calm turn, not an endless spin.
      const rotateAnimation = Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      });
      rotateAnimation.start();

      // Confetti scale animation
      Animated.sequence([
        Animated.timing(confettiScaleAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(confettiScaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(confettiScaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      rotationAnim.setValue(0);
      opacityAnim.setValue(0);
      confettiScaleAnim.setValue(0);
    }
  }, [visible, reduceMotion]);

  const modalStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const starStyle = {
    transform: [
      { rotate: rotation },
      { scale: confettiScaleAnim },
    ],
  };

  const confettiStyle = {
    transform: [{ scale: confettiScaleAnim }],
    opacity: confettiScaleAnim.interpolate({
      inputRange: [0, 1, 1.2],
      outputRange: [0, 1, 0.8],
    }),
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
          {/* Hero: the star ring is centred on the icon so it never runs into the title. */}
          <View style={styles.hero}>
          <Animated.View style={[styles.confettiContainer, confettiStyle]}>
            {[...Array(12)].map((_, i) => {
              const angle = (i * 360) / 12;
              const radius = HERO_RADIUS;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <View
                  key={i}
                  style={[
                    styles.confetti,
                    {
                      transform: [
                        { translateX: x },
                        { translateY: y },
                      ],
                    },
                  ]}
                >
                  <MaterialIcons
                    name="star"
                    size={20}
                    color={SoftPopColors.secondary}
                  />
                </View>
              );
            })}
          </Animated.View>

          {/* Main Content */}
          <Animated.View style={starStyle}>
            <MaterialIcons
              name="celebration"
              size={72}
              color={SoftPopColors.secondary}
            />
          </Animated.View>
          </View>

          <Text style={styles.title}>🎉 완벽해요! 🎉</Text>
          <Text style={styles.message}>
            오늘의 모든 일정을 완료했어요!
          </Text>
          <Text style={styles.subMessage}>
            정말 수고했어요! 내일도 화이팅! 💪
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              Platform.OS === 'android' && {
                marginBottom: Math.max(insets.bottom, 16),
              }
            ]}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>확인</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const HERO_SIZE = 168;
const HERO_RADIUS = 70;

const styles = StyleSheet.create({
  hero: {
    width: HERO_SIZE,
    height: HERO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    padding: 40,
    alignItems: 'center',
    maxWidth: 400,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: SoftPopColors.secondary,
    marginTop: 12,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 36,
    fontFamily: 'BMJUA',
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    color: SoftPopColors.text,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: 'BMJUA',
  },
  subMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: SoftPopColors.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  button: {
    backgroundColor: SoftPopColors.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 28, // rounded-full
    minWidth: 140,
    // 3D pressable effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: SoftPopColors.white,
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: 'BMJUA',
  },
});

