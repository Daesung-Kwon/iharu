/**
 * 프로필 화면
 * Soft Pop 3D (Claymorphism) 디자인 적용
 * 필수 기능만 구현 (개인정보 수집 최소화)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { AdBanner } from '../components/AdBanner';
import { exportAllData, importAllData, clearAllData, parseBackupData } from '../services/storage';
import {
  requestNotificationPermissions,
  loadNotificationsMasterEnabled,
  saveNotificationsMasterEnabled,
  loadNotificationSettings,
  loadNotificationLeadMinutes,
  saveNotificationLeadMinutes,
  cancelAllNotifications,
  rescheduleUpcomingNotifications,
} from '../services/notificationService';
import { loadSettingsPin, saveSettingsPin, clearSettingsPin } from '../services/pinLock';
import PinLockModal from '../components/PinLockModal';
import { NOTIFICATION_LEAD_OPTIONS, NotificationLeadMinutes } from '../utils/dateUtils';
import { useActivity } from '../contexts/ActivityContext';
import { useSchedule } from '../contexts/ScheduleContext';
import { toLocalDateString } from '../utils/dateUtils';
import TermsModal from '../components/TermsModal';
import PrivacyModal from '../components/PrivacyModal';
import LicenseModal from '../components/LicenseModal';
import { SoftPopColors } from '../constants/theme';
import { useLayout } from '../hooks/useLayout';

export default function ProfileScreen() {
  const { isCompact, isLandscape, space, adBannerBottom, contentPadWithAd } = useLayout();
  const { resetActivities, reloadFromStorage: reloadActivities } = useActivity();
  const { resetSchedules, schedules, reloadFromStorage: reloadSchedules } = useSchedule();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLicense, setShowLicense] = useState(false);
  const [leadMinutes, setLeadMinutes] = useState<NotificationLeadMinutes>(5);
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(true);
  const [pinModal, setPinModal] = useState<'unlock' | 'set' | 'confirm' | 'remove' | null>(null);
  const [pendingPin, setPendingPin] = useState('');
  const [pinError, setPinError] = useState('');

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const appName = Constants.expoConfig?.name || 'i하루';

  React.useEffect(() => {
    const loadSettings = async () => {
      const enabled = await loadNotificationsMasterEnabled();
      setNotificationEnabled(enabled);
      setLeadMinutes(await loadNotificationLeadMinutes());
      const pin = await loadSettingsPin();
      setStoredPin(pin);
      setUnlocked(!pin);
    };
    loadSettings();
  }, []);

  const handleNotificationToggle = async (value: boolean) => {
    if (value) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert('알림 권한 필요', '알림을 사용하려면 알림 권한이 필요합니다.');
        return;
      }
      setNotificationEnabled(true);
      await saveNotificationsMasterEnabled(true);
      const settings = await loadNotificationSettings();
      await rescheduleUpcomingNotifications(schedules, settings);
      return;
    }

    setNotificationEnabled(false);
    await saveNotificationsMasterEnabled(false);
    await cancelAllNotifications();
  };

  const handleLeadMinutes = async (minutes: NotificationLeadMinutes) => {
    setLeadMinutes(minutes);
    await saveNotificationLeadMinutes(minutes);
    if (notificationEnabled) {
      const settings = await loadNotificationSettings();
      await rescheduleUpcomingNotifications(schedules, settings);
    }
  };

  const handlePinSubmit = async (pin: string) => {
    setPinError('');
    if (pinModal === 'unlock') {
      if (pin === storedPin) {
        setUnlocked(true);
        setPinModal(null);
      } else {
        setPinError('비밀번호가 달라요');
      }
      return;
    }
    if (pinModal === 'set') {
      setPendingPin(pin);
      setPinModal('confirm');
      return;
    }
    if (pinModal === 'confirm') {
      if (pin !== pendingPin) {
        setPinError('다시 입력한 숫자가 달라요');
        return;
      }
      await saveSettingsPin(pin);
      setStoredPin(pin);
      setUnlocked(true);
      setPinModal(null);
      Alert.alert('잠금 설정', '설정이 비밀번호로 잠겼어요.');
      return;
    }
    if (pinModal === 'remove') {
      if (pin !== storedPin) {
        setPinError('비밀번호가 달라요');
        return;
      }
      await clearSettingsPin();
      setStoredPin(null);
      setUnlocked(true);
      setPinModal(null);
      Alert.alert('잠금 해제', '설정 잠금을 풀었어요.');
    }
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
      const hasDeletedDefaults = data.deletedDefaultIds.length > 0;
      const hasNotificationSettings = Object.keys(data.notificationSettings).length > 0;
      const hasNonDefaultMaster = data.notificationsEnabled === false;
      const hasNonDefaultLead = data.notificationLeadMinutes !== 5;
      const hasPin = Boolean(data.settingsPin);

      if (
        activityCount === 0
        && scheduleCount === 0
        && !hasDeletedDefaults
        && !hasNotificationSettings
        && !hasNonDefaultMaster
        && !hasNonDefaultLead
        && !hasPin
      ) {
        Alert.alert('백업할 데이터 없음', '저장된 활동이나 일정이 없습니다.');
        return;
      }

      console.log('백업 데이터:', {
        activities: activityCount,
        schedules: scheduleCount,
        version: data.version,
      });

      const jsonString = JSON.stringify(data, null, 2);
      const timestamp = toLocalDateString(new Date()).replace(/-/g, '');
      const fileName = `i하루-백업-${timestamp}.json`;

      // documentDirectory 사용 (사용자가 접근 가능한 위치)
      // @ts-ignore
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
        // @ts-ignore
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
                  // @ts-ignore
                  encoding: FileSystem.EncodingType.UTF8,
                });

                const data = parseBackupData(fileContent);
                if (!data) {
                  Alert.alert('복원 실패', '유효하지 않은 백업 파일입니다.');
                  return;
                }

                const success = await importAllData(data);
                if (success) {
                  const [, restoredSchedules] = await Promise.all([
                    reloadActivities(),
                    reloadSchedules(),
                  ]);
                  const enabled = await loadNotificationsMasterEnabled();
                  setNotificationEnabled(enabled);
                  setLeadMinutes(await loadNotificationLeadMinutes());
                  const pin = await loadSettingsPin();
                  setStoredPin(pin);
                  setUnlocked(!pin);
                  await cancelAllNotifications();
                  if (enabled) {
                    await rescheduleUpcomingNotifications(
                      restoredSchedules,
                      data.notificationSettings
                    );
                  }
                  Alert.alert(
                    '복원 완료',
                    '데이터가 복원되었습니다.',
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
              resetActivities();
              resetSchedules();
              setNotificationEnabled(await loadNotificationsMasterEnabled());
              setLeadMinutes(await loadNotificationLeadMinutes());
              const pin = await loadSettingsPin();
              setStoredPin(pin);
              setUnlocked(!pin);
              await cancelAllNotifications();
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
      {!unlocked ? (
        <View style={[styles.lockGate, { padding: space }]}>
          <MaterialIcons name="lock" size={48} color={SoftPopColors.primary} />
          <Text style={styles.lockTitle}>설정이 잠겨 있어요</Text>
          <Text style={styles.lockMessage}>부모님만 바꿀 수 있게 잠가 두었어요.</Text>
          <Pressable
            style={styles.lockButton}
            onPress={() => {
              setPinError('');
              setPinModal('unlock');
            }}
          >
            <Text style={styles.lockButtonText}>비밀번호 입력</Text>
          </Pressable>
        </View>
      ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { padding: space, paddingBottom: contentPadWithAd },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 앱 정보 카드 */}
        <View style={[styles.appInfoCard, isCompact && styles.appInfoCardCompact]}>
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
        <View style={[styles.section, isCompact && styles.sectionCompact]}>
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
          <View style={styles.leadRow}>
            <Text style={styles.leadLabel}>미리 알림</Text>
            <View style={styles.leadChips}>
              {NOTIFICATION_LEAD_OPTIONS.map((minutes) => (
                <Pressable
                  key={minutes}
                  onPress={() => handleLeadMinutes(minutes)}
                  style={[
                    styles.leadChip,
                    leadMinutes === minutes && styles.leadChipActive,
                  ]}
                >
                  <Text style={[
                    styles.leadChipText,
                    leadMinutes === minutes && styles.leadChipTextActive,
                  ]}>
                    {minutes === 0 ? '정각' : `${minutes}분 전`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed,
            ]}
            onPress={() => {
              setPinError('');
              setPinModal(storedPin ? 'remove' : 'set');
            }}
          >
            <MaterialIcons
              name={storedPin ? 'lock-open' : 'lock'}
              size={28}
              color={SoftPopColors.textSecondary}
            />
            <Text style={styles.settingText}>
              {storedPin ? '설정 잠금 해제' : '설정 잠금'}
            </Text>
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={SoftPopColors.textSecondary}
            />
          </Pressable>
        </View>

        {/* 데이터 관리 섹션 */}
        <View style={[styles.section, isCompact && styles.sectionCompact]}>
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
        <View style={[styles.section, isCompact && styles.sectionCompact]}>
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
      )}

      {/* Ad Banner */}
      <AdBanner
        style={{
          position: 'absolute',
          bottom: adBannerBottom,
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

      <PinLockModal
        visible={pinModal !== null}
        title={
          pinModal === 'unlock' ? '비밀번호'
            : pinModal === 'set' ? '잠금 숫자 4자리'
              : pinModal === 'confirm' ? '한 번 더 입력'
                : '잠금 해제'
        }
        message={
          pinModal === 'set' ? '아이가 설정을 바꾸지 못하게 잠가 두세요.'
            : pinModal === 'confirm' ? '같은 숫자 4자리를 다시 눌러 주세요.'
              : undefined
        }
        confirmLabel={pinModal === 'remove' ? '잠금 풀기' : '확인'}
        errorText={pinError}
        onCancel={() => {
          setPinModal(null);
          setPinError('');
        }}
        onSubmit={handlePinSubmit}
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
  },
  lockGate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  lockTitle: {
    fontSize: 22,
    fontFamily: 'BMJUA',
    color: SoftPopColors.text,
  },
  lockMessage: {
    fontSize: 16,
    fontFamily: 'BMJUA',
    color: SoftPopColors.textSecondary,
    textAlign: 'center',
  },
  lockButton: {
    marginTop: 12,
    backgroundColor: SoftPopColors.primary,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  lockButtonText: {
    color: SoftPopColors.white,
    fontFamily: 'BMJUA',
    fontSize: 18,
  },
  leadRow: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  leadLabel: {
    fontSize: 14,
    fontFamily: 'BMJUA',
    color: SoftPopColors.textSecondary,
    marginBottom: 8,
  },
  leadChips: {
    flexDirection: 'row',
    gap: 8,
  },
  leadChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: SoftPopColors.background,
  },
  leadChipActive: {
    backgroundColor: SoftPopColors.primary,
  },
  leadChipText: {
    fontFamily: 'BMJUA',
    color: SoftPopColors.textSecondary,
  },
  leadChipTextActive: {
    color: SoftPopColors.white,
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
  appInfoCardCompact: {
    padding: 24,
    marginBottom: 16,
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
  sectionCompact: {
    padding: 16,
    marginBottom: 16,
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
