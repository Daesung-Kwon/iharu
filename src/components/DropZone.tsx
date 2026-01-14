/**
 * DropZone 컴포넌트
 * 드래그 앤 드롭을 위한 드롭 존 (Material Design)
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialColors, Typography, Spacing, Shape } from '../constants/materialDesign';

interface DropZoneProps {
  isActive?: boolean;
  time?: string;
}

export default function DropZone({ isActive = false, time }: DropZoneProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const backgroundColorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundColorAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundColorAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [isActive]);

  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [MaterialColors.surface.variant, MaterialColors.primary[50]],
  });

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    backgroundColor: backgroundColor,
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <MaterialIcons
        name="add-circle-outline"
        size={32}
        color={isActive ? MaterialColors.primary[500] : MaterialColors.text.disabled}
      />
      <Text style={[
        styles.text,
        isActive && styles.textActive
      ]}>
        {time ? `${time}에 놓기` : '여기로 끌어다 놓으세요'}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    borderRadius: Shape.medium,
    borderWidth: 2,
    borderColor: MaterialColors.divider,
    borderStyle: 'dashed',
    padding: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  text: {
    ...Typography.caption,
    color: MaterialColors.text.disabled,
    textAlign: 'center',
  },
  textActive: {
    color: MaterialColors.primary[500],
    fontWeight: '500',
  },
});

