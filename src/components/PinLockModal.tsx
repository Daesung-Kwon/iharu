import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SoftPopColors } from '../constants/theme';
import ModalBackdrop from './ModalBackdrop';
import { modalStyles } from '../constants/modalStyle';
import { normalizePin, PIN_LENGTH } from '../utils/pinFlow';

interface PinLockModalProps {
  visible: boolean;
  /** Changes per step (unlock / set / confirm / remove): remounts the input. */
  stepKey: string;
  title: string;
  message?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  /** Unlock step only: forgot-PIN recovery. */
  onForgot?: () => void;
  onSubmit: (pin: string) => void;
  errorText?: string;
}

/**
 * 4-digit PIN entry. Submits by itself on the 4th digit (the button stays for
 * accessibility). The digits are drawn as dots by us instead of using a
 * secureTextEntry field: iOS secure fields keep their own text buffer, clear
 * it on re-edit and run password AutoFill heuristics, which made the value JS
 * saw differ from what was typed and delayed the close after confirming.
 */
export default function PinLockModal({
  visible,
  stepKey,
  title,
  message,
  confirmLabel = '확인',
  onCancel,
  onForgot,
  onSubmit,
  errorText,
}: PinLockModalProps) {
  const [pin, setPin] = useState('');
  const inputRef = useRef<TextInput>(null);
  // Always call the latest handler (no stale closure from an older step).
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;
  const submittedRef = useRef(false);

  useEffect(() => {
    setPin('');
    submittedRef.current = false;
  }, [visible, stepKey]);

  // Closing the modal does not always take the number pad with it on iOS;
  // drop it so the screen underneath shows cleanly.
  useEffect(() => {
    if (!visible) Keyboard.dismiss();
  }, [visible]);

  const submit = (value: string) => {
    if (value.length !== PIN_LENGTH || submittedRef.current) return;
    submittedRef.current = true;
    // Empty the dots right away: a wrong PIN can be retyped at once, and a
    // stale value never carries into the next step.
    setPin('');
    onSubmitRef.current(value);
  };

  const handleChange = (raw: string) => {
    const next = normalizePin(raw);
    submittedRef.current = false;
    setPin(next);
    if (next.length === PIN_LENGTH) submit(next);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Keep 취소 / 확인 above the number pad on small phones (SE). */}
      <KeyboardAvoidingView
        style={modalStyles.dialogOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ModalBackdrop />
        <View style={modalStyles.dialog}>
          <Text style={[modalStyles.title, styles.title]}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Pressable
            onPress={() => inputRef.current?.focus()}
            style={styles.dotsRow}
            accessibilityLabel={`${title}, ${pin.length}자리 입력됨`}
          >
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <View key={i} style={[styles.dot, i < pin.length && styles.dotFilled]} />
            ))}
            <TextInput
              key={stepKey}
              ref={inputRef}
              value={pin}
              onChangeText={handleChange}
              keyboardType="number-pad"
              maxLength={PIN_LENGTH}
              autoFocus
              caretHidden
              contextMenuHidden
              autoComplete="off"
              autoCorrect={false}
              textContentType="none"
              importantForAutofill="no"
              style={styles.hiddenInput}
              testID="pin-input"
            />
          </Pressable>
          {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
          {onForgot ? (
            <Pressable onPress={onForgot} style={styles.forgot} accessibilityRole="button">
              <Text style={styles.forgotText}>비밀번호를 잊었어요</Text>
            </Pressable>
          ) : null}
          <View style={styles.actions}>
            {onCancel && (
              <Pressable onPress={onCancel} style={styles.secondary}>
                <Text style={styles.secondaryText}>취소</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => submit(pin)}
              style={[styles.primary, pin.length !== PIN_LENGTH && styles.primaryDisabled]}
            >
              <Text style={styles.primaryText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  forgot: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  forgotText: {
    fontFamily: 'BMJUA',
    fontSize: 15,
    color: SoftPopColors.textSecondary,
    textDecorationLine: 'underline',
  },
  title: {
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    fontFamily: 'BMJUA',
    color: SoftPopColors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    minHeight: 56,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: SoftPopColors.background,
    borderRadius: 16,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: SoftPopColors.textSecondary,
  },
  dotFilled: {
    backgroundColor: SoftPopColors.text,
    borderColor: SoftPopColors.text,
  },
  hiddenInput: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.011,
    color: 'transparent',
  },
  error: {
    marginTop: 8,
    color: SoftPopColors.error,
    fontFamily: 'BMJUA',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  secondary: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryText: {
    fontFamily: 'BMJUA',
    color: SoftPopColors.textSecondary,
    fontSize: 16,
  },
  primary: {
    backgroundColor: SoftPopColors.primary,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 44,
    justifyContent: 'center',
  },
  primaryDisabled: {
    opacity: 0.4,
  },
  primaryText: {
    fontFamily: 'BMJUA',
    color: SoftPopColors.white,
    fontSize: 16,
  },
});
