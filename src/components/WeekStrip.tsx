/**
 * Mon–Sun completion strip for the week of the selected date.
 *
 * - variant "full" (phones): the only date UI on the Today screen. Each day
 *   shows weekday + date number + completion dot (>=44pt tap target), and
 *   44pt chevrons move a week back/forward within the same range as
 *   HorizontalDatePicker (past 30 / future 90 days).
 * - variant "summary" (tablet): compact dots under HorizontalDatePicker.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Schedule } from '../types';
import { SoftPopColors } from '../constants/theme';
import {
  formatWeekRangeKo,
  getShiftedWeekDate,
  getWeekDatesInWeek,
  toLocalDateString,
} from '../utils/dateUtils';
import { countCompleteDays, getWeekOverview } from '../utils/statsUtils';

const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

interface WeekStripProps {
  selectedDate: Date;
  schedules: Schedule[];
  onDateSelect: (date: Date) => void;
  variant?: 'full' | 'summary';
  /** Tighter vertical rhythm (iPhone SE class). */
  dense?: boolean;
}

export default function WeekStrip({
  selectedDate,
  schedules,
  onDateSelect,
  variant = 'summary',
  dense = false,
}: WeekStripProps) {
  const weekDates = getWeekDatesInWeek(selectedDate);
  const overview = getWeekOverview(weekDates, schedules);
  const kept = countCompleteDays(overview);
  const todayString = toLocalDateString(new Date());
  const selectedString = toLocalDateString(selectedDate);
  const summaryText = kept > 0 ? `${kept}일 지켰어요` : '아직 지킨 날이 없어요';
  const isFull = variant === 'full';

  const prevDate = isFull ? getShiftedWeekDate(selectedDate, -1) : null;
  const nextDate = isFull ? getShiftedWeekDate(selectedDate, 1) : null;
  const containsToday = overview.some(day => day.dateString === todayString);

  return (
    <View style={isFull ? (dense ? styles.containerFullDense : styles.containerFull) : styles.container}>
      {isFull ? (
        <View style={styles.navRow}>
          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              !prevDate && styles.navButtonDisabled,
              pressed && styles.navButtonPressed,
            ]}
            onPress={() => prevDate && onDateSelect(prevDate)}
            disabled={!prevDate}
            accessibilityRole="button"
            accessibilityLabel="지난 주"
            accessibilityState={{ disabled: !prevDate }}
          >
            <MaterialIcons name="chevron-left" size={28} color={SoftPopColors.text} />
          </Pressable>
          <View style={styles.navCenter} accessible accessibilityLabel={`${formatWeekRangeKo(weekDates)}, ${summaryText}`}>
            <Text style={styles.rangeText} numberOfLines={1}>
              {formatWeekRangeKo(weekDates)}
            </Text>
            <Text style={styles.summaryFull} numberOfLines={1}>
              {containsToday ? `이번 주 ${summaryText}` : summaryText}
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              !nextDate && styles.navButtonDisabled,
              pressed && styles.navButtonPressed,
            ]}
            onPress={() => nextDate && onDateSelect(nextDate)}
            disabled={!nextDate}
            accessibilityRole="button"
            accessibilityLabel="다음 주"
            accessibilityState={{ disabled: !nextDate }}
          >
            <MaterialIcons name="chevron-right" size={28} color={SoftPopColors.text} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.headerRow}>
          <Text style={styles.title}>이번 주</Text>
          <Text style={styles.summary}>{summaryText}</Text>
        </View>
      )}
      <View style={styles.days}>
        {overview.map((day, index) => {
          const isSelected = day.dateString === selectedString;
          const isToday = day.dateString === todayString;
          const statusLabel = day.status === 'complete'
            ? '모두 완료'
            : day.status === 'partial'
              ? '일부 완료'
              : '';
          return (
            <Pressable
              key={day.dateString}
              style={[
                styles.day,
                isFull && styles.dayFull,
                isFull && dense && styles.dayFullDense,
                isSelected && styles.daySelected,
                isToday && !isSelected && styles.dayToday,
              ]}
              onPress={() => onDateSelect(day.date)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${day.date.getMonth() + 1}월 ${day.date.getDate()}일 ${WEEKDAY_LABELS[index]}요일${isToday ? ', 오늘' : ''}${statusLabel ? `, ${statusLabel}` : ''}`}
            >
              <Text
                style={[
                  styles.weekday,
                  isSelected && styles.weekdaySelected,
                ]}
              >
                {WEEKDAY_LABELS[index]}
              </Text>
              {isFull && (
                <Text
                  style={[
                    styles.dayNumber,
                    isToday && styles.dayNumberToday,
                    isSelected && styles.dayNumberSelected,
                  ]}
                >
                  {day.date.getDate()}
                </Text>
              )}
              <View
                style={[
                  styles.dot,
                  isFull && styles.dotFull,
                  day.status === 'empty' && styles.dotEmpty,
                  day.status === 'partial' && styles.dotPartial,
                  day.status === 'complete' && styles.dotComplete,
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: SoftPopColors.background,
  },
  containerFull: {
    marginTop: 10,
  },
  containerFullDense: {
    marginTop: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
  },
  summary: {
    fontSize: 13,
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SoftPopColors.background,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonPressed: {
    transform: [{ scale: 0.94 }],
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  rangeText: {
    fontSize: 15,
    lineHeight: 20,
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
  },
  summaryFull: {
    fontSize: 13,
    lineHeight: 17,
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  dayFull: {
    minHeight: 56,
    paddingVertical: 6,
    gap: 3,
    marginHorizontal: 1,
    justifyContent: 'center',
  },
  dayFullDense: {
    minHeight: 52,
    paddingVertical: 4,
    gap: 2,
  },
  daySelected: {
    backgroundColor: SoftPopColors.todaySurface,
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: SoftPopColors.today,
  },
  weekday: {
    fontSize: 12,
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
  },
  weekdaySelected: {
    color: SoftPopColors.today,
  },
  dayNumber: {
    fontSize: 17,
    lineHeight: 20,
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
  },
  dayNumberToday: {
    color: SoftPopColors.today,
  },
  dayNumberSelected: {
    color: SoftPopColors.today,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotFull: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotEmpty: {
    backgroundColor: SoftPopColors.background,
    borderWidth: 1.5,
    borderColor: SoftPopColors.textSecondary,
  },
  dotPartial: {
    backgroundColor: SoftPopColors.today,
  },
  dotComplete: {
    backgroundColor: SoftPopColors.complete,
  },
});
