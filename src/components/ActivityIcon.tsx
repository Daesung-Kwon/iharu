/**
 * Activity icon. Stored emoji keys and legacy emoji characters both render
 * as an Ionicons outline glyph in a pastel tile. Unknown values use the pin.
 */

import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Activity } from '../types';
import { resolveActivityIcon } from '../constants/activityIcons';
import IconTile from './IconTile';

interface ActivityIconProps {
  activity?: Pick<Activity, 'emojiKey'> | null;
  /** Tile size in px. The glyph ink is ACTIVITY_ICON_INK on every screen. */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export default function ActivityIcon({
  activity,
  size = 44,
  style,
}: ActivityIconProps) {
  const resolved = resolveActivityIcon(activity?.emojiKey);
  return (
    <IconTile
      name={resolved.icon}
      size={size}
      tileColor={resolved.tile}
      style={style}
    />
  );
}
