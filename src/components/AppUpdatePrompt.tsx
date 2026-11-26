/**
 * Soft update card. Not a forced update: the rest of the app stays tappable,
 * and 나중에 hides this store version. iOS only.
 *
 * Simulator (dev client), once splash and any lock or reward card are gone:
 *   xcrun simctl launch booted com.dailyschedule.app -previewAppUpdate 1
 * That pretends the installed version is 0.0.0 and the store version is 9.9.9
 * (no iTunes call). A lower-current check against the real lookup:
 *   xcrun simctl launch booted com.dailyschedule.app -mockCurrentVersion 0.9.0
 * Same switches via EXPO_PUBLIC_PREVIEW_APP_UPDATE=1 and
 * EXPO_PUBLIC_APP_UPDATE_MOCK_CURRENT / EXPO_PUBLIC_APP_UPDATE_MOCK_STORE.
 */
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AppState, Linking, Platform, Pressable, Settings, StyleSheet, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IhIcon } from './icons/IhIcon';
import { modalStyles } from '../constants/modalStyle';
import { BrandAccent, SoftPopColors } from '../constants/theme';
import { Fonts } from '../constants/fonts';
import { useLayout } from '../hooks/useLayout';
import { readInstalledAppVersion } from '../services/installedVersion';
import {
  AppUpdatePreview,
  canPresentAppUpdate,
  dismissAppUpdate,
  isAppUpdateBlocked,
  isPreviewActive,
  MOCK_CURRENT_VERSION_SETTING,
  MOCK_STORE_VERSION_SETTING,
  openAppStorePage,
  PREVIEW_APP_UPDATE_SETTING,
  previewFromSources,
  runAppUpdateCheck,
  subscribeAppUpdateGate,
} from '../services/appUpdate';

function readLaunchSetting(key: string): unknown {
  if (Platform.OS !== 'ios') return null;
  try {
    return Settings.get(key);
  } catch {
    return null;
  }
}

function readIosPreview(): AppUpdatePreview | null {
  if (!__DEV__) return null;
  return previewFromSources(true, {
    previewFlag: readLaunchSetting(PREVIEW_APP_UPDATE_SETTING),
    mockCurrent: readLaunchSetting(MOCK_CURRENT_VERSION_SETTING),
    mockStore: readLaunchSetting(MOCK_STORE_VERSION_SETTING),
    envPreview: process.env.EXPO_PUBLIC_PREVIEW_APP_UPDATE,
    envCurrent: process.env.EXPO_PUBLIC_APP_UPDATE_MOCK_CURRENT,
    envStore: process.env.EXPO_PUBLIC_APP_UPDATE_MOCK_STORE,
  });
}

export default function AppUpdatePrompt() {
  const blocked = useSyncExternalStore(subscribeAppUpdateGate, isAppUpdateBlocked, isAppUpdateBlocked);
  const { tabBarOffset } = useLayout();
  const [promptVersion, setPromptVersion] = useState<string | null>(null);
  const previewRef = useRef<AppUpdatePreview | null | undefined>(undefined);
  if (previewRef.current === undefined) {
    previewRef.current = Platform.OS === 'ios' ? readIosPreview() : null;
  }
  const sessionHidden = useRef(false);
  const checking = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let cancelled = false;
    const run = () => {
      if (cancelled || sessionHidden.current || checking.current) return;
      checking.current = true;
      void runAppUpdateCheck({
        platform: 'ios',
        now: Date.now(),
        currentVersion: readInstalledAppVersion(),
        preview: previewRef.current ?? null,
        storage: AsyncStorage,
      })
        .then((result) => {
          if (cancelled || sessionHidden.current) return;
          if (result.promptVersion) setPromptVersion(result.promptVersion);
        })
        .catch(() => {})
        .finally(() => {
          checking.current = false;
        });
    };
    run();
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') run();
    });
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  if (!canPresentAppUpdate(promptVersion, blocked) || Platform.OS !== 'ios') return null;
  const version = promptVersion;
  if (!version) return null;

  const hideForSession = () => {
    sessionHidden.current = true;
    setPromptVersion(null);
  };

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <View
        style={[modalStyles.dialog, { marginBottom: tabBarOffset + 12 }]}
        accessibilityRole="summary"
        accessibilityLabel="새 버전이 있어요"
      >
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <IhIcon name="ih-sparkle" size={28} color={BrandAccent.text} />
          </View>
          <Text style={styles.title}>새 버전이 있어요</Text>
        </View>
        <Text style={styles.body}>
          앱스토어에 새로운 i하루가 있어요. 지금 받거나, 나중에 받아도 돼요.
        </Text>
        <View style={styles.actions}>
          <Pressable
            onPress={() => {
              hideForSession();
              void dismissAppUpdate(AsyncStorage, version, {
                persist: !isPreviewActive(previewRef.current),
              });
            }}
            style={({ pressed }) => [styles.later, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="나중에"
          >
            <Text style={styles.laterText}>나중에</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              hideForSession();
              void openAppStorePage((url) => Linking.openURL(url));
            }}
            style={({ pressed }) => [styles.update, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="업데이트"
          >
            <Text style={styles.updateText}>업데이트</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const bold = Platform.OS === 'android' ? 'normal' : '700';

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 20,
    elevation: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandAccent.soft,
  },
  title: {
    flex: 1,
    fontFamily: Fonts.jua,
    fontWeight: bold,
    fontSize: 22,
    lineHeight: 30,
    color: SoftPopColors.text,
  },
  body: {
    marginTop: 12,
    fontFamily: Fonts.jua,
    fontSize: 16,
    lineHeight: 24,
    color: SoftPopColors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  later: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  laterText: {
    fontFamily: Fonts.jua,
    fontSize: 17,
    lineHeight: 24,
    color: SoftPopColors.textSecondary,
  },
  update: {
    minHeight: 48,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandAccent.strong,
  },
  updateText: {
    fontFamily: Fonts.jua,
    fontWeight: bold,
    fontSize: 17,
    lineHeight: 24,
    color: SoftPopColors.white,
  },
  pressed: {
    opacity: 0.85,
  },
});
