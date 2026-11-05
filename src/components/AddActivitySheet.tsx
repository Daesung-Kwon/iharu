/**
 * Phone Plan "+ 추가" bottom sheet: pick activity, start time, duration, repeat.
 * Overlaps are shown inline before saving, with a one-tap fix.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, TextInput, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ActivityIcon from './ActivityIcon';
import { Activity } from '../types';
import { SoftPopColors } from '../constants/theme';
import ModalBackdrop, { sheetFrameStyle } from './ModalBackdrop';
import { modalStyles } from '../constants/modalStyle';
import { MIN_TOUCH_TARGET } from '../hooks/useLayout';
import {
  DAY_END_MIN, MAX_DURATION, MIN_DURATION, SpanItem, TIME_STEP_MIN,
  clampDuration, defaultStart, formatRange, fromMinutes, validateSlot,
} from '../utils/planList';
import { filterActivities, shouldShowSearch } from '../utils/activityPicker';

type Props = {
  visible: boolean;
  activities: Activity[];
  items: SpanItem[];
  nowMin?: number;
  onClose: () => void;
  onSave: (activity: Activity, startTime: string, weekdays: boolean) => boolean;
  onManageActivities?: () => void;
};

const STEP_HOUR = 60;

export default function AddActivitySheet({ visible, activities, items, nowMin, onClose, onSave, onManageActivities }: Props) {
  const insets = useSafeAreaInsets();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [duration, setDuration] = useState(30);
  const [start, setStart] = useState(7 * 60);
  const [weekdays, setWeekdays] = useState(false);
  const [query, setQuery] = useState('');
  const { height: winH } = useWindowDimensions();
  // Cap the chip area so time, duration and save stay on screen (about 3 rows on SE)
  const chipMaxH = Math.max(112, Math.min(200, winH * 0.24));
  const shown = useMemo(() => filterActivities(activities, query), [activities, query]);

  useEffect(() => {
    if (!visible) return;
    const first = activities[0] ?? null;
    const d = clampDuration(first?.durationMinutes ?? 30);
    setActivity(first);
    setDuration(d);
    setStart(defaultStart(items, d, nowMin));
    setWeekdays(false);
    setQuery('');
  }, [visible]);

  const result = useMemo(() => validateSlot(items, start, duration), [items, start, duration]);

  const pick = (a: Activity) => {
    setActivity(a);
    setDuration(clampDuration(a.durationMinutes));
  };
  const moveStart = (delta: number) =>
    setStart(s => Math.max(0, Math.min(DAY_END_MIN - TIME_STEP_MIN, s + delta)));
  const save = () => {
    if (!activity || !result.ok) return;
    if (onSave({ ...activity, durationMinutes: duration }, fromMinutes(start), weekdays)) onClose();
  };

  const Step = ({ icon, label, onPress, disabled }: { icon: 'remove' | 'add'; label: string; onPress: () => void; disabled?: boolean }) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.step, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <MaterialIcons name={icon} size={22} color={SoftPopColors.text} />
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.sheetOverlay}>
      <ModalBackdrop onPress={onClose} />
      <View style={[sheetFrameStyle(insets.bottom), styles.sheet]}>
        <View style={styles.headerRow}>
          <Text style={modalStyles.title}>활동 추가</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [modalStyles.closeButton, pressed && modalStyles.closeButtonPressed]}
            accessibilityLabel="닫기"
          >
            <MaterialIcons name="close" size={24} color={SoftPopColors.text} />
          </Pressable>
        </View>

        <Text style={styles.label}>활동</Text>
        {activities.length === 0 ? (
          <Pressable style={styles.secondaryBtn} onPress={onManageActivities}>
            <Text style={styles.secondaryText}>활동 탭에서 활동 만들기</Text>
          </Pressable>
        ) : (
          <>
            {shouldShowSearch(activities.length) && (
              <View style={styles.search}>
                <MaterialIcons name="search" size={20} color={SoftPopColors.textSecondary} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="활동 이름 찾기"
                  placeholderTextColor={SoftPopColors.textSecondary}
                  style={styles.searchInput}
                  returnKeyType="done"
                  accessibilityLabel="활동 이름 찾기"
                />
                {query.length > 0 && (
                  <Pressable onPress={() => setQuery('')} style={styles.searchClear} accessibilityLabel="찾기 지우기">
                    <MaterialIcons name="cancel" size={20} color={SoftPopColors.textSecondary} />
                  </Pressable>
                )}
              </View>
            )}
            <ScrollView style={{ maxHeight: chipMaxH }} contentContainerStyle={styles.chips} keyboardShouldPersistTaps="handled">
              {shown.length === 0 && <Text style={styles.empty}>'{query.trim()}' 활동이 없어요</Text>}
              {shown.map(a => {
                const on = activity?.id === a.id;
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => pick(a)}
                    accessibilityState={{ selected: on }}
                    accessibilityLabel={a.name}
                    style={[styles.chip, on && styles.chipOn]}
                  >
                    {on
                      ? <MaterialIcons name="check-circle" size={20} color={SoftPopColors.white} />
                      : <ActivityIcon activity={a} size={22} color={SoftPopColors.text} />}
                    <Text style={[styles.chipText, on && styles.chipTextOn]} numberOfLines={1}>{a.name}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>시작 시간</Text>
            <View style={styles.stepper}>
              <Step icon="remove" label="10분 앞으로" onPress={() => moveStart(-TIME_STEP_MIN)} disabled={start <= 0} />
              <Text style={styles.value}>{fromMinutes(start)}</Text>
              <Step icon="add" label="10분 뒤로" onPress={() => moveStart(TIME_STEP_MIN)} />
            </View>
            <View style={styles.hourRow}>
              <Pressable style={styles.hourBtn} onPress={() => moveStart(-STEP_HOUR)}><Text style={styles.hourText}>1시간 앞</Text></Pressable>
              <Pressable style={styles.hourBtn} onPress={() => moveStart(STEP_HOUR)}><Text style={styles.hourText}>1시간 뒤</Text></Pressable>
            </View>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>걸리는 시간</Text>
            <View style={styles.stepper}>
              <Step icon="remove" label="10분 줄이기" onPress={() => setDuration(d => clampDuration(d - TIME_STEP_MIN))} disabled={duration <= MIN_DURATION} />
              <Text style={styles.value}>{duration}분</Text>
              <Step icon="add" label="10분 늘리기" onPress={() => setDuration(d => clampDuration(d + TIME_STEP_MIN))} disabled={duration >= MAX_DURATION} />
            </View>
          </View>
        </View>

        <Text style={styles.label}>반복</Text>
        <View style={styles.segment}>
          {[{ k: false, t: '이날만' }, { k: true, t: '이번 주 월~금' }].map(o => (
            <Pressable
              key={o.t}
              onPress={() => setWeekdays(o.k)}
              accessibilityState={{ selected: weekdays === o.k }}
              style={[styles.segBtn, weekdays === o.k && styles.segOn]}
            >
              <Text style={[styles.segText, weekdays === o.k && styles.chipTextOn]}>{o.t}</Text>
            </Pressable>
          ))}
        </View>

        {result.ok ? (
          <Text style={styles.okText}>{formatRange(fromMinutes(start), result.endTime)}에 넣어요</Text>
        ) : (
          <View style={styles.warn}>
            <MaterialIcons name="error-outline" size={20} color={SoftPopColors.error} />
            <Text style={styles.warnText}>{result.message}</Text>
            {result.suggestion !== null && (
              <Pressable style={styles.fixBtn} onPress={() => setStart(result.suggestion as number)}>
                <Text style={styles.fixText}>{fromMinutes(result.suggestion)}로 옮기기</Text>
              </Pressable>
            )}
          </View>
        )}

        <Pressable
          onPress={save}
          disabled={!activity || !result.ok}
          style={({ pressed }) => [styles.saveBtn, (!activity || !result.ok) && styles.disabled, pressed && styles.pressed]}
        >
          <Text style={styles.saveText}>
            {result.ok ? `${formatRange(fromMinutes(start), result.endTime)} 추가하기` : '겹치지 않는 시간을 골라 주세요'}
          </Text>
        </Pressable>
      </View>
      </View>
    </Modal>
  );
}

const font = { fontFamily: 'BMJUA' } as const;
const styles = StyleSheet.create({
  sheet: { gap: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  label: { ...font, fontSize: 14, color: SoftPopColors.textSecondary, marginTop: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingVertical: 2 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: MIN_TOUCH_TARGET, paddingLeft: 12, borderRadius: 14, backgroundColor: SoftPopColors.background },
  searchInput: { ...font, flex: 1, fontSize: 16, color: SoftPopColors.text, paddingVertical: 8 },
  searchClear: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
  empty: { ...font, fontSize: 14, color: SoftPopColors.textSecondary, paddingVertical: 12 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: MIN_TOUCH_TARGET, paddingHorizontal: 12, borderRadius: 22, backgroundColor: SoftPopColors.background, maxWidth: 160, borderWidth: 2, borderColor: 'transparent' },
  chipOn: { backgroundColor: SoftPopColors.primary, borderColor: SoftPopColors.text },
  chipText: { ...font, fontSize: 15, color: SoftPopColors.text, flexShrink: 1 },
  chipTextOn: { color: SoftPopColors.white },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: SoftPopColors.background, borderRadius: 16 },
  step: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
  value: { ...font, fontSize: 20, color: SoftPopColors.text },
  hourRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  hourBtn: { flex: 1, minHeight: MIN_TOUCH_TARGET, borderRadius: 12, borderWidth: 1, borderColor: SoftPopColors.background, alignItems: 'center', justifyContent: 'center' },
  hourText: { ...font, fontSize: 13, color: SoftPopColors.textSecondary },
  segment: { flexDirection: 'row', gap: 8 },
  segBtn: { flex: 1, minHeight: MIN_TOUCH_TARGET, borderRadius: 14, backgroundColor: SoftPopColors.background, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: SoftPopColors.secondary },
  segText: { ...font, fontSize: 15, color: SoftPopColors.text },
  okText: { ...font, fontSize: 15, color: SoftPopColors.success, textAlign: 'center', marginTop: 4 },
  warn: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, backgroundColor: '#FFF0F0', borderRadius: 14, padding: 10 },
  warnText: { ...font, fontSize: 14, color: SoftPopColors.error, flex: 1 },
  fixBtn: { minHeight: MIN_TOUCH_TARGET, paddingHorizontal: 12, borderRadius: 12, backgroundColor: SoftPopColors.white, borderWidth: 1, borderColor: SoftPopColors.error, justifyContent: 'center' },
  fixText: { ...font, fontSize: 14, color: SoftPopColors.error },
  saveBtn: { minHeight: 52, borderRadius: 18, backgroundColor: SoftPopColors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  saveText: { ...font, fontSize: 17, color: SoftPopColors.white },
  secondaryBtn: { minHeight: MIN_TOUCH_TARGET, borderRadius: 14, borderWidth: 1, borderColor: SoftPopColors.primary, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { ...font, fontSize: 15, color: SoftPopColors.primary },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.7 },
});
