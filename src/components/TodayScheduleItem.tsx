/**
 * TodayScheduleItem 컴포넌트
 * 오늘의 일정 전용 아이템 카드 (체크박스 + 상태 표시)
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ScheduleItem } from '../types';
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
  success: '#6BCB77',
  error: '#FF6B6B',
};

interface TodayScheduleItemProps {
  scheduleItem: ScheduleItem;
  itemStatus: 'upcoming' | 'current' | 'completed' | 'missed' | 'future';
  onToggleComplete: () => void;
  onToggleNotification?: () => void;
  notificationEnabled?: boolean;
}

export default function TodayScheduleItem({
  scheduleItem,
  itemStatus,
  onToggleComplete,
  onToggleNotification,
  notificationEnabled = false,
}: TodayScheduleItemProps) {
  const activity = scheduleItem.activity;
  if (!activity) return null;

  const emoji = ActivityEmojis[activity.emojiKey] || activity.emojiKey;
  const colorScheme = ActivityMaterialColors[activity.colorKey];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  // 상태별 스타일
  const getStatusStyle = () => {
    switch (itemStatus) {
      case 'current':
        return {
          backgroundColor: '#FFF0F0',
          borderColor: SoftPopColors.primary,
          borderWidth: 4,
        };
      case 'completed':
        return {
          backgroundColor: '#F0FFF4',
          borderColor: SoftPopColors.success,
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
          color: SoftPopColors.primary,
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

  const isDisabled = itemStatus === 'future' || itemStatus === 'completed';

  const statusBadge = getStatusBadge();

  return (
    <View style={[styles.card, getStatusStyle()]}>
      {/* Left: Checkbox */}
      <Pressable
        style={({ pressed }) => [
          styles.checkboxContainer,
          isDisabled && styles.checkboxContainerDisabled,
          pressed && !isDisabled && styles.checkboxContainerPressed
        ]}
        onPress={onToggleComplete}
        disabled={isDisabled}
        accessibilityLabel={scheduleItem.status === 'completed' ? '완료 취소' : itemStatus === 'future' ? '미래 일정 (비활성화)' : '완료 표시'}
      >
        <View style={[
          styles.checkbox,
          scheduleItem.status === 'completed' && styles.checkboxChecked,
          isDisabled && styles.checkboxDisabled
        ]}>
          {scheduleItem.status === 'completed' && (
            <MaterialIcons
              name="check"
              size={20}
              color={SoftPopColors.white}
            />
          )}
        </View>
      </Pressable>

      {/* Center: Info */}
      <View style={styles.infoContainer}>
        {/* Emoji */}
        <Text style={styles.emoji}>{emoji}</Text>

        <View style={styles.textInfo}>
          {/* Name */}
          <Text style={[
            styles.name,
            scheduleItem.status === 'completed' && styles.nameCompleted
          ]}>
            {activity.name}
          </Text>

          {/* Time */}
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

          {/* Status Badge */}
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

      {/* Right: Notification Toggle */}
      {itemStatus === 'upcoming' && (
        <Pressable
          style={({ pressed }) => [
            styles.notificationButton,
            pressed && styles.notificationButtonPressed
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
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24, // rounded-3xl
    padding: 20,
    marginBottom: 12,
    gap: 16,
    backgroundColor: SoftPopColors.white,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 100,
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
    borderRadius: 20, // rounded-full
    borderWidth: 3,
    borderColor: SoftPopColors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.white,
    // 3D effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  checkboxChecked: {
    backgroundColor: SoftPopColors.success,
    borderColor: SoftPopColors.success,
    // Stronger shadow when checked
    shadowColor: SoftPopColors.success,
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
  emoji: {
    fontSize: 44,
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
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // Android: 투명 배경에서 elevation 제거
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
    borderRadius: 24, // rounded-full
    // 3D pressable effect
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

