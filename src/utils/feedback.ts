/**
 * Complete-action feedback without extra native modules.
 * expo-haptics / expo-av would need a rebuild; Vibration is already in the binary.
 */
import { Platform, Vibration } from 'react-native';

export function playCompleteFeedback(): void {
  try {
    if (Platform.OS === 'ios') {
      Vibration.vibrate();
    } else {
      Vibration.vibrate([0, 28, 36, 28]);
    }
  } catch {
    // Simulators and some devices ignore vibration.
  }
}
