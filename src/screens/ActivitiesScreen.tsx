/**
 * 활동 관리 화면
 * 자주 하는 활동을 추가/수정/삭제
 *
 * The header card stays fixed and collapses to a one-line bar as the list
 * scrolls. The list still ends with scrollEndPadding so the last row clears
 * the tab bar, and it scrolls behind the bar once the collapse is done.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Alert, Animated } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import CollapsingHeader from '../components/CollapsingHeader';
import { MaterialIcons } from '@expo/vector-icons';
import { IhIcon } from '../components/icons/IhIcon';
import { useActivity } from '../contexts/ActivityContext';
import { useSchedule } from '../contexts/ScheduleContext';
import { groupActivitiesByUsage } from '../utils/activityGroups';
import ActivityCard from '../components/ActivityCard';
import ActivityFormModal from '../components/ActivityFormModal';
import { Activity } from '../types';
import { BrandAccent, SoftPopColors } from '../constants/theme';
import { getClayShadow, MIN_TOUCH_TARGET, useLayout } from '../hooks/useLayout';
import { useCollapsingHeader } from '../hooks/useCollapsingHeader';
import {
  activityCollapsingMetrics,
  activityHeaderType,
  activityListPadding,
} from './activityHeader';

/** One horizontal band per row so every card is inside the scroll height. */
function chunkIntoRows<T>(items: readonly T[], columns: number): T[][] {
  const size = Math.max(1, columns);
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

const systemFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

function AddActivityButton({ onPress, label, icon, iconSize }: {
  onPress: () => void;
  label: string;
  icon: string;
  iconSize: number;
}) {
  return (
    <Pressable
      testID="activity-add-button"
      style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <IhIcon name={icon} size={iconSize} color={SoftPopColors.white} />
      <Text style={styles.addButtonText}>{label}</Text>
    </Pressable>
  );
}

export default function ActivitiesScreen() {
  const {
    width,
    isCompact,
    isLandscape,
    space,
    titleSize,
    activityColumns,
    scrollEndPadding,
    cardRadius,
    isSmallPhone,
  } = useLayout();
  const clayShadow = getClayShadow(isCompact);
  const { activities, addActivity, updateActivity, deleteActivity } = useActivity();
  const { schedules } = useSchedule();
  const groups = useMemo(() => groupActivitiesByUsage(activities, schedules), [activities, schedules]);
  const headerType = activityHeaderType(titleSize);
  const headerMetrics = activityCollapsingMetrics({
    space,
    titleSize,
    isCompact,
    cardRadius,
  });
  const collapseDistance = Math.max(1, headerMetrics.expandedHeight - headerMetrics.compactHeight);
  const collapse = useCollapsingHeader({ distance: collapseDistance });

  const [modalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const GAP = isCompact ? 12 : 20;
  const contentPadding = space * 2;
  const cardWidth =
    (width - contentPadding - GAP * (activityColumns - 1)) / activityColumns;

  const handleAddActivity = () => {
    setEditingActivity(null);
    setModalVisible(true);
  };

  const handleEditActivity = (activityId: string) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setEditingActivity(activity);
      setModalVisible(true);
    }
  };

  const handleSubmitActivity = (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingActivity) {
      updateActivity(editingActivity.id, activityData);
    } else {
      addActivity(activityData);
    }
    setModalVisible(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = (activityId: string) => {
    const activity = activities.find(item => item.id === activityId);
    Alert.alert(
      '활동 삭제',
      activity ? `"${activity.name}" 활동을 삭제할까요?` : '이 활동을 삭제할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteActivity(activityId);
            setModalVisible(false);
            setEditingActivity(null);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer style={isLandscape && styles.containerLandscape}>
      <View style={styles.body}>
        <Animated.ScrollView
          ref={collapse.scrollRef}
          testID="activity-list"
          style={styles.scrollView}
          contentContainerStyle={activityListPadding({
            space,
            expandedHeight: headerMetrics.expandedHeight,
            scrollEndPadding,
          })}
          contentInsetAdjustmentBehavior="never"
          onScroll={collapse.onScroll}
          onScrollEndDrag={collapse.onScrollEndDrag}
          onMomentumScrollEnd={collapse.onMomentumScrollEnd}
          scrollEventThrottle={collapse.scrollEventThrottle}
          showsVerticalScrollIndicator={false}
        >
          {activities.length === 0 ? (
            <View style={[styles.emptyState, isSmallPhone && styles.emptyStateSmall]}>
              <MaterialIcons
                name="format-list-bulleted"
                size={isSmallPhone ? 48 : 64}
                color={SoftPopColors.textSecondary}
              />
              <Text style={[styles.emptyTitle, isSmallPhone && styles.emptyTitleSmall]}>
                활동이 없어요
              </Text>
              <Text style={[styles.emptyMessage, isSmallPhone && styles.emptyMessageSmall]}>
                활동을 추가해 보세요
              </Text>
            </View>
          ) : (
            <View style={{ gap: GAP + 4 }}>
              {groups.map((group) => (
                <View key={group.key} style={{ gap: 10 }}>
                  {group.label ? (
                    <Text style={styles.groupTitle} accessibilityRole="header">
                      {group.label}
                    </Text>
                  ) : null}
                  <View style={{ gap: GAP }}>
                    {chunkIntoRows(group.items, activityColumns).map((row) => (
                      <View
                        key={row.map((activity) => activity.id).join('-')}
                        style={[styles.activityRow, { gap: GAP }]}
                      >
                        {row.map((activity) => (
                          <ActivityCard
                            key={activity.id}
                            activity={activity}
                            onEdit={() => handleEditActivity(activity.id)}
                            onDelete={() => handleDeleteActivity(activity.id)}
                            width={cardWidth}
                          />
                        ))}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </Animated.ScrollView>

        <CollapsingHeader
          testID="activity-header"
          title={headerType.title}
          largeFontSize={headerType.largeFontSize}
          compactFontSize={headerType.compactFontSize}
          metrics={headerMetrics}
          shadow={clayShadow}
          heightProgress={collapse.heightProgress}
          motionProgress={collapse.motionProgress}
          compactActive={collapse.compactActive}
          trailing={(
            <AddActivityButton
              onPress={handleAddActivity}
              label={headerType.addLabel}
              icon={headerType.addIcon}
              iconSize={headerType.addIconSize}
            />
          )}
        />
      </View>

      <ActivityFormModal
        visible={modalVisible}
        activity={editingActivity}
        onClose={() => {
          setModalVisible(false);
          setEditingActivity(null);
        }}
        onSubmit={handleSubmitActivity}
        onDelete={editingActivity ? () => handleDeleteActivity(editingActivity.id) : undefined}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: BrandAccent.strong,
    flexShrink: 0,
  },
  addButtonText: {
    color: SoftPopColors.white,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: systemFont,
    includeFontPadding: false,
  },
  addButtonPressed: {
    opacity: 0.88,
  },
  groupTitle: {
    fontSize: 16,
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
  },
  containerLandscape: {
    paddingTop: 0,
  },
  scrollView: {
    flex: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 112,
    width: '100%',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: SoftPopColors.text,
    marginTop: 20,
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
  emptyStateSmall: {
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  emptyTitleSmall: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessageSmall: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 0,
  },
});
