/**
 * 박수 애니메이션 컴포넌트
 * 활동 완료 시 표시되는 축하 애니메이션
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated } from 'react-native';

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

interface ClapAnimationProps {
  visible: boolean;
  onAnimationFinish?: () => void;
}

export default function ClapAnimation({ visible, onAnimationFinish }: ClapAnimationProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const clapScaleAnim = useRef(new Animated.Value(1)).current;

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

      // Clap animation (박수 효과) - 부드러운 펄스 3회
      const clapAnimation = Animated.sequence([
        Animated.timing(clapScaleAnim, {
          toValue: 1.15,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(clapScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(clapScaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(clapScaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(clapScaleAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(clapScaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]);
      clapAnimation.start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      clapScaleAnim.setValue(1);
    }
  }, [visible, onAnimationFinish]);

  const modalStyle = {
    transform: [{ scale: scaleAnim }],
    opacity: opacityAnim,
  };

  const clapStyle = {
    transform: [{ scale: clapScaleAnim }],
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onAnimationFinish}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          {/* 박수 이모지 */}
          <Animated.View style={[styles.clapContainer, clapStyle]}>
            <Text style={styles.clapEmoji}>👏</Text>
          </Animated.View>

          <Text style={styles.title}>🎉 잘했어요! 🎉</Text>
          <Text style={styles.message}>
            활동을 완료했어요!
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]}
            onPress={onAnimationFinish}
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
  clapContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  clapEmoji: {
    fontSize: 88,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: SoftPopColors.secondary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 36,
    fontFamily: 'BMJUA',
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    color: SoftPopColors.text,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 28,
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
