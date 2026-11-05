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
import { SoftPopColors, TabBarColors } from '../constants/theme';
import { useLayout } from '../hooks/useLayout';
import { MIN_TOUCH_TARGET, TAB_BAR_HIT_SLOP, TAB_ICON_PILL } from '../hooks/layoutMetrics';

const Tab = createBottomTabNavigator<MainTabParamList>();

// 커스텀 탭 바 버튼 (3D 효과)
// React Navigation's UIKit icon slot is 31×28 and the item centers its child,
// so the pressable would otherwise shrink under 44pt. minWidth/minHeight plus
// hitSlop keep the HIG target. Navigation also adds padding: 5, which clips
// the 12pt label inside the SE bar (60pt with an 8pt floor); zero it after
// that style so 오늘/계획/활동/설정 stay on one line at 320pt.
const CustomTabBarButton = ({
  children,
  onPress,
  onLongPress,
  accessibilityState,
  style,
  minHeight,
  minWidth,
  testID,
  ...rest
}: any) => {
  // v7 passes aria-selected; older props used accessibilityState.selected.
  const isSelected = Boolean(accessibilityState?.selected || rest['aria-selected']);

  return (
    <Pressable
      testID={testID}
      hitSlop={TAB_BAR_HIT_SLOP}
      accessibilityState={accessibilityState}
      style={({ pressed }) => [
        tabBarStyles.tabButton,
        style, // React Navigation 기본 스타일 (flex: 1 등)은 유지
        {
          minHeight,
          minWidth,
          padding: 0,
          paddingVertical: 0,
          paddingHorizontal: 0,
          justifyContent: 'center',
        },
        isSelected && tabBarStyles.tabButtonActive,
        pressed && tabBarStyles.tabButtonPressed,
      ]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {children}
    </Pressable>
  );
};

/** Floating tab bar. The app has no ads, so nothing sits above it. */
const FloatingTabBar = (props: BottomTabBarProps) => (
  <View style={tabBarStyles.bottomStack} pointerEvents="box-none">
    <BottomTabBar {...props} />
  </View>
);

// Icon with a solid primary pill when selected. The pill stays the same size;
// only the fill and the icon color change, so the bar does not grow.
const TabIcon = ({ name, color, focused }: { name: keyof typeof MaterialIcons.glyphMap; color: string; focused: boolean }) => (
  <View style={[tabBarStyles.iconPill, focused && tabBarStyles.iconPillActive]}>
    <MaterialIcons name={name} size={24} color={focused ? TabBarColors.activeIcon : color} />
  </View>
);

export const MainTabNavigator: React.FC = () => <MainTabs />;

const MainTabs: React.FC = () => {
  // Tier + safe-area aware geometry (SE/home-button: tighter bar with an 8pt
  // floor; notched phones and iPad unchanged). See getTabBarChrome.
  const { tabBarChrome } = useLayout();

  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false, // 각 화면에서 자체 헤더 사용
        tabBarActiveTintColor: TabBarColors.activeLabel,
        tabBarInactiveTintColor: TabBarColors.inactive,
        // 실제 탭 컨텐츠는 투명/플랫하게 두고, 배경은 tabBarBackground에서만 처리
        // The wrapper in FloatingTabBar floats; the bar itself stays in its flow.
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
          <CustomTabBarButton
            {...props}
            minHeight={tabBarChrome.buttonMinHeight}
            minWidth={tabBarChrome.buttonMinWidth}
          />
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
    width: TAB_ICON_PILL.width,
    height: TAB_ICON_PILL.height,
    borderRadius: TAB_ICON_PILL.height / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: TabBarColors.activePill,
  },
  tabBarBackground: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 24, // 둥근 모서리 (rounded-3xl)
    backgroundColor: TabBarColors.bar,
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
    // Floor only. Chrome passes a taller minHeight (48 on SE, 56 elsewhere)
    // after React Navigation's style, so this cannot force 56 into the 52pt SE band.
    minHeight: MIN_TOUCH_TARGET,
    minWidth: MIN_TOUCH_TARGET,
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

