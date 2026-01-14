/**
 * TimelineView V2 컴포넌트
 * 30분 단위 타임라인 표시 + 활동 시간만큼 블록 표시
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { TIMELINE_CONFIG } from '../constants/config';
import { ScheduleItem, Activity } from '../types';
import { ActivityEmojis } from '../constants/emojis';
import { ActivityMaterialColors } from '../constants/materialDesign';

// Soft Pop 3D 디자인 색상 팔레트
const SoftPopColors = {
  background: '#FFF9F0', // Cream
  primary: '#FF6B6B', // Soft Red
  secondary: '#FFD93D', // Banana Yellow
  text: '#2D3436', // Soft Black
  textSecondary: '#636E72', // Soft Gray
  white: '#FFFFFF',
  error: '#FF6B6B',
  success: '#6BCB77',
};

interface TimelineViewV2Props {
  scheduleItems: ScheduleItem[];
  onTimeSlotPress?: (time: string) => void;
  onRemoveItem?: (itemId: string) => void;
  draggingActivity?: Activity | null;
  initialScrollTime?: string; // 초기 스크롤 위치 시간 (기본: 09:00)
}

export default function TimelineViewV2({
  scheduleItems,
  onTimeSlotPress,
  onRemoveItem,
  draggingActivity,
  initialScrollTime = '09:00'
}: TimelineViewV2Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  // 30분 단위로 타임라인 슬롯 생성 (00:00 ~ 23:30)
  const timeSlots: string[] = [];
  for (let hour = TIMELINE_CONFIG.START_HOUR; hour < TIMELINE_CONFIG.END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += TIMELINE_CONFIG.INTERVAL_MINUTES) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  // 특정 시간에 시작하는 일정 아이템 찾기
  const getScheduleItemForTime = (time: string): ScheduleItem | undefined => {
    return scheduleItems.find(item => item.startTime === time);
  };

  // 특정 시간이 일정 아이템에 포함되는지 확인 (중간 시간)
  const isTimeOccupied = (time: string): ScheduleItem | null => {
    const [hours, minutes] = time.split(':').map(Number);
    const timeMinutes = hours * 60 + minutes;

    for (const item of scheduleItems) {
      const [startHours, startMins] = item.startTime.split(':').map(Number);
      const [endHours, endMins] = item.endTime.split(':').map(Number);
      const startMinutes = startHours * 60 + startMins;
      const endMinutes = endHours * 60 + endMins;

      if (timeMinutes >= startMinutes && timeMinutes < endMinutes) {
        return item;
      }
    }
    return null;
  };

  // 드래그 중인 활동이 특정 시간에 놓이면 겹치는지 확인
  const wouldConflict = (time: string, draggingActivity: Activity | null): boolean => {
    if (!draggingActivity) return false;

    const [hours, minutes] = time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + draggingActivity.durationMinutes;

    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    for (const item of scheduleItems) {
      const [itemStartHours, itemStartMins] = item.startTime.split(':').map(Number);
      const [itemEndHours, itemEndMins] = item.endTime.split(':').map(Number);
      const itemStart = itemStartHours * 60 + itemStartMins;
      const itemEnd = itemEndHours * 60 + itemEndMins;

      // 겹치는지 체크
      if (startMinutes < itemEnd && endMinutes > itemStart) {
        return true;
      }
    }
    return false;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  // 일정 아이템의 높이 계산 (30분당 SLOT_HEIGHT)
  const calculateItemHeight = (item: ScheduleItem): number => {
    const duration = item.activity?.durationMinutes || 0;
    const slots = Math.ceil(duration / TIMELINE_CONFIG.INTERVAL_MINUTES);
    return slots * TIMELINE_CONFIG.SLOT_HEIGHT;
  };

  // 특정 시간의 인덱스 찾기
  const getTimeIndex = (time: string): number => {
    return timeSlots.findIndex(slot => slot === time);
  };

  // 초기 스크롤 위치 설정
  useEffect(() => {
    const scrollToTime = () => {
      let targetTime = initialScrollTime;

      // 일정이 하나라도 있으면 마지막 활동으로 스크롤
      if (scheduleItems.length > 0) {
        // 시간순 정렬 후 마지막 활동 찾기
        const sortedItems = [...scheduleItems].sort((a, b) => {
          const [aHours, aMins] = a.startTime.split(':').map(Number);
          const [bHours, bMins] = b.startTime.split(':').map(Number);
          return (aHours * 60 + aMins) - (bHours * 60 + bMins);
        });

        const lastItem = sortedItems[sortedItems.length - 1];
        targetTime = lastItem.startTime;
        console.log('Scrolling to last activity:', lastItem.activity?.name, 'at', targetTime);
      }

      const targetIndex = getTimeIndex(targetTime);
      if (targetIndex !== -1 && scrollViewRef.current) {
        // 타겟 위치 계산 (화면 중앙에 오도록)
        const targetY = targetIndex * TIMELINE_CONFIG.SLOT_HEIGHT - 200; // 200px 위로 올려서 중앙 배치

        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, targetY),
            animated: true,
          });
        }, 100);
      }
    };

    scrollToTime();
  }, [initialScrollTime, scheduleItems.length]); // scheduleItems.length 변경 시에도 재실행

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {timeSlots.map((time, index) => {
        const scheduleItem = getScheduleItemForTime(time);
        const occupiedItem = isTimeOccupied(time);

        // 이 시간에 시작하는 일정이 있으면 블록으로 표시
        if (scheduleItem) {
          const emoji = ActivityEmojis[scheduleItem.activity?.emojiKey || ''] || '📌';
          const colorScheme = ActivityMaterialColors[scheduleItem.activity?.colorKey || 'blue'];
          const blockHeight = calculateItemHeight(scheduleItem);
          // timeSlot의 높이는 활동 블록의 높이와 동일하게 설정
          const slotHeight = blockHeight;

          return (
            <View key={time} style={[styles.timeSlot, { height: slotHeight }]}>
              {/* Time Label */}
              <View style={styles.timeLabel}>
                <Text style={styles.timeText}>
                  {formatTime(time)}
                </Text>
              </View>

              {/* Timeline Line */}
              <View style={styles.timelineContainer}>
                <View style={[styles.timelineDot, styles.timelineDotActive]} />
                {index < timeSlots.length - 1 && (
                  <View style={[styles.timelineLine, styles.timelineLineActive]} />
                )}
              </View>

              {/* Schedule Block */}
              <View style={styles.contentArea}>
                <View style={[
                  styles.scheduleBlock,
                  {
                    backgroundColor: colorScheme.surface,
                    borderLeftColor: colorScheme.main,
                    height: blockHeight - 8, // 약간의 여백
                  }
                ]}>
                  <View style={styles.scheduleBlockHeader}>
                    <Text style={styles.scheduleEmoji}>{emoji}</Text>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.scheduleName}>
                        {scheduleItem.activity?.name || '활동'}
                      </Text>
                      <Text style={styles.scheduleTime}>
                        {formatTime(scheduleItem.startTime)} - {formatTime(scheduleItem.endTime)}
                      </Text>
                    </View>
                    <Pressable
                      style={({ pressed }) => [
                        styles.removeButton,
                        pressed && styles.removeButtonPressed
                      ]}
                      onPress={() => onRemoveItem?.(scheduleItem.id)}
                    >
                      <Text style={styles.removeButtonText}>✕</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          );
        }

        // 이 시간이 다른 일정에 포함되어 있으면 건너뛰기 (블록 중간)
        if (occupiedItem && occupiedItem.startTime !== time) {
          return null;
        }

        // 빈 슬롯 - 드롭 가능
        const hasConflict = draggingActivity ? wouldConflict(time, draggingActivity) : false;

        return (
          <View key={time} style={[styles.timeSlot, { height: TIMELINE_CONFIG.SLOT_HEIGHT }]}>
            {/* Time Label */}
            <View style={styles.timeLabel}>
              <Text style={styles.timeText}>
                {formatTime(time)}
              </Text>
            </View>

            {/* Timeline Line */}
            <View style={styles.timelineContainer}>
              <View style={styles.timelineDot} />
              {index < timeSlots.length - 1 && (
                <View style={styles.timelineLine} />
              )}
            </View>

            {/* Drop Zone */}
            <View style={styles.contentArea}>
              <Pressable
                style={({ pressed }) => [
                  styles.dropZone,
                  draggingActivity && !hasConflict && styles.dropZoneActive,
                  hasConflict && styles.dropZoneConflict,
                  pressed && !hasConflict && styles.dropZonePressed
                ]}
                onPress={() => onTimeSlotPress?.(time)}
                disabled={hasConflict}
              >
                <Text style={[
                  styles.dropZoneText,
                  draggingActivity && !hasConflict && styles.dropZoneTextActive,
                  hasConflict && styles.dropZoneTextConflict
                ]}>
                  {hasConflict
                    ? '⚠️ 시간 겹침'
                    : draggingActivity
                      ? `${draggingActivity.name} 추가`
                      : '+ 활동 추가'
                  }
                </Text>
              </Pressable>
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
    backgroundColor: SoftPopColors.background,
  },
  contentContainer: {
    paddingBottom: 60,
  },
  timeSlot: {
    flexDirection: 'row',
    minHeight: TIMELINE_CONFIG.SLOT_HEIGHT,
    paddingVertical: 4,
  },
  timeLabel: {
    width: 80,
    paddingRight: 12,
    paddingTop: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
  },
  timelineContainer: {
    width: 32,
    alignItems: 'center',
    position: 'relative',
    alignSelf: 'stretch',
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: SoftPopColors.textSecondary,
    marginTop: 8,
    marginBottom: 4,
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  timelineDotActive: {
    backgroundColor: SoftPopColors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    // Stronger shadow for active
    shadowColor: SoftPopColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  timelineLine: {
    width: 3,
    backgroundColor: SoftPopColors.textSecondary,
    flex: 1,
    opacity: 0.3,
  },
  timelineLineActive: {
    backgroundColor: SoftPopColors.primary,
    width: 4,
    opacity: 0.5,
  },
  contentArea: {
    flex: 1,
    paddingLeft: 12,
    paddingTop: 4,
    paddingBottom: 4,
    justifyContent: 'flex-start',
  },
  scheduleBlock: {
    borderRadius: 24, // rounded-3xl
    padding: 20,
    borderLeftWidth: 6,
    backgroundColor: SoftPopColors.white,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    justifyContent: 'center',
  },
  scheduleBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleEmoji: {
    fontSize: 36,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 18,
    fontWeight: '600',
    color: SoftPopColors.text,
    marginBottom: 6,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  scheduleTime: {
    fontSize: 14,
    color: SoftPopColors.textSecondary,
    lineHeight: 20,
    fontFamily: 'BMJUA',
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20, // rounded-full
    backgroundColor: '#FFF0F0',
    // 3D pressable effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  removeButtonPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  removeButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: SoftPopColors.error,
    fontFamily: 'BMJUA',
  },
  dropZone: {
    flex: 1,
    borderWidth: 3,
    borderColor: SoftPopColors.textSecondary,
    borderStyle: 'dashed',
    borderRadius: 24, // rounded-3xl
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: TIMELINE_CONFIG.SLOT_HEIGHT - 8,
    backgroundColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropZonePressed: {
    transform: [{ scale: 0.98 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  dropZoneActive: {
    backgroundColor: '#FFF0F0',
    borderColor: SoftPopColors.primary,
    borderWidth: 4,
    borderStyle: 'solid',
    // Stronger shadow when active
    shadowColor: SoftPopColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  dropZoneText: {
    fontSize: 14,
    fontWeight: '500',
    color: SoftPopColors.textSecondary,
    textAlign: 'center',
    fontFamily: 'BMJUA',
  },
  dropZoneTextActive: {
    color: SoftPopColors.primary,
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'BMJUA',
  },
  dropZoneConflict: {
    backgroundColor: '#FFF0F0',
    borderColor: SoftPopColors.error,
    borderWidth: 4,
    borderStyle: 'solid',
    opacity: 0.8,
  },
  dropZoneTextConflict: {
    color: SoftPopColors.error,
    fontWeight: '700',
    fontFamily: 'BMJUA',
  },
});

