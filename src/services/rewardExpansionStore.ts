import AsyncStorage from '@react-native-async-storage/async-storage';
import { KEYS } from './storageKeys';
import { parseStoredExpansion, RewardExpansion } from '../utils/rewardExpansion';

export async function loadRewardExpansion(): Promise<RewardExpansion> {
  try {
    return parseStoredExpansion(await AsyncStorage.getItem(KEYS.REWARD_EXPANSION));
  } catch {
    return parseStoredExpansion(null);
  }
}

export async function saveRewardExpansion(value: RewardExpansion): Promise<void> {
  await AsyncStorage.setItem(KEYS.REWARD_EXPANSION, JSON.stringify(value));
}
