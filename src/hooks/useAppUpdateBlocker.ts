/**
 * Marks a lock, celebration, or reward surface so the update card waits.
 * useLayoutEffect publishes before paint, so the card does not flash on top.
 */
import { useLayoutEffect } from 'react';
import { setAppUpdateBlocked } from '../services/appUpdate';

export function useAppUpdateBlocker(id: string, blocked: boolean): void {
  useLayoutEffect(() => {
    setAppUpdateBlocked(id, blocked);
    return () => setAppUpdateBlocked(id, false);
  }, [id, blocked]);
}
