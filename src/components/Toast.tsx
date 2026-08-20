/**
 * Toast - 짧은 메시지 표시 (자동 사라짐)
 */

import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

export default function Toast({ message, visible, onHide, duration = 2000 }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const runIdRef = useRef(0);
  const onHideRef = useRef(onHide);
  onHideRef.current = onHide;

  useEffect(() => {
    if (!visible || !message) {
      animationRef.current?.stop();
      animationRef.current = null;
      opacity.setValue(0);
      return;
    }

    const runId = ++runIdRef.current;
    animationRef.current?.stop();
    opacity.setValue(0);

    const animation = Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(Math.max(duration - 400, 0)),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);
    animationRef.current = animation;
    animation.start(({ finished }) => {
      if (finished && runId === runIdRef.current) {
        onHideRef.current();
      }
    });

    return () => {
      animation.stop();
      if (animationRef.current === animation) {
        animationRef.current = null;
      }
    };
  }, [visible, message, duration, opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(45, 52, 54, 0.9)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignSelf: 'center',
  },
  message: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'BMJUA',
  },
});
