/**
 * ActivityIcon - 활동 이모지 또는 Material Icon 렌더링
 * displayAsIcon이 true면 아이콘, 아니면 이모지로 표시
 */

import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Activity } from '../types';
import { ActivityEmojis, EmojiToMaterialIcon } from '../constants/emojis';

interface ActivityIconProps {
  activity?: Pick<Activity, 'emojiKey' | 'displayAsIcon'> | null;
  size?: number;
  color?: string;
  style?: object;
}

const FALLBACK_EMOJI = '📌';

export default function ActivityIcon({
  activity,
  size = 44,
  color,
  style,
}: ActivityIconProps) {
  if (!activity?.emojiKey) {
    return (
      <Text style={[styles.emoji, { fontSize: size * 0.9 }, style]}>
        {FALLBACK_EMOJI}
      </Text>
    );
  }

  const emoji = ActivityEmojis[activity.emojiKey] || activity.emojiKey;
  const iconName = EmojiToMaterialIcon[activity.emojiKey] || 'circle';
  const showAsIcon = activity.displayAsIcon === true;

  if (showAsIcon) {
    return (
      <MaterialIcons
        name={iconName as React.ComponentProps<typeof MaterialIcons>['name']}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  return (
    <Text style={[styles.emoji, { fontSize: size * 0.9 }, style]}>
      {emoji}
    </Text>
  );
}

const styles = StyleSheet.create({
  emoji: {
    textAlign: 'center',
  },
});
