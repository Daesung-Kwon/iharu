/**
 * Toast - 짧은 메시지 표시 (자동 사라짐)
 */

import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Pressable, View } from 'react-native';
import { SoftPopColors } from '../constants/theme';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  /** Distance from the screen bottom; screens pass ad + tab bar height. */
  bottomOffset?: number;
}

export default function Toast({
  message,
  visible,
  onHide,
  duration = 2000,
  actionLabel,
  onAction,
  bottomOffset = 120,
}: ToastProps) {
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

  const handleAction = () => {
    animationRef.current?.stop();
    onAction?.();
    onHide();
  };

  return (
    <Animated.View style={[styles.container, { opacity, bottom: bottomOffset }]}>
      <View style={styles.row}>
        <Text style={styles.message}>{message}</Text>
        {actionLabel && onAction ? (
          <Pressable
            onPress={handleAction}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={actionLabel}
          >
            <Text style={styles.action}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
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
    zIndex: 200,
    elevation: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'BMJUA',
    flexShrink: 1,
  },
  action: {
    color: SoftPopColors.secondary,
    fontSize: 15,
    fontFamily: 'BMJUA',
  },
});
