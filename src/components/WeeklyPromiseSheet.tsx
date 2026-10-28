/**
 * Parent sheet for weekly promises (Settings is already behind the PIN).
 * One slot: straight to the form. Several slots: a short list, then the form.
 */
import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, Modal, Pressable, TextInput, Platform, KeyboardAvoidingView, Alert, ScrollView,
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
import { promiseLine, UpsertResult } from '../utils/weeklyPromises';
import { MULTI_PROMISE_COPY as M } from '../utils/multiPromiseCopy';

interface Props {
  visible: boolean;
  /** Promises that take a slot, oldest first. */
  promises: WeeklyPromise[];
  limit: number;
  /** True when more slots can be bought ('보상 확장' not unlocked). */
  canExpand: boolean;
  today: string;
  onSave: (id: string | null, input: TermsInput) => Promise<UpsertResult>;
  onStop: (id: string) => Promise<void>;
  onOpenExpansion: () => void;
  onClose: () => void;
}

type View_ = { kind: 'list' } | { kind: 'form'; id: string | null; direct: boolean };

export default function WeeklyPromiseSheet(props: Props) {
  const { visible, promises, limit, canExpand, today, onClose } = props;
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<View_>({ kind: 'list' });

  useEffect(() => {
    if (!visible) return;
    // With one slot there is nothing to choose: open the form directly.
    if (limit <= 1 && promises.length <= 1) setView({ kind: 'form', id: promises[0]?.id ?? null, direct: true });
    else setView({ kind: 'list' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const editing = view.kind === 'form' && view.id ? promises.find(p => p.id === view.id) ?? null : null;
  const canAdd = promises.length < limit;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={modalStyles.sheetOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ModalBackdrop onPress={onClose} />
        <View style={[modalStyles.sheet, styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
          <View style={styles.header}>
            {view.kind === 'form' && !view.direct ? (
              <Pressable
                onPress={() => setView({ kind: 'list' })}
                style={({ pressed }) => [modalStyles.closeButton, pressed && modalStyles.closeButtonPressed]}
                accessibilityRole="button"
                accessibilityLabel={M.back}
              >
                <MaterialIcons name="arrow-back" size={24} color={SoftPopColors.text} />
              </Pressable>
            ) : null}
            <Text style={[modalStyles.title, styles.headerTitle]}>
              {view.kind === 'form' && !view.direct ? (editing ? M.editTitle : M.newTitle) : '주간 보상 약속'}
            </Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [modalStyles.closeButton, pressed && modalStyles.closeButtonPressed]}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <MaterialIcons name="close" size={24} color={SoftPopColors.text} />
            </Pressable>
          </View>

          {view.kind === 'list' ? (
            <ScrollView style={styles.listScroll} bounces={false}>
              <Text style={styles.intro}>{M.listIntro}</Text>
              {promises.map(p => {
                const line = promiseLine(p, today);
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setView({ kind: 'form', id: p.id, direct: false })}
                    style={({ pressed }) => [styles.listRow, pressed && styles.savePressed]}
                    accessibilityRole="button"
                    accessibilityLabel={`${line.title}${line.note ? `, ${line.note}` : ''}`}
                  >
                    <MaterialIcons name="card-giftcard" size={22} color={SoftPopColors.today} />
                    <View style={styles.listText}>
                      <Text style={styles.listTitle} numberOfLines={1}>{line.title}</Text>
                      {line.note ? <Text style={styles.hint} numberOfLines={1}>{line.note}</Text> : null}
                    </View>
                    <MaterialIcons name="chevron-right" size={22} color={SoftPopColors.textSecondary} />
                  </Pressable>
                );
              })}
              <Text style={styles.note}>{M.slots(promises.length, limit)}</Text>
              {canAdd ? (
                <Pressable
                  onPress={() => setView({ kind: 'form', id: null, direct: false })}
                  style={({ pressed }) => [styles.save, pressed && styles.savePressed]}
                  accessibilityRole="button"
                >
                  <Text style={styles.saveText}>{M.add}</Text>
                </Pressable>
              ) : canExpand ? (
                <Pressable onPress={props.onOpenExpansion} style={styles.stop} accessibilityRole="button" hitSlop={8}>
                  <Text style={styles.stopText}>{M.expandLink}</Text>
                </Pressable>
              ) : null}
            </ScrollView>
          ) : (
            <PromiseForm
              key={view.id ?? 'new'}
              promise={editing}
              today={today}
              onSave={async input => {
                const r = await props.onSave(view.id, input);
                if (!r.ok) { Alert.alert(M.limitTitle, M.limitBody(limit)); return; }
                if (view.direct) onClose(); else setView({ kind: 'list' });
              }}
              onStop={async () => {
                if (!editing) return;
                await props.onStop(editing.id);
                if (view.direct) onClose(); else setView({ kind: 'list' });
              }}
              moreLink={view.direct && canExpand && promises.length > 0 ? props.onOpenExpansion : undefined}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function PromiseForm({ promise, today, onSave, onStop, moreLink }: {
  promise: WeeklyPromise | null;
  today: string;
  onSave: (input: TermsInput) => Promise<void>;
  onStop: () => Promise<void>;
  moreLink?: () => void;
}) {
  const thisWeek = weekOf(today).start;
  const active = termsForWeek(promise, thisWeek);
  const pending = pendingChange(promise, today);
  const shown = pending.kind === 'change' ? pending.terms : active;
  const [reward, setReward] = useState('');
  const [goal, setGoal] = useState<number>(DEFAULT_GOAL_PERCENT);

  useEffect(() => {
    setReward(shown?.reward ?? '');
    setGoal(shown?.goalPercent ?? DEFAULT_GOAL_PERCENT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promise?.id]);

  const canSave = normalizeReward(reward).length > 0;
  const nextMonday = shortDate(addDays(thisWeek, 7));
  const note = !active
    ? '저장하면 이번 주부터 시작해요.'
    : `바꾼 내용은 다음 주(${nextMonday} 월요일)부터 적용돼요.`;

  const handleStop = () => {
    Alert.alert('약속 그만하기', '이번 주까지만 약속이 이어지고, 다음 주부터는 보이지 않아요.', [
      { text: '취소', style: 'cancel' },
      { text: '그만하기', style: 'destructive', onPress: () => { void onStop(); } },
    ]);
  };

  return (
    <>
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
            onPress={() => { void onSave({ reward, goalPercent: goal }); }}
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
          {moreLink && (
            <Pressable onPress={moreLink} style={styles.stop} accessibilityRole="button" hitSlop={8}>
              <Text style={styles.stopText}>{M.expandLink}</Text>
            </Pressable>
          )}
    </>
  );
}

const bold = Platform.OS === 'android' ? 'normal' : '700';
const styles = StyleSheet.create({
  sheet: { paddingHorizontal: 20, paddingTop: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  headerTitle: { flex: 1 },
  listScroll: { flexGrow: 0 },
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, minHeight: 56,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: SoftPopColors.background,
  },
  listText: { flex: 1, minWidth: 0 },
  listTitle: { fontSize: 16, lineHeight: 22, fontFamily: 'BMJUA', fontWeight: bold, color: SoftPopColors.text },
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
