/**
 * Pure layout tokens so phone vs tablet math can be tested without RN.
 */

import { BREAKPOINTS } from '../constants/config';

export const TAB_BAR_HEIGHT = 68;
export const AD_BANNER_HEIGHT = 60;
export const ACTIVITY_CARD_MIN_WIDTH = 140;

export type LayoutMetrics = {
  width: number;
  height: number;
  isCompact: boolean;
  isLandscape: boolean;
  space: number;
  titleSize: number;
  activityColumns: number;
  tabBarHeight: number;
  dateCardWidth: number;
};

function getActivityGridGap(isCompact: boolean): number {
  return isCompact ? 12 : 20;
}

/** Cap the 2/3/4/6 target so 140px cards do not wrap to a different count. */
export function getFittedActivityColumns(
  width: number,
  isCompact: boolean,
  isLandscape: boolean,
  space: number,
): number {
  const target = isCompact
    ? (isLandscape ? 3 : 2)
    : (isLandscape ? 6 : 4);
  const gap = getActivityGridGap(isCompact);
  const available = width - space * 2;
  const maxFit = Math.floor(
    (available + gap) / (ACTIVITY_CARD_MIN_WIDTH + gap),
  );
  return Math.max(1, Math.min(target, maxFit));
}

export function getLayoutMetrics(width: number, height: number): LayoutMetrics {
  // Shortest side: phone landscape (844×390) stays compact; iPad 768×1024 stays regular.
  const isCompact = Math.min(width, height) < BREAKPOINTS.tablet;
  const isLandscape = width > height;
  const space = isCompact ? 16 : 32;

  return {
    width,
    height,
    isCompact,
    isLandscape,
    space,
    titleSize: isCompact ? 22 : 28,
    activityColumns: getFittedActivityColumns(
      width,
      isCompact,
      isLandscape,
      space,
    ),
    tabBarHeight: TAB_BAR_HEIGHT,
    dateCardWidth: isCompact ? 64 : 80,
  };
}
