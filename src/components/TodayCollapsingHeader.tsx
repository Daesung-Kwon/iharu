/**
 * Today’s sticky header. The card starts at the current stack height and
 * shrinks to one line. Height and padding use the JS driver; opacity and
 * scale use the native driver and stay on separate views.
 */

import React, { useMemo } from 'react';
import { Animated, LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Fonts } from '../constants/fonts';
import { BrandAccent, SoftPopColors } from '../constants/theme';
import { IhIcon } from './icons/IhIcon';
import { MIN_TOUCH_TARGET } from '../hooks/layoutMetrics';
import {
  COMPACT_TITLE_OPACITY_STOPS,
  LARGE_TITLE_OPACITY_STOPS,
  LARGE_TITLE_SCALE_END,
  stopRanges,
} from '../hooks/collapsingHeader';
import {
  TODAY_ACCESSORY_OPACITY_STOPS,
  TODAY_BUTTON_ICON,
  TODAY_BUTTON_LABEL,
  type TodayHeaderMetrics,
} from '../screens/todayHeader';

const systemFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

/** Above the current-activity card (elevation 8) and below the toast (20). */
const HEADER_ELEVATION = 12;

type TodayCollapsingHeaderProps = {
  largeTitle: string;
  compactTitle: string;
  dateLabel: string;
  /** Tablet stacks the date under the title. Phones keep both on one line. */
  stackedDate: boolean;
  largeFontSize: number;
  compactFontSize: number;
  metrics: TodayHeaderMetrics;
  /** Card height at rest. May be a hair taller than the estimate once content is measured. */
  expandedHeight: number;
  /** Week strip, promise, and date picker block at rest. */
  accessoryHeight: number;
  shadow: ViewStyle;
  heightProgress: Animated.Value;
  motionProgress: Animated.AnimatedInterpolation<number>;
  compactActive: boolean;
  faded: boolean;
  showTodayButton: boolean;
  onPressToday?: () => void;
  completionLabel: string | null;
  completionColor: string;
  accessory: React.ReactNode;
  onAccessoryLayout?: (height: number) => void;
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

function TodayButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      testID="today-header-today"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="오늘로 돌아가기"
      hitSlop={4}
      style={({ pressed }) => [styles.todayButton, pressed && styles.todayButtonPressed]}
    >
      <IhIcon name={TODAY_BUTTON_ICON} size={18} color={SoftPopColors.white} />
      <Text style={styles.todayButtonText}>{TODAY_BUTTON_LABEL}</Text>
    </Pressable>
  );
}

