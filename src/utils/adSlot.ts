/**
 * Banner slot rules (pure, tested).
 *
 * The banner is unmounted on Settings: the SDK has no pause, and a hidden
 * but mounted banner can keep requesting / refreshing. Coming back to a tab
 * mounts a fresh banner (one new request). The slot keeps the last loaded
 * ad's height meanwhile so the screen doesn't jump, and a failed load is
 * retried with a growing delay. There is no "give up" state that could keep
 * the banner away after the user returns.
 */

export const AD_RETRY_DELAYS_MS = [15_000, 30_000, 60_000] as const;

export interface AdBannerState {
  /** Bumps on each retry; used as the BannerAd key (= one new request). */
  attempt: number;
  failures: number;
  /** Between a failure and its retry: render nothing, keep the slot. */
  waiting: boolean;
}

export type AdBannerEvent = { type: 'LOADED' } | { type: 'FAILED' } | { type: 'RETRY' };

export const initialAdBannerState: AdBannerState = { attempt: 0, failures: 0, waiting: false };

export function adBannerReducer(state: AdBannerState, event: AdBannerEvent): AdBannerState {
  switch (event.type) {
    case 'LOADED':
      return { ...state, failures: 0, waiting: false };
    case 'FAILED':
      return state.waiting ? state : { ...state, failures: state.failures + 1, waiting: true };
    case 'RETRY':
      return state.waiting ? { ...state, attempt: state.attempt + 1, waiting: false } : state;
  }
}

/** Delay before retrying after `failures` failed loads in a row (>= 1). */
export function nextAdRetryDelay(failures: number): number {
  const i = Math.min(Math.max(failures, 1), AD_RETRY_DELAYS_MS.length) - 1;
  return AD_RETRY_DELAYS_MS[i];
}

/** Height to hold for the banner while it (re)loads. */
export function reservedAdHeight(lastLoadedHeight: number): number {
  return Math.max(0, Math.round(lastLoadedHeight));
}
