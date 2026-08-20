/**
 * Window-driven layout tokens so phone and tablet share one universal app.
 */

import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AD_BANNER_HEIGHT,
  getLayoutMetrics,
  TAB_BAR_HEIGHT,
} from './layoutMetrics';

export {
  ACTIVITY_CARD_MIN_WIDTH,
  AD_BANNER_HEIGHT,
  getFittedActivityColumns,
  getLayoutMetrics,
  TAB_BAR_HEIGHT,
} from './layoutMetrics';
export type { LayoutMetrics } from './layoutMetrics';

/** Matches the floating tab bar's occupied height so scroll/ads clear it. */
export function getTabBarOffset(insetsBottom: number): number {
  return Platform.OS === 'android'
    ? TAB_BAR_HEIGHT + Math.max(insetsBottom, 16) + 8
    : TAB_BAR_HEIGHT + Math.max(insetsBottom, 10);
}

export function getScrollBottomPadding(
  insetsBottom: number,
  {
    includeAd = false,
    isCompact = false,
  }: { includeAd?: boolean; isCompact?: boolean } = {},
): number {
  const extra = isCompact ? 12 : 20;
  return getTabBarOffset(insetsBottom)
    + (includeAd ? AD_BANNER_HEIGHT : 0)
    + extra;
}

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const metrics = getLayoutMetrics(width, height);
  const tabBarOffset = getTabBarOffset(insets.bottom);

  return {
    ...metrics,
    insets,
    tabBarOffset,
    adBannerBottom: tabBarOffset,
    contentPad: getScrollBottomPadding(insets.bottom, {
      isCompact: metrics.isCompact,
    }),
    contentPadWithAd: getScrollBottomPadding(insets.bottom, {
      includeAd: true,
      isCompact: metrics.isCompact,
    }),
  };
}
