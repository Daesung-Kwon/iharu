/**
 * ScheduleItemCard 컴포넌트
 * 일정 아이템을 카드 형태로 표시 (Soft Pop 3D - Claymorphism)
 * 초등학생(7-9세)을 위한 귀여운 스티커 카드 디자인
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
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
};

interface ScheduleItemCardProps {
  scheduleItem: ScheduleItem;
  onRemove?: () => void;
  onPress?: () => void;
  compact?: boolean; // 요약 보기용 컴팩트 모드
}

export default function ScheduleItemCard({ 
  scheduleItem, 
  onRemove, 
  onPress,
  compact = false 
}: ScheduleItemCardProps) {
  const activity = scheduleItem.activity;
  if (!activity) return null;

  const emoji = ActivityEmojis[activity.emojiKey] || activity.emojiKey;
  const colorScheme = ActivityMaterialColors[activity.colorKey];
  const [isPressed, setIsPressed] = useState(false);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colorScheme.surface || SoftPopColors.white },
        compact && styles.cardCompact,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      <View style={styles.content}>
        {/* Left: Emoji */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        {/* Center: Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1}>
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
          </View>
          {!compact && (
            <Text style={styles.duration}>
              {activity.durationMinutes}분
            </Text>
          )}
        </View>

        {/* Right: Status & Remove */}
        <View style={styles.rightContainer}>
          {scheduleItem.status === 'completed' && (
            <View style={styles.statusBadge}>
              <MaterialIcons 
                name="check-circle" 
                size={24} 
                color={SoftPopColors.success} 
              />
            </View>
          )}
          {onRemove && (
            <Pressable
              style={({ pressed }) => [
                styles.removeButton,
                pressed && styles.removeButtonPressed,
              ]}
              onPress={onRemove}
              accessibilityLabel="일정 제거"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <MaterialIcons 
                name="close" 
                size={20} 
                color={SoftPopColors.textSecondary} 
              />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24, // rounded-3xl (24px)
    padding: 24, // p-6 (generous padding)
    marginBottom: 12,
    backgroundColor: SoftPopColors.white,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect (shadow-lg)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardCompact: {
    padding: 20,
  },
  cardPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.background,
    borderRadius: 16,
  },
  emoji: {
    fontSize: 36,
  },
  infoContainer: {
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
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.background,
    borderRadius: 16,
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.background,
    borderRadius: 20, // rounded-full
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
});


