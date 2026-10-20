/**
 * Completion haptics. expo-haptics gives a light tap per item and a success
 * pattern for the last one on both iOS and Android; Vibration stays as a
 * fallback if the native module is missing (e.g. an old dev client).
 */
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { CompletionFeedback } from './instantReward';

export function playCompleteFeedback(kind: CompletionFeedback = 'light'): void {
  if (kind === 'none') return;
  const run = kind === 'success'
    ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    : Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  run.catch(() => {
    try {
      Vibration.vibrate(Platform.OS === 'ios' ? 10 : [0, 28, 36, 28]);
    } catch {
      // Simulators and some devices ignore vibration.
    }
  });
}
