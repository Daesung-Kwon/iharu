/**
 * TimelineView 컴포넌트
 * 10분 단위 타임라인 표시 (Material Design)
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialColors, Typography, Spacing, Elevation, Shape } from '../constants/materialDesign';
import { TIMELINE_CONFIG } from '../constants/config';
import { ScheduleItem, Activity } from '../types';

interface TimelineViewProps {
  scheduleItems: ScheduleItem[];
  onTimeSlotPress?: (time: string) => void;
  draggingActivity?: Activity | null;
}

export default function TimelineView({ scheduleItems, onTimeSlotPress, draggingActivity }: TimelineViewProps) {
  // 10분 단위로 타임라인 슬롯 생성 (00:00 ~ 23:50)
  const timeSlots: string[] = [];
  for (let hour = TIMELINE_CONFIG.START_HOUR; hour < TIMELINE_CONFIG.END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += TIMELINE_CONFIG.INTERVAL_MINUTES) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  const getScheduleItemForTime = (time: string): ScheduleItem | undefined => {
    return scheduleItems.find(item => item.startTime === time);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {timeSlots.map((time, index) => {
        const scheduleItem = getScheduleItemForTime(time);
        const isHourMark = time.endsWith(':00');

        return (
          <View key={time} style={styles.timeSlot}>
            {/* Time Label */}
            <View style={styles.timeLabel}>
              {isHourMark && (
                <Text style={styles.timeText}>
                  {formatTime(time)}
                </Text>
              )}
            </View>

            {/* Timeline Line */}
            <View style={styles.timelineContainer}>
              <View style={[
                styles.timelineDot,
                scheduleItem && styles.timelineDotActive
              ]} />
              {index < timeSlots.length - 1 && (
                <View style={[
                  styles.timelineLine,
                  scheduleItem && styles.timelineLineActive
                ]} />
              )}
            </View>

            {/* Schedule Item or Drop Zone */}
            <View style={styles.contentArea}>
              {scheduleItem ? (
                <View style={styles.scheduleItemPlaceholder}>
                  <Text style={styles.scheduleItemText}>
                    {scheduleItem.activity?.name || '활동'}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.dropZone,
                    draggingActivity && styles.dropZoneActive
                  ]}
                  onPress={() => onTimeSlotPress?.(time)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dropZoneText,
                    draggingActivity && styles.dropZoneTextActive
                  ]}>
                    {draggingActivity 
                      ? `${formatTime(time)}에 ${draggingActivity.name} 추가`
                      : isHourMark 
                        ? '여기로 끌어다 놓으세요' 
                        : formatTime(time)
                    }
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MaterialColors.surface.default,
  },
  timeSlot: {
    flexDirection: 'row',
    minHeight: 60,
    paddingVertical: Spacing.xs,
  },
  timeLabel: {
    width: 60,
    paddingRight: Spacing.sm,
    justifyContent: 'flex-start',
    paddingTop: Spacing.xs,
  },
  timeText: {
    ...Typography.caption,
    color: MaterialColors.text.secondary,
    fontWeight: '500',
  },
  timelineContainer: {
    width: 20,
    alignItems: 'center',
    position: 'relative',
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: Shape.round,
    backgroundColor: MaterialColors.divider,
    marginBottom: Spacing.xs,
  },
  timelineDotActive: {
    backgroundColor: MaterialColors.primary[500],
    width: 12,
    height: 12,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: MaterialColors.divider,
  },
  timelineLineActive: {
    backgroundColor: MaterialColors.primary[500],
  },
  contentArea: {
    flex: 1,
    paddingLeft: Spacing.sm,
  },
  scheduleItemPlaceholder: {
    backgroundColor: MaterialColors.primary[50],
    borderRadius: Shape.small,
    padding: Spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: MaterialColors.primary[500],
  },
  scheduleItemText: {
    ...Typography.body2,
    color: MaterialColors.text.primary,
  },
  dropZone: {
    borderWidth: 2,
    borderColor: MaterialColors.divider,
    borderStyle: 'dashed',
    borderRadius: Shape.small,
    padding: Spacing.sm,
    minHeight: 40,
    justifyContent: 'center',
  },
  dropZoneText: {
    ...Typography.caption,
    color: MaterialColors.text.disabled,
    textAlign: 'center',
  },
  dropZoneActive: {
    backgroundColor: MaterialColors.primary[50],
    borderColor: MaterialColors.primary[500],
    borderWidth: 3,
  },
  dropZoneTextActive: {
    color: MaterialColors.primary[500],
    fontWeight: '600',
  },
});

