/**
 * TimelineView V2 컴포넌트
 * 30분 단위 타임라인 표시 + 활동 시간만큼 블록 표시
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useRef, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { TIMELINE_CONFIG } from '../constants/config';
import { ScheduleItem, Activity } from '../types';
import ActivityIcon from './ActivityIcon';
import { ActivityMaterialColors } from '../constants/materialDesign';
import { SoftPopColors } from '../constants/theme';
import { layoutTimelineItems, minuteToY, slotOverlapsSpan, toMinutes } from '../utils/timelineLayout';

// Gap between a block and the slot grid lines, and the smallest block we still draw (10-min items).
const BLOCK_INSET = 4;
const MIN_BLOCK_HEIGHT = 22;
// timeLabel (80) + timelineContainer (32) + contentArea paddingLeft (12)
const BLOCK_LAYER_LEFT = 124;

interface TimelineViewV2Props {
  scheduleItems: ScheduleItem[];
  onTimeSlotPress?: (time: string) => void;
  onRemoveItem?: (itemId: string) => void;
  draggingActivity?: Activity | null;
  initialScrollTime?: string;
  contentPaddingBottom?: number;
  showNowLine?: boolean;
  /** Past day: no '+ 활동 추가' slots and no delete buttons. */
  readOnly?: boolean;
}

