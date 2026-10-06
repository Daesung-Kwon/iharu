/**
 * TodayScheduleItem 컴포넌트
 * 오늘의 일정 전용 아이템 카드 (체크박스 + 스와이프 완료/알림)
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import { ScheduleItem } from '../types';
import ActivityIcon from './ActivityIcon';
import { ActivityMaterialColors } from '../constants/materialDesign';
import { SoftPopColors } from '../constants/theme';
import { getClayShadow, useLayout } from '../hooks/useLayout';
import { getCheckboxState } from '../utils/completionLogic';

interface TodayScheduleItemProps {
  scheduleItem: ScheduleItem;
  itemStatus: 'upcoming' | 'current' | 'completed' | 'missed' | 'future';
  onToggleComplete: () => void;
  onSwipeComplete?: () => void;
  onToggleNotification?: () => void;
  notificationEnabled?: boolean;
  swipeEnabled?: boolean;
}

export default function TodayScheduleItem({
  scheduleItem,
  itemStatus,
  onToggleComplete,
  onSwipeComplete,
  onToggleNotification,
  notificationEnabled = false,
  swipeEnabled = true,
}: TodayScheduleItemProps) {
  const { isCompact, cardRadius } = useLayout();
  const swipeRef = useRef<Swipeable>(null);
  const handlingRef = useRef(false);
  const activity = scheduleItem.activity;
  if (!activity) return null;

  const colorScheme = ActivityMaterialColors[activity.colorKey];
  const isCompleted = scheduleItem.status === 'completed';
  const canComplete = swipeEnabled && itemStatus !== 'future';
  const canNotify = Boolean(onToggleNotification) && (itemStatus === 'upcoming' || itemStatus === 'future');

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const getStatusStyle = () => {
    switch (itemStatus) {
      case 'current':
        return {
          backgroundColor: SoftPopColors.nowSurface,
          borderColor: SoftPopColors.now,
          borderWidth: 4,
        };
      case 'completed':
        return {
          backgroundColor: SoftPopColors.completeSurface,
          borderColor: SoftPopColors.complete,
          opacity: 0.9,
        };
      case 'missed':
        return {
          backgroundColor: '#FFF0F0',
          borderColor: SoftPopColors.error,
        };
      case 'future':
        return {
          backgroundColor: SoftPopColors.background,
          borderColor: SoftPopColors.textSecondary,
          opacity: 0.7,
        };
      default:
        return {
          backgroundColor: colorScheme.surface || SoftPopColors.white,
        };
    }
  };

  const getStatusBadge = () => {
    switch (itemStatus) {
      case 'current':
        return {
          text: '지금 할 시간',
          color: SoftPopColors.now,
          icon: 'play-circle' as const,
        };
      case 'missed':
        return {
          text: '시간 지남',
          color: SoftPopColors.error,
          icon: 'schedule' as const,
        };
      case 'future':
        return {
          text: '예정된 일정',
          color: SoftPopColors.textSecondary,
          icon: 'event' as const,
        };
      default:
        return null;
    }
  };

  // swipeEnabled is true only on the editable day (today): there a completed
  // item can be tapped to un-complete; past stays read-only, future disabled.
  const checkbox = getCheckboxState({
    isCompleted,
    itemStatus,
    isEditableDay: swipeEnabled,
  });
  const isDisabled = checkbox.disabled;
  const statusBadge = getStatusBadge();

  const closeSoon = () => {
    requestAnimationFrame(() => swipeRef.current?.close());
  };

  const runOnce = (fn: () => void) => {
    if (handlingRef.current) return;
    handlingRef.current = true;
    fn();
    closeSoon();
    setTimeout(() => {
      handlingRef.current = false;
    }, 400);
  };

  const renderLeftActions = () => {
    if (!canComplete) return null;
    return (
      <View style={[styles.action, styles.completeAction, { borderRadius: cardRadius }]}>
        <MaterialIcons
          name={isCompleted ? 'undo' : 'check-circle'}
          size={28}
          color={SoftPopColors.white}
        />
        <Text style={styles.actionText}>{isCompleted ? '되돌리기' : '완료'}</Text>
      </View>
    );
  };

  const renderRightActions = () => {
    if (!canNotify) return null;
    return (
      <View style={[styles.action, styles.notifyAction, { borderRadius: cardRadius }]}>
        <MaterialIcons
          name={notificationEnabled ? 'notifications-off' : 'notifications-active'}
          size={28}
          color={SoftPopColors.white}
        />
        <Text style={styles.actionText}>{notificationEnabled ? '알림 끄기' : '알림'}</Text>
      </View>
    );
  };

  const card = (
    <View
      style={[
        styles.card,
        getStatusStyle(),
        getClayShadow(isCompact),
        isCompact && styles.cardCompact,
        { borderRadius: cardRadius },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.checkboxContainer,
          isDisabled && styles.checkboxContainerDisabled,
          pressed && !isDisabled && styles.checkboxContainerPressed,
        ]}
        onPress={onToggleComplete}
        disabled={isDisabled}
        hitSlop={4}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted, disabled: isDisabled }}
        accessibilityLabel={checkbox.accessibilityLabel}
      >
        <View
          style={[
            styles.checkbox,
            scheduleItem.status === 'completed' && styles.checkboxChecked,
            isDisabled && styles.checkboxDisabled,
          ]}
        >
          {scheduleItem.status === 'completed' && (
            <MaterialIcons
              name="check"
              size={20}
              color={SoftPopColors.white}
            />
          )}
        </View>
      </Pressable>

      <View style={styles.infoContainer}>
        <View style={styles.emojiWrapper}>
          <ActivityIcon
            activity={activity}
            size={isCompact ? 36 : 44}
            color={SoftPopColors.text}
          />
        </View>

        <View style={styles.textInfo}>
          <Text
            style={[
              styles.name,
              isCompact && styles.nameCompact,
              scheduleItem.status === 'completed' && styles.nameCompleted,
            ]}
          >
            {activity.name}
          </Text>

          <View style={styles.timeContainer}>
            <MaterialIcons
              name="access-time"
              size={16}
              color={SoftPopColors.textSecondary}
            />
            <Text style={styles.time}>
              {formatTime(scheduleItem.startTime)} - {formatTime(scheduleItem.endTime)}
            </Text>
            <Text style={styles.duration}>
              ({activity.durationMinutes}분)
            </Text>
          </View>

          {statusBadge && (
            <View style={[styles.statusBadge, { backgroundColor: `${statusBadge.color}20` }]}>
              <MaterialIcons
                name={statusBadge.icon}
                size={16}
                color={statusBadge.color}
              />
              <Text style={[styles.statusBadgeText, { color: statusBadge.color }]}>
                {statusBadge.text}
              </Text>
            </View>
          )}
        </View>
      </View>

      {(itemStatus === 'upcoming' || itemStatus === 'future') && (
        <Pressable
          style={({ pressed }) => [
            styles.notificationButton,
            pressed && styles.notificationButtonPressed,
          ]}
          onPress={onToggleNotification}
          accessibilityLabel="알림 설정"
        >
          <MaterialIcons
            name={notificationEnabled ? 'notifications-active' : 'notifications-none'}
            size={24}
            color={notificationEnabled ? SoftPopColors.primary : SoftPopColors.textSecondary}
          />
        </Pressable>
      )}
    </View>
  );

  if (!canComplete && !canNotify) {
    return <View style={styles.swipeContainer}>{card}</View>;
  }

  return (
    <Swipeable
      ref={swipeRef}
      containerStyle={styles.swipeContainer}
      friction={2}
      leftThreshold={56}
      rightThreshold={56}
      overshootLeft={false}
      overshootRight={false}
      renderLeftActions={canComplete ? renderLeftActions : undefined}
      renderRightActions={canNotify ? renderRightActions : undefined}
      onSwipeableOpen={(direction) => {
        if (direction === 'left') {
          runOnce(onSwipeComplete ?? onToggleComplete);
        } else if (canNotify && onToggleNotification) {
          runOnce(onToggleNotification);
        } else {
          closeSoon();
        }
      }}
    >
      {card}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    backgroundColor: SoftPopColors.white,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    minHeight: 100,
  },
  cardCompact: {
    padding: 14,
    minHeight: 80,
    gap: 10,
  },
  action: {
    width: 96,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  completeAction: {
    backgroundColor: SoftPopColors.complete,
    marginRight: 8,
  },
  notifyAction: {
    backgroundColor: SoftPopColors.primary,
    marginLeft: 8,
  },
  actionText: {
    color: SoftPopColors.white,
    fontSize: 13,
    fontFamily: 'BMJUA',
  },
  checkboxContainer: {
    padding: 8,
  },
  checkboxContainerDisabled: {
    opacity: 0.5,
  },
  checkboxContainerPressed: {
    transform: [{ scale: 0.95 }],
  },
  checkbox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: SoftPopColors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  checkboxChecked: {
    backgroundColor: SoftPopColors.complete,
    borderColor: SoftPopColors.complete,
    shadowColor: SoftPopColors.complete,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emojiWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInfo: {
    flex: 1,
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: SoftPopColors.text,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  nameCompact: {
    fontSize: 16,
    lineHeight: 22,
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: SoftPopColors.textSecondary,
    opacity: 0.7,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  time: {
    fontSize: 14,
    color: SoftPopColors.textSecondary,
    lineHeight: 20,
    fontFamily: 'BMJUA',
  },
  duration: {
    fontSize: 13,
    color: SoftPopColors.textSecondary,
    lineHeight: 18,
    fontFamily: 'BMJUA',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    ...(Platform.OS !== 'android' && {
      elevation: 2,
    }),
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'BMJUA',
  },
  notificationButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.background,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  notificationButtonPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
});
