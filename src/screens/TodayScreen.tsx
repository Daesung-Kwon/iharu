/**
 * 오늘의 일정 화면 (대시보드)
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform, Linking, AppState } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSchedule } from '../contexts/ScheduleContext';
import { AdBanner } from '../components/AdBanner';
import TodayScheduleItem from '../components/TodayScheduleItem';
import CelebrationModal from '../components/CelebrationModal';
import HorizontalDatePicker from '../components/HorizontalDatePicker';
import ClapAnimation from '../components/ClapAnimation';
import WeekStrip from '../components/WeekStrip';
import { getItemStatus, getNextActivity, getCurrentActivity, getMinutesUntil, formatRemainingTime } from '../utils/timeUtils';
import { calculateDayStats, isToday, isPast, isFuture } from '../utils/statsUtils';
import { toLocalDateString } from '../utils/dateUtils';
import { playCompleteFeedback } from '../utils/feedback';
import { getUndoStatus, planToggleComplete } from '../utils/completionLogic';
import ActivityIcon from '../components/ActivityIcon';
import Toast from '../components/Toast';
import { SoftPopColors } from '../constants/theme';
import { getClayShadow, getInFlowBottomLayout, useLayout } from '../hooks/useLayout';
import {
  getNotificationPermissionStatus,
  requestNotificationPermissions,
  loadNotificationSettings,
  saveNotificationSettings,
  scheduleActivityNotification,
  rescheduleUpcomingNotifications,
  cancelActivityNotification,
  loadNotificationLeadMinutes,
} from '../services/notificationService';

export default function TodayScreen() {
  const {
    isCompact,
    isLandscape,
    space,
    titleSize,
    dateCardWidth,
    tabBarOffset,
    insets,
    cardPad,
    cardRadius,
    isPhone,
    isSmallPhone,
    showDatePicker,
  } = useLayout();
  const clayShadow = getClayShadow(isCompact);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const {
    selectedDate,
    setSelectedDate,
    getScheduleForDate,
    updateScheduleItem,
    schedules,
    copyScheduleToDate,
  } = useSchedule();
  const selectedSchedule = getScheduleForDate(selectedDate);
  const scheduleItems = selectedSchedule?.items || [];
  const [showCelebration, setShowCelebration] = useState(false);
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Ad sits in layout flow; 0 until the banner has actually loaded (or failed → null).
  const [adHeight, setAdHeight] = useState(0);
  const [showClapAnimation, setShowClapAnimation] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastActionLabel, setToastActionLabel] = useState<string | undefined>();
  const toastActionRef = useRef<(() => void) | undefined>(undefined);

  const selectedDateString = toLocalDateString(selectedDate);
  const isViewingToday = isToday(selectedDateString);
  const isViewingPast = isPast(selectedDateString);
  const isViewingFuture = isFuture(selectedDateString);
  const dayStats = calculateDayStats(selectedSchedule);
  const schedulesRef = useRef(schedules);
  schedulesRef.current = schedules;

  useEffect(() => {
    const initializeApp = async () => {
      const savedSettings = await loadNotificationSettings();
      setNotifications(savedSettings);
    };

    initializeApp();
  }, []);

  const rescheduleNotifications = useCallback(async () => {
    const permStatus = await getNotificationPermissionStatus();
    if (permStatus !== 'granted') return;
    const savedSettings = await loadNotificationSettings();
    setNotifications(savedSettings);
    await rescheduleUpcomingNotifications(schedulesRef.current, savedSettings);
  }, []);

  useFocusEffect(
    useCallback(() => {
      rescheduleNotifications();
    }, [rescheduleNotifications])
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        rescheduleNotifications();
      }
    });
    return () => sub.remove();
  }, [rescheduleNotifications]);

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

  // Celebration is triggered by the completing action itself (button or swipe,
  // see planToggleComplete) so both paths behave the same and it never fires
  // twice or just from opening an already-finished day. Here we only close it
  // (and cancel a pending open) when the day is no longer fully completed.
  useEffect(() => {
    if (!allCompleted) {
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
        celebrationTimerRef.current = null;
      }
      setShowCelebration(false);
    }
  }, [allCompleted]);

  useEffect(() => () => {
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
  }, []);

  const bottomLayout = getInFlowBottomLayout({
    tabBarOffset,
    adHeight,
    isCompact,
    // Android SafeAreaView pads the bottom edge itself (see `edges` below).
    safeAreaBottomApplied: !isLandscape && Platform.OS === 'android' ? insets.bottom : 0,
  });

  const showToast = (message: string, action?: { label: string; onPress: () => void }) => {
    setToastMessage(message);
    setToastActionLabel(action?.label);
    toastActionRef.current = action?.onPress;
    setToastVisible(true);
  };

  const handleToggleComplete = (
    itemId: string,
    source: 'button' | 'swipe' = 'button',
  ) => {
    const plan = planToggleComplete(scheduleItems, itemId, source);
    if (!plan) return;

    updateScheduleItem(itemId, { status: plan.nextStatus });

    if (plan.haptic) {
      playCompleteFeedback();
    }
    if (plan.undoToast) {
      // Undo writes the explicit pre-swipe status. It must not call
      // handleToggleComplete again: that closure holds this render's
      // scheduleItems, where the item is still un-completed, so it would
      // "toggle" it to completed again.
      const undoStatus = getUndoStatus(plan);
      showToast('완료했어요', {
        label: '취소',
        onPress: () => updateScheduleItem(itemId, { status: undoStatus }),
      });
    }
    if (plan.clap) {
      setShowClapAnimation(true);
    }
    if (plan.celebrate) {
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      // Short delay so the swipe row / checkbox animation settles first.
      celebrationTimerRef.current = setTimeout(() => {
        celebrationTimerRef.current = null;
        setShowCelebration(true);
      }, 300);
    }
  };

  const handleToggleNotification = async (itemId: string) => {
    const item = scheduleItems.find(i => i.id === itemId);
    if (!item) return;

    const newEnabled = !notifications[itemId];

    // 알림 ON: 먼저 권한 확인/요청
    if (newEnabled) {
      const permStatus = await getNotificationPermissionStatus();
      if (permStatus !== 'granted') {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          Alert.alert(
            '알림 권한 필요',
            '알림을 사용하려면 설정에서 권한을 허용해주세요.',
            [
              { text: '취소', style: 'cancel' },
              { text: '설정 열기', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
      }
    }

    const updatedNotifications = {
      ...notifications,
      [itemId]: newEnabled,
    };

    if (newEnabled) {
      const result = await scheduleActivityNotification(item, true, selectedDate);
      if (result === 'scheduled') {
        setNotifications(updatedNotifications);
        await saveNotificationSettings(updatedNotifications);
        const lead = await loadNotificationLeadMinutes();
        showToast(
          lead === 0
            ? `${item.activity?.name || '활동'} 시작 시간에 알림을 보내드릴게요`
            : `${item.activity?.name || '활동'} ${lead}분 전에 알림을 보내드릴게요`
        );
        return;
      }
      if (result === 'master_off') {
        setNotifications(updatedNotifications);
        await saveNotificationSettings(updatedNotifications);
        showToast('설정에서 알림을 켜면 예약됩니다');
        return;
      }
      if (result === 'past') {
        showToast('이미 지난 시간이라 알림을 예약하지 않았어요');
        return;
      }
      showToast('알림을 예약하지 못했어요');
      return;
    }

    setNotifications(updatedNotifications);
    await saveNotificationSettings(updatedNotifications);
    await cancelActivityNotification(itemId);
    showToast('알림이 해제되었어요');
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
              const success = copyScheduleToDate(selectedDate, today, { overwrite: true });
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
      edges={isLandscape
        ? []
        : Platform.OS === 'android'
          ? ['top', 'bottom'] // Android만 bottom 추가
          : ['top'] // iOS는 기존 유지
      }
    >
      <View style={styles.mainColumn}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          // Viewport already ends above ad + tab bar (in-flow layout below),
          // so the content only needs breathing room, not chrome height.
          { padding: space, paddingBottom: bottomLayout.scrollEndGap },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={[
          styles.header,
          clayShadow,
          {
            padding: isPhone ? cardPad : space,
            paddingBottom: isPhone ? (isSmallPhone ? 8 : 10) : isCompact ? 12 : 20,
            borderRadius: cardRadius,
            marginBottom: isPhone ? space : 20,
          },
        ]}>
          {isPhone ? (
            /* Phones: one-line title + short date; WeekStrip (full) is the
               only date UI. 오늘 pill appears when another day is selected. */
            <View style={styles.phoneHeaderRow}>
              <View style={styles.phoneTitleGroup}>
                <Text
                  style={[styles.phoneTitle, { fontSize: titleSize, lineHeight: titleSize + 8 }]}
                  accessibilityRole="header"
                >
                  {isViewingToday ? '오늘의 일정' : '일정 이력'}
                </Text>
                <Text style={styles.phoneDateText}>
                  {selectedDate.toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short',
                  })}
                </Text>
              </View>
              {!isViewingToday && (
                <Pressable
                  style={({ pressed }) => [
                    styles.todayButton,
                    styles.todayButtonPhone,
                    { backgroundColor: SoftPopColors.today },
                    pressed && styles.todayButtonPressed
                  ]}
                  onPress={handleGoToToday}
                  accessibilityRole="button"
                  accessibilityLabel="오늘로 돌아가기"
                >
                  <MaterialIcons
                    name="today"
                    size={18}
                    color={SoftPopColors.white}
                  />
                  <Text style={[styles.todayButtonText, styles.todayButtonTextPhone]}>오늘</Text>
                </Pressable>
              )}
            </View>
          ) : (
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <View style={styles.headerTitleContainer}>
                <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleSize + 8 }]}>
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
                    { backgroundColor: SoftPopColors.today },
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
          )}

          {/* Tablet: horizontal date picker + week summary dots.
              Phones: a single WeekStrip with day numbers and week arrows. */}
          {showDatePicker && (
            <View style={styles.datePickerContainer}>
              <HorizontalDatePicker
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                schedules={schedules}
                cardWidth={dateCardWidth}
              />
            </View>
          )}

          <WeekStrip
            selectedDate={selectedDate}
            schedules={schedules}
            onDateSelect={handleDateSelect}
            variant={showDatePicker ? 'summary' : 'full'}
            dense={isSmallPhone}
          />
        </View>

        {scheduleItems.length > 0 && isViewingToday && (currentActivity || nextActivity) && (
          <View style={[
            styles.highlightSection,
            isCompact && styles.highlightSectionCompact,
            isPhone && { marginBottom: space, gap: space },
          ]}>
            {currentActivity && (
              <View style={[
                styles.currentActivityCard,
                isPhone && styles.currentActivityCardPhone,
                { padding: cardPad, borderRadius: cardRadius },
              ]}>
                <View style={[styles.currentActivityHeader, isPhone && styles.currentActivityHeaderPhone]}>
                  <MaterialIcons
                    name="play-circle"
                    size={isPhone ? 22 : 28}
                    color={SoftPopColors.now}
                  />
                  <Text style={[
                    styles.currentActivityTitle,
                    isPhone && styles.currentActivityTitlePhone,
                    { color: SoftPopColors.now },
                  ]}>
                    지금 할 시간!
                  </Text>
                </View>
                <View style={[styles.currentActivityContent, isPhone && styles.currentActivityContentPhone]}>
                  <View style={styles.currentActivityIconWrapper}>
                    <ActivityIcon
                      activity={currentActivity.activity}
                      size={isSmallPhone ? 36 : isCompact ? 44 : 52}
                      color={SoftPopColors.now}
                    />
                  </View>
                  <View style={styles.currentActivityInfo}>
                    <Text
                      style={[styles.currentActivityName, isPhone && styles.currentActivityNamePhone]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      lineBreakStrategyIOS="hangul-word"
                    >
                      {currentActivity.activity?.name}
                    </Text>
                    <Text style={[styles.currentActivityTime, isPhone && styles.currentActivityTimePhone]}>
                      {currentActivity.startTime} - {currentActivity.endTime}
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.completeNowButton,
                    isPhone && styles.completeNowButtonPhone,
                    pressed && styles.completeNowButtonPressed,
                  ]}
                  onPress={() => handleToggleComplete(currentActivity.id, 'button')}
                  accessibilityLabel="지금 활동 완료"
                  accessibilityRole="button"
                >
                  <MaterialIcons name="check-circle" size={22} color={SoftPopColors.white} />
                  <Text style={styles.completeNowButtonText}>완료했어요</Text>
                </Pressable>
              </View>
            )}

            {nextActivity && !currentActivity && (
              <View style={[styles.nextActivityCard, isPhone && { padding: cardPad, borderRadius: cardRadius }]}>
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
                  <View style={styles.nextActivityIconWrapper}>
                    <ActivityIcon
                      activity={nextActivity.activity}
                      size={28}
                      color={SoftPopColors.text}
                    />
                  </View>
                  <Text
                    style={styles.nextActivityName}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    lineBreakStrategyIOS="hangul-word"
                  >
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

        {/* Progress Card with Stats */}
        {scheduleItems.length > 0 && (
          <View style={[
            styles.progressCard,
            clayShadow,
            {
              padding: isPhone ? cardPad : space,
              borderRadius: cardRadius,
              marginBottom: isPhone ? space : isCompact ? 20 : 40,
            },
            // Phones: the header / highlight section above already provide the gap.
            isPhone && { marginTop: 0 },
          ]}>
            {isSmallPhone ? (
              /* iPhone SE class: a single compact row (icon · title · bar · n/m · %). */
              <View
                style={styles.progressInlineRow}
                accessible
                accessibilityLabel={`${isViewingPast ? '달성 결과' : '진행 상황'} ${dayStats.completedItems}/${dayStats.totalItems}, ${Math.round(dayStats.completionRate)}%`}
              >
                <Text style={styles.progressInlineIcon}>{isViewingPast ? '📊' : '⭐'}</Text>
                <Text style={styles.progressInlineTitle}>
                  {isViewingPast ? '달성 결과' : '진행 상황'}
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${dayStats.completionRate}%` },
                      dayStats.completionRate === 100 && styles.progressFillPerfect,
                    ]}
                  />
                </View>
                <Text style={styles.progressInlineCount}>
                  {dayStats.completedItems}/{dayStats.totalItems}
                </Text>
                <Text style={[
                  styles.progressInlinePercent,
                  dayStats.completionRate === 100 && styles.progressPercentagePerfect,
                ]}>
                  {Math.round(dayStats.completionRate)}%
                </Text>
              </View>
            ) : (
            <>
            <View style={[styles.progressCardHeader, isPhone && styles.progressCardHeaderPhone]}>
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
                    dayStats.completionRate === 100 && styles.progressFillPerfect,
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {dayStats.completedItems}/{dayStats.totalItems}
              </Text>
            </View>

            {/* Stats Detail */}
            <View style={[styles.statsDetail, isPhone && styles.statsDetailPhone]}>
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
            </>
            )}

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

        {scheduleItems.length === 0 ? (
          <View style={[
            styles.emptyState,
            clayShadow,
            {
              borderRadius: cardRadius,
              paddingVertical: isCompact ? 32 : 56,
            },
          ]}>
            <MaterialIcons
              name="calendar-today"
              size={64}
              color={SoftPopColors.textSecondary}
            />
            <Text style={styles.emptyTitle}>아직 일정이 없어요</Text>
            <Text style={styles.emptyMessage}>
              일정 만들기에서 오늘의 일과를 계획해보세요!
            </Text>
            <Pressable
              style={({ pressed }) => [
                styles.emptyCta,
                pressed && styles.emptyCtaPressed,
              ]}
              onPress={() => navigation.navigate('PlanSchedule')}
              accessibilityLabel="일정 만들기"
              accessibilityRole="button"
            >
              <MaterialIcons name="event-note" size={22} color={SoftPopColors.white} />
              <Text style={styles.emptyCtaText}>일정 만들기</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.scheduleItemsContainer}>
            <View style={[styles.sectionHeader, isPhone && styles.sectionHeaderPhone]}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
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

            {!isViewingPast && (
              <Text style={[styles.swipeHint, isPhone && styles.swipeHintPhone]}>
                오른쪽으로 밀면 완료, 왼쪽으로 밀면 알림
              </Text>
            )}

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
                  swipeEnabled={!isViewingPast && !isViewingFuture}
                  onToggleComplete={() => {
                    if (isViewingPast) {
                      Alert.alert('읽기 전용', '과거 일정은 수정할 수 없습니다.');
                    } else if (isViewingFuture) {
                      Alert.alert('미래 일정', '미래 일정은 아직 완료할 수 없습니다.');
                    } else {
                      handleToggleComplete(item.id, 'button');
                    }
                  }}
                  onSwipeComplete={() => {
                    if (!isViewingPast && !isViewingFuture) {
                      handleToggleComplete(item.id, 'swipe');
                    }
                  }}
                  onToggleNotification={(isViewingToday || isViewingFuture) ? () => handleToggleNotification(item.id) : undefined}
                  notificationEnabled={notifications[item.id] || false}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Ad Banner - in layout flow above the floating tab bar, so it never
          covers scroll content (e.g. the 완료했어요 CTA on iPhone SE). Takes
          no space until the banner loads; AdBanner renders null on error. */}
      <View
        onLayout={(e) => {
          const h = Math.round(e.nativeEvent.layout.height);
          setAdHeight(prev => (prev === h ? prev : h));
        }}
      >
        <AdBanner />
      </View>
      {/* Floating tab bar is position:absolute; keep its footprint clear. */}
      <View style={{ height: bottomLayout.tabBarSpacer }} />
      </View>

      {/* Celebration Modal (Today Only) */}
      {isViewingToday && (
        <CelebrationModal
          visible={showCelebration}
          onClose={() => {
            console.log('Celebration modal closed');
            setShowCelebration(false);
            // 완료 동작에서만 열리므로 닫은 뒤 다시 열리지 않음
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

      <Toast
        message={toastMessage}
        visible={toastVisible}
        duration={toastActionLabel ? 4000 : 2000}
        actionLabel={toastActionLabel}
        onAction={toastActionRef.current}
        bottomOffset={bottomLayout.toastBottom}
        onHide={() => {
          setToastVisible(false);
          setToastActionLabel(undefined);
          toastActionRef.current = undefined;
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
  mainColumn: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 32,
  },
  header: {
    padding: 32,
    paddingBottom: 20,
    backgroundColor: SoftPopColors.white,
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
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
    // Android에서는 fontWeight 제거 (커스텀 폰트와 충돌)
    ...(Platform.OS === 'ios' && {
      fontWeight: '700',
    }),
    color: SoftPopColors.text,
    marginBottom: 8,
    lineHeight: 36,
    fontFamily: 'BMJUA',
    // Android 폰트 렌더링 최적화
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
      textAlignVertical: 'center',
    }),
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
  todayButtonPhone: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 4,
    minHeight: 44,
    borderRadius: 22,
  },
  todayButtonTextPhone: {
    fontSize: 16,
  },
  phoneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  phoneTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    columnGap: 8,
  },
  phoneTitle: {
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
    ...(Platform.OS === 'ios' && {
      fontWeight: '700',
    }),
    ...(Platform.OS === 'android' && {
      includeFontPadding: false,
    }),
  },
  phoneDateText: {
    fontSize: 15,
    lineHeight: 20,
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
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
    borderRadius: 24,
    padding: 32,
    marginTop: 20,
    marginBottom: 40,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
  },
  progressCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  progressCardHeaderPhone: {
    marginBottom: 10,
    gap: 8,
  },
  statsDetailPhone: {
    gap: 14,
    marginTop: 12,
    paddingTop: 12,
  },
  progressInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 28,
  },
  progressInlineIcon: {
    fontSize: 18,
  },
  progressInlineTitle: {
    fontSize: 16,
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
  },
  progressInlineCount: {
    fontSize: 15,
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
  },
  progressInlinePercent: {
    fontSize: 17,
    color: SoftPopColors.today,
    fontFamily: 'BMJUA',
    minWidth: 40,
    textAlign: 'right',
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
    color: SoftPopColors.today,
    fontFamily: 'BMJUA',
  },
  progressPercentagePerfect: {
    color: SoftPopColors.complete,
  },
  progressFillPerfect: {
    backgroundColor: SoftPopColors.complete,
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
    backgroundColor: SoftPopColors.today,
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
  containerLandscape: {
    flexDirection: 'row',
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
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    backgroundColor: SoftPopColors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  emptyCtaPressed: {
    transform: [{ translateY: 2 }],
    shadowOpacity: 0.12,
  },
  emptyCtaText: {
    fontSize: 18,
    color: SoftPopColors.white,
    fontFamily: 'BMJUA',
  },
  completeNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: SoftPopColors.complete,
    paddingVertical: 14,
    borderRadius: 20,
  },
  completeNowButtonPhone: {
    marginTop: 10,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 18,
  },
  completeNowButtonPressed: {
    transform: [{ translateY: 2 }],
    opacity: 0.9,
  },
  completeNowButtonText: {
    fontSize: 18,
    color: SoftPopColors.white,
    fontFamily: 'BMJUA',
  },
  highlightSection: {
    marginBottom: 32,
    gap: 20,
  },
  highlightSectionCompact: {
    marginBottom: 20,
  },
  currentActivityCard: {
    backgroundColor: SoftPopColors.nowSurface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 4,
    borderColor: SoftPopColors.now,
    shadowColor: SoftPopColors.now,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 8,
  },
  currentActivityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  currentActivityCardPhone: {
    borderWidth: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  currentActivityHeaderPhone: {
    gap: 6,
    marginBottom: 8,
  },
  currentActivityTitlePhone: {
    fontSize: 16,
    lineHeight: 22,
  },
  currentActivityContentPhone: {
    gap: 12,
  },
  currentActivityNamePhone: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 2,
  },
  currentActivityTimePhone: {
    fontSize: 15,
    lineHeight: 20,
  },
  currentActivityTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: SoftPopColors.now,
    fontFamily: 'BMJUA',
  },
  currentActivityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  currentActivityIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
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
    color: SoftPopColors.now,
    fontFamily: 'BMJUA',
  },
  nextActivityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextActivityIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
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
  sectionHeaderPhone: {
    marginBottom: 0,
  },
  swipeHintPhone: {
    marginBottom: 0,
    marginTop: -4,
  },
  swipeHint: {
    fontSize: 13,
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
    marginBottom: 8,
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

