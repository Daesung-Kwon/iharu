/**
 * ih-* glyph on a soft pastel tile.
 * One radius and one glyph ratio so the stroke reads the same on every screen.
 */

import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { ACTIVITY_ICON_INK, ICON_GLYPH_RATIO } from '../constants/activityIcons';
import { IhIcon } from './icons/IhIcon';

interface IconTileProps {
  name: string;
  /** Outer tile size in px. The glyph is ICON_GLYPH_RATIO of this. */
  size?: number;
  tileColor: string;
  iconColor?: string;
  /** Overrides the ratio-based glyph size (Activity cards use 28 on 52). */
  glyphSize?: number;
  /** Overrides the 32% radius (Activity cards use 16 on 52). */
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export default function IconTile({
  name,
  size = 44,
  tileColor,
  iconColor = ACTIVITY_ICON_INK,
  glyphSize,
  radius: radiusOverride,
  style,
}: IconTileProps) {
  const glyph = glyphSize ?? Math.max(10, Math.round(size * ICON_GLYPH_RATIO));
  const radius = radiusOverride ?? Math.max(6, Math.round(size * 0.32));

  return (
    <View
      accessible={false}
      importantForAccessibility="no"
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: tileColor,
        },
        style,
      ]}
    >
      <IhIcon name={name} size={glyph} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
