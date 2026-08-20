/**
 * Pure layout tokens so phone vs tablet math can be tested without RN.
 */

import { BREAKPOINTS } from '../constants/config';

export const TAB_BAR_HEIGHT = 68;
export const AD_BANNER_HEIGHT = 60;

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

export function getLayoutMetrics(width: number, height: number): LayoutMetrics {
  const isCompact = width < BREAKPOINTS.tablet;
  const isLandscape = width > height;

  return {
    width,
    height,
    isCompact,
    isLandscape,
    space: isCompact ? 16 : 32,
    titleSize: isCompact ? 22 : 28,
    activityColumns: isCompact
      ? (isLandscape ? 3 : 2)
      : (isLandscape ? 6 : 4),
    tabBarHeight: TAB_BAR_HEIGHT,
    dateCardWidth: isCompact ? 56 : 80,
  };
}
