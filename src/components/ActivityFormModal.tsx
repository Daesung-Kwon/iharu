/**
 * ActivityFormModal 컴포넌트
 * 활동 추가/수정 모달
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Activity, ActivityColor, ActivityCategory } from '../types';
import { ActivityEmojis, EmojiList, EmojiToMaterialIcon } from '../constants/emojis';
import { ActivityMaterialColors } from '../constants/materialDesign';

// Soft Pop 3D 디자인 색상 팔레트
const SoftPopColors = {
  background: '#FFF9F0', // Cream
  primary: '#FF6B6B', // Soft Red
  secondary: '#FFD93D', // Banana Yellow
  text: '#2D3436', // Soft Black
  textSecondary: '#636E72', // Soft Gray
  white: '#FFFFFF',
};

interface ActivityFormModalProps {
  visible: boolean;
  activity?: Activity | null; // null이면 추가 모드, 있으면 수정 모드
  onClose: () => void;
  onSubmit: (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const COLOR_OPTIONS: ActivityColor[] = [
  'purple', 'blue', 'pink', 'yellow', 'green', 'orange', 'red', 'teal'
];

const CATEGORY_OPTIONS: { key: ActivityCategory; label: string; icon: string }[] = [
  { key: 'study', label: '공부', icon: 'school' },
  { key: 'play', label: '놀이', icon: 'sports-esports' },
  { key: 'reading', label: '독서', icon: 'menu-book' },
  { key: 'exercise', label: '운동', icon: 'directions-run' },
  { key: 'meal', label: '식사', icon: 'restaurant' },
  { key: 'rest', label: '휴식', icon: 'self-improvement' },
  { key: 'art', label: '미술', icon: 'palette' },
  { key: 'music', label: '음악', icon: 'music-note' },
];

const DURATION_OPTIONS = [10, 20, 30, 40, 50, 60, 80, 90, 120];

export default function ActivityFormModal({
  visible,
  activity,
  onClose,
  onSubmit,
}: ActivityFormModalProps) {
  const insets = useSafeAreaInsets();
  const isEditMode = !!activity;

  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('homework');
  const [selectedColor, setSelectedColor] = useState<ActivityColor>('blue');
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>('study');
  const [duration, setDuration] = useState(30);
  const [iconPickerMode, setIconPickerMode] = useState<'emoji' | 'icon'>('emoji');

  useEffect(() => {
    if (activity) {
      setName(activity.name);
      setSelectedEmoji(activity.emojiKey);
      setSelectedColor(activity.colorKey);
      setSelectedCategory(activity.category);
      setDuration(activity.durationMinutes);
      setIconPickerMode(activity.displayAsIcon ? 'icon' : 'emoji');
    } else {
      // 초기화
      setName('');
      setSelectedEmoji('homework');
      setSelectedColor('blue');
      setSelectedCategory('study');
      setDuration(30);
      setIconPickerMode('emoji');
    }
  }, [activity, visible]);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('입력 오류', '활동 이름을 입력해주세요.');
      return;
    }

    onSubmit({
      userId: activity?.userId || null,
      childProfileId: activity?.childProfileId || null,
      name: name.trim(),
      emojiKey: selectedEmoji,
      displayAsIcon: iconPickerMode === 'icon',
      colorKey: selectedColor,
      category: selectedCategory,
      durationMinutes: duration,
      isDefault: false,
    });

    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditMode ? '활동 수정' : '새 활동 추가'}
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed
              ]}
              onPress={onClose}
              accessibilityLabel="닫기"
            >
              <MaterialIcons
                name="close"
                size={24}
                color={SoftPopColors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Activity Name */}
            <View style={styles.section}>
              <Text style={styles.label}>활동 이름</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="예: 숙제하기"
                placeholderTextColor={SoftPopColors.textSecondary}
                {...(Platform.OS === 'android' && {
                  underlineColorAndroid: 'transparent', // Android underline 제거
                })}
              />
            </View>

            {/* Emoji / Icon Selection (확장) */}
            <View style={styles.section}>
              <View style={styles.emojiSectionHeader}>
                <Text style={styles.label}>아이콘</Text>
                <View style={styles.iconModeTabs}>
                  <Pressable
                    style={[styles.iconModeTab, iconPickerMode === 'emoji' && styles.iconModeTabActive]}
                    onPress={() => setIconPickerMode('emoji')}
                  >
                    <Text style={[styles.iconModeTabText, iconPickerMode === 'emoji' && styles.iconModeTabTextActive]}>
                      이모지
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[styles.iconModeTab, iconPickerMode === 'icon' && styles.iconModeTabActive]}
                    onPress={() => setIconPickerMode('icon')}
                  >
                    <MaterialIcons
                      name="category"
                      size={18}
                      color={iconPickerMode === 'icon' ? SoftPopColors.white : SoftPopColors.textSecondary}
                    />
                    <Text style={[styles.iconModeTabText, iconPickerMode === 'icon' && styles.iconModeTabTextActive]}>
                      아이콘
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View style={styles.emojiGrid}>
                {EmojiList.map(({ key, emoji }) => (
                  <Pressable
                    key={key}
                    style={({ pressed }) => [
                      styles.emojiOption,
                      selectedEmoji === key && styles.emojiOptionSelected,
                      pressed && styles.emojiOptionPressed
                    ]}
                    onPress={() => setSelectedEmoji(key)}
                  >
                    {iconPickerMode === 'emoji' ? (
                      <Text style={styles.emojiText}>{emoji}</Text>
                    ) : (
                      <MaterialIcons
                        name={(EmojiToMaterialIcon[key] || 'circle') as React.ComponentProps<typeof MaterialIcons>['name']}
                        size={32}
                        color={selectedEmoji === key ? SoftPopColors.primary : SoftPopColors.text}
                      />
                    )}
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Color Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>색상</Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map((color) => {
                  const colorScheme = ActivityMaterialColors[color];
                  return (
                    <Pressable
                      key={color}
                      style={({ pressed }) => [
                        styles.colorOption,
                        { backgroundColor: colorScheme.main },
                        selectedColor === color && styles.colorOptionSelected,
                        pressed && styles.colorOptionPressed
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <MaterialIcons
                          name="check"
                          size={20}
                          color={SoftPopColors.white}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Category Selection (확장 - 아이콘 포함) */}
            <View style={styles.section}>
              <Text style={styles.label}>카테고리</Text>
              <View style={styles.categoryGrid}>
                {CATEGORY_OPTIONS.map(({ key, label, icon }) => (
                  <Pressable
                    key={key}
                    style={({ pressed }) => [
                      styles.categoryOption,
                      selectedCategory === key && styles.categoryOptionSelected,
                      pressed && styles.categoryOptionPressed
                    ]}
                    onPress={() => setSelectedCategory(key)}
                  >
                    <MaterialIcons
                      name={icon as React.ComponentProps<typeof MaterialIcons>['name']}
                      size={20}
                      color={selectedCategory === key ? SoftPopColors.white : SoftPopColors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === key && styles.categoryTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Duration Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>소요 시간 (분)</Text>
              <View style={styles.durationGrid}>
                {DURATION_OPTIONS.map((minutes) => (
                  <Pressable
                    key={minutes}
                    style={({ pressed }) => [
                      styles.durationOption,
                      duration === minutes && styles.durationOptionSelected,
                      pressed && styles.durationOptionPressed
                    ]}
                    onPress={() => setDuration(minutes)}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        duration === minutes && styles.durationTextSelected,
                      ]}
                    >
                      {minutes}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={[
            styles.footer,
            Platform.OS === 'android' && {
              marginBottom: Math.max(insets.bottom, 16),
            }
          ]}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                pressed && styles.buttonPressed
              ]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.submitButton,
                pressed && styles.buttonPressed
              ]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>
                {isEditMode ? '수정' : '추가'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: SoftPopColors.white,
    borderTopLeftRadius: 32, // rounded-3xl
    borderTopRightRadius: 32,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Strong floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 2,
    borderBottomColor: SoftPopColors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    color: SoftPopColors.text,
    lineHeight: 32,
    fontFamily: 'BMJUA',
  },
  closeButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.background,
    borderRadius: 24, // rounded-full
    // 3D pressable effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  closeButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    padding: 32,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: Platform.OS === 'android' ? 'normal' : '600',
    color: SoftPopColors.text,
    marginBottom: 16,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  textInput: {
    fontSize: 18,
    fontWeight: Platform.OS === 'android' ? 'normal' : '500',
    backgroundColor: SoftPopColors.background,
    borderRadius: 20,
    padding: 20,
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
    // iOS는 기존 테두리 유지, Android는 테두리 제거
    ...(Platform.OS === 'ios'
      ? {
        borderWidth: 2,
        borderColor: SoftPopColors.white,
      }
      : {
        borderWidth: 0,
        borderColor: 'transparent',
      }
    ),
    // 그림자는 공통
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emojiSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconModeTabs: {
    flexDirection: 'row',
    backgroundColor: SoftPopColors.background,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  iconModeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  iconModeTabActive: {
    backgroundColor: SoftPopColors.primary,
  },
  iconModeTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
  },
  iconModeTabTextActive: {
    color: SoftPopColors.white,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emojiOption: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: SoftPopColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emojiOptionSelected: {
    borderColor: SoftPopColors.primary,
    backgroundColor: '#FFF0F0',
    shadowColor: SoftPopColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  emojiOptionPressed: {
    transform: [{ scale: 0.95 }],
  },
  emojiText: {
    fontSize: 32,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28, // rounded-full
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'transparent',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  colorOptionSelected: {
    borderColor: SoftPopColors.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  colorOptionPressed: {
    transform: [{ scale: 0.9 }],
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: SoftPopColors.background,
    borderWidth: 3,
    borderColor: 'transparent',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryOptionSelected: {
    backgroundColor: SoftPopColors.primary,
    borderColor: SoftPopColors.primary,
    shadowColor: SoftPopColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  categoryOptionPressed: {
    transform: [{ scale: 0.95 }],
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
  },
  categoryTextSelected: {
    color: SoftPopColors.white,
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    fontFamily: 'BMJUA',
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  durationOption: {
    minWidth: 70,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: SoftPopColors.background,
    borderWidth: 3,
    borderColor: 'transparent',
    alignItems: 'center',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  durationOptionSelected: {
    backgroundColor: SoftPopColors.primary,
    borderColor: SoftPopColors.primary,
    shadowColor: SoftPopColors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  durationOptionPressed: {
    transform: [{ scale: 0.95 }],
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
  },
  durationTextSelected: {
    color: SoftPopColors.white,
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    fontFamily: 'BMJUA',
  },
  footer: {
    flexDirection: 'row',
    padding: 32,
    gap: 16,
    borderTopWidth: 2,
    borderTopColor: SoftPopColors.background,
  },
  button: {
    flex: 1,
    minHeight: 56,
    borderRadius: 28, // rounded-full
    justifyContent: 'center',
    alignItems: 'center',
    // 3D pressable effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: SoftPopColors.background,
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    color: SoftPopColors.text,
    letterSpacing: 0.5,
    fontFamily: 'BMJUA',
  },
  submitButton: {
    backgroundColor: SoftPopColors.primary,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    color: SoftPopColors.white,
    letterSpacing: 0.5,
    fontFamily: 'BMJUA',
  },
});


