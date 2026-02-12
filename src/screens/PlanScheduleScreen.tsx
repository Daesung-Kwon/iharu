/**
 * 일정 만들기 화면
 * 드래그 앤 드롭으로 타임라인에 일정 배치
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useActivity } from '../contexts/ActivityContext';
import { useSchedule } from '../contexts/ScheduleContext';
import DraggableActivityCard from '../components/DraggableActivityCard';
import ScheduleItemCard from '../components/ScheduleItemCard';
import TimelineViewV2 from '../components/TimelineViewV2';
import { Activity } from '../types';

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

export default function PlanScheduleScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { activities } = useActivity();
  const {
    selectedDate,
    setSelectedDate,
    getScheduleForDate,
    addScheduleItem,
    removeScheduleItem,
    removeAllScheduleItems,
    checkTimeConflict
  } = useSchedule();
  const [viewMode, setViewMode] = useState<'summary' | 'timeline'>('timeline');
  const [draggingActivity, setDraggingActivity] = useState<Activity | null>(null);

  const currentSchedule = getScheduleForDate(selectedDate);
  const scheduleItems = currentSchedule?.items || [];

  const handleDateChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const totalMinutes = scheduleItems.reduce((sum, item) => {
    return sum + (item.activity?.durationMinutes || 0);
  }, 0);


  const handleTimeSlotPress = (time: string) => {
    console.log('Time slot pressed:', time, 'Dragging:', draggingActivity?.name);
    if (draggingActivity) {
      // 드래그 중인 활동을 해당 시간에 추가
      const success = addScheduleItem(selectedDate, draggingActivity, time);
      if (success) {
        setDraggingActivity(null); // 드래그 모드 해제
        // 성공 시 시각적 피드백으로 충분 (Alert 제거로 UX 개선)
      } else {
        // 더 자세한 에러 메시지
        const duration = draggingActivity.durationMinutes;
        const [hours, minutes] = time.split(':').map(Number);
        const startMinutes = hours * 60 + minutes;
        const endMinutes = startMinutes + duration;
        const endHours = Math.floor(endMinutes / 60);
        const endMins = endMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

        Alert.alert(
          '시간 중복',
          `${time}부터 ${endTime}까지 다른 활동과 겹칩니다.\n\n다른 시간을 선택해주세요.`
        );
      }
    } else {
      // 드래그 모드가 아닐 때는 아무 동작 안함
      Alert.alert('안내', '먼저 왼쪽 활동 목록에서 활동을 길게 눌러주세요.');
    }
  };

  const handleCancelDrag = () => {
    console.log('드래그 취소');
    setDraggingActivity(null);
  };

  return (
    <SafeAreaView
      style={[styles.container, isLandscape && styles.containerLandscape]}
      edges={isLandscape
        ? []
        : Platform.OS === 'android'
          ? ['top', 'bottom'] // Android만 bottom 추가
          : ['top'] // iOS는 기존 유지
      }
    >
      {/* Dragging Indicator - 화면 상단 가운데 */}
      {draggingActivity && (
        <View style={[
          styles.draggingIndicator,
          {
            left: Math.max(20, (width - Math.min(width - 40, 400)) / 2),
            width: Math.min(width - 40, 400),
          }
        ]}>
          <Text style={styles.draggingText}>
            {draggingActivity.name}을(를) 타임라인에 놓으세요
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.cancelDragButton,
              pressed && styles.cancelDragButtonPressed
            ]}
            onPress={handleCancelDrag}
          >
            <MaterialIcons
              name="close"
              size={20}
              color={SoftPopColors.white}
            />
          </Pressable>
        </View>
      )}

      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>일정 만들기</Text>
        <View style={styles.dateSelector}>
          <Pressable
            style={({ pressed }) => [
              styles.dateButton,
              pressed && styles.dateButtonPressed
            ]}
            onPress={() => handleDateChange('prev')}
            accessibilityLabel="이전 날짜"
          >
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={SoftPopColors.text}
            />
          </Pressable>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.dateButton,
              pressed && styles.dateButtonPressed
            ]}
            onPress={() => handleDateChange('next')}
            accessibilityLabel="다음 날짜"
          >
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={SoftPopColors.text}
            />
          </Pressable>
        </View>
      </View>

      {/* Main Content - Two Column Layout */}
      <View style={styles.content}>
        {/* Activity List Panel (Left) - Soft Pop 3D Card */}
        <View style={styles.activityListPanel}>
          <View style={styles.panelHeader}>
            <MaterialIcons
              name="list"
              size={28}
              color={SoftPopColors.primary}
            />
            <Text style={styles.panelTitle}>활동 목록</Text>
          </View>
          <ScrollView
            style={styles.activityList}
            showsVerticalScrollIndicator={false}
          >
            {activities.length === 0 ? (
              <View style={styles.emptyListState}>
                <MaterialIcons
                  name="inbox"
                  size={48}
                  color={SoftPopColors.textSecondary}
                />
                <Text style={styles.emptyListText}>
                  활동 목록이 여기에 표시됩니다
                </Text>
              </View>
            ) : (
              <View style={styles.activityListContent}>
                <View style={styles.instructionBanner}>
                  <MaterialIcons
                    name="info-outline"
                    size={22}
                    color={SoftPopColors.primary}
                  />
                  <Text style={styles.instructionText}>
                    {draggingActivity
                      ? '✨ 오른쪽 타임라인에서 원하는 시간을 탭하세요!'
                      : '👆 활동을 길게 눌러서 드래그 모드를 시작하세요'}
                  </Text>
                </View>
                <View style={styles.activityCardsWrapper}>
                  {activities.map((activity) => (
                    <View key={activity.id}>
                      <DraggableActivityCard
                        activity={activity}
                        onDragStart={() => {
                          console.log('드래그 모드 시작:', activity.name);
                          setDraggingActivity(activity);
                        }}
                        onDragEnd={() => {
                          // 드래그 종료는 명시적으로 처리
                        }}
                        onPress={() => {
                          // 단순 클릭 동작 제거
                        }}
                        isDragging={draggingActivity?.id === activity.id}
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Schedule Panel (Right) - Soft Pop 3D Card */}
        <View style={styles.schedulePanel}>
          <View style={styles.panelHeader}>
            <MaterialIcons
              name="calendar-today"
              size={28}
              color={SoftPopColors.secondary}
            />
            <Text style={styles.panelTitle}>일정표</Text>
            {scheduleItems.length > 0 && (
              <Pressable
                style={({ pressed }) => [
                  styles.deleteAllButton,
                  pressed && styles.deleteAllButtonPressed
                ]}
                onPress={() => removeAllScheduleItems(selectedDate)}
                accessibilityLabel="모든 일정 삭제"
              >
                <MaterialIcons
                  name="delete-outline"
                  size={20}
                  color={SoftPopColors.error}
                />
                <Text style={styles.deleteAllText}>모두 삭제</Text>
              </Pressable>
            )}
            <View style={styles.viewModeButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.viewModeButton,
                  viewMode === 'summary' && styles.viewModeButtonActive,
                  pressed && styles.viewModeButtonPressed,
                ]}
                onPress={() => setViewMode('summary')}
                accessibilityLabel="요약 보기"
              >
                <Text
                  style={[
                    styles.viewModeButtonText,
                    viewMode === 'summary' && styles.viewModeButtonTextActive,
                  ]}
                >
                  요약
                </Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.viewModeButton,
                  viewMode === 'timeline' && styles.viewModeButtonActive,
                  pressed && styles.viewModeButtonPressed,
                ]}
                onPress={() => setViewMode('timeline')}
                accessibilityLabel="타임라인 보기"
              >
                <Text
                  style={[
                    styles.viewModeButtonText,
                    viewMode === 'timeline' && styles.viewModeButtonTextActive,
                  ]}
                >
                  타임라인
                </Text>
              </Pressable>
            </View>
          </View>

          {viewMode === 'summary' ? (
            <View style={styles.summaryView}>
              {/* Summary Stats - Material Cards */}
              <View style={styles.summaryStats}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{scheduleItems.length}</Text>
                  <Text style={styles.statLabel}>개 활동</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{totalMinutes}</Text>
                  <Text style={styles.statLabel}>총 시간 (분)</Text>
                </View>
              </View>

              {/* Schedule Items List or Drop Zone */}
              {scheduleItems.length === 0 ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.dropZone,
                    draggingActivity && styles.dropZoneActive,
                    pressed && styles.dropZonePressed
                  ]}
                  onPress={() => {
                    if (draggingActivity) {
                      // 기본 시간에 추가
                      addScheduleItem(selectedDate, draggingActivity, '09:00');
                      setDraggingActivity(null);
                    }
                  }}
                >
                  <MaterialIcons
                    name="calendar-today"
                    size={64}
                    color={draggingActivity ? SoftPopColors.primary : SoftPopColors.textSecondary}
                  />
                  <Text style={[
                    styles.dropZoneText,
                    draggingActivity && styles.dropZoneTextActive
                  ]}>
                    {draggingActivity
                      ? `${draggingActivity.name}을(를) 여기에 놓으세요!`
                      : '왼쪽에서 활동을 길게 눌러서 여기에 놓아보세요!'
                    }
                  </Text>
                </Pressable>
              ) : (
                <ScrollView
                  style={styles.scheduleItemsList}
                  contentContainerStyle={styles.scheduleItemsListContent}
                  showsVerticalScrollIndicator={false}
                >
                  {scheduleItems.map((item) => (
                    <ScheduleItemCard
                      key={item.id}
                      scheduleItem={item}
                      onRemove={() => removeScheduleItem(item.id)}
                      compact={false}
                    />
                  ))}
                </ScrollView>
              )}
            </View>
          ) : (
            <TimelineViewV2
              scheduleItems={scheduleItems}
              onTimeSlotPress={handleTimeSlotPress}
              onRemoveItem={removeScheduleItem}
              draggingActivity={draggingActivity}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SoftPopColors.background, // Cream background
  },
  containerLandscape: {
    paddingTop: 0,
  },
  header: {
    padding: 32,
    paddingBottom: 20,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24,
    margin: 32,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    color: SoftPopColors.text,
    marginBottom: 20,
    lineHeight: 40,
    fontFamily: 'BMJUA',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  dateButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.white,
    borderRadius: 28, // rounded-full
    // 3D pressable effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  dateButtonPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: SoftPopColors.text,
    paddingHorizontal: 20,
    fontFamily: 'BMJUA',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 32,
    gap: 32,
  },
  activityListPanel: {
    flex: 1,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24, // rounded-3xl
    padding: 24,
    maxWidth: 400,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  schedulePanel: {
    flex: 2,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24, // rounded-3xl
    padding: 24,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    flexWrap: 'wrap',
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SoftPopColors.text,
    flex: 1,
    fontFamily: 'BMJUA',
  },
  viewModeButtons: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: SoftPopColors.background,
    borderRadius: 16,
    padding: 4,
  },
  viewModeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    // 3D pressable effect - iOS only for base state
    ...(Platform.OS === 'ios' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }),
    // Android: 투명 상태에서 elevation 제거
  },
  viewModeButtonActive: {
    backgroundColor: SoftPopColors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3, // 활성 상태(배경색 있음)에서는 elevation 유지
  },
  viewModeButtonPressed: {
    transform: [{ translateY: 1 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  viewModeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
  },
  viewModeButtonTextActive: {
    color: SoftPopColors.text,
    fontWeight: '700',
    fontFamily: 'BMJUA',
  },
  activityList: {
    flex: 1,
  },
  activityListContent: {
    paddingVertical: 8,
    paddingBottom: 60,
  },
  activityCardsWrapper: {
    gap: 12,
    paddingVertical: 8, // 확대 시 여유 공간
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 8,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '500',
    color: SoftPopColors.primary,
    flex: 1,
    lineHeight: 20,
    fontFamily: 'BMJUA',
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20, // rounded-full
    backgroundColor: '#FFF0F0',
    // 3D pressable effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteAllButtonPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: SoftPopColors.error,
    fontFamily: 'BMJUA',
  },
  emptyListState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 56,
  },
  emptyListText: {
    fontSize: 16,
    color: SoftPopColors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'BMJUA',
  },
  summaryView: {
    flex: 1,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    gap: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24, // rounded-3xl
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: SoftPopColors.secondary,
    marginBottom: 8,
    fontFamily: 'BMJUA',
  },
  statLabel: {
    fontSize: 16,
    color: SoftPopColors.textSecondary,
    fontWeight: '500',
    fontFamily: 'BMJUA',
  },
  dropZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.background,
    borderRadius: 24, // rounded-3xl
    borderWidth: 3,
    borderColor: SoftPopColors.textSecondary,
    borderStyle: 'dashed',
    padding: 56,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropZonePressed: {
    transform: [{ scale: 0.98 }],
  },
  dropZoneText: {
    fontSize: 18,
    color: SoftPopColors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '500',
    fontFamily: 'BMJUA',
  },
  dropZoneActive: {
    backgroundColor: '#FFF0F0',
    borderColor: SoftPopColors.primary,
    borderWidth: 4,
    borderStyle: 'solid',
  },
  dropZoneTextActive: {
    color: SoftPopColors.primary,
    fontWeight: '700',
    fontFamily: 'BMJUA',
  },
  scheduleItemsList: {
    flex: 1,
  },
  scheduleItemsListContent: {
    paddingVertical: 8,
    paddingBottom: 60,
    gap: 12, // Spacing between floating sticker cards
  },
  draggingIndicator: {
    position: 'absolute',
    top: 120, // 화면 상단으로 이동
    backgroundColor: SoftPopColors.primary,
    borderRadius: 24, // rounded-3xl
    padding: 20,
    // Strong shadow for floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20, // z-index 높임
    zIndex: 1000, // 최상위에 표시
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  draggingText: {
    fontSize: 18,
    color: SoftPopColors.white,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'BMJUA',
  },
  cancelDragButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20, // rounded-full
  },
  cancelDragButtonPressed: {
    transform: [{ scale: 0.9 }],
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

