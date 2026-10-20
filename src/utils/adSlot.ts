/**
 * Banner slot rules (pure, tested).
 *
 * The banner is unmounted on Settings: the SDK has no pause, and a hidden
 * but mounted banner can keep requesting / refreshing. So coming back to a
 * tab loads a fresh ad. To keep that calm, the slot keeps the last measured
 * height while the new ad loads (no layout jump), retries a failed load once,
 * and only collapses after the retry also fails.
 */

/** Wait before the single retry after a failed load. */
export const AD_RETRY_DELAY_MS = 15_000;
export const AD_MAX_RETRIES = 1;

/** Delay before the next load attempt, or null to stop and collapse. */
export function nextAdRetryDelay(failures: number): number | null {
  return failures >= 1 && failures <= AD_MAX_RETRIES ? AD_RETRY_DELAY_MS : null;
}

/** Height to hold for the banner while it (re)loads; 0 = collapse. */
export function reservedAdHeight(lastLoadedHeight: number, gaveUp: boolean): number {
  return gaveUp ? 0 : Math.max(0, Math.round(lastLoadedHeight));
}
