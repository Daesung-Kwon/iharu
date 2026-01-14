/**
 * HorizontalDatePicker 컴포넌트
 * 가로 스크롤 날짜 선택 UI (Material Design)
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialColors, Typography, Spacing, Elevation, Shape } from '../constants/materialDesign';
import { ChildFriendlyShape } from '../constants/childFriendlyColors';
import { Schedule } from '../types';
import { calculateDayStats } from '../utils/statsUtils';

interface HorizontalDatePickerProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  schedules: Schedule[]; // 모든 일정 데이터
  daysToShow?: number; // 표시할 날짜 수 (기본: 30일)
}

export default function HorizontalDatePicker({
  selectedDate,
  onDateSelect,
  schedules,
  daysToShow = 30,
}: HorizontalDatePickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const today = new Date();
  
  // 과거 30일 + 오늘 + 미래 90일 (총 121일)
  const dates: Date[] = [];
  const pastDays = 30;
  const futureDays = 90;
  
  for (let i = -pastDays; i <= futureDays; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  // 선택된 날짜의 인덱스
  const selectedIndex = dates.findIndex(
    date => date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
  );

  // 특정 날짜의 일정 정보 가져오기
  const getScheduleForDate = (date: Date): Schedule | null => {
    const dateString = date.toISOString().split('T')[0];
    return schedules.find(s => s.date === dateString) || null;
  };

  // 날짜 카드 너비
  const CARD_WIDTH = 80;
  const CARD_MARGIN = 8;

  // 선택된 날짜로 자동 스크롤
  useEffect(() => {
    if (selectedIndex !== -1 && scrollViewRef.current) {
      const screenWidth = Dimensions.get('window').width;
      const targetX = selectedIndex * (CARD_WIDTH + CARD_MARGIN * 2) - screenWidth / 2 + CARD_WIDTH / 2;
      
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, targetX),
          animated: true,
        });
      }, 100);
    }
  }, [selectedDate]);

  const isToday = (date: Date): boolean => {
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  };

  const isSelected = (date: Date): boolean => {
    return date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
  };

  const renderDateCard = (date: Date, index: number) => {
    const schedule = getScheduleForDate(date);
    const stats = calculateDayStats(schedule);
    const hasSchedule = schedule && schedule.items.length > 0;
    const selected = isSelected(date);
    const todayDate = isToday(date);

    // 요일 확인 (0: 일요일, 6: 토요일)
    const dayOfWeek = date.getDay();
    const isSaturday = dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    const isWeekend = isSaturday || isSunday;

    // 월이 바뀌는 지점인지 확인
    const isFirstOfMonth = date.getDate() === 1;
    const showMonthLabel = isFirstOfMonth || index === 0;

    // 달성률에 따른 색상
    let statusColor = MaterialColors.text.disabled;
    if (hasSchedule) {
      if (stats.completionRate === 100) {
        statusColor = MaterialColors.success[500]; // 완전 달성
      } else if (stats.completionRate >= 50) {
        statusColor = MaterialColors.primary[500]; // 부분 달성
      } else if (stats.completionRate > 0) {
        statusColor = MaterialColors.primary[300]; // 조금 달성
      } else {
        statusColor = MaterialColors.error[500]; // 미달성
      }
    }

    return (
      <View key={index} style={styles.dateCardWrapper}>
        {/* 월 구분선 및 레이블 */}
        {showMonthLabel && (
          <View style={styles.monthDivider}>
            <View style={styles.monthLabelContainer}>
              <Text style={styles.monthLabel}>
                {date.toLocaleDateString('ko-KR', { month: 'long' })}
              </Text>
            </View>
          </View>
        )}
        
        <TouchableOpacity
          style={[
            styles.dateCard,
            selected && styles.dateCardSelected,
            todayDate && styles.dateCardToday,
            !selected && isSaturday && styles.dateCardSaturday,
            !selected && isSunday && styles.dateCardSunday,
          ]}
          onPress={() => onDateSelect(date)}
          activeOpacity={0.7}
        >
        {/* 요일 */}
        <Text style={[
          styles.dayText,
          selected && styles.dayTextSelected,
          !selected && isSaturday && styles.dayTextSaturday,
          !selected && isSunday && styles.dayTextSunday,
        ]}>
          {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
        </Text>

        {/* 날짜 */}
        <Text style={[
          styles.dateText,
          selected && styles.dateTextSelected,
          todayDate && !selected && styles.dateTextToday,
          !selected && isSaturday && styles.dateTextSaturday,
          !selected && isSunday && styles.dateTextSunday,
        ]}>
          {date.getDate()}
        </Text>

        {/* 일정 표시 점 */}
        {hasSchedule && (
          <View style={styles.indicatorContainer}>
            <View style={[
              styles.indicator,
              { backgroundColor: statusColor }
            ]} />
            {stats.completionRate === 100 && (
              <View style={styles.perfectBadge}>
                <Text style={styles.perfectBadgeText}>✓</Text>
              </View>
            )}
          </View>
        )}

        {/* 오늘 배지 */}
        {todayDate && !selected && (
          <View style={styles.todayDot}>
            <View style={styles.todayDotInner} />
          </View>
        )}

        {/* 월 표시 (카드 상단) */}
        {showMonthLabel && (
          <View style={styles.monthBadge}>
            <Text style={styles.monthBadgeText}>
              {date.getMonth() + 1}월
            </Text>
          </View>
        )}
      </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {dates.map((date, index) => renderDateCard(date, index))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: MaterialColors.surface.default,
    paddingVertical: Spacing.md,
    borderRadius: ChildFriendlyShape.medium,
    overflow: 'hidden',
    ...Elevation[1],
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  dateCardWrapper: {
    position: 'relative',
  },
  monthDivider: {
    position: 'absolute',
    left: -8,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: MaterialColors.primary[500],
  },
  monthLabelContainer: {
    position: 'absolute',
    left: -40,
    top: -24,
    backgroundColor: MaterialColors.primary[500],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Shape.small,
  },
  monthLabel: {
    ...Typography.caption,
    fontSize: 11,
    color: MaterialColors.surface.default,
    fontWeight: '600',
    fontFamily: 'BMJUA',
  },
  monthBadge: {
    position: 'absolute',
    top: -8,
    left: '50%',
    marginLeft: -20,
    backgroundColor: MaterialColors.primary[500],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Shape.small,
    ...Elevation[2],
  },
  monthBadgeText: {
    ...Typography.caption,
    fontSize: 10,
    color: MaterialColors.surface.default,
    fontWeight: 'bold',
    fontFamily: 'BMJUA',
  },
  dateCard: {
    width: 80,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Shape.medium,
    backgroundColor: MaterialColors.surface.variant,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dateCardSelected: {
    backgroundColor: MaterialColors.primary[500],
    borderColor: MaterialColors.primary[700],
    ...Elevation[4],
  },
  dateCardToday: {
    borderColor: MaterialColors.primary[300],
    borderWidth: 2,
  },
  dateCardSaturday: {
    backgroundColor: '#E3F2FD', // 연한 파란색
  },
  dateCardSunday: {
    backgroundColor: '#FFEBEE', // 연한 빨간색
  },
  dayText: {
    ...Typography.caption,
    color: MaterialColors.text.secondary,
    textTransform: 'uppercase',
    fontFamily: 'BMJUA',
  },
  dayTextSelected: {
    color: MaterialColors.surface.default,
    fontWeight: '600',
    fontFamily: 'BMJUA',
  },
  dateText: {
    ...Typography.h5,
    color: MaterialColors.text.primary,
    fontWeight: '600',
    fontFamily: 'BMJUA',
  },
  dateTextSelected: {
    color: MaterialColors.surface.default,
    fontFamily: 'BMJUA',
  },
  dateTextToday: {
    color: MaterialColors.primary[500],
    fontFamily: 'BMJUA',
  },
  dateTextSaturday: {
    color: '#1976D2', // 파란색 (토요일)
    fontFamily: 'BMJUA',
  },
  dateTextSunday: {
    color: '#D32F2F', // 빨간색 (일요일)
    fontFamily: 'BMJUA',
  },
  dayTextSaturday: {
    color: '#1976D2',
  },
  dayTextSunday: {
    color: '#D32F2F',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: Spacing.xs,
    flexDirection: 'row',
    gap: 2,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: Shape.round,
  },
  perfectBadge: {
    width: 14,
    height: 14,
    borderRadius: Shape.round,
    backgroundColor: MaterialColors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfectBadgeText: {
    fontSize: 10,
    color: MaterialColors.surface.default,
    fontWeight: 'bold',
  },
  todayDot: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    width: 8,
    height: 8,
    borderRadius: Shape.round,
    backgroundColor: MaterialColors.primary[500],
  },
  todayDotInner: {
    width: 4,
    height: 4,
    borderRadius: Shape.round,
    backgroundColor: MaterialColors.surface.default,
    position: 'absolute',
    top: 2,
    left: 2,
  },
});
