/**
 * One safe-area standard for every screen, sheet and modal (iOS + Android).
 *
 * - Screens: top inset always; left/right too in landscape. Never bottom:
 *   the floating tab bar (+ ad above it) already owns the bottom inset, so a
 *   screen adding it again would double it (the old Android bug).
 * - Scroll content runs behind the tab bar and ad and ends with one padding:
 *   bottomChrome + SCROLL_END_GAP.
 * - Bottom sheets / forms: max(inset, 16) + 16 under the last control, and at
 *   most SHEET_MAX_WIDTH wide (iPad).
 */
export type Edge = 'top' | 'right' | 'bottom' | 'left';

export const SCROLL_END_GAP = 16;
export const SHEET_MAX_WIDTH = 640;

export function getScreenEdges(isLandscape: boolean): Edge[] {
  return isLandscape ? ['top', 'left', 'right'] : ['top'];
}

/** Height from the screen bottom taken by the tab bar and the ad above it. */
export function getBottomChrome(tabBarOffset: number, adHeight: number): number {
  return Math.max(0, tabBarOffset) + Math.max(0, adHeight);
}

/** paddingBottom for any tab screen's scroll content. */
export function getScrollEndPadding(bottomChrome: number): number {
  return Math.max(0, bottomChrome) + SCROLL_END_GAP;
}

/** paddingBottom under the last control of a bottom sheet or form. */
export function getSheetBottomPadding(insetBottom: number): number {
  return Math.max(Math.max(0, insetBottom), 16) + 16;
}

/**
 * Padding that centres a full-height view (e.g. the lock gate) on the part
 * of the screen not covered by the tab bar and ad.
 */
export function getVisibleAreaPaddingBottom(bottomChrome: number): number {
  return Math.max(0, bottomChrome);
}
