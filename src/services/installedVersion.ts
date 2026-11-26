/**
 * Installed app version for the store check.
 * nativeApplicationVersion (expo-application) wins; app.json via expo-constants
 * is the fallback when the native value is missing.
 */
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { resolveInstalledVersion } from './appUpdate';

export function readInstalledAppVersion(): string {
  let native: string | null = null;
  let config: string | null = null;
  try {
    native = Application.nativeApplicationVersion ?? null;
  } catch {
    native = null;
  }
  try {
    config = Constants.expoConfig?.version ?? null;
  } catch {
    config = null;
  }
  return resolveInstalledVersion(native, config);
}
