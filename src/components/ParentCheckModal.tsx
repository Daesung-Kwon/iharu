/**
 * Forgot-PIN parent check: one multiplication with a number-pad answer.
 * Wrong answers get a new problem; 3 misses start a short cooldown.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SoftPopColors } from '../constants/theme';
import {
  cooldownSecondsLeft,
  isCorrectAnswer,
  makeProblem,
  MathProblem,
  recordWrong,
  RecoveryState,
} from '../utils/parentCheck';

interface ParentCheckModalProps {
  visible: boolean;
  /** Kept by the screen so closing and reopening does not skip the cooldown. */
  recovery: RecoveryState;
  onRecoveryChange: (next: RecoveryState) => void;
  onPass: () => void;
  onCancel: () => void;
}

export default function ParentCheckModal({
  visible,
  recovery,
  onRecoveryChange,
  onPass,
  onCancel,
}: ParentCheckModalProps) {
  const [problem, setProblem] = useState<MathProblem>(() => makeProblem());
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(Date.now());
  const inputRef = useRef<TextInput>(null);

  const secondsLeft = cooldownSecondsLeft(recovery, now);
  const coolingDown = secondsLeft > 0;

  useEffect(() => {
    if (visible) {
      setProblem((p) => makeProblem(Math.random, p));
      setAnswer('');
      setMessage('');
      setNow(Date.now());
    } else {
      Keyboard.dismiss();
    }
  }, [visible]);

  // Tick only while cooling down; refocus when it ends.
  useEffect(() => {
    if (!visible || !coolingDown) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [visible, coolingDown]);
  const wasCooling = useRef(false);
  useEffect(() => {
    if (wasCooling.current && !coolingDown && visible) {
      setMessage('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    wasCooling.current = coolingDown;
  }, [coolingDown, visible]);

  const submit = () => {
    if (coolingDown || !answer) return;
    if (isCorrectAnswer(problem, answer)) {
      onPass();
      return;
    }
    const t = Date.now();
    const next = recordWrong(recovery, t);
    onRecoveryChange(next);
    setNow(t);
    setProblem((p) => makeProblem(Math.random, p));
    setAnswer('');
    if (cooldownSecondsLeft(next, t) > 0) {
      Keyboard.dismiss();
      setMessage('여러 번 틀렸어요. 잠시 후 다시 해 주세요');
    } else {
      setMessage('답이 달라요. 새 문제를 풀어 주세요');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Keep 취소 / 확인 above the number pad on small phones (SE). */}
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>어른 확인</Text>
          <Text style={styles.body}>
            문제를 풀면 잠금이 꺼져요. 그다음 새 비밀번호를 정할 수 있어요.
          </Text>
          <Text style={[styles.problem, coolingDown && styles.dim]} accessibilityLabel={`${problem.a} 곱하기 ${problem.b}는?`}>
            {problem.a}
            {/* BMJUA maps × to an empty glyph: draw the sign in the system font. */}
            <Text style={styles.times}>{' × '}</Text>
            {problem.b} = ?
          </Text>
          <TextInput
            ref={inputRef}
            value={answer}
            onChangeText={(v) => setAnswer(v.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            autoFocus={!coolingDown}
            editable={!coolingDown}
            placeholder="답"
            placeholderTextColor={SoftPopColors.textSecondary}
            autoComplete="off"
            autoCorrect={false}
            textContentType="none"
            style={[styles.input, coolingDown && styles.dim]}
            accessibilityLabel="답 입력"
            testID="parent-answer"
          />
          {coolingDown ? (
            <Text style={styles.error}>{`잠시 후 다시 해 주세요 (${secondsLeft}초)`}</Text>
          ) : message ? (
            <Text style={styles.error}>{message}</Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.secondary} accessibilityRole="button">
              <Text style={styles.secondaryText}>취소</Text>
            </Pressable>
            <Pressable
              onPress={submit}
              style={[styles.primary, (coolingDown || !answer) && styles.primaryDisabled]}
              accessibilityRole="button"
              accessibilityState={{ disabled: coolingDown || !answer }}
            >
              <Text style={styles.primaryText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 32 },
  card: { backgroundColor: SoftPopColors.white, borderRadius: 24, padding: 24 },
  title: { fontSize: 22, fontFamily: 'BMJUA', color: SoftPopColors.text, marginBottom: 8 },
  body: { fontSize: 15, fontFamily: 'BMJUA', color: SoftPopColors.textSecondary, lineHeight: 22, marginBottom: 16 },
  problem: { fontSize: 32, fontFamily: 'BMJUA', color: SoftPopColors.text, textAlign: 'center', marginBottom: 12 },
  input: {
    borderWidth: 2,
    borderColor: SoftPopColors.background,
    borderRadius: 16,
    fontSize: 28,
    textAlign: 'center',
    paddingVertical: 10,
    minHeight: 56,
    fontFamily: 'BMJUA',
    color: SoftPopColors.text,
  },
  times: { fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif', fontWeight: '700' },
  dim: { opacity: 0.4 },
  error: { marginTop: 8, color: SoftPopColors.error, fontFamily: 'BMJUA' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20 },
  secondary: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 44, justifyContent: 'center' },
  secondaryText: { fontFamily: 'BMJUA', color: SoftPopColors.textSecondary, fontSize: 16 },
  primary: { backgroundColor: SoftPopColors.primary, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 20, minHeight: 44, justifyContent: 'center' },
  primaryDisabled: { opacity: 0.4 },
  primaryText: { fontFamily: 'BMJUA', color: SoftPopColors.white, fontSize: 16 },
});
