/**
 * CelebrationModal 컴포넌트
 * 모든 일정 완료 시 축하 애니메이션
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

// Soft Pop 3D 디자인 색상 팔레트
const SoftPopColors = {
  background: '#FFF9F0', // Cream
  primary: '#FF6B6B', // Soft Red
  secondary: '#FFD93D', // Banana Yellow
  text: '#2D3436', // Soft Black
  textSecondary: '#636E72', // Soft Gray
  white: '#FFFFFF',
  success: '#6BCB77',
};

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CelebrationModal({ visible, onClose }: CelebrationModalProps) {
  const insets = useSafeAreaInsets();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const confettiScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
      const rotateAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(rotationAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(rotationAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
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
  }, [visible]);

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
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          {/* Confetti Effect */}
          <Animated.View style={[styles.confettiContainer, confettiStyle]}>
            {[...Array(12)].map((_, i) => {
              const angle = (i * 360) / 12;
              const radius = 100;
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
                    size={24}
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
              size={80}
              color={SoftPopColors.secondary}
            />
          </Animated.View>

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

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: SoftPopColors.white,
    borderRadius: 32, // rounded-3xl (더 크게)
    padding: 40,
    alignItems: 'center',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Strong floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  confettiContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
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
    marginTop: 32,
    marginBottom: 20,
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

