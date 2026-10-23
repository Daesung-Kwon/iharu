/** One-time weekly result moment, shown after a week ends. Gentle either way. */
import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SoftPopColors } from '../constants/theme';
import ModalBackdrop from './ModalBackdrop';
import { modalStyles } from '../constants/modalStyle';
import { resultCopy, WeeklyResult } from '../utils/weeklyPromise';

export default function WeeklyResultModal({ result, onClose }: { result: WeeklyResult | null; onClose: () => void }) {
  const copy = result ? resultCopy(result) : null;
  return (
    <Modal visible={!!result} transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalStyles.dialogOverlay}>
        <ModalBackdrop onPress={onClose} />
        {result && copy && (
          <View style={[modalStyles.dialog, styles.box]} accessibilityViewIsModal>
            <View style={[styles.badge, { backgroundColor: result.achieved ? SoftPopColors.completeSurface : SoftPopColors.todaySurface }]}>
              <MaterialIcons
                name={result.achieved ? 'emoji-events' : 'favorite'}
                size={44}
                color={result.achieved ? SoftPopColors.secondary : SoftPopColors.today}
              />
            </View>
            <Text style={styles.title}>{copy.title}</Text>
            <Text style={styles.body}>{copy.body}</Text>
            <Text style={styles.footer}>{copy.footer}</Text>
            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={onClose}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>확인</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const bold = Platform.OS === 'android' ? 'normal' : '700';
const styles = StyleSheet.create({
  box: { alignItems: 'center', paddingVertical: 28, maxWidth: 360 },
  badge: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  title: {
    marginTop: 14, fontSize: 24, lineHeight: 32, fontFamily: 'BMJUA', fontWeight: bold,
    color: SoftPopColors.text, textAlign: 'center',
  },
  body: {
    marginTop: 8, fontSize: 18, lineHeight: 26, fontFamily: 'BMJUA', fontWeight: bold,
    color: SoftPopColors.text, textAlign: 'center',
  },
  footer: {
    marginTop: 8, fontSize: 15, lineHeight: 22, color: SoftPopColors.textSecondary, textAlign: 'center',
  },
  button: {
    marginTop: 22, backgroundColor: SoftPopColors.primary, borderRadius: 28,
    paddingVertical: 14, minWidth: 140, alignItems: 'center',
  },
  buttonPressed: { opacity: 0.85 },
  buttonText: { fontSize: 18, fontFamily: 'BMJUA', fontWeight: bold, color: SoftPopColors.white },
});
