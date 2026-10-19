/**
 * 메인 하단 탭 네비게이션
 * Soft Pop 3D (Claymorphism) 디자인 적용
 */

import React from 'react';
import { BottomTabBar, BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { Platform, Pressable, View, StyleSheet } from 'react-native';
import { MainTabParamList } from '../types';

// 화면 임포트
import TodayScreen from '../screens/TodayScreen';
import PlanScheduleScreen from '../screens/PlanScheduleScreen';
import ActivitiesScreen from '../screens/ActivitiesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { SoftPopColors } from '../constants/theme';
import { useLayout } from '../hooks/useLayout';
import { shouldShowAdForRoute, MIN_TOUCH_TARGET } from '../hooks/layoutMetrics';
import { AdSlotProvider, useAdSlot } from '../contexts/AdSlotContext';
import { AdBanner } from '../components/AdBanner';

const Tab = createBottomTabNavigator<MainTabParamList>();

// 커스텀 탭 바 버튼 (3D 효과)
const CustomTabBarButton = ({ children, onPress, accessibilityState, style, minHeight }: any) => {
  const isSelected = accessibilityState?.selected;

  return (
    <Pressable
      style={({ pressed }) => [
        tabBarStyles.tabButton,
        style, // React Navigation 기본 스타일 (flex: 1 등)은 유지
        minHeight != null && { minHeight },
        isSelected && tabBarStyles.tabButtonActive,
        pressed && tabBarStyles.tabButtonPressed,
      ]}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
};

/**
 * Tab bar + the app's single ad banner directly above it. The whole stack
 * floats (position absolute); its ad height goes to AdSlotContext so screens
 * pad by it. Not mounted on Settings (no ad request there).
 */
const TabBarWithAd = (props: BottomTabBarProps) => {
  const { setAdHeight } = useAdSlot();
  const routeName = props.state.routes[props.state.index]?.name ?? '';
  const showAd = shouldShowAdForRoute(routeName);
  React.useEffect(() => {
    if (!showAd) setAdHeight(0);
  }, [showAd, setAdHeight]);

  return (
    <View style={tabBarStyles.bottomStack} pointerEvents="box-none">
      {/* Settings: unmounted, not just hidden, so no ad request runs there. */}
      {showAd && (
        <View onLayout={(e) => setAdHeight(e.nativeEvent.layout.height)}>
          <AdBanner />
        </View>
      )}
      <BottomTabBar {...props} />
    </View>
  );
};

// Icon with a pill behind it when selected (clear active state, same size).
const TabIcon = ({ name, color, focused }: { name: keyof typeof MaterialIcons.glyphMap; color: string; focused: boolean }) => (
  <View style={[tabBarStyles.iconPill, focused && tabBarStyles.iconPillActive]}>
    <MaterialIcons name={name} size={24} color={color} />
  </View>
);

export const MainTabNavigator: React.FC = () => (
  <AdSlotProvider>
    <MainTabs />
  </AdSlotProvider>
);

const MainTabs: React.FC = () => {
  // Tier + safe-area aware geometry (SE/home-button: tighter bar with an 8pt
  // floor; notched phones and iPad unchanged). See getTabBarChrome.
  const { tabBarChrome } = useLayout();

  return (
    <Tab.Navigator
      tabBar={(props) => <TabBarWithAd {...props} />}
      screenOptions={{
        headerShown: false, // 각 화면에서 자체 헤더 사용
        tabBarActiveTintColor: SoftPopColors.primary,
        tabBarInactiveTintColor: SoftPopColors.textSecondary,
        // 실제 탭 컨텐츠는 투명/플랫하게 두고, 배경은 tabBarBackground에서만 처리
        // The wrapper in TabBarWithAd floats; the bar itself stays in its flow.
        tabBarStyle: {
          paddingBottom: tabBarChrome.paddingBottom,
          paddingTop: 0,
          height: tabBarChrome.barHeight,
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
        tabBarButton: (props) => (
          <CustomTabBarButton {...props} minHeight={tabBarChrome.buttonMinHeight} />
        ),
        // 플로팅 탭 바 배경 (실제 흰색 바 + 그림자 + 라운드)
        tabBarBackground: () => (
          <View
            style={[
              tabBarStyles.tabBarBackground,
              {
                marginHorizontal: tabBarChrome.pillMarginHorizontal,
                marginBottom: tabBarChrome.pillMarginBottom,
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
          tabBarLabel: '오늘',
          tabBarAccessibilityLabel: '오늘의 일정',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="today" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PlanSchedule"
        component={PlanScheduleScreen}
        options={{
          title: '일정 만들기',
          tabBarLabel: '계획',
          tabBarAccessibilityLabel: '일정 만들기',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="event-note" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Activities"
        component={ActivitiesScreen}
        options={{
          title: '활동 관리',
          tabBarLabel: '활동',
          tabBarAccessibilityLabel: '활동 관리',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="format-list-bulleted" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '설정',
          tabBarLabel: '설정',
          tabBarAccessibilityLabel: '설정',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="settings" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const tabBarStyles = StyleSheet.create({
  bottomStack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconPill: {
    width: 56,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: `${SoftPopColors.primary}26`,
  },
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
    elevation: Platform.OS === 'android' ? 0 : 12,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderRadius: 20,
    marginHorizontal: 2,
    minHeight: Math.max(56, MIN_TOUCH_TARGET),
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

