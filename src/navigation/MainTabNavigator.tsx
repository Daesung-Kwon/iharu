/**
 * 메인 하단 탭 네비게이션
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '../types';

// 화면 임포트
import TodayScreen from '../screens/TodayScreen';
import PlanScheduleScreen from '../screens/PlanScheduleScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Soft Pop 3D 디자인 색상 팔레트
const SoftPopColors = {
  background: '#FFF9F0', // Cream
  primary: '#FF6B6B', // Soft Red
  secondary: '#FFD93D', // Banana Yellow
  text: '#2D3436', // Soft Black
  textSecondary: '#636E72', // Soft Gray
  white: '#FFFFFF',
};

const Tab = createBottomTabNavigator<MainTabParamList>();

// 커스텀 탭 바 버튼 (3D 효과)
const CustomTabBarButton = ({ children, onPress, accessibilityState, style }: any) => {
  const isSelected = accessibilityState?.selected;

  return (
    <Pressable
      style={({ pressed }) => [
        tabBarStyles.tabButton,
        style, // React Navigation 기본 스타일 (flex: 1 등)은 유지
        isSelected && tabBarStyles.tabButtonActive,
        pressed && tabBarStyles.tabButtonPressed,
      ]}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
};

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();

  // Android 시스템 네비게이션 바 높이 고려 (iOS는 기존 유지)
  const tabBarPaddingBottom = Platform.OS === 'ios'
    ? Math.max(insets.bottom, 10) // iOS 기존 로직 유지
    : Math.max(insets.bottom, 16); // Android만 개선

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // 각 화면에서 자체 헤더 사용
        tabBarActiveTintColor: SoftPopColors.primary,
        tabBarInactiveTintColor: SoftPopColors.textSecondary,
        // 실제 탭 컨텐츠는 투명/플랫하게 두고, 배경은 tabBarBackground에서만 처리
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingBottom: tabBarPaddingBottom,
          paddingTop: 0,
          height: 68 + (Platform.OS === 'ios' 
            ? Math.max(insets.bottom - 8, 0) // iOS 기존 로직 유지
            : Math.max(insets.bottom, 0) // Android만 개선
          ),
          backgroundColor: 'transparent', // 뒤 배경이 비치도록 투명 처리
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
          marginBottom: 0,
          textAlign: 'center',
          fontFamily: 'BMJUA',
          includeFontPadding: false,
          // Android 폰트 정렬 개선
          ...(Platform.OS === 'android' && {
            textAlignVertical: 'center',
          }),
        },
        tabBarIconStyle: {
          marginTop: 0,
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          paddingHorizontal: 0,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
        tabBarButton: (props) => <CustomTabBarButton {...props} />,
        // 플로팅 탭 바 배경 (실제 흰색 바 + 그림자 + 라운드)
        tabBarBackground: () => (
          <View
            style={[
              tabBarStyles.tabBarBackground,
              {
                marginBottom: Platform.OS === 'ios'
                  ? Math.max(insets.bottom, 12) // iOS 기존 로직 유지
                  : Math.max(insets.bottom, 16), // Android만 개선
              },
            ]}
          />
        ),
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          title: '오늘의 일정',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name="today"
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="PlanSchedule"
        component={PlanScheduleScreen}
        options={{
          title: '일정 만들기',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name="event-note"
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          title: '활동 관리',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name="star"
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '설정',
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name="settings"
              size={focused ? 28 : 24}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const tabBarStyles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24, // 둥근 모서리 (rounded-3xl)
    backgroundColor: 'rgba(255, 255, 255, 0.75)', // 투명 처리
    // Strong floating shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 20,
    marginHorizontal: 2,
    minHeight: 56,
    // iOS 전용 shadow (Android에서는 elevation 제거)
    ...(Platform.OS === 'ios' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    }),
  },
  tabButtonActive: {
    // 배경색 제거 - Android에서 네모 박스가 보이지 않도록
    backgroundColor: 'transparent',
    // iOS 전용 shadow (Android에서는 elevation 제거)
    ...(Platform.OS === 'ios' && {
      shadowColor: SoftPopColors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    }),
  },
  tabButtonPressed: {
    transform: [{ scale: 0.95 }],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    // Android: elevation 제거 (투명 배경에서 박스 현상 방지)
    ...(Platform.OS !== 'android' && {
      elevation: 2,
    }),
  },
});

