/** Calm one-row weekly promise line for the Today header (one row even with several promises). */
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SoftPopColors } from '../constants/theme';
import { summaryCopy, WeekSummary } from '../utils/weeklyPromises';

export default function WeeklyPromiseCard({ summary, dense }: { summary: WeekSummary; dense?: boolean }) {
  const { title, detail } = summaryCopy(summary);
  return (
    <View style={[styles.row, dense && styles.rowDense]} accessible accessibilityLabel={`${title}. ${detail}`}>
      <MaterialIcons name="card-giftcard" size={dense ? 20 : 22} color={SoftPopColors.today} />
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.detail} numberOfLines={1}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: SoftPopColors.todaySurface,
  },
  rowDense: { marginTop: 8, paddingVertical: 6 },
  text: { flex: 1, minWidth: 0 },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'BMJUA',
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    color: SoftPopColors.text,
  },
  detail: {
    fontSize: 13,
    lineHeight: 18,
    color: SoftPopColors.textSecondary,
  },
});
