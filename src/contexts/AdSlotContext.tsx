/**
 * AdSlot - the single ad banner lives above the floating tab bar (see
 * MainTabNavigator). Its measured height is shared here so every screen can
 * reserve that space and the banner never covers content.
 */

import React, { createContext, useContext, useMemo, useState } from 'react';

interface AdSlotValue {
  adHeight: number;
  setAdHeight: (h: number) => void;
  /** Height of the last banner that actually loaded; kept while on Settings. */
  lastLoadedHeight: number;
  setLastLoadedHeight: (h: number) => void;
}

const AdSlotContext = createContext<AdSlotValue>({
  adHeight: 0,
  setAdHeight: () => {},
  lastLoadedHeight: 0,
  setLastLoadedHeight: () => {},
});

export function AdSlotProvider({ children }: { children: React.ReactNode }) {
  const [adHeight, setHeight] = useState(0);
  const [lastLoadedHeight, setLast] = useState(0);
  const value = useMemo(
    () => ({
      adHeight,
      setAdHeight: (h: number) => setHeight((prev) => (prev === h ? prev : Math.max(0, Math.round(h)))),
      lastLoadedHeight,
      setLastLoadedHeight: (h: number) => setLast((prev) => (h > 0 ? Math.round(h) : prev)),
    }),
    [adHeight, lastLoadedHeight],
  );
  return <AdSlotContext.Provider value={value}>{children}</AdSlotContext.Provider>;
}

export const useAdSlot = () => useContext(AdSlotContext);
