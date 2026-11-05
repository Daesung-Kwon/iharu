/**
 * Window-driven layout tokens so phone and tablet share one universal app.
 */

import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getBottomChrome, getScrollEndPadding, getSheetBottomPadding } from '../utils/safeArea';
import {
  AD_BANNER_HEIGHT,
  getLayoutMetrics,
  getTabBarChrome,
  type LayoutTier,
} from './layoutMetrics';

export {
  ACTIVITY_CARD_MIN_WIDTH,
  AD_BANNER_HEIGHT,
  computeTabBarOffset,
  getClayShadow,
  getFittedActivityColumns,
  getLayoutMetrics,
  getLayoutTier,
  getTabBarChrome,
  MIN_TOUCH_TARGET,
  TAB_BAR_HEIGHT,
  TAB_BAR_HEIGHT_SMALL,
} from './layoutMetrics';
export type { LayoutMetrics, LayoutTier, TabBarChrome } from './layoutMetrics';

/** Matches the floating tab bar's occupied height so scroll/ads clear it. */
export function getTabBarOffset(
  insetsBottom: number,
  tier: LayoutTier = 'phoneRegular',
): number {
  return getTabBarChrome(tier, insetsBottom, Platform.OS).offset;
}

export function getScrollBottomPadding(
  insetsBottom: number,
  {
    includeAd = false,
    isCompact = false,
    tier = 'phoneRegular',
  }: { includeAd?: boolean; isCompact?: boolean; tier?: LayoutTier } = {},
): number {
  const extra = isCompact ? 12 : 20;
  return getTabBarOffset(insetsBottom, tier)
    + (includeAd ? AD_BANNER_HEIGHT : 0)
    + extra;
}

export function useLayout() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const metrics = getLayoutMetrics(width, height);
  const tabBarChrome = getTabBarChrome(metrics.tier, insets.bottom, Platform.OS);
  // No ads in the app: nothing sits above the tab bar.
  const adHeight = 0;
  // bottomChrome = tab bar + the shared ad above it (see utils/safeArea).
  // Screens never add the bottom inset themselves: it is already inside.
  const bottomChrome = getBottomChrome(tabBarChrome.offset, adHeight);
  const scrollEndPadding = getScrollEndPadding(bottomChrome);

  return {
    ...metrics,
    insets,
    tabBarChrome,
    /** Same as bottomChrome; kept for floating buttons and toasts. */
    tabBarOffset: bottomChrome,
    bottomChrome,
    adHeight,
    adBannerBottom: tabBarChrome.offset,
    /** The one paddingBottom for every tab screen's scroll content. */
    scrollEndPadding,
    contentPad: scrollEndPadding,
    sheetBottomPadding: getSheetBottomPadding(insets.bottom),
  };
}
