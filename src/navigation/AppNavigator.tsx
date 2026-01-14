/**
 * 앱 네비게이션 구조
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from '../types';
import { MainTabNavigator } from './MainTabNavigator';

// 화면 임포트 (추후 추가)
// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import ActivityDetailScreen from '../screens/ActivityDetailScreen';
// import ScheduleDetailScreen from '../screens/ScheduleDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  // TODO: 인증 상태 확인 로직 추가
  const isAuthenticated = true; // 임시
  const isLoading = false; // 임시

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // 인증된 사용자 - 메인 탭 네비게이션
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabNavigator}
            options={{ 
              headerShown: false,
            }}
          />
          {/* 추후 추가될 화면들 */}
          {/* <Stack.Screen
            name="ActivityDetail"
            component={ActivityDetailScreen}
            options={{
              title: '활동 추가/수정',
              headerShown: true,
              presentation: 'modal',
            }}
          />
          <Stack.Screen
            name="ScheduleDetail"
            component={ScheduleDetailScreen}
            options={{
              title: '일정 상세',
              headerShown: true,
            }}
          /> */}
        </>
      ) : (
        // 비인증 사용자 (추후 인증 화면 추가)
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabNavigator}
            options={{ 
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};


