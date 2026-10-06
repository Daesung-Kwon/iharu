import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS } from './storage';

export async function loadSettingsPin(): Promise<string | null> {
  try {
    const stored = await AsyncStorage.getItem(KEYS.SETTINGS_PIN);
    return stored && /^\d{4}$/.test(stored) ? stored : null;
  } catch {
    return null;
  }
}

export async function saveSettingsPin(pin: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS_PIN, pin);
}

export async function clearSettingsPin(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.SETTINGS_PIN);
}
