/**
 * 프로필 화면
 * Soft Pop 3D (Claymorphism) 디자인 적용
 * 필수 기능만 구현 (개인정보 수집 최소화)
 */

import React, { useState, useCallback, useRef, useReducer, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Switch, Image, Platform, AppState } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
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
import ParentCheckModal from '../components/ParentCheckModal';
import { initialRecovery, RecoveryState } from '../utils/parentCheck';
import { NOTIFICATION_LEAD_OPTIONS, NotificationLeadMinutes } from '../utils/dateUtils';
import { useActivity } from '../contexts/ActivityContext';
import { useSchedule } from '../contexts/ScheduleContext';
import { toLocalDateString } from '../utils/dateUtils';
import TermsModal from '../components/TermsModal';
import PrivacyModal from '../components/PrivacyModal';
import LicenseModal from '../components/LicenseModal';
import { SoftPopColors } from '../constants/theme';
import { useLayout } from '../hooks/useLayout';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from '../components/Toast';
import { formatLastBackup } from '../utils/lastBackup';
import { decidePinStep } from '../utils/pinFlow';
import { lockReducer, lockView } from '../utils/lockState';

const LAST_BACKUP_KEY = '@settings.lastBackupAt';

export default function ProfileScreen() {
  const { isCompact, isLandscape, space, contentPad, tabBarOffset } = useLayout();
  const { resetActivities, reloadFromStorage: reloadActivities } = useActivity();
  const { resetSchedules, schedules, reloadFromStorage: reloadSchedules } = useSchedule();
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLicense, setShowLicense] = useState(false);
  const [leadMinutes, setLeadMinutes] = useState<NotificationLeadMinutes>(5);
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [lockState, dispatchLock] = useReducer(lockReducer, 'loading');
  const view = lockView(lockState);
  const [pinModal, setPinModal] = useState<'unlock' | 'set' | 'confirm' | 'remove' | 'recover' | null>(null);
  const [recovery, setRecovery] = useState<RecoveryState>(initialRecovery);
  const [pendingPin, setPendingPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastAction, setToastAction] = useState<{ label: string; onPress: () => void } | undefined>();
  const showToast = (message: string, action?: { label: string; onPress: () => void }) => {
    setToastMessage(message);
    setToastAction(action);
    setToastVisible(true);
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';
  const appName = Constants.expoConfig?.name || 'i하루';

  React.useEffect(() => {
    const loadSettings = async () => {
      // PIN first: until it is known the screen shows a neutral placeholder.
      const pin = await loadSettingsPin();
      setStoredPin(pin);
      dispatchLock({ type: 'LOADED', hasPin: Boolean(pin) });
      const enabled = await loadNotificationsMasterEnabled();
      setNotificationEnabled(enabled);
      setLeadMinutes(await loadNotificationLeadMinutes());
      setLastBackupAt(await AsyncStorage.getItem(LAST_BACKUP_KEY));
    };
    loadSettings();
  }, []);

  // Leaving the tab or backgrounding the app re-locks and closes any PIN
  // step, so the gate is already up when the screen is seen again.
  const leave = useCallback(() => {
    dispatchLock({ type: 'LEAVE' });
    setPinModal(null);
    setPendingPin('');
    setPinError('');
  }, []);
  useFocusEffect(useCallback(() => leave, [leave]));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background') leave();
    });
    return () => sub.remove();
  }, [leave]);

  const openUnlock = () => {
    setPinError('');
    setPinModal('unlock');
  };

  // Forgot PIN. From the unlock modal, let it finish closing first: iOS
  // won't present a second modal while one is still dismissing.
  const openRecover = (fromModal: boolean) => {
    setPinError('');
    if (!fromModal) {
      setPinModal('recover');
      return;
    }
    setPinModal(null);
    setTimeout(() => setPinModal('recover'), 450);
  };

  const openSetPin = () => {
    setPinError('');
    setPinModal('set');
  };

  const handleRecovered = async () => {
    setStoredPin(null);
    setPendingPin('');
    dispatchLock({ type: 'RECOVERED' });
    setPinModal(null);
    setRecovery(initialRecovery);
    showToast('잠금을 껐어요. 새 비밀번호를 정해 주세요', {
      label: '정하기',
      onPress: openSetPin,
    });
    try {
      await clearSettingsPin();
    } catch {
      showToast('잠금을 끄지 못했어요. 다시 시도해 주세요');
    }
  };

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
    const decision = decidePinStep({ mode: pinModal === 'recover' ? null : pinModal, pin, storedPin, pendingPin });
    switch (decision.kind) {
      case 'ignore':
        return;
      case 'error':
        setPinError(decision.message);
        return;
      case 'unlocked':
        setPinError('');
        dispatchLock({ type: 'UNLOCK_OK' });
        setPinModal(null);
        return;
      case 'toConfirm':
        setPinError('');
        setPendingPin(decision.pendingPin);
        setPinModal('confirm');
        return;
      case 'save': {
        // Close first so the screen responds at once; then persist.
        setPinError('');
        setPendingPin('');
        setStoredPin(decision.pin);
        dispatchLock({ type: 'ENABLED' });
        setPinModal(null);
        showToast('설정을 잠갔어요');
        try {
          await saveSettingsPin(decision.pin);
        } catch {
          setStoredPin(null);
          dispatchLock({ type: 'DISABLED' });
          showToast('잠금을 저장하지 못했어요. 다시 시도해 주세요');
        }
        return;
      }
      case 'clear': {
        const previous = storedPin;
        setPinError('');
        setStoredPin(null);
        dispatchLock({ type: 'DISABLED' });
        setPinModal(null);
        showToast('설정 잠금을 껐어요');
        try {
          await clearSettingsPin();
        } catch {
          setStoredPin(previous);
          dispatchLock({ type: 'ENABLED' });
          showToast('잠금을 끄지 못했어요. 다시 시도해 주세요');
        }
        return;
      }
    }
  };

  // 데이터 백업
  const handleBackup = async () => {
    try {
      console.log('백업 시작...');
      const data = await exportAllData();

      if (!data) {
        showToast('백업하지 못했어요. 다시 시도해 주세요');
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
        showToast('백업할 활동이나 일정이 아직 없어요');
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
        showToast('이 기기에서는 백업 파일을 만들 수 없어요');
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
      const backedUpAt = new Date().toISOString();
      await AsyncStorage.setItem(LAST_BACKUP_KEY, backedUpAt);
      setLastBackupAt(backedUpAt);
      const doneMessage = `백업했어요. 활동 ${activityCount}개, 일정 ${scheduleCount}개`;

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

          showToast(doneMessage);
        } catch (shareError: any) {
          console.error('공유 오류:', shareError);
          showToast(doneMessage);
        }
      } else {
        showToast(doneMessage);
      }
    } catch (error: any) {
      console.error('Backup error:', error);
      const errorMessage = error?.message || '알 수 없는 오류';
      showToast(`백업하지 못했어요: ${errorMessage}`);
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
                  showToast('파일을 고르지 못했어요');
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
                  showToast('i하루 백업 파일이 아니에요');
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
                  dispatchLock({ type: 'DATA_REPLACED', hasPin: Boolean(pin) });
                  await cancelAllNotifications();
                  if (enabled) {
                    await rescheduleUpcomingNotifications(
                      restoredSchedules,
                      data.notificationSettings
                    );
                  }
                  showToast('복원했어요');
                } else {
                  showToast('복원하지 못했어요. 다시 시도해 주세요');
                }
              } catch (error) {
                console.error('Restore error:', error);
                showToast('백업 파일을 읽지 못했어요');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Restore error:', error);
      showToast('복원하지 못했어요. 다시 시도해 주세요');
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
              dispatchLock({ type: 'DATA_REPLACED', hasPin: Boolean(pin) });
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
      {view === 'placeholder' ? (
        <View style={styles.lockGate} accessibilityLabel="설정 불러오는 중" />
      ) : view === 'gate' ? (
        <Pressable
          style={[styles.lockGate, { padding: space }]}
          onPress={openUnlock}
          accessibilityRole="button"
          accessibilityLabel="설정이 잠겨 있어요. 잠금 풀기"
        >
          <MaterialIcons name="lock" size={48} color={SoftPopColors.primary} />
          <Text style={styles.lockTitle}>설정이 잠겨 있어요</Text>
          <Text style={styles.lockMessage}>부모님만 바꿀 수 있게 잠가 두었어요.</Text>
          <View style={styles.lockButton}>
            <Text style={styles.lockButtonText}>잠금 풀기</Text>
          </View>
          <Pressable
            onPress={() => openRecover(false)}
            style={styles.forgotLink}
            accessibilityRole="button"
            hitSlop={8}
          >
            <Text style={styles.forgotLinkText}>비밀번호를 잊었어요</Text>
          </Pressable>
        </Pressable>
      ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { padding: space, paddingBottom: contentPad },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 앱 정보 카드 */}
        <View style={styles.appHeader}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.appHeaderIcon}
            resizeMode="contain"
          />
          <Text style={styles.appHeaderName}>{appName}</Text>
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
              name={storedPin ? 'lock' : 'lock-open'}
              size={28}
              color={SoftPopColors.textSecondary}
            />
            <Text style={styles.settingText}>설정 잠금</Text>
            <Text style={[styles.stateText, storedPin && styles.stateTextOn]}>
              {storedPin ? '켜짐' : '꺼짐'}
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
            <View style={styles.settingTextBlock}>
              <Text style={[styles.settingText, styles.settingTextInBlock]}>데이터 백업</Text>
              <Text style={styles.settingSubText}>{formatLastBackup(lastBackupAt)}</Text>
            </View>
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

          <View style={styles.settingItem} accessible accessibilityLabel={`버전 ${appVersion}`}>
            <MaterialIcons name="info-outline" size={28} color={SoftPopColors.textSecondary} />
            <Text style={styles.settingText}>버전</Text>
            <Text style={styles.stateText}>{appVersion}</Text>
          </View>
        </View>
      </ScrollView>
      )}


      <Toast
        message={toastMessage}
        visible={toastVisible}
        duration={toastAction ? 5000 : 2600}
        actionLabel={toastAction?.label}
        onAction={toastAction?.onPress}
        bottomOffset={tabBarOffset + 12}
        onHide={() => {
          setToastVisible(false);
          setToastAction(undefined);
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
        visible={pinModal !== null && pinModal !== 'recover'}
        onForgot={pinModal === 'unlock' ? () => openRecover(true) : undefined}
        stepKey={pinModal ?? 'closed'}
        title={
          pinModal === 'unlock' ? '잠금 풀기'
            : pinModal === 'set' ? '잠금 숫자 4자리'
              : pinModal === 'confirm' ? '한 번 더 입력'
                : '잠금 끄기'
        }
        message={
          pinModal === 'unlock' ? '잠금 숫자 4자리를 눌러 주세요.'
            : pinModal === 'remove' ? '끄려면 지금 잠금 숫자 4자리를 눌러 주세요.'
            : pinModal === 'set' ? '아이가 설정을 바꾸지 못하게 잠가 두세요.'
            : pinModal === 'confirm' ? '같은 숫자 4자리를 다시 눌러 주세요.'
              : undefined
        }
        confirmLabel={pinModal === 'remove' ? '잠금 끄기' : '확인'}
        errorText={pinError}
        onCancel={() => {
          setPinModal(null);
          setPinError('');
        }}
        onSubmit={handlePinSubmit}
      />
      <ParentCheckModal
        visible={pinModal === 'recover'}
        recovery={recovery}
        onRecoveryChange={setRecovery}
        onPass={handleRecovered}
        onCancel={() => setPinModal(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  appHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  appHeaderName: {
    fontSize: 24,
    color: SoftPopColors.text,
    fontFamily: 'BMJUA',
  },
  stateText: {
    fontSize: 16,
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
    marginRight: 4,
  },
  stateTextOn: {
    color: SoftPopColors.primary,
  },
  settingTextBlock: {
    flex: 1,
  },
  settingTextInBlock: {
    flex: 0,
  },
  settingSubText: {
    fontSize: 13,
    color: SoftPopColors.textSecondary,
    fontFamily: 'BMJUA',
    marginTop: 2,
  },
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
  forgotLink: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  forgotLinkText: {
    fontFamily: 'BMJUA',
    fontSize: 15,
    color: SoftPopColors.textSecondary,
    textDecorationLine: 'underline',
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
