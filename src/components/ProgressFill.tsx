/**
 * Progress bar fill that glides to the new value (about 0.35s) instead of
 * jumping. Respects Reduce Motion. Width animation runs on the JS driver,
 * which is fine for a single small view.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle } from 'react-native';
import { useReduceMotion } from '../hooks/useReduceMotion';

interface Props {
  /** 0..100 */
  percent: number;
  style?: StyleProp<ViewStyle>;
}

export default function ProgressFill({ percent, style }: Props) {
  const reduceMotion = useReduceMotion();
  const value = useRef(new Animated.Value(percent)).current;

  useEffect(() => {
    if (reduceMotion) {
      value.setValue(percent);
      return;
    }
    const anim = Animated.timing(value, {
      toValue: percent,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.start();
    return () => anim.stop();
  }, [percent, reduceMotion, value]);

  const width = value.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' });
  return <Animated.View style={[style, { width }]} />;
}
