/** Parent-only '보상 확장' purchase sheet (Settings is already behind the PIN). */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform, ActivityIndicator, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { SoftPopColors } from '../constants/theme';
import ModalBackdrop, { sheetFrameStyle } from './ModalBackdrop';
import { modalStyles } from '../constants/modalStyle';
import { EXPANSION_COPY as C } from '../utils/rewardExpansion';
import { useRewardExpansion } from '../contexts/RewardExpansionContext';

/** Sim/QA builds only (EXPO_PUBLIC_IAP_TEST=1 at bundle time, or dev). */
export const SHOW_TEST_TOGGLE = __DEV__ || process.env.EXPO_PUBLIC_IAP_TEST === '1';

interface Props {
  visible: boolean;
  onClose: () => void;
  onMessage: (text: string) => void;
}

export default function RewardExpansionSheet({ visible, onClose, onMessage }: Props) {
  const insets = useSafeAreaInsets();
  const { expansion, getPrice, purchase, restore, setTestUnlocked } = useRewardExpansion();
  const [price, setPrice] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);
  /** Shown inside the sheet: a Toast would sit under the Modal. */
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (visible) setNotice(null);
    if (!visible || expansion.unlocked) return;
    let live = true;
    getPrice().then(p => { if (live) setPrice(p); });
    return () => { live = false; };
  }, [visible, expansion.unlocked, getPrice]);

  const onBuy = async () => {
    setBusy('buy');
    try {
      const out = await purchase();
      if (out.kind === 'purchased') { onMessage('보상 확장을 열었어요'); onClose(); }
      else if (out.kind === 'unavailable') setNotice(C.unavailable);
      else if (out.kind === 'error') setNotice('구매하지 못했어요. 다시 해 봐요.');
    } finally { setBusy(null); }
  };

  const onRestore = async () => {
    setBusy('restore');
    try {
      const r = await restore();
      if (r === 'restored') { onMessage('구매를 다시 불러왔어요'); onClose(); }
      else setNotice('불러올 구매 기록이 없어요');
    } finally { setBusy(null); }
  };

  const unlocked = expansion.unlocked;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.sheetOverlay}>
        <ModalBackdrop onPress={onClose} />
        <View style={sheetFrameStyle(insets.bottom)}>
          <View style={styles.header}>
            <Text style={modalStyles.title}>{C.title}</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [modalStyles.closeButton, pressed && modalStyles.closeButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <MaterialIcons name="close" size={24} color={SoftPopColors.text} />
            </Pressable>
          </View>

          <Text style={styles.intro}>{C.intro}</Text>
          {C.benefits.map(b => (
            <View key={b} style={styles.benefit}>
              <MaterialIcons name="check-circle" size={20} color={SoftPopColors.primary} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}

          {unlocked ? (
            <View style={styles.doneBox} accessible accessibilityLabel={C.done}>
              <MaterialIcons name="verified" size={22} color={SoftPopColors.primary} />
              <Text style={styles.doneText}>{C.done}</Text>
            </View>
          ) : (
            <>
              <Pressable
                disabled={busy !== null}
                onPress={onBuy}
                style={({ pressed }) => [styles.buy, busy && styles.disabled, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={price ? `${C.buy}, ${price}` : C.buy}
              >
                {busy === 'buy'
                  ? <ActivityIndicator color={SoftPopColors.white} />
                  : <Text style={styles.buyText}>{price ? `${C.buy} (${price})` : C.buy}</Text>}
              </Pressable>
              {notice
                ? <Text style={[styles.note, styles.notice]} accessibilityLiveRegion="polite">{notice}</Text>
                : !price && <Text style={styles.note}>{C.priceLater}</Text>}
              <Pressable
                disabled={busy !== null}
                onPress={onRestore}
                style={styles.restore}
                accessibilityRole="button"
                hitSlop={8}
              >
                {busy === 'restore'
                  ? <ActivityIndicator color={SoftPopColors.textSecondary} />
                  : <Text style={styles.restoreText}>{C.restore}</Text>}
              </Pressable>
            </>
          )}

          {SHOW_TEST_TOGGLE && expansion.source !== 'store' && expansion.source !== 'restore' && (
            <View style={styles.testRow}>
              <Text style={styles.testText}>{C.testOn}</Text>
              <Switch
                value={expansion.source === 'test'}
                onValueChange={on => setTestUnlocked(on)}
                accessibilityLabel={C.testOn}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const bold = Platform.OS === 'android' ? 'normal' : '700';
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  intro: { marginTop: 6, marginBottom: 8, fontSize: 14, lineHeight: 20, color: SoftPopColors.textSecondary },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  benefitText: { fontSize: 16, color: SoftPopColors.text, flexShrink: 1 },
  buy: {
    marginTop: 20, minHeight: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SoftPopColors.primary,
  },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  buyText: { fontSize: 18, fontFamily: 'BMJUA', fontWeight: bold, color: SoftPopColors.white },
  note: { marginTop: 8, fontSize: 13, textAlign: 'center', color: SoftPopColors.textSecondary },
  notice: { color: SoftPopColors.text },
  restore: { marginTop: 12, alignSelf: 'center', padding: 4, minHeight: 28 },
  restoreText: { fontSize: 14, color: SoftPopColors.textSecondary, textDecorationLine: 'underline' },
  doneBox: {
    marginTop: 20, minHeight: 52, borderRadius: 26, flexDirection: 'row', gap: 8,
    alignItems: 'center', justifyContent: 'center', backgroundColor: SoftPopColors.background,
  },
  doneText: { fontSize: 17, fontFamily: 'BMJUA', fontWeight: bold, color: SoftPopColors.text },
  testRow: {
    marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: SoftPopColors.background,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  testText: { fontSize: 14, color: SoftPopColors.textSecondary },
});
