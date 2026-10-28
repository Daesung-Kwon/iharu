/** AsyncStorage for weekly reward promises (logic lives in utils/weeklyPromise*). */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS } from './storageKeys';
import { parseStoredResults, WeeklyPromise, WeeklyResult } from '../utils/weeklyPromise';
import { normalizePromises, parseStoredPromises } from '../utils/weeklyPromises';

export async function loadWeeklyPromises(): Promise<{ promises: WeeklyPromise[]; results: WeeklyResult[] }> {
  const [list, legacy, r] = await Promise.all([
    AsyncStorage.getItem(KEYS.WEEKLY_PROMISES),
    AsyncStorage.getItem(KEYS.WEEKLY_PROMISE),
    AsyncStorage.getItem(KEYS.WEEKLY_RESULTS),
  ]);
  // The v5 migration moves the legacy value; reading both keeps a half-migrated store safe.
  const promises = normalizePromises([...parseStoredPromises(list), ...parseStoredPromises(legacy)]);
  return { promises, results: parseStoredResults(r) };
}

export async function saveWeeklyPromises(promises: WeeklyPromise[]): Promise<void> {
  await AsyncStorage.multiSet([
    [KEYS.WEEKLY_PROMISES, JSON.stringify(promises)],
    [KEYS.WEEKLY_PROMISE, 'null'],
  ]);
}

export async function saveWeeklyResults(results: WeeklyResult[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.WEEKLY_RESULTS, JSON.stringify(results));
}
