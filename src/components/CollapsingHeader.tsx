/**
 * Full-bleed bar that shrinks from a large title card to a one-line bar.
 *
 * The list scrolls behind the bar. Height and padding use the JS driver;
 * title opacity and scale use the native driver and are never on the same view.
 */

import React, { useMemo } from 'react';
import { Animated, Platform, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Fonts } from '../constants/fonts';
import { SoftPopColors } from '../constants/theme';
import {
  COMPACT_TITLE_OPACITY_STOPS,
  LARGE_TITLE_OPACITY_STOPS,
  LARGE_TITLE_SCALE_END,
  SUBTITLE_OPACITY_STOPS,
  stopRanges,
  type CollapsingHeaderMetrics,
} from '../hooks/collapsingHeader';
import { MIN_TOUCH_TARGET } from '../hooks/layoutMetrics';

const systemFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

/**
 * Activity cards use elevation 10. A lower bar would let those cards paint
 * over the header on Android once the list scrolls behind it. The shadow
 * color stays transparent so the lift does not add a second shadow.
 */
const HEADER_ELEVATION = 12;

type CollapsingHeaderProps = {
  title: string;
  subtitle?: string;
  largeFontSize: number;
  compactFontSize: number;
  metrics: CollapsingHeaderMetrics;
  shadow: ViewStyle;
  /** 0 expanded, 1 compact. JS driver. */
  heightProgress: Animated.Value;
  /** 0 expanded, 1 compact. Native driver. Layout props must not use this. */
  motionProgress: Animated.AnimatedInterpolation<number>;
  /** Compact title owns the header role. */
  compactActive: boolean;
  trailing: React.ReactNode;
  testID?: string;
};

function iosCardShadow(shadow: ViewStyle): ViewStyle {
  return {
    shadowColor: shadow.shadowColor,
    shadowOffset: shadow.shadowOffset,
    shadowOpacity: shadow.shadowOpacity,
    shadowRadius: shadow.shadowRadius,
    elevation: 0,
  };
}

export default function CollapsingHeader({
  title,
  subtitle,
  largeFontSize,
  compactFontSize,
  metrics,
  shadow,
  heightProgress,
  motionProgress,
  compactActive,
  trailing,
  testID,
}: CollapsingHeaderProps) {
  const cardHeight = useMemo(
    () => heightProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [metrics.expandedHeight, metrics.compactHeight],
      extrapolate: 'clamp',
    }),
    [heightProgress, metrics.expandedHeight, metrics.compactHeight],
  );
  const barHeight = useMemo(
    () => heightProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        metrics.insetTop + metrics.expandedHeight,
        metrics.insetTop + metrics.compactHeight,
      ],
      extrapolate: 'clamp',
    }),
    [heightProgress, metrics.insetTop, metrics.expandedHeight, metrics.compactHeight],
  );
  const paddingTop = useMemo(
    () => heightProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [metrics.paddingTop, metrics.compactPaddingVertical],
      extrapolate: 'clamp',
    }),
    [heightProgress, metrics.paddingTop, metrics.compactPaddingVertical],
  );
  const paddingBottom = useMemo(
    () => heightProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [metrics.paddingBottom, metrics.compactPaddingVertical],
      extrapolate: 'clamp',
    }),
    [heightProgress, metrics.paddingBottom, metrics.compactPaddingVertical],
  );
  const largeOpacity = useMemo(
    () => motionProgress.interpolate({ ...stopRanges(LARGE_TITLE_OPACITY_STOPS), extrapolate: 'clamp' }),
    [motionProgress],
  );
  const largeScale = useMemo(
    () => motionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, LARGE_TITLE_SCALE_END],
      extrapolate: 'clamp',
    }),
    [motionProgress],
  );
  const compactOpacity = useMemo(
    () => motionProgress.interpolate({ ...stopRanges(COMPACT_TITLE_OPACITY_STOPS), extrapolate: 'clamp' }),
    [motionProgress],
  );
  const subtitleOpacity = useMemo(
    () => motionProgress.interpolate({ ...stopRanges(SUBTITLE_OPACITY_STOPS), extrapolate: 'clamp' }),
    [motionProgress],
  );

  return (
    <Animated.View
      testID={testID}
      collapsable={false}
      style={[
        styles.bar,
        {
          height: barHeight,
          zIndex: 2,
          elevation: HEADER_ELEVATION,
          shadowColor: 'transparent',
          backgroundColor: SoftPopColors.background,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.card,
          iosCardShadow(shadow),
          {
            height: cardHeight,
            marginTop: metrics.insetTop,
            marginHorizontal: metrics.insetHorizontal,
            paddingTop,
            paddingBottom,
            paddingHorizontal: metrics.paddingHorizontal,
            borderRadius: metrics.radius,
            borderWidth: metrics.borderWidth,
          },
        ]}
      >
        <View style={styles.row}>
          <View style={styles.titleSlot}>
            <Animated.View
              pointerEvents="none"
              accessibilityElementsHidden={compactActive}
              importantForAccessibility={compactActive ? 'no-hide-descendants' : 'yes'}
              style={[styles.fill, { opacity: largeOpacity, transform: [{ scale: largeScale }] }]}
            >
              <Text
                testID={testID ? `${testID}-title-large` : undefined}
                accessibilityRole={compactActive ? undefined : 'header'}
                numberOfLines={1}
                style={[styles.largeTitle, { fontSize: largeFontSize, lineHeight: largeFontSize + 8 }]}
              >
                {title}
              </Text>
              {subtitle ? (
                <Animated.Text
                  numberOfLines={2}
                  style={[styles.subtitle, { opacity: subtitleOpacity }]}
                >
                  {subtitle}
                </Animated.Text>
              ) : null}
            </Animated.View>
            <Animated.View
              pointerEvents="none"
              accessibilityElementsHidden={!compactActive}
              importantForAccessibility={compactActive ? 'yes' : 'no-hide-descendants'}
              style={[styles.fill, { opacity: compactOpacity }]}
            >
              <Text
                testID={testID ? `${testID}-title-compact` : undefined}
                accessibilityRole="header"
                numberOfLines={1}
                style={[
                  styles.compactTitle,
                  { fontSize: compactFontSize, lineHeight: compactFontSize + 8 },
                ]}
              >
                {title}
              </Text>
            </Animated.View>
          </View>
          <View style={styles.trailing}>{trailing}</View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  card: {
    backgroundColor: SoftPopColors.white,
    borderColor: SoftPopColors.white,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleSlot: {
    flex: 1,
    minHeight: MIN_TOUCH_TARGET,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  largeTitle: {
    color: SoftPopColors.text,
    fontFamily: Fonts.jua,
  },
  compactTitle: {
    color: SoftPopColors.text,
    fontFamily: Fonts.jua,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 22,
    color: SoftPopColors.textSecondary,
    fontFamily: systemFont,
  },
  trailing: {
    flexShrink: 0,
    justifyContent: 'center',
  },
});
