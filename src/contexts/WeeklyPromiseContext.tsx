/**
 * Weekly reward promise state. Judges ended weeks whenever the data or the
 * day changes, and keeps the newest unseen result for the one-time moment.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSchedule } from './ScheduleContext';
import { loadWeeklyPromise, saveWeeklyPromise, saveWeeklyResults } from '../services/weeklyPromiseStore';
import {
  currentWeekStatus, judgeEndedWeeks, latestUnseen, markAllSeen, saveTerms, stopPromise,
  TermsInput, WeeklyPromise, WeeklyResult, WeekStatus,
} from '../utils/weeklyPromise';

interface WeeklyPromiseContextType {
  promise: WeeklyPromise | null;
  status: WeekStatus | null;
  unseenResult: WeeklyResult | null;
  loaded: boolean;
  save: (input: TermsInput) => Promise<void>;
  stop: () => Promise<void>;
  markResultSeen: () => Promise<void>;
  reload: () => Promise<void>;
}

const Ctx = createContext<WeeklyPromiseContextType | null>(null);

export function WeeklyPromiseProvider({ children }: { children: React.ReactNode }) {
  const { schedules, todayKey } = useSchedule();
  const [promise, setPromise] = useState<WeeklyPromise | null>(null);
  const [results, setResults] = useState<WeeklyResult[]>([]);
  const [loaded, setLoaded] = useState(false);
  const resultsRef = useRef(results);
  resultsRef.current = results;

  const reload = useCallback(async () => {
    const data = await loadWeeklyPromise();
    setPromise(data.promise);
    setResults(data.results);
    setLoaded(true);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Judge weeks that ended. Schedules load async, so this re-runs when they arrive.
  useEffect(() => {
    if (!loaded || !promise) return;
    const fresh = judgeEndedWeeks(promise, resultsRef.current, schedules, {
      today: todayKey,
      nowIso: new Date().toISOString(),
    });
    if (fresh.length === 0) return;
    const next = [...resultsRef.current, ...fresh];
    setResults(next);
    saveWeeklyResults(next).catch(e => console.error('Failed to save weekly results:', e));
  }, [loaded, promise, schedules, todayKey]);

  const save = useCallback(async (input: TermsInput) => {
    const next = saveTerms(promise, input, {
      today: todayKey,
      nowIso: new Date().toISOString(),
      newId: `promise-${Date.now()}`,
    });
    await saveWeeklyPromise(next);
    setPromise(next);
  }, [promise, todayKey]);

  const stop = useCallback(async () => {
    if (!promise) return;
    const next = stopPromise(promise, { today: todayKey, nowIso: new Date().toISOString() });
    await saveWeeklyPromise(next);
    setPromise(next);
  }, [promise, todayKey]);

  const markResultSeen = useCallback(async () => {
    const next = markAllSeen(resultsRef.current, new Date().toISOString());
    setResults(next);
    await saveWeeklyResults(next);
  }, []);

  const value = useMemo<WeeklyPromiseContextType>(() => ({
    promise,
    status: currentWeekStatus(promise, schedules, todayKey),
    unseenResult: latestUnseen(results),
    loaded,
    save,
    stop,
    markResultSeen,
    reload,
  }), [promise, schedules, todayKey, results, loaded, save, stop, markResultSeen, reload]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWeeklyPromise(): WeeklyPromiseContextType {
  const v = useContext(Ctx);
  if (!v) throw new Error('useWeeklyPromise must be used inside WeeklyPromiseProvider');
  return v;
}
