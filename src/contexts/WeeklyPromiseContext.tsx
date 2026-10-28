/**
 * Weekly reward promises (1 free, more with '보상 확장'). Judges ended weeks
 * whenever the data or the day changes, and keeps the newest unseen week's
 * results for the one-time moment.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useSchedule } from './ScheduleContext';
import { syncWeeklyResultNotifications } from '../services/weeklyResultNotification';
import { loadWeeklyPromises, saveWeeklyPromises, saveWeeklyResults } from '../services/weeklyPromiseStore';
import { markAllSeen, TermsInput, WeeklyPromise, WeeklyResult } from '../utils/weeklyPromise';
import {
  judgeAll, latestUnseenWeek, managedPromises, stopPromiseById, upsertPromise, UpsertResult,
  weekSummary, WeekSummary,
} from '../utils/weeklyPromises';

interface WeeklyPromiseContextType {
  /** Every stored promise, including stopped ones (for judging and backup). */
  promises: WeeklyPromise[];
  /** Ones that take a slot (what the parent manages). */
  managed: WeeklyPromise[];
  summary: WeekSummary | null;
  unseenResults: WeeklyResult[];
  loaded: boolean;
  /** id null = new. `limit` = slots the parent has (rewardSlotLimit). */
  save: (id: string | null, input: TermsInput, limit: number) => Promise<UpsertResult>;
  stop: (id: string) => Promise<void>;
  markResultSeen: () => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<WeeklyPromiseContextType | null>(null);

export function WeeklyPromiseProvider({ children }: { children: React.ReactNode }) {
  const { schedules, todayKey } = useSchedule();
  const [promises, setPromises] = useState<WeeklyPromise[]>([]);
  const [results, setResults] = useState<WeeklyResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const resultsRef = useRef(results);
  resultsRef.current = results;
  const promisesRef = useRef(promises);
  promisesRef.current = promises;
  const schedulesRef = useRef(schedules);
  schedulesRef.current = schedules;
  const todayKeyRef = useRef(todayKey);
  todayKeyRef.current = todayKey;

  const reload = useCallback(async () => {
    const data = await loadWeeklyPromises();
    setPromises(data.promises);
    setResults(data.results);
    setLoaded(true);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Judge weeks that ended. Schedules load async, so this re-runs when they arrive.
  useEffect(() => {
    if (!loaded || promises.length === 0) return;
    const fresh = judgeAll(promises, resultsRef.current, schedules, {
      today: todayKey,
      nowIso: new Date().toISOString(),
    });
    if (fresh.length === 0) return;
    const next = [...resultsRef.current, ...fresh];
    setResults(next);
    saveWeeklyResults(next).catch(e => console.error('Failed to save weekly results:', e));
  }, [loaded, promises, schedules, todayKey]);

  // One local notification for the newest unseen week. Scheduled ahead so it
  // still fires if the app is backgrounded or killed. Judging above is unchanged.
  const syncNotifications = useCallback((now = new Date()) => {
    if (!loaded) return;
    syncWeeklyResultNotifications({
      promises: promisesRef.current,
      results: resultsRef.current,
      schedules: schedulesRef.current,
      today: todayKeyRef.current,
      now,
    }).catch(e => console.error('주간 결과 알림 동기화 실패:', e));
  }, [loaded]);

  useEffect(() => {
    syncNotifications();
  }, [syncNotifications, promises, results, schedules, todayKey]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if (next === 'active') syncNotifications(new Date());
    });
    return () => sub.remove();
  }, [syncNotifications]);

  const save = useCallback(async (id: string | null, input: TermsInput, limit: number) => {
    const r = upsertPromise(promisesRef.current, id, input, {
      today: todayKey,
      nowIso: new Date().toISOString(),
      newId: `promise-${Date.now()}`,
      limit,
    });
    if (r.ok) {
      await saveWeeklyPromises(r.list);
      setPromises(r.list);
    }
    return r;
  }, [todayKey]);

  const stop = useCallback(async (id: string) => {
    const next = stopPromiseById(promisesRef.current, id, { today: todayKey, nowIso: new Date().toISOString() });
    await saveWeeklyPromises(next);
    setPromises(next);
  }, [todayKey]);

  const markResultSeen = useCallback(async () => {
    const next = markAllSeen(resultsRef.current, new Date().toISOString());
    setResults(next);
    await saveWeeklyResults(next);
  }, []);

  const value = useMemo<WeeklyPromiseContextType>(() => ({
    promises,
    managed: managedPromises(promises, todayKey),
    summary: weekSummary(promises, schedules, todayKey),
    unseenResults: latestUnseenWeek(results),
    loaded,
    save,
    stop,
    markResultSeen,
    reload,
  }), [promises, schedules, todayKey, results, loaded, save, stop, markResultSeen, reload]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWeeklyPromise(): WeeklyPromiseContextType {
  const v = useContext(Ctx);
  if (!v) throw new Error('useWeeklyPromise must be used inside WeeklyPromiseProvider');
  return v;
}