export default function TodayCollapsingHeader({
  largeTitle,
  compactTitle,
  dateLabel,
  stackedDate,
  largeFontSize,
  compactFontSize,
  metrics,
  expandedHeight,
  accessoryHeight,
  shadow,
  heightProgress,
  motionProgress,
  compactActive,
  faded,
  showTodayButton,
  onPressToday,
  completionLabel,
  completionColor,
  accessory,
  onAccessoryLayout,
  testID = 'today-header',
}: TodayCollapsingHeaderProps) {
  const cardHeight = useMemo(
    () => heightProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [expandedHeight, metrics.compactHeight],
      extrapolate: 'clamp',
    }),
    [heightProgress, expandedHeight, metrics.compactHeight],
  );
  const barHeight = useMemo(
    () => heightProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        metrics.insetTop + expandedHeight,
        metrics.insetTop + metrics.compactHeight,
      ],
      extrapolate: 'clamp',
    }),
    [heightProgress, metrics.insetTop, expandedHeight, metrics.compactHeight],
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
  const accessoryClip = useMemo(
    () => heightProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [accessoryHeight, 0],
      extrapolate: 'clamp',
    }),
    [heightProgress, accessoryHeight],
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
  const accessoryOpacity = useMemo(
    () => motionProgress.interpolate({ ...stopRanges(TODAY_ACCESSORY_OPACITY_STOPS), extrapolate: 'clamp' }),
    [motionProgress],
  );

  const handleAccessoryLayout = (event: LayoutChangeEvent) => {
    onAccessoryLayout?.(event.nativeEvent.layout.height);
  };

  const titleLine = largeFontSize + 8;
  const compactLine = compactFontSize + 8;

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
        <View style={styles.column}>
          <View style={styles.row}>
            <View style={styles.titleSlot}>
              <Animated.View
                pointerEvents="none"
                accessibilityElementsHidden={compactActive}
                importantForAccessibility={compactActive ? 'no-hide-descendants' : 'yes'}
                style={[styles.fill, { opacity: largeOpacity, transform: [{ scale: largeScale }] }]}
              >
                {stackedDate ? (
                  <View>
                    <Text
                      testID={`${testID}-title-large`}
                      accessibilityRole={compactActive ? undefined : 'header'}
                      numberOfLines={1}
                      style={[styles.largeTitle, { fontSize: largeFontSize, lineHeight: titleLine }]}
                    >
                      {largeTitle}
                    </Text>
                    <Text numberOfLines={1} style={styles.stackedDate}>
                      {dateLabel}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.inlineTitles}>
                    <Text
                      testID={`${testID}-title-large`}
                      accessibilityRole={compactActive ? undefined : 'header'}
                      numberOfLines={1}
                      style={[styles.largeTitle, { fontSize: largeFontSize, lineHeight: titleLine }]}
                    >
                      {largeTitle}
                    </Text>
                    <Text numberOfLines={1} style={styles.inlineDate}>
                      {dateLabel}
                    </Text>
                  </View>
                )}
              </Animated.View>
              <Animated.View
                pointerEvents="none"
                accessibilityElementsHidden={!compactActive}
                importantForAccessibility={compactActive ? 'yes' : 'no-hide-descendants'}
                style={[styles.fill, { opacity: compactOpacity }]}
              >
                <Text
                  testID={`${testID}-title-compact`}
                  accessibilityRole="header"
                  numberOfLines={1}
                  style={[
                    styles.compactTitle,
                    {
                      fontSize: compactFontSize,
                      lineHeight: compactLine,
                      paddingRight: completionLabel ? 56 : 0,
                    },
                  ]}
                >
                  {compactTitle}
                </Text>
              </Animated.View>
            </View>
            <View style={styles.side}>
              {completionLabel ? (
                <Animated.View
                  pointerEvents="none"
                  accessibilityElementsHidden={!compactActive}
                  importantForAccessibility={compactActive ? 'yes' : 'no-hide-descendants'}
                  style={[
                    styles.completionWrap,
                    { opacity: compactOpacity, marginRight: showTodayButton ? 8 : 0 },
                  ]}
                >
                  <Text
                    testID={`${testID}-completion`}
                    numberOfLines={1}
                    accessibilityLabel={`완료율 ${completionLabel}`}
                    style={[
                      styles.completion,
                      { color: completionColor, fontSize: compactFontSize, lineHeight: compactLine },
                    ]}
                  >
                    {completionLabel}
                  </Text>
                </Animated.View>
              ) : null}
              {showTodayButton && onPressToday ? <TodayButton onPress={onPressToday} /> : null}
            </View>
          </View>
          <Animated.View style={[styles.accessoryClip, { height: accessoryClip }]}>
            <Animated.View
              pointerEvents={faded ? 'none' : 'auto'}
              accessibilityElementsHidden={faded}
              importantForAccessibility={faded ? 'no-hide-descendants' : 'auto'}
              style={{ opacity: accessoryOpacity }}
            >
              <View collapsable={false} onLayout={handleAccessoryLayout}>
                {accessory}
              </View>
            </Animated.View>
          </Animated.View>
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
  column: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  titleSlot: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
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
  inlineTitles: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  largeTitle: {
    color: SoftPopColors.text,
    fontFamily: Fonts.jua,
    flexShrink: 0,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  inlineDate: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
    color: SoftPopColors.textSecondary,
    fontFamily: systemFont,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  stackedDate: {
    marginTop: 8,
    fontSize: 18,
    lineHeight: 24,
    color: SoftPopColors.textSecondary,
    fontFamily: systemFont,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  compactTitle: {
    color: SoftPopColors.text,
    fontFamily: Fonts.jua,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  side: {
    flexShrink: 0,
    justifyContent: 'center',
    position: 'relative',
  },
  completionWrap: {
    position: 'absolute',
    right: '100%',
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  completion: {
    fontFamily: Fonts.jua,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
    marginLeft: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: BrandAccent.strong,
  },
  todayButtonPressed: {
    opacity: 0.88,
  },
  todayButtonText: {
    color: SoftPopColors.white,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: systemFont,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  accessoryClip: {
    overflow: 'hidden',
  },
});
