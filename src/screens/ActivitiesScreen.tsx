/**
 * 활동 관리 화면
 * 자주 하는 활동을 추가/수정/삭제
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useActivity } from '../contexts/ActivityContext';
import ActivityCard from '../components/ActivityCard';
import ActivityFormModal from '../components/ActivityFormModal';
import { Activity } from '../types';

// Soft Pop 3D 디자인 색상 팔레트
const SoftPopColors = {
  background: '#FFF9F0', // Cream
  primary: '#FF6B6B', // Soft Red
  secondary: '#FFD93D', // Banana Yellow
  text: '#2D3436', // Soft Black
  textSecondary: '#636E72', // Soft Gray
  white: '#FFFFFF',
};

export default function ActivitiesScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();
  const { activities, addActivity, updateActivity, deleteActivity } = useActivity();

  const TAB_BAR_HEIGHT = 68;
  const bottomPadding = Platform.OS === 'android'
    ? TAB_BAR_HEIGHT + Math.max(insets.bottom, 16) + 8
    : TAB_BAR_HEIGHT + Math.max(insets.bottom, 10);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

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
    deleteActivity(activityId);
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
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>활동 관리</Text>
          <Text style={styles.subtitle}>자주 하는 활동들을 저장해두세요</Text>
        </View>
        {/* FAB (Floating Action Button) - Soft Pop 3D */}
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            pressed && styles.fabPressed
          ]}
          onPress={handleAddActivity}
          accessibilityLabel="새 활동 추가"
          accessibilityRole="button"
        >
          <MaterialIcons
            name="add"
            size={28}
            color={SoftPopColors.white}
          />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            // 동적 계산: 탭바 높이 + SafeArea bottom (OS별)
            paddingBottom: bottomPadding,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activities.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="star-outline"
              size={64}
              color={SoftPopColors.textSecondary}
            />
            <Text style={styles.emptyTitle}>활동이 없어요</Text>
            <Text style={styles.emptyMessage}>
              새 활동을 추가해서 시작해보세요!
            </Text>
          </View>
        ) : (
          <View style={styles.activityGrid}>
            {activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onEdit={() => handleEditActivity(activity.id)}
                onDelete={() => handleDeleteActivity(activity.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Activity Form Modal */}
      <ActivityFormModal
        visible={modalVisible}
        activity={editingActivity}
        onClose={() => {
          setModalVisible(false);
          setEditingActivity(null);
        }}
        onSubmit={handleSubmitActivity}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SoftPopColors.background, // Cream
  },
  containerLandscape: {
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    color: SoftPopColors.primary,
    marginBottom: 8,
    lineHeight: 40,
    fontFamily: 'BMJUA',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: SoftPopColors.textSecondary,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32, // rounded-full
    backgroundColor: SoftPopColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    // Strong 3D effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ translateY: 2 }],
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 32,
    // paddingBottom은 동적으로 계산 (contentContainerStyle에서)
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
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
});

