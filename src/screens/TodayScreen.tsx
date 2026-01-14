/**
 * 오늘의 일정 화면 (대시보드)
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSchedule } from '../contexts/ScheduleContext';
import TodayScheduleItem from '../components/TodayScheduleItem';
import CelebrationModal from '../components/CelebrationModal';
import HorizontalDatePicker from '../components/HorizontalDatePicker';
import ClapAnimation from '../components/ClapAnimation';
import { getItemStatus, getNextActivity, getCurrentActivity, getMinutesUntil, formatRemainingTime } from '../utils/timeUtils';
import { calculateDayStats, isToday, isPast, isFuture } from '../utils/statsUtils';
import { ActivityEmojis } from '../constants/emojis';

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
import {
  requestNotificationPermissions,
  loadNotificationSettings,
  saveNotificationSettings,
  scheduleActivityNotification,
  scheduleTodayNotifications,
  cancelActivityNotification,
} from '../services/notificationService';

export default function TodayScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getScheduleForDate, updateScheduleItem, schedules, copyScheduleToDate } = useSchedule();
  const selectedSchedule = getScheduleForDate(selectedDate);
  const scheduleItems = selectedSchedule?.items || [];
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false); // 한 번 표시된 완료 팝업 추적
  const [showClapAnimation, setShowClapAnimation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  
  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const isViewingToday = isToday(selectedDateString);
  const isViewingPast = isPast(selectedDateString);
  const isViewingFuture = isFuture(selectedDateString);
  const dayStats = calculateDayStats(selectedSchedule);
  
  // 앱 시작 시 알림 권한 요청 및 설정 로드
  useEffect(() => {
    const initializeNotifications = async () => {
      // 알림 권한 요청
      await requestNotificationPermissions();
      
      // 저장된 알림 설정 로드
      const savedSettings = await loadNotificationSettings();
      setNotifications(savedSettings);
      
      // 오늘 일정 알림 스케줄링
      const todaySchedule = getScheduleForDate(new Date());
      if (todaySchedule && todaySchedule.items.length > 0) {
        await scheduleTodayNotifications(todaySchedule.items, savedSettings);
      }
    };

    initializeNotifications();
  }, []);

  // 오늘 일정이 변경될 때만 알림 재스케줄링 (알림 설정 변경은 handleToggleNotification에서 개별 처리)
  useEffect(() => {
    if (!isViewingToday || scheduleItems.length === 0) return;

    const scheduleNotifications = async () => {
      await scheduleTodayNotifications(scheduleItems, notifications);
    };
    
    scheduleNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewingToday, scheduleItems.length]); // notifications 제거 - 개별 토글에서 처리

  // 매분 현재 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 시간순 정렬
  const sortedItems = [...scheduleItems].sort((a, b) => {
    const [aHours, aMins] = a.startTime.split(':').map(Number);
    const [bHours, bMins] = b.startTime.split(':').map(Number);
    return (aHours * 60 + aMins) - (bHours * 60 + bMins);
  });

  const totalItems = scheduleItems.length;
  const completedItems = scheduleItems.filter(item => item.status === 'completed').length;
  const progressPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const allCompleted = totalItems > 0 && completedItems === totalItems;

  // 현재/다음 활동
  const currentActivity = getCurrentActivity(scheduleItems, currentTime);
  const nextActivity = getNextActivity(scheduleItems, currentTime);

  useEffect(() => {
    if (allCompleted && !showCelebration && !celebrationShown) {
      // 모든 일정이 완료되면 축하 모달 표시 (한 번만)
      const timer = setTimeout(() => {
        setShowCelebration(true);
        setCelebrationShown(true);
      }, 300);
      return () => clearTimeout(timer);
    } else if (!allCompleted) {
      // 완료가 해제되면 모달 닫기 및 플래그 리셋
      setShowCelebration(false);
      setCelebrationShown(false);
    }
  }, [allCompleted, showCelebration, celebrationShown]);

  const handleToggleComplete = (itemId: string) => {
    const item = scheduleItems.find(i => i.id === itemId);
    if (item) {
      const wasCompleted = item.status === 'completed';
      const newStatus = wasCompleted ? 'planned' : 'completed';
      
      // 현재 완료된 항목 수 계산
      const currentCompletedCount = scheduleItems.filter(i => i.status === 'completed').length;
      const willBeCompletedCount = newStatus === 'completed' 
        ? currentCompletedCount + (wasCompleted ? 0 : 1)
        : currentCompletedCount - (wasCompleted ? 1 : 0);
      
      // 마지막 활동 완료인지 확인
      const isLastActivity = willBeCompletedCount === totalItems && newStatus === 'completed';
      
      updateScheduleItem(itemId, { status: newStatus });
      
      // 완료 체크 시 박수 애니메이션 표시 (마지막 활동이 아닐 때만)
      if (!wasCompleted && newStatus === 'completed' && !isLastActivity) {
        console.log('🎉 Activity completed, showing clap animation');
        setShowClapAnimation(true);
      } else if (isLastActivity) {
        console.log('🎉 Last activity completed, will show celebration modal');
        // 마지막 활동이면 박수 팝업은 표시하지 않고, useEffect에서 완료 팝업이 표시됨
      }
    }
  };

  const handleToggleNotification = async (itemId: string) => {
    const item = scheduleItems.find(i => i.id === itemId);
    if (!item) return;

    const newEnabled = !notifications[itemId];
    
    // 상태 업데이트
    const updatedNotifications = {
      ...notifications,
      [itemId]: newEnabled,
    };
    setNotifications(updatedNotifications);

    // AsyncStorage에 저장
    await saveNotificationSettings(updatedNotifications);

    // 알림 스케줄링/취소
    if (isViewingToday) {
      if (newEnabled) {
        await scheduleActivityNotification(item, true);
      } else {
        await cancelActivityNotification(itemId);
      }
    }
  };

  const handleGoToToday = () => {
    setSelectedDate(new Date());
    setShowCelebration(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowCelebration(false);
  };

  const handleCopyToToday = () => {
    const today = new Date();
    const todaySchedule = getScheduleForDate(today);
    
    // 오늘 이미 일정이 있는지 확인
    if (todaySchedule && todaySchedule.items.length > 0) {
      Alert.alert(
        '일정 복사',
        '오늘 이미 일정이 있습니다. 기존 일정을 삭제하고 복사하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '삭제하고 복사', 
            style: 'destructive',
            onPress: () => {
              // 기존 일정 삭제 후 복사
              const success = copyScheduleToDate(selectedDate, today);
              if (success) {
                setSelectedDate(today);
                Alert.alert('완료', '일정을 오늘로 복사했습니다.');
              } else {
                Alert.alert('오류', '일정 복사에 실패했습니다.');
              }
            }
          },
        ]
      );
    } else {
      // 오늘 일정이 없으면 바로 복사
      Alert.alert(
        '일정 복사',
        `${selectedDate.toLocaleDateString('ko-KR')} 일정을 오늘로 복사하시겠습니까?`,
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '복사', 
            onPress: () => {
              const success = copyScheduleToDate(selectedDate, today);
              if (success) {
                setSelectedDate(today);
                Alert.alert('완료', '일정을 오늘로 복사했습니다. 오늘 날짜로 이동합니다.');
              } else {
                Alert.alert('오류', '일정 복사에 실패했습니다.');
              }
            }
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView 
      style={[styles.container, isLandscape && styles.containerLandscape]} 
      edges={isLandscape ? [] : ['top']}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[styles.content, isLandscape && styles.contentLandscape]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.title}>
                  {isViewingToday ? '오늘의 일정' : '일정 이력'}
                </Text>
                <Text style={styles.selectedDateText}>
                  {selectedDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </Text>
              </View>
              {!isViewingToday && (
                <Pressable
                  style={({ pressed }) => [
                    styles.todayButton,
                    pressed && styles.todayButtonPressed
                  ]}
                  onPress={handleGoToToday}
                >
                  <MaterialIcons
                    name="today"
                    size={20}
                    color={SoftPopColors.white}
                  />
                  <Text style={styles.todayButtonText}>오늘</Text>
                </Pressable>
              )}
            </View>
            {isViewingPast && (
              <View style={styles.pastBadge}>
                <Text style={styles.pastBadgeText}>과거</Text>
              </View>
            )}
          </View>
          
          {/* Horizontal Date Picker - 카드 안으로 이동 */}
          <View style={styles.datePickerContainer}>
            <HorizontalDatePicker
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              schedules={schedules}
            />
          </View>
        </View>

        {/* Progress Card with Stats */}
        {scheduleItems.length > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressCardHeader}>
              <Text style={styles.progressCardIcon}>
                {isViewingPast ? '📊' : '⭐'}
              </Text>
              <Text style={styles.progressCardTitle}>
                {isViewingPast ? '달성 결과' : '진행 상황'}
              </Text>
              <Text style={[
                styles.progressPercentage,
                dayStats.completionRate === 100 && styles.progressPercentagePerfect
              ]}>
                {Math.round(dayStats.completionRate)}%
              </Text>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${dayStats.completionRate}%` },
                    dayStats.completionRate === 100 && styles.progressFillPerfect
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                {dayStats.completedItems}/{dayStats.totalItems}
              </Text>
            </View>

            {/* Stats Detail */}
            <View style={styles.statsDetail}>
              <View style={styles.statItem}>
                <MaterialIcons
                  name="check-circle"
                  size={20}
                  color={SoftPopColors.success}
                />
                <Text style={styles.statText}>
                  완료 {dayStats.completedItems}개
                </Text>
              </View>
              {dayStats.missedItems > 0 && (
                <View style={styles.statItem}>
                  <MaterialIcons
                    name="cancel"
                    size={20}
                    color={SoftPopColors.error}
                  />
                  <Text style={styles.statText}>
                    놓침 {dayStats.missedItems}개
                  </Text>
                </View>
              )}
              <View style={styles.statItem}>
                <MaterialIcons
                  name="schedule"
                  size={20}
                  color={SoftPopColors.textSecondary}
                />
                <Text style={styles.statText}>
                  {dayStats.completedMinutes}/{dayStats.totalMinutes}분
                </Text>
              </View>
            </View>

            {/* Copy Button for Past Days */}
            {isViewingPast && scheduleItems.length > 0 && (
              <Pressable
                style={({ pressed }) => [
                  styles.copyButton,
                  pressed && styles.copyButtonPressed
                ]}
                onPress={handleCopyToToday}
              >
                <MaterialIcons
                  name="content-copy"
                  size={20}
                  color={SoftPopColors.primary}
                />
                <Text style={styles.copyButtonText}>
                  이 일정을 오늘로 복사
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Current & Next Activity Cards (Today Only) */}
        {scheduleItems.length > 0 && isViewingToday && (
          <View style={styles.highlightSection}>
            {/* Current Activity */}
            {currentActivity && (
              <View style={styles.currentActivityCard}>
                <View style={styles.currentActivityHeader}>
                  <MaterialIcons
                    name="play-circle"
                    size={28}
                    color={SoftPopColors.primary}
                  />
                  <Text style={styles.currentActivityTitle}>지금 할 시간!</Text>
                </View>
                <View style={styles.currentActivityContent}>
                  <Text style={styles.currentActivityEmoji}>
                    {ActivityEmojis[currentActivity.activity?.emojiKey || ''] || '📌'}
                  </Text>
                  <View style={styles.currentActivityInfo}>
                    <Text style={styles.currentActivityName}>
                      {currentActivity.activity?.name}
                    </Text>
                    <Text style={styles.currentActivityTime}>
                      {currentActivity.startTime} - {currentActivity.endTime}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Next Activity */}
            {nextActivity && !currentActivity && (
              <View style={styles.nextActivityCard}>
                <View style={styles.nextActivityHeader}>
                  <MaterialIcons
                    name="schedule"
                    size={20}
                    color={SoftPopColors.textSecondary}
                  />
                  <Text style={styles.nextActivityTitle}>다음 활동</Text>
                  <Text style={styles.nextActivityTimeUntil}>
                    {formatRemainingTime(getMinutesUntil(nextActivity.startTime, currentTime))}
                  </Text>
                </View>
                <View style={styles.nextActivityContent}>
                  <Text style={styles.nextActivityEmoji}>
                    {ActivityEmojis[nextActivity.activity?.emojiKey || ''] || '📌'}
                  </Text>
                  <Text style={styles.nextActivityName}>
                    {nextActivity.activity?.name}
                  </Text>
                  <Text style={styles.nextActivityTime}>
                    {nextActivity.startTime}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Schedule Items or Empty State */}
        {scheduleItems.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons 
              name="calendar-today" 
              size={64} 
              color={SoftPopColors.textSecondary} 
            />
            <Text style={styles.emptyTitle}>아직 일정이 없어요</Text>
            <Text style={styles.emptyMessage}>
              일정 만들기 페이지에서 오늘의 일과를 계획해보세요!
            </Text>
          </View>
        ) : (
          <View style={styles.scheduleItemsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {isViewingToday ? '오늘의 할 일' : '일정 목록'}
              </Text>
              {isViewingPast && (
                <View style={styles.readOnlyBadge}>
                  <MaterialIcons
                    name="lock"
                    size={14}
                    color={SoftPopColors.textSecondary}
                  />
                  <Text style={styles.readOnlyText}>읽기 전용</Text>
                </View>
              )}
            </View>
            
            {sortedItems.map((item) => {
              const itemStatus = isViewingToday 
                ? getItemStatus(item, currentTime, selectedDate)
                : isViewingFuture
                  ? getItemStatus(item, currentTime, selectedDate)
                  : item.status === 'completed' 
                    ? 'completed' 
                    : 'missed';
              
              return (
                <TodayScheduleItem
                  key={item.id}
                  scheduleItem={item}
                  itemStatus={itemStatus}
                  onToggleComplete={() => {
                    if (isViewingPast) {
                      Alert.alert('읽기 전용', '과거 일정은 수정할 수 없습니다.');
                    } else if (isViewingFuture) {
                      Alert.alert('미래 일정', '미래 일정은 아직 완료할 수 없습니다.');
                    } else {
                      handleToggleComplete(item.id);
                    }
                  }}
                  onToggleNotification={isViewingToday ? () => handleToggleNotification(item.id) : undefined}
                  notificationEnabled={notifications[item.id] || false}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Celebration Modal (Today Only) */}
      {isViewingToday && (
        <CelebrationModal
          visible={showCelebration}
          onClose={() => {
            console.log('Celebration modal closed');
            setShowCelebration(false);
            // celebrationShown은 유지하여 다시 열리지 않도록 함
          }}
        />
      )}
      
      {/* Clap Animation (활동 완료 시) */}
      <ClapAnimation
        visible={showClapAnimation}
        onAnimationFinish={() => {
          setShowClapAnimation(false);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SoftPopColors.background, // Cream
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 32,
    paddingBottom: 120, // Tab bar height + safe margin
  },
  header: {
    padding: 32,
    paddingBottom: 20,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24, // rounded-3xl
    marginBottom: 20,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: SoftPopColors.text,
    marginBottom: 8,
    lineHeight: 36,
    fontFamily: 'BMJUA',
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: SoftPopColors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28, // rounded-full
    gap: 8,
    minHeight: 56,
    // 3D pressable effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  todayButtonPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  todayButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: SoftPopColors.white,
    fontFamily: 'BMJUA',
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '500',
    color: SoftPopColors.textSecondary,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  pastBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: SoftPopColors.textSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pastBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: SoftPopColors.white,
    fontFamily: 'BMJUA',
  },
  datePickerContainer: {
    marginTop: 20,
  },
  progressCard: {
    backgroundColor: SoftPopColors.white,
    borderRadius: 24, // rounded-3xl
    padding: 32,
    marginTop: 20,
    marginBottom: 40,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  progressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  progressCardIcon: {
    fontSize: 28,
  },
  progressCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SoftPopColors.text,
    flex: 1,
    fontFamily: 'BMJUA',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: SoftPopColors.primary,
    fontFamily: 'BMJUA',
  },
  progressPercentagePerfect: {
    color: SoftPopColors.success,
  },
  progressFillPerfect: {
    backgroundColor: SoftPopColors.success,
  },
  statsDetail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: SoftPopColors.background,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 24, // rounded-3xl
    backgroundColor: '#FFF0F0',
    borderWidth: 2,
    borderColor: SoftPopColors.primary,
    // 3D pressable effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  copyButtonPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  copyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: SoftPopColors.primary,
    fontFamily: 'BMJUA',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: SoftPopColors.background,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: SoftPopColors.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600',
    color: SoftPopColors.text,
    minWidth: 48,
    textAlign: 'right',
    fontFamily: 'BMJUA',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 56,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24, // rounded-3xl
    borderWidth: 3,
    borderColor: SoftPopColors.textSecondary,
    borderStyle: 'dashed',
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: SoftPopColors.text,
    marginBottom: 12,
    fontFamily: 'BMJUA',
  },
  emptyMessage: {
    fontSize: 16,
    fontWeight: '500',
    color: SoftPopColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  highlightSection: {
    marginBottom: 32,
    gap: 20,
  },
  currentActivityCard: {
    backgroundColor: '#FFF0F0',
    borderRadius: 24, // rounded-3xl
    padding: 24,
    borderWidth: 4,
    borderColor: SoftPopColors.primary,
    // Strong shadow for emphasis
    shadowColor: SoftPopColors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  currentActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  currentActivityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SoftPopColors.primary,
    fontFamily: 'BMJUA',
  },
  currentActivityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  currentActivityEmoji: {
    fontSize: 52,
  },
  currentActivityInfo: {
    flex: 1,
  },
  currentActivityName: {
    fontSize: 22,
    fontWeight: '600',
    color: SoftPopColors.text,
    marginBottom: 8,
    lineHeight: 28,
    fontFamily: 'BMJUA',
  },
  currentActivityTime: {
    fontSize: 18,
    fontWeight: '500',
    color: SoftPopColors.textSecondary,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  nextActivityCard: {
    backgroundColor: SoftPopColors.white,
    borderRadius: 24, // rounded-3xl
    padding: 20,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  nextActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  nextActivityTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: SoftPopColors.textSecondary,
    textTransform: 'uppercase',
    flex: 1,
    letterSpacing: 0.5,
    fontFamily: 'BMJUA',
  },
  nextActivityTimeUntil: {
    fontSize: 14,
    fontWeight: '700',
    color: SoftPopColors.primary,
    fontFamily: 'BMJUA',
  },
  nextActivityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextActivityEmoji: {
    fontSize: 28,
  },
  nextActivityName: {
    fontSize: 18,
    fontWeight: '600',
    color: SoftPopColors.text,
    flex: 1,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  nextActivityTime: {
    fontSize: 16,
    fontWeight: '500',
    color: SoftPopColors.textSecondary,
    lineHeight: 22,
    fontFamily: 'BMJUA',
  },
  scheduleItemsContainer: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
  },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: SoftPopColors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  readOnlyText: {
    fontSize: 12,
    fontWeight: '600',
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
  },
});

