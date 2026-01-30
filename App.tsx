import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';
import { Text, TextProps } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ActivityProvider } from './src/contexts/ActivityContext';
import { ScheduleProvider } from './src/contexts/ScheduleContext';
import CustomSplashScreen from './src/screens/SplashScreen';


import mobileAds from 'react-native-google-mobile-ads';

// 스플래시 스크린을 유지하도록 설정
SplashScreen.preventAutoHideAsync();


const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

export default function App() {
    // 주아체 폰트 로드
    // 주의: 폰트 파일이 없으면 에러가 발생할 수 있으므로, 
    // assets/fonts/ 폴더에 BMJUA_ttf.ttf 파일을 추가해야 합니다.
    const [fontsLoaded, fontError] = useFonts({
        'BMJUA': require('./assets/fonts/BMJUA_ttf.ttf'),
    });

    const [isSplashFinished, setIsSplashFinished] = React.useState(false);

    // Initialize Google Mobile Ads SDK (안드로이드 크래시 방지를 위해 useEffect 내부에서 초기화)
    useEffect(() => {
        (async () => {
            const { status } = await requestTrackingPermissionsAsync();
            if (status === 'granted') {
                console.log('✅ Tracking permission granted');
            }
            
            mobileAds()
                .initialize()
                .then(adapterStatuses => {
                    console.log('📱 Google Mobile Ads SDK initialized:', adapterStatuses);
                })
                .catch(error => {
                    console.warn('⚠️ Google Mobile Ads SDK initialization failed:', error);
                });
        })();
    }, []);

    useEffect(() => {
        if (fontsLoaded) {
            console.log('✅ 주아체 폰트 로드 성공: BMJUA');
            // 전역 Text 컴포넌트에 폰트 적용
            // @ts-ignore
            if (Text.defaultProps) {
                // @ts-ignore
                Text.defaultProps.style = { fontFamily: 'BMJUA' };
            }
            SplashScreen.hideAsync();
        } else if (fontError) {
            console.warn('❌ 주아체 폰트 로드 실패:', fontError);
            console.warn('시스템 기본 폰트를 사용합니다.');
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    // 폰트가 로드되기 전에는 null 반환 (네이티브 스플래시 스크린 표시)
    if (!fontsLoaded && !fontError) {
        return null;
    }

    // 폰트 로드 에러가 있어도 앱은 계속 실행 (시스템 폰트 사용)
    if (fontError) {
        console.warn('주아체 폰트 로드 실패:', fontError);
        console.warn('시스템 기본 폰트를 사용합니다. assets/fonts/BMJUA_ttf.ttf 파일을 확인하세요.');
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <QueryClientProvider client={queryClient}>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <ActivityProvider>
                            <ScheduleProvider>
                                <StatusBar style="auto" />
                                <AppNavigator />
                                {!isSplashFinished && (
                                    <CustomSplashScreen onFinish={() => setIsSplashFinished(true)} />
                                )}
                            </ScheduleProvider>
                        </ActivityProvider>
                    </NavigationContainer>
                </SafeAreaProvider>
            </QueryClientProvider>
        </GestureHandlerRootView>
    );
}

