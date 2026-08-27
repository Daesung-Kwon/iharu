import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SoftPopColors } from '../constants/theme';

interface PinLockModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onSubmit: (pin: string) => void;
  errorText?: string;
}

export default function PinLockModal({
  visible,
  title,
  message,
  confirmLabel = '확인',
  onCancel,
  onSubmit,
  errorText,
}: PinLockModalProps) {
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (visible) setPin('');
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <TextInput
            value={pin}
            onChangeText={(value) => setPin(value.replace(/\D/g, '').slice(0, 4))}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            style={styles.input}
            placeholder="••••"
            placeholderTextColor={SoftPopColors.textSecondary}
            autoFocus
          />
          {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
          <View style={styles.actions}>
            {onCancel && (
              <Pressable onPress={onCancel} style={styles.secondary}>
                <Text style={styles.secondaryText}>취소</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => pin.length === 4 && onSubmit(pin)}
              style={[styles.primary, pin.length !== 4 && styles.primaryDisabled]}
            >
              <Text style={styles.primaryText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    backgroundColor: SoftPopColors.white,
    borderRadius: 24,
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: 'BMJUA',
    color: SoftPopColors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    fontFamily: 'BMJUA',
    color: SoftPopColors.textSecondary,
    marginBottom: 16,
    lineHeight: 22,
  },
  input: {
    borderWidth: 2,
    borderColor: SoftPopColors.background,
    borderRadius: 16,
    fontSize: 28,
    letterSpacing: 12,
    textAlign: 'center',
    paddingVertical: 12,
    fontFamily: 'BMJUA',
    color: SoftPopColors.text,
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
