/**
 * ActivityCard
 * Activity tab grid card (brand-guide §3/§5/§6, icons/tile-mockup-activity.png):
 * white card r24 with the one soft shadow, left-aligned. 52pt tile r16 in the
 * activity's brand hue with a 28pt glyph in the darker ink of that hue, then the
 * name (system 17/700) and the duration (13, ink2) with a small clock.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Activity } from '../types';
import IconTile from './IconTile';
import { activityBrandHue, resolveActivityIcon } from '../constants/activityIcons';
import { SoftPopColors } from '../constants/theme';
import { ACTIVITY_CARD_MIN_WIDTH } from '../hooks/layoutMetrics';

export const ACTIVITY_CARD_TILE = 52;
export const ACTIVITY_CARD_TILE_RADIUS = 16;
export const ACTIVITY_CARD_GLYPH = 28;
export const ACTIVITY_CARD_RADIUS = 24;
export const ACTIVITY_CARD_MIN_HEIGHT = 148;

const INK = '#2D3436';
const INK2 = '#636E72';

const systemFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

interface ActivityCardProps {
  activity: Activity;
  /** Tap: open the edit sheet. */
  onEdit: () => void;
  /** Long-press: delete shortcut (confirmed by the screen). */
  onDelete?: () => void;
  /** 동적 그리드용 카드 너비 (미지정 시 180) */
  width?: number;
}

export default function ActivityCard({ activity, onEdit, onDelete, width }: ActivityCardProps) {
  const hue = activityBrandHue(activity.colorKey);
  const icon = resolveActivityIcon(activity.emojiKey).icon;
  const cardWidth = width !== undefined ? Math.max(width, ACTIVITY_CARD_MIN_WIDTH) : undefined;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        cardWidth !== undefined && { width: cardWidth },
        pressed && styles.cardPressed,
      ]}
      onPress={onEdit}
      onLongPress={onDelete}
      delayLongPress={500}
      accessibilityRole="button"
      accessibilityLabel={`${activity.name}, ${activity.durationMinutes}분`}
      accessibilityHint="눌러서 수정"
    >
      <IconTile
        name={icon}
        size={ACTIVITY_CARD_TILE}
        radius={ACTIVITY_CARD_TILE_RADIUS}
        glyphSize={ACTIVITY_CARD_GLYPH}
        tileColor={hue.tint}
        iconColor={hue.ink}
      />

      <View style={styles.info}>
        <Text
          style={styles.name}
          numberOfLines={2}
          lineBreakStrategyIOS="hangul-word"
        >
          {activity.name}
        </Text>
        <View style={styles.duration}>
          <Ionicons name="time-outline" size={14} color={INK2} />
          <Text style={styles.durationText}>{activity.durationMinutes}분</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    minHeight: ACTIVITY_CARD_MIN_HEIGHT,
    borderRadius: ACTIVITY_CARD_RADIUS,
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: SoftPopColors.white,
    alignItems: 'flex-start',
    // One soft shadow (brand-guide §5): 0 4 16 rgba(45,52,54,.06).
    shadowColor: INK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  info: {
    marginTop: 'auto',
    paddingTop: 12,
    alignSelf: 'stretch',
  },
  name: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    fontFamily: systemFont,
    color: INK,
    includeFontPadding: false,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  durationText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: systemFont,
    color: INK2,
    includeFontPadding: false,
  },
});
