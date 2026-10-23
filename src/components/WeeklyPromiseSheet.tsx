/** Parent form for the weekly promise (Settings is already behind the PIN). */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, TextInput, Platform, KeyboardAvoidingView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { SoftPopColors } from '../constants/theme';
import ModalBackdrop from './ModalBackdrop';
import { modalStyles } from '../constants/modalStyle';
import {
  DEFAULT_GOAL_PERCENT, GOAL_OPTIONS, normalizeReward, pendingChange, REWARD_MAX_LENGTH,
  shortDate, termsForWeek, weekOf, WeeklyPromise, TermsInput, addDays,
} from '../utils/weeklyPromise';

interface Props {
  visible: boolean;
  promise: WeeklyPromise | null;
  today: string;
  onSave: (input: TermsInput) => Promise<void>;
  onStop: () => Promise<void>;
  onClose: () => void;
}

export default function WeeklyPromiseSheet({ visible, promise, today, onSave, onStop, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const thisWeek = weekOf(today).start;
  const active = termsForWeek(promise, thisWeek);
  const pending = pendingChange(promise, today);
  const shown = pending.kind === 'change' ? pending.terms : active;
  const [reward, setReward] = useState('');
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL_PERCENT);

  useEffect(() => {
    if (!visible) return;
    setReward(shown?.reward ?? '');
    setGoal(shown?.goalPercent ?? DEFAULT_GOAL_PERCENT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const canSave = normalizeReward(reward).length > 0;
  const nextMonday = shortDate(addDays(thisWeek, 7));
  const note = !active
    ? '저장하면 이번 주부터 시작해요.'
    : `바꾼 내용은 다음 주(${nextMonday} 월요일)부터 적용돼요.`;

  const handleStop = () => {
    Alert.alert('약속 그만하기', '이번 주까지만 약속이 이어지고, 다음 주부터는 보이지 않아요.', [
      { text: '취소', style: 'cancel' },
      { text: '그만하기', style: 'destructive', onPress: async () => { await onStop(); onClose(); } },
    ]);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={modalStyles.sheetOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ModalBackdrop onPress={onClose} />
        <View style={[modalStyles.sheet, styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.header}>
            <Text style={modalStyles.title}>주간 보상 약속</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [modalStyles.closeButton, pressed && modalStyles.closeButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <MaterialIcons name="close" size={24} color={SoftPopColors.text} />
            </Pressable>
          </View>

          <Text style={styles.intro}>할 일은 아이가 정해요. 부모님은 보상만 정해 주세요.</Text>

          <Text style={styles.label}>보상</Text>
          <TextInput
            value={reward}
            onChangeText={setReward}
            placeholder="게임 재화"
            placeholderTextColor={SoftPopColors.textSecondary}
            maxLength={REWARD_MAX_LENGTH}
            style={styles.input}
            returnKeyType="done"
            accessibilityLabel="보상"
          />
          <Text style={styles.hint}>작고 바로 줄 수 있는 보상이 좋아요. 아이와 함께 정해 보세요.</Text>

          <Text style={styles.label}>목표 (할 일을 다 끝낸 날)</Text>
          <View style={styles.chips}>
            {GOAL_OPTIONS.map(g => (
              <Pressable
                key={g}
                onPress={() => setGoal(g)}
                style={[styles.chip, goal === g && styles.chipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: goal === g }}
                accessibilityLabel={`목표 ${g}퍼센트`}
              >
                <Text style={[styles.chipText, goal === g && styles.chipTextActive]}>{g}%</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.note}>{note}</Text>
          {pending.kind === 'stop' && (
            <Text style={styles.note}>{`${shortDate(pending.from)}부터 약속을 그만해요. 저장하면 다시 이어져요.`}</Text>
          )}

          <Pressable
            disabled={!canSave}
            onPress={async () => { await onSave({ reward, goalPercent: goal }); onClose(); }}
            style={({ pressed }) => [styles.save, !canSave && styles.saveDisabled, pressed && styles.savePressed]}
            accessibilityRole="button"
          >
            <Text style={styles.saveText}>저장</Text>
          </Pressable>
          {active && pending.kind !== 'stop' && (
            <Pressable onPress={handleStop} style={styles.stop} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.stopText}>약속 그만하기</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const bold = Platform.OS === 'android' ? 'normal' : '700';
const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  intro: { marginTop: 6, fontSize: 14, lineHeight: 20, color: SoftPopColors.textSecondary },
  label: { marginTop: 16, marginBottom: 6, fontSize: 16, fontFamily: 'BMJUA', fontWeight: bold, color: SoftPopColors.text },
  input: {
    borderWidth: 2, borderColor: SoftPopColors.background, backgroundColor: SoftPopColors.background,
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 17, color: SoftPopColors.text,
  },
  hint: { marginTop: 6, fontSize: 13, lineHeight: 18, color: SoftPopColors.textSecondary },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    flex: 1, minHeight: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SoftPopColors.background,
  },
  chipActive: { backgroundColor: SoftPopColors.primary },
  chipText: { fontSize: 15, fontFamily: 'BMJUA', fontWeight: bold, color: SoftPopColors.text },
  chipTextActive: { color: SoftPopColors.white },
  note: { marginTop: 12, fontSize: 13, lineHeight: 18, color: SoftPopColors.textSecondary },
  save: {
    marginTop: 16, minHeight: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center',
    backgroundColor: SoftPopColors.primary,
  },
  saveDisabled: { opacity: 0.4 },
  savePressed: { opacity: 0.85 },
  saveText: { fontSize: 18, fontFamily: 'BMJUA', fontWeight: bold, color: SoftPopColors.white },
  stop: { marginTop: 12, alignSelf: 'center', padding: 4 },
  stopText: { fontSize: 14, color: SoftPopColors.textSecondary, textDecorationLine: 'underline' },
});