export default function TimelineViewV2({
  scheduleItems,
  onTimeSlotPress,
  onRemoveItem,
  readOnly = false,
  draggingActivity,
  initialScrollTime = '07:00',
  contentPaddingBottom,
  showNowLine = false,
}: TimelineViewV2Props) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!showNowLine) return;
    const tick = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(tick);
  }, [showNowLine]);
  // 30분 단위로 타임라인 슬롯 생성 (00:00 ~ 23:30)
  const timeSlots: string[] = [];
  for (let hour = TIMELINE_CONFIG.START_HOUR; hour < TIMELINE_CONFIG.END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += TIMELINE_CONFIG.INTERVAL_MINUTES) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

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

  const grid = {
    startHour: TIMELINE_CONFIG.START_HOUR,
    endHour: TIMELINE_CONFIG.END_HOUR,
    slotMinutes: TIMELINE_CONFIG.INTERVAL_MINUTES,
    slotHeight: TIMELINE_CONFIG.SLOT_HEIGHT,
  };

  // Items sit at their true minute offset (e.g. 15:50), not only on 30-minute slots.
  const blocks = useMemo(
    () => layoutTimelineItems(
      scheduleItems.map(item => ({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        durationMinutes: item.activity?.durationMinutes,
      })),
      grid,
    ),
    [scheduleItems],
  );
  const itemById = new Map(scheduleItems.map(item => [item.id, item]));

  const isSlotCovered = (time: string): boolean => {
    const slotMin = toMinutes(time);
    return blocks.some(b => slotOverlapsSpan(slotMin, grid.slotMinutes, b.startMin, b.endMin));
  };

  // 특정 시간의 인덱스 찾기
  const getTimeIndex = (time: string): number => {
    return timeSlots.findIndex(slot => slot === time);
  };

  const nowLineOffset = useMemo(() => {
    if (!showNowLine) return 0;
    return Math.max(0, minuteToY(now.getHours() * 60 + now.getMinutes(), grid));
  }, [showNowLine, now]);

  useEffect(() => {
    const targetY = showNowLine
      ? nowLineOffset - 160
      : Math.max(0, getTimeIndex(initialScrollTime) * TIMELINE_CONFIG.SLOT_HEIGHT - 160);
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Math.max(0, targetY),
        animated: true,
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [initialScrollTime, showNowLine, scheduleItems.length]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        contentPaddingBottom !== undefined && { paddingBottom: contentPaddingBottom },
      ]}
      showsVerticalScrollIndicator={true}
    >
      <View>
      {showNowLine && (
        <View pointerEvents="none" style={[styles.nowLine, { top: nowLineOffset }]}>
          <View style={styles.nowDot} />
          <View style={styles.nowHair} />
          <Text style={styles.nowLabel}>지금</Text>
        </View>
      )}
      {timeSlots.map((time, index) => {
        const covered = isSlotCovered(time);
        // 빈 슬롯 - 드롭 가능 (일정 블록은 아래 오버레이에 실제 분 단위 위치로 그림)
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
              <View style={[styles.timelineDot, covered && styles.timelineDotActive]} />
              {index < timeSlots.length - 1 && (
                <View style={[styles.timelineLine, covered && styles.timelineLineActive]} />
              )}
            </View>

            {/* Drop Zone */}
            <View style={styles.contentArea}>
              <Pressable
                style={({ pressed }) => [
                  styles.dropZone,
                  draggingActivity && !hasConflict && styles.dropZoneActive,
                  hasConflict && styles.dropZoneConflict,
                  pressed && !hasConflict && styles.dropZonePressed,
                  readOnly && styles.dropZoneReadOnly,
                ]}
                onPress={() => onTimeSlotPress?.(time)}
                disabled={hasConflict || readOnly}
              >
                <Text style={[
                  styles.dropZoneText,
                  draggingActivity && !hasConflict && styles.dropZoneTextActive,
                  hasConflict && styles.dropZoneTextConflict
                ]}>
                  {readOnly
                    ? ''
                    : hasConflict
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

      {/* Schedule blocks at their true minute offset; overlapping items share the width in lanes */}
      <View pointerEvents="box-none" style={styles.blockLayer}>
        {blocks.map(block => {
          const scheduleItem = itemById.get(block.id);
          if (!scheduleItem) return null;
          const colorScheme = ActivityMaterialColors[scheduleItem.activity?.colorKey || 'blue'];
          const blockHeight = block.height;
          const isShort = blockHeight < TIMELINE_CONFIG.SLOT_HEIGHT;
          return (
            <View
              key={block.id}
              pointerEvents="box-none"
              style={[
                styles.blockSlot,
                {
                  top: block.top + BLOCK_INSET,
                  height: Math.max(blockHeight - BLOCK_INSET * 2, MIN_BLOCK_HEIGHT),
                  left: `${(block.lane / block.laneCount) * 100}%`,
                  width: `${100 / block.laneCount}%`,
                },
              ]}
            >
              <View style={[
                styles.scheduleBlock,
                isShort && styles.scheduleBlockShort,
                {
                  backgroundColor: colorScheme.surface,
                  borderLeftColor: colorScheme.main,
                  flex: 1,
                }
              ]}>
                <View style={styles.scheduleBlockHeader}>
                  <View style={styles.scheduleEmojiWrapper}>
                    <ActivityIcon
                      activity={scheduleItem.activity}
                      size={isShort ? 20 : 32}
                      color={SoftPopColors.text}
                    />
                  </View>
                  <View style={[styles.scheduleInfo, isShort && styles.scheduleInfoShort]}>
                    <Text
                      style={[styles.scheduleName, isShort && styles.scheduleNameShort]}
                      // A block of one slot (30 min) or less only has room for one line.
                      numberOfLines={blockHeight > TIMELINE_CONFIG.SLOT_HEIGHT ? 2 : 1}
                      ellipsizeMode="tail"
                      lineBreakStrategyIOS="hangul-word"
                    >
                      {scheduleItem.activity?.name || '활동'}
                    </Text>
                    <Text style={[styles.scheduleTime, isShort && styles.scheduleTimeShort]} numberOfLines={1}>
                      {formatTime(scheduleItem.startTime)} - {formatTime(scheduleItem.endTime)}
                    </Text>
                  </View>
                  {!readOnly && <Pressable
                    style={({ pressed }) => [
                      styles.removeButton,
                      isShort && styles.removeButtonShort,
                      pressed && styles.removeButtonPressed
                    ]}
                    hitSlop={isShort ? 8 : undefined}
                    onPress={() => onRemoveItem?.(scheduleItem.id)}
                    accessibilityLabel={`${scheduleItem.activity?.name || '활동'} 삭제`}
                  >
                    <Text style={[styles.removeButtonText, isShort && styles.removeButtonTextShort]}>✕</Text>
                  </Pressable>}
                </View>
              </View>
            </View>
          );
        })}
      </View>
      </View>
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
  nowLine: {
    position: 'absolute',
    left: 72,
    right: 8,
    height: 2,
    backgroundColor: SoftPopColors.now,
    zIndex: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: SoftPopColors.now,
    marginLeft: -4,
    marginTop: -4,
  },
  nowHair: {
    flex: 1,
    height: 2,
    backgroundColor: SoftPopColors.now,
  },
  nowLabel: {
    marginLeft: 6,
    fontSize: 11,
    color: SoftPopColors.now,
    fontFamily: 'BMJUA',
    marginTop: -8,
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
  blockLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: BLOCK_LAYER_LEFT,
    right: 0,
    zIndex: 5,
  },
  blockSlot: {
    position: 'absolute',
    paddingRight: 4,
  },
  scheduleBlockShort: {
    paddingVertical: 2,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  scheduleInfoShort: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleNameShort: {
    fontSize: 15,
    lineHeight: 18,
    marginBottom: 0,
    flexShrink: 1,
  },
  scheduleTimeShort: {
    fontSize: 12,
    lineHeight: 16,
  },
  removeButtonShort: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  removeButtonTextShort: {
    fontSize: 14,
  },
  scheduleBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleEmojiWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
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
  dropZoneReadOnly: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
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

