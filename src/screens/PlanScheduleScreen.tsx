/**
 * 일정 만들기 화면
 * 길게 눌러 활동을 선택한 뒤 타임라인 슬롯을 탭해 배치
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useActivity } from '../contexts/ActivityContext';
import { useSchedule } from '../contexts/ScheduleContext';
import DraggableActivityCard from '../components/DraggableActivityCard';
import ScheduleItemCard from '../components/ScheduleItemCard';
import TimelineViewV2 from '../components/TimelineViewV2';
import { Activity } from '../types';
import { SoftPopColors } from '../constants/theme';
import { useLayout } from '../hooks/useLayout';

const SELECT_INSTRUCTION = '활동을 길게 누른 뒤 시간을 탭하세요';

export default function PlanScheduleScreen() {
  const {
    width,
    isCompact,
    isLandscape,
    space,
    titleSize,
    tabBarOffset,
  } = useLayout();
  const { activities } = useActivity();
  const {
    selectedDate,
    setSelectedDate,
    getScheduleForDate,
    addScheduleItem,
    removeScheduleItem,
    removeAllScheduleItems,
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
      const success = addScheduleItem(selectedDate, draggingActivity, time);
      if (success) {
        setDraggingActivity(null);
      } else {
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
      Alert.alert('안내', SELECT_INSTRUCTION);
    }
  };

  const handleCancelDrag = () => {
    console.log('드래그 취소');
    setDraggingActivity(null);
  };

  const handleSelectActivity = (activity: Activity) => {
    console.log('드래그 모드 시작:', activity.name);
    setDraggingActivity(activity);
  };

  const instructionText = draggingActivity
    ? '원하는 시간을 탭하세요'
    : SELECT_INSTRUCTION;

  const dateButtonSize = isCompact ? 44 : 56;

  const renderActivityCards = (variant: 'list' | 'chip') => (
    activities.map((activity) => (
      <View key={activity.id}>
        <DraggableActivityCard
          activity={activity}
          variant={variant}
          onDragStart={() => handleSelectActivity(activity)}
          onDragEnd={() => {
            // 종료는 타임라인 탭 또는 취소에서만 처리
          }}
          onPress={() => {
            // 탭은 배치가 아님 — 길게 눌러 선택
          }}
          isDragging={draggingActivity?.id === activity.id}
        />
      </View>
    ))
  );

  const renderScheduleBody = () => (
    viewMode === 'summary' ? (
      <View style={styles.summaryView}>
        <View style={styles.summaryStats}>
          <View style={[styles.statCard, isCompact && styles.statCardCompact]}>
            <Text style={[styles.statNumber, isCompact && styles.statNumberCompact]}>
              {scheduleItems.length}
            </Text>
            <Text style={styles.statLabel}>개 활동</Text>
          </View>
          <View style={[styles.statCard, isCompact && styles.statCardCompact]}>
            <Text style={[styles.statNumber, isCompact && styles.statNumberCompact]}>
              {totalMinutes}
            </Text>
            <Text style={styles.statLabel}>총 시간 (분)</Text>
          </View>
        </View>

        {scheduleItems.length === 0 ? (
          <Pressable
            style={({ pressed }) => [
              styles.dropZone,
              isCompact && styles.dropZoneCompact,
              draggingActivity && styles.dropZoneActive,
              pressed && styles.dropZonePressed
            ]}
            onPress={() => {
              if (draggingActivity) {
                addScheduleItem(selectedDate, draggingActivity, '09:00');
                setDraggingActivity(null);
              }
            }}
          >
            <MaterialIcons
              name="calendar-today"
              size={isCompact ? 48 : 64}
              color={draggingActivity ? SoftPopColors.primary : SoftPopColors.textSecondary}
            />
            <Text style={[
              styles.dropZoneText,
              draggingActivity && styles.dropZoneTextActive
            ]}>
              {draggingActivity
                ? `${draggingActivity.name}을(를) 추가하려면 여기를 탭하세요`
                : '활동을 길게 누른 뒤 여기를 탭하세요'
              }
            </Text>
          </Pressable>
        ) : (
          <ScrollView
            style={styles.scheduleItemsList}
            contentContainerStyle={[
              styles.scheduleItemsListContent,
              { paddingBottom: tabBarOffset + 8 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {scheduleItems.map((item) => (
              <ScheduleItemCard
                key={item.id}
                scheduleItem={item}
                onRemove={() => removeScheduleItem(item.id)}
                compact={isCompact}
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
        contentPaddingBottom={tabBarOffset + 8}
      />
    )
  );

  return (
    <SafeAreaView
      style={[styles.container, isLandscape && styles.containerLandscape]}
      edges={isLandscape
        ? []
        : Platform.OS === 'android'
          ? ['top', 'bottom']
          : ['top']
      }
    >
      {draggingActivity && (
        <View style={[
          styles.draggingIndicator,
          {
            top: isCompact ? 72 : 120,
            left: Math.max(20, (width - Math.min(width - 40, 400)) / 2),
            width: Math.min(width - 40, 400),
          }
        ]}>
          <Text style={styles.draggingText}>
            {draggingActivity.name}을(를) 타임라인에서 탭하세요
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

      <View style={[
        styles.header,
        {
          padding: space,
          paddingBottom: isCompact ? 12 : 20,
          marginHorizontal: space,
          marginTop: space,
        },
      ]}>
        <Text style={[
          styles.title,
          { fontSize: titleSize, lineHeight: titleSize + 8 },
        ]}>
          일정 만들기
        </Text>
        <View style={styles.dateSelector}>
          <Pressable
            style={({ pressed }) => [
              styles.dateButton,
              { width: dateButtonSize, height: dateButtonSize, borderRadius: dateButtonSize / 2 },
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
          <Text style={[styles.dateText, isCompact && styles.dateTextCompact]}>
            {selectedDate.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.dateButton,
              { width: dateButtonSize, height: dateButtonSize, borderRadius: dateButtonSize / 2 },
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

      {isCompact ? (
        // Phone widths cannot fit activity list + timeline side by side
        <ScrollView
          style={styles.contentCompact}
          contentContainerStyle={[
            styles.contentCompactInner,
            { paddingHorizontal: space, gap: 12 },
          ]}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.activityChipsPanel, { padding: 12 }]}>
            <View style={[styles.instructionBanner, styles.instructionBannerCompact]}>
              <MaterialIcons
                name="info-outline"
                size={18}
                color={SoftPopColors.primary}
              />
              <Text style={[styles.instructionText, styles.instructionTextCompact]}>
                {instructionText}
              </Text>
            </View>
            {activities.length === 0 ? (
              <Text style={styles.emptyChipsText}>활동 목록이 여기에 표시됩니다</Text>
            ) : (
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activityChipsContent}
              >
                {renderActivityCards('chip')}
              </ScrollView>
            )}
          </View>

          <View style={[styles.schedulePanel, styles.schedulePanelCompact, { padding: space }]}>
            <View style={styles.panelHeader}>
              <MaterialIcons
                name="calendar-today"
                size={24}
                color={SoftPopColors.secondary}
              />
              <Text style={styles.panelTitle}>일정표</Text>
              {scheduleItems.length > 0 && (
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteAllButton,
                    styles.deleteAllButtonCompact,
                    pressed && styles.deleteAllButtonPressed
                  ]}
                  onPress={() => removeAllScheduleItems(selectedDate)}
                  accessibilityLabel="모든 일정 삭제"
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={18}
                    color={SoftPopColors.error}
                  />
                  <Text style={styles.deleteAllText}>모두 삭제</Text>
                </Pressable>
              )}
              <View style={styles.viewModeButtons}>
                <Pressable
                  style={({ pressed }) => [
                    styles.viewModeButton,
                    styles.viewModeButtonCompact,
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
                    styles.viewModeButtonCompact,
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
            {renderScheduleBody()}
          </View>
        </ScrollView>
      ) : (
        <View style={[styles.content, { padding: space, gap: space }]}>
          <View style={[styles.activityListPanel, { padding: 24 }]}>
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
                        ? '✨ 타임라인에서 원하는 시간을 탭하세요!'
                        : SELECT_INSTRUCTION}
                    </Text>
                  </View>
                  <View style={styles.activityCardsWrapper}>
                    {renderActivityCards('list')}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>

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
            {renderScheduleBody()}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SoftPopColors.background,
  },
  containerLandscape: {
    paddingTop: 0,
  },
  header: {
    padding: 32,
    paddingBottom: 20,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
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
    gap: 12,
  },
  dateButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: SoftPopColors.white,
    borderRadius: 28,
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
    paddingHorizontal: 12,
    fontFamily: 'BMJUA',
    flexShrink: 1,
    textAlign: 'center',
  },
  dateTextCompact: {
    fontSize: 16,
    paddingHorizontal: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    padding: 32,
    gap: 32,
  },
  contentCompact: {
    flex: 1,
    minHeight: 0,
  },
  contentCompactInner: {
    flexGrow: 1,
    flexDirection: 'column',
  },
  activityListPanel: {
    flex: 1,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24,
    padding: 24,
    maxWidth: 400,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  activityChipsPanel: {
    flexShrink: 0,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  activityChipsContent: {
    gap: 8,
    paddingVertical: 4,
    paddingRight: 8,
  },
  emptyChipsText: {
    fontSize: 14,
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
    paddingVertical: 8,
  },
  schedulePanel: {
    flex: 2,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 0,
  },
  schedulePanelCompact: {
    flex: 1,
    maxWidth: '100%',
    minHeight: 180,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
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
    ...(Platform.OS === 'ios' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    }),
  },
  viewModeButtonCompact: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 40,
  },
  viewModeButtonActive: {
    backgroundColor: SoftPopColors.secondary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
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
    paddingVertical: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionBannerCompact: {
    padding: 10,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '500',
    color: SoftPopColors.primary,
    flex: 1,
    lineHeight: 20,
    fontFamily: 'BMJUA',
  },
  instructionTextCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
  deleteAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#FFF0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteAllButtonCompact: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
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
    minHeight: 0,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statCardCompact: {
    padding: 12,
    borderRadius: 16,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '700',
    color: SoftPopColors.secondary,
    marginBottom: 8,
    fontFamily: 'BMJUA',
  },
  statNumberCompact: {
    fontSize: 28,
    marginBottom: 4,
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
    borderRadius: 24,
    borderWidth: 3,
    borderColor: SoftPopColors.textSecondary,
    borderStyle: 'dashed',
    padding: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropZoneCompact: {
    padding: 24,
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
    gap: 12,
  },
  draggingIndicator: {
    position: 'absolute',
    top: 120,
    backgroundColor: SoftPopColors.primary,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 1000,
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
    borderRadius: 20,
  },
  cancelDragButtonPressed: {
    transform: [{ scale: 0.9 }],
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});
