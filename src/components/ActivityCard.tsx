/**
 * ActivityCard 컴포넌트
 * 활동을 카드 형태로 표시
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Activity } from '../types';
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
};

interface ActivityCardProps {
  activity: Activity;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActivityCard({ activity, onEdit, onDelete }: ActivityCardProps) {
  const emoji = ActivityEmojis[activity.emojiKey] || activity.emojiKey;
  const colorScheme = ActivityMaterialColors[activity.colorKey];

  return (
    <View 
      style={[
        styles.card,
        { backgroundColor: colorScheme.surface }
      ]}
    >
      {/* Emoji Icon - 배경 완전히 투명 */}
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>

      {/* Activity Info - 배경 완전히 투명 */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {activity.name}
        </Text>
        <View style={styles.durationContainer}>
          <MaterialIcons 
            name="schedule" 
            size={16} 
            color={SoftPopColors.textSecondary} 
          />
          <Text style={styles.duration}>
            {activity.durationMinutes}분
          </Text>
        </View>
      </View>

      {/* Action Buttons - 배경 완전히 투명 */}
      <View style={styles.actionsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed
          ]}
          onPress={onEdit}
          accessibilityLabel="활동 수정"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons 
            name="edit" 
            size={20} 
            color={SoftPopColors.textSecondary} 
          />
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed
          ]}
          onPress={onDelete}
          accessibilityLabel="활동 삭제"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons 
            name="delete-outline" 
            size={20} 
            color={SoftPopColors.error} 
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    minHeight: 180,
    borderRadius: 32, // rounded-[32px]
    padding: 24, // p-6
    // backgroundColor는 동적으로 colorScheme.surface로 설정됨 (단일 클레이 카드)
    // 외부 그림자: shadow-[8px_8px_16px_rgba(0,0,0,0.05)]
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 20,
    // flex-col items-center justify-between
    alignItems: 'center',
    justifyContent: 'space-between',
    // 단일 클레이 카드 효과를 위한 테두리
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)', // 밝은 테두리로 도톰한 느낌
  },
  emojiContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    minHeight: 72,
    // 배경 제거 - bg-transparent
    backgroundColor: 'transparent',
    width: '100%',
  },
  emoji: {
    fontSize: 52,
  },
  infoContainer: {
    flex: 1,
    marginBottom: 12,
    // 배경 제거 - bg-transparent
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: SoftPopColors.text,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  duration: {
    fontSize: 14,
    fontWeight: '500',
    color: SoftPopColors.textSecondary,
    lineHeight: 20,
    fontFamily: 'BMJUA',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 12,
    // 테두리 제거 - 단일 클레이 카드 효과
    borderTopWidth: 0,
    // 배경 제거 - bg-transparent
    backgroundColor: 'transparent',
  },
  actionButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // 배경 제거 - bg-transparent (또는 매우 연한 배경)
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20, // rounded-full
    // 미묘한 3D pressable effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
});


