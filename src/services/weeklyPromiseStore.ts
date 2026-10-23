/** AsyncStorage for the weekly reward promise (logic lives in utils/weeklyPromise). */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS } from './storageKeys';
import {
  parseStoredPromise, parseStoredResults, WeeklyPromise, WeeklyResult,
} from '../utils/weeklyPromise';

export async function loadWeeklyPromise(): Promise<{ promise: WeeklyPromise | null; results: WeeklyResult[] }> {
  const [p, r] = await Promise.all([
    AsyncStorage.getItem(KEYS.WEEKLY_PROMISE),
    AsyncStorage.getItem(KEYS.WEEKLY_RESULTS),
  ]);
  return { promise: parseStoredPromise(p), results: parseStoredResults(r) };
}

export async function saveWeeklyPromise(promise: WeeklyPromise | null): Promise<void> {
  await AsyncStorage.setItem(KEYS.WEEKLY_PROMISE, JSON.stringify(promise));
}

export async function saveWeeklyResults(results: WeeklyResult[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.WEEKLY_RESULTS, JSON.stringify(results));
}
