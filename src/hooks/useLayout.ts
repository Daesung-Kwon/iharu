/**
 * Window-driven layout tokens so phone and tablet share one universal app.
 */

import { Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdSlot } from '../contexts/AdSlotContext';
import {
  AD_BANNER_HEIGHT,
  getBottomChromeOffset,
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
  getInFlowBottomLayout,
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
  const { adHeight } = useAdSlot();
  // tabBarOffset = tab bar + the shared ad banner above it, so every screen
  // that pads by it keeps its content clear of both.
  const tabBarOffset = getBottomChromeOffset(tabBarChrome.offset, adHeight);
  const contentPad = getScrollBottomPadding(insets.bottom, {
    isCompact: metrics.isCompact,
    tier: metrics.tier,
  }) + adHeight;

  return {
    ...metrics,
    insets,
    tabBarChrome,
    tabBarOffset,
    adHeight,
    adBannerBottom: tabBarChrome.offset,
    contentPad,
    contentPadWithAd: contentPad,
  };
}
