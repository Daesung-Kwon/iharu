/**
 * 프로필 화면
 * Soft Pop 3D (Claymorphism) 디자인 적용
 * 필수 기능만 구현 (개인정보 수집 최소화)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch, useWindowDimensions, Image, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { AdBanner } from '../components/AdBanner';
import { exportAllData, importAllData, clearAllData } from '../services/storage';
import { requestNotificationPermissions, loadNotificationSettings, saveNotificationSettings } from '../services/notificationService';
import { useActivity } from '../contexts/ActivityContext';
import { useSchedule } from '../contexts/ScheduleContext';
import TermsModal from '../components/TermsModal';
import PrivacyModal from '../components/PrivacyModal';
import LicenseModal from '../components/LicenseModal';

// Soft Pop 3D 디자인 색상 팔레트
const SoftPopColors = {
  background: '#FFF9F0', // Cream
  primary: '#FF6B6B', // Soft Red
  secondary: '#FFD93D', // Banana Yellow
  text: '#2D3436', // Soft Black
  textSecondary: '#636E72', // Soft Gray
  white: '#FFFFFF',
  error: '#FF6B6B',
};

export default function ProfileScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();
  const { resetActivities } = useActivity();
  const { resetSchedules } = useSchedule();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLicense, setShowLicense] = useState(false);

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const appName = Constants.expoConfig?.name || 'i하루';

  // 알림 설정 로드
  React.useEffect(() => {
    const loadSettings = async () => {
      const hasPermission = await requestNotificationPermissions();
      const settings = await loadNotificationSettings();
      setNotificationEnabled(hasPermission && Object.keys(settings).length > 0);
    };
    loadSettings();
  }, []);

  // 알림 설정 토글
  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert('알림 권한 필요', '알림을 사용하려면 알림 권한이 필요합니다.');
        return;
      }
    }
    setNotificationEnabled(value);
    // 알림 설정 저장 (빈 객체로 저장하면 모든 알림 비활성화)
    await saveNotificationSettings(value ? {} : {});
  };

  // 데이터 백업
  const handleBackup = async () => {
    try {
      console.log('백업 시작...');
      const data = await exportAllData();

      if (!data) {
        Alert.alert('백업 실패', '데이터를 백업할 수 없습니다.');
        return;
      }

      const activityCount = data.activities.length;
      const scheduleCount = data.schedules.length;

      if (activityCount === 0 && scheduleCount === 0) {
        Alert.alert('백업할 데이터 없음', '저장된 활동이나 일정이 없습니다.');
        return;
      }

      console.log('백업 데이터:', {
        activities: activityCount,
        schedules: scheduleCount,
        version: data.version,
      });

      const jsonString = JSON.stringify(data, null, 2);
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const fileName = `i하루-백업-${timestamp}.json`;

      // documentDirectory 사용 (사용자가 접근 가능한 위치)
      const directory = FileSystem.documentDirectory || FileSystem.cacheDirectory;

      if (!directory) {
        // 웹 환경 등의 경우
        Alert.alert(
          '백업 불가',
          '이 기기에서는 파일 저장이 지원되지 않습니다.\n\n다른 기기나 앱에서 시도해주세요.'
        );
        return;
      }

      const fileUri = `${directory}${fileName}`;
      console.log('파일 저장 위치:', fileUri);

      // 파일 저장
      await FileSystem.writeAsStringAsync(fileUri, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      console.log('파일 저장 완료:', fileUri);

      // 파일 공유 (이메일, 클라우드 스토리지, 파일 앱 등으로 저장)
      const isSharingAvailable = await Sharing.isAvailableAsync();

      if (isSharingAvailable) {
        try {
          // 공유 다이얼로그 표시 (이메일, 파일 앱, 클라우드 등)
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/json',
            dialogTitle: '백업 파일 저장',
            UTI: 'public.json', // iOS
          });

          Alert.alert(
            '백업 완료',
            `백업 파일이 생성되었습니다.\n\n활동 ${activityCount}개, 일정 ${scheduleCount}개가 백업되었습니다.\n\n파일을 원하는 위치에 저장하세요.`
          );
        } catch (shareError: any) {
          console.error('공유 오류:', shareError);
          Alert.alert(
            '백업 완료',
            `백업 파일이 생성되었습니다.\n\n활동 ${activityCount}개, 일정 ${scheduleCount}개\n\n파일 위치: ${fileUri}\n\n파일 앱에서 확인하거나 다른 앱으로 공유할 수 있습니다.`
          );
        }
      } else {
        Alert.alert(
          '백업 완료',
          `백업 파일이 생성되었습니다.\n\n활동 ${activityCount}개, 일정 ${scheduleCount}개\n\n파일 위치: ${fileUri}`
        );
      }
    } catch (error: any) {
      console.error('Backup error:', error);
      const errorMessage = error?.message || '알 수 없는 오류';
      Alert.alert(
        '백업 실패',
        `데이터 백업 중 오류가 발생했습니다.\n\n오류: ${errorMessage}\n\n다시 시도해주세요.`
      );
    }
  };

  // 데이터 복원
  const handleRestore = async () => {
    try {
      Alert.alert(
        '데이터 복원',
        '기존 데이터가 모두 삭제되고 백업 파일의 데이터로 대체됩니다. 계속하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '복원',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await DocumentPicker.getDocumentAsync({
                  type: 'application/json',
                  copyToCacheDirectory: true,
                });

                if (result.canceled) return;

                if (!result.assets || result.assets.length === 0) {
                  Alert.alert('복원 실패', '파일을 선택할 수 없습니다.');
                  return;
                }

                const fileUri = result.assets[0].uri;

                // 파일 읽기
                const fileContent = await FileSystem.readAsStringAsync(fileUri, {
                  encoding: FileSystem.EncodingType.UTF8,
                });

                // JSON 파싱
                const data = JSON.parse(fileContent);

                // 데이터 검증
                if (!data.version || !Array.isArray(data.activities) || !Array.isArray(data.schedules)) {
                  Alert.alert('복원 실패', '유효하지 않은 백업 파일입니다.');
                  return;
                }

                // 데이터 복원
                const success = await importAllData(data);
                if (success) {
                  // Context는 자동으로 AsyncStorage에서 다시 로드됨
                  // 하지만 즉시 반영을 위해 앱 재시작 권장
                  Alert.alert(
                    '복원 완료',
                    '데이터가 복원되었습니다.\n\n변경사항을 확인하려면 앱을 재시작해주세요.',
                    [{ text: '확인' }]
                  );
                } else {
                  Alert.alert('복원 실패', '데이터 복원 중 오류가 발생했습니다.');
                }
              } catch (error) {
                console.error('Restore error:', error);
                Alert.alert('복원 실패', '백업 파일을 읽을 수 없습니다. 파일 형식을 확인해주세요.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('복원 실패', '데이터 복원 중 오류가 발생했습니다.');
    }
  };

  // 데이터 초기화
  const handleReset = async () => {
    Alert.alert(
      '데이터 초기화',
      '모든 활동과 일정 데이터가 삭제됩니다. 이 작업은 되돌릴 수 없습니다. 계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              // Context 초기화
              resetActivities();
              resetSchedules();
              Alert.alert('완료', '모든 데이터가 삭제되었습니다.');
            } catch (error) {
              console.error('Reset error:', error);
              Alert.alert('초기화 실패', '데이터 초기화 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            // 동적 계산: 탭바 높이 + SafeArea bottom (OS별)
            paddingBottom: (() => {
              const TAB_BAR_HEIGHT = 68;
              const AD_HEIGHT = 60;
              const tabBarHeight = Platform.OS === 'android'
                ? TAB_BAR_HEIGHT + Math.max(insets.bottom, 16) + 8
                : TAB_BAR_HEIGHT + Math.max(insets.bottom, 10);
              return tabBarHeight + AD_HEIGHT + 20;
            })(),
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 앱 정보 카드 */}
        <View style={styles.appInfoCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.appIcon}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>{appName}</Text>
          <Text style={styles.appVersion}>버전 {appVersion}</Text>
        </View>

        {/* 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설정</Text>

          {/* 알림 설정 */}
          <View style={styles.settingItem}>
            <MaterialIcons
              name="notifications"
              size={28}
              color={SoftPopColors.textSecondary}
            />
            <Text style={styles.settingText}>알림</Text>
            <Switch
              value={notificationEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: SoftPopColors.background, true: '#FFB3B3' }}
              thumbColor={notificationEnabled ? SoftPopColors.primary : SoftPopColors.textSecondary}
            />
          </View>
        </View>

        {/* 데이터 관리 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터 관리</Text>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed
            ]}
            onPress={handleBackup}
          >
            <MaterialIcons
              name="backup"
              size={28}
              color={SoftPopColors.textSecondary}
            />
            <Text style={styles.settingText}>데이터 백업</Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={SoftPopColors.textSecondary}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed
            ]}
            onPress={handleRestore}
          >
            <MaterialIcons
              name="restore"
              size={28}
              color={SoftPopColors.textSecondary}
            />
            <Text style={styles.settingText}>데이터 복원</Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={SoftPopColors.textSecondary}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              styles.dangerItem,
              pressed && styles.settingItemPressed
            ]}
            onPress={handleReset}
          >
            <MaterialIcons
              name="delete-outline"
              size={28}
              color={SoftPopColors.error}
            />
            <Text style={[styles.settingText, styles.dangerText]}>데이터 초기화</Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={SoftPopColors.textSecondary}
            />
          </Pressable>
        </View>

        {/* 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed
            ]}
            onPress={() => setShowTerms(true)}
          >
            <MaterialIcons
              name="description"
              size={28}
              color={SoftPopColors.textSecondary}
            />
            <Text style={styles.settingText}>이용약관</Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={SoftPopColors.textSecondary}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed
            ]}
            onPress={() => setShowPrivacy(true)}
          >
            <MaterialIcons
              name="privacy-tip"
              size={28}
              color={SoftPopColors.textSecondary}
            />
            <Text style={styles.settingText}>개인정보처리방침</Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={SoftPopColors.textSecondary}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed
            ]}
            onPress={() => setShowLicense(true)}
          >
            <MaterialIcons
              name="code"
              size={28}
              color={SoftPopColors.textSecondary}
            />
            <Text style={styles.settingText}>오픈소스 라이센스</Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={SoftPopColors.textSecondary}
            />
          </Pressable>
        </View>
      </ScrollView>

      {/* Ad Banner */}
      <AdBanner
        style={{
          position: 'absolute',
          bottom: Platform.OS === 'android'
            ? 68 + Math.max(insets.bottom, 16) + 8
            : 68 + Math.max(insets.bottom, 10),
          width: '100%',
        }}
      />

      {/* 약관 모달 */}
      <TermsModal
        visible={showTerms}
        onClose={() => setShowTerms(false)}
      />

      {/* 개인정보처리방침 모달 */}
      <PrivacyModal
        visible={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />

      {/* 오픈소스 라이센스 모달 */}
      <LicenseModal
        visible={showLicense}
        onClose={() => setShowLicense(false)}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 32,
    // paddingBottom은 동적으로 계산 (contentContainerStyle에서)
  },
  appInfoCard: {
    backgroundColor: SoftPopColors.white,
    borderRadius: 24, // rounded-3xl
    padding: 40,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarContainer: {
    marginBottom: 20,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: SoftPopColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    // Soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  appIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  appName: {
    fontSize: 24,
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    color: SoftPopColors.text,
    marginBottom: 8,
    lineHeight: 32,
    fontFamily: 'BMJUA',
  },
  appVersion: {
    fontSize: 16,
    fontWeight: '500',
    color: SoftPopColors.textSecondary,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  section: {
    backgroundColor: SoftPopColors.white,
    borderRadius: 24, // rounded-3xl
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: SoftPopColors.white,
    // Soft floating effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: Platform.OS === 'android' ? 'normal' : '700',
    color: SoftPopColors.text,
    marginBottom: 20,
    lineHeight: 28,
    fontFamily: 'BMJUA',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 4,
    gap: 16,
    borderBottomWidth: 2,
    borderBottomColor: SoftPopColors.background,
    borderRadius: 16,
    marginBottom: 4,
  },
  settingItemPressed: {
    backgroundColor: SoftPopColors.background,
    transform: [{ scale: 0.98 }],
  },
  settingText: {
    fontSize: 18,
    fontWeight: '600',
    color: SoftPopColors.text,
    flex: 1,
    lineHeight: 24,
    fontFamily: 'BMJUA',
  },
  dangerItem: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: SoftPopColors.error,
    fontWeight: '700',
    fontFamily: 'BMJUA',
  },
});
